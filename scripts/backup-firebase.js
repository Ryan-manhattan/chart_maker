#!/usr/bin/env node

const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

// Firebase Admin 초기화
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  })
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error)
  process.exit(1)
}

const db = admin.firestore()
const storage = admin.storage()

// 백업 디렉토리 생성
const backupDir = path.join(__dirname, '../backups')
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
}

async function backupFirestore() {
  console.log('📦 Firestore 백업 시작...')
  
  const backup = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    },
    collections: {}
  }
  
  const collections = ['charts', 'reports', 'folders', 'users']
  
  try {
    for (const collectionName of collections) {
      console.log(`  - ${collectionName} 백업 중...`)
      backup.collections[collectionName] = []
      
      const snapshot = await db.collection(collectionName).get()
      
      snapshot.forEach((doc) => {
        backup.collections[collectionName].push({
          id: doc.id,
          data: doc.data()
        })
      })
      
      console.log(`  ✓ ${collectionName}: ${backup.collections[collectionName].length}개 문서`)
    }
    
    // 백업 파일 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `firestore-backup-${timestamp}.json`
    const filepath = path.join(backupDir, filename)
    
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))
    console.log(`✅ Firestore 백업 완료: ${filename}`)
    
    return filename
  } catch (error) {
    console.error('❌ Firestore 백업 실패:', error)
    throw error
  }
}

async function backupStorage() {
  console.log('📦 Storage 백업 시작...')
  
  try {
    const bucket = storage.bucket()
    const [files] = await bucket.getFiles()
    
    const storageBackup = []
    
    for (const file of files) {
      // 메타데이터만 백업 (실제 파일은 용량 문제로 제외)
      const [metadata] = await file.getMetadata()
      storageBackup.push({
        name: file.name,
        bucket: metadata.bucket,
        size: metadata.size,
        contentType: metadata.contentType,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
      })
    }
    
    // 스토리지 메타데이터 백업 파일 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `storage-metadata-${timestamp}.json`
    const filepath = path.join(backupDir, filename)
    
    fs.writeFileSync(filepath, JSON.stringify({
      metadata: {
        timestamp: new Date().toISOString(),
        totalFiles: storageBackup.length,
      },
      files: storageBackup
    }, null, 2))
    
    console.log(`✅ Storage 메타데이터 백업 완료: ${filename}`)
    
    return filename
  } catch (error) {
    console.error('❌ Storage 백업 실패:', error)
    throw error
  }
}

async function cleanupOldBackups() {
  console.log('🧹 오래된 백업 정리 중...')
  
  try {
    const files = fs.readdirSync(backupDir)
    const backupFiles = files
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        stat: fs.statSync(path.join(backupDir, file))
      }))
      .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())
    
    // 최근 7개 백업만 유지
    const filesToDelete = backupFiles.slice(7)
    
    for (const file of filesToDelete) {
      fs.unlinkSync(file.path)
      console.log(`  🗑️ 삭제: ${file.name}`)
    }
    
    console.log(`✅ 백업 정리 완료 (${filesToDelete.length}개 파일 삭제)`)
  } catch (error) {
    console.error('❌ 백업 정리 실패:', error)
  }
}

async function main() {
  console.log('🚀 Firebase 백업 프로세스 시작...')
  
  try {
    // 1. Firestore 백업
    await backupFirestore()
    
    // 2. Storage 메타데이터 백업
    await backupStorage()
    
    // 3. 오래된 백업 정리
    await cleanupOldBackups()
    
    console.log('✅ 모든 백업 완료!')
    
    // 백업 상태 보고서
    const report = {
      success: true,
      timestamp: new Date().toISOString(),
      backupLocation: backupDir,
      summary: {
        firestoreBackup: '완료',
        storageBackup: '완료',
        cleanup: '완료'
      }
    }
    
    // 백업 보고서 저장
    const reportPath = path.join(backupDir, `backup-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    // Slack 알림 (환경 변수 설정 시)
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '📦 ChartAI 백업 완료!',
          attachments: [{
            color: 'good',
            fields: [
              { title: 'Firestore', value: '✅ 완료' },
              { title: 'Storage', value: '✅ 완료' },
              { title: '시간', value: new Date().toLocaleString() }
            ]
          }]
        })
      })
    }
    
  } catch (error) {
    console.error('❌ 백업 프로세스 실패:', error)
    
    // 에러 보고서
    const errorReport = {
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack
      }
    }
    
    const errorPath = path.join(backupDir, `backup-error-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
    fs.writeFileSync(errorPath, JSON.stringify(errorReport, null, 2))
    
    // Slack 에러 알림
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '❌ ChartAI 백업 실패!',
          attachments: [{
            color: 'danger',
            fields: [
              { title: '에러', value: error.message },
              { title: '시간', value: new Date().toLocaleString() }
            ]
          }]
        })
      })
    }
    
    process.exit(1)
  }
}

// 백업 실행
main()
