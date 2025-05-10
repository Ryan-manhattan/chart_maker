import { db } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore'

// 타입 정의
export interface Chart {
  id?: string
  userId: string
  fileId: string
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea'
  title: string
  description?: string
  data: any
  options: any
  imageUrl?: string
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface Folder {
  id?: string
  userId: string
  name: string
  parentId?: string
  description?: string
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface Report {
  id?: string
  userId: string
  title: string
  description?: string
  charts: string[] // Chart IDs
  layout: any
  imageUrl?: string
  shareSettings?: {
    isPublic: boolean
    shareUrl?: string
    permissions: Record<string, 'view' | 'edit'>
  }
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

// 차트 관련 함수
export async function saveChart(chartData: Omit<Chart, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const chartsRef = collection(db, 'charts')
    const docRef = await addDoc(chartsRef, {
      ...chartData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error('차트 저장 실패:', error)
    throw new Error('차트 저장에 실패했습니다.')
  }
}

export async function updateChart(chartId: string, updates: Partial<Chart>): Promise<void> {
  try {
    const chartRef = doc(db, 'charts', chartId)
    await updateDoc(chartRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('차트 업데이트 실패:', error)
    throw new Error('차트 업데이트에 실패했습니다.')
  }
}

export async function deleteChart(chartId: string): Promise<void> {
  try {
    const chartRef = doc(db, 'charts', chartId)
    await deleteDoc(chartRef)
  } catch (error) {
    console.error('차트 삭제 실패:', error)
    throw new Error('차트 삭제에 실패했습니다.')
  }
}

export async function getChart(chartId: string): Promise<Chart | null> {
  try {
    const chartRef = doc(db, 'charts', chartId)
    const chartSnap = await getDoc(chartRef)
    
    if (chartSnap.exists()) {
      return { id: chartSnap.id, ...chartSnap.data() } as Chart
    }
    return null
  } catch (error) {
    console.error('차트 조회 실패:', error)
    throw new Error('차트 조회에 실패했습니다.')
  }
}

export async function getUserCharts(userId: string, limitCount = 20): Promise<Chart[]> {
  try {
    const chartsRef = collection(db, 'charts')
    const q = query(
      chartsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    const charts: Chart[] = []
    
    snapshot.forEach((doc) => {
      charts.push({ id: doc.id, ...doc.data() } as Chart)
    })
    
    return charts
  } catch (error) {
    console.error('사용자 차트 목록 조회 실패:', error)
    throw new Error('차트 목록 조회에 실패했습니다.')
  }
}

// 폴더 관련 함수
export async function createFolder(folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const foldersRef = collection(db, 'folders')
    const docRef = await addDoc(foldersRef, {
      ...folderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error('폴더 생성 실패:', error)
    throw new Error('폴더 생성에 실패했습니다.')
  }
}

export async function updateFolder(folderId: string, updates: Partial<Folder>): Promise<void> {
  try {
    const folderRef = doc(db, 'folders', folderId)
    await updateDoc(folderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('폴더 업데이트 실패:', error)
    throw new Error('폴더 업데이트에 실패했습니다.')
  }
}

export async function deleteFolder(folderId: string): Promise<void> {
  try {
    const folderRef = doc(db, 'folders', folderId)
    await deleteDoc(folderRef)
  } catch (error) {
    console.error('폴더 삭제 실패:', error)
    throw new Error('폴더 삭제에 실패했습니다.')
  }
}

export async function getUserFolders(userId: string): Promise<Folder[]> {
  try {
    const foldersRef = collection(db, 'folders')
    const q = query(
      foldersRef,
      where('userId', '==', userId),
      orderBy('name')
    )
    
    const snapshot = await getDocs(q)
    const folders: Folder[] = []
    
    snapshot.forEach((doc) => {
      folders.push({ id: doc.id, ...doc.data() } as Folder)
    })
    
    return folders
  } catch (error) {
    console.error('폴더 목록 조회 실패:', error)
    throw new Error('폴더 목록 조회에 실패했습니다.')
  }
}

// 리포트 관련 함수
export async function saveReport(reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const reportsRef = collection(db, 'reports')
    const docRef = await addDoc(reportsRef, {
      ...reportData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error('리포트 저장 실패:', error)
    throw new Error('리포트 저장에 실패했습니다.')
  }
}

export async function updateReport(reportId: string, updates: Partial<Report>): Promise<void> {
  try {
    const reportRef = doc(db, 'reports', reportId)
    await updateDoc(reportRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('리포트 업데이트 실패:', error)
    throw new Error('리포트 업데이트에 실패했습니다.')
  }
}

export async function getReport(reportId: string): Promise<Report | null> {
  try {
    const reportRef = doc(db, 'reports', reportId)
    const reportSnap = await getDoc(reportRef)
    
    if (reportSnap.exists()) {
      return { id: reportSnap.id, ...reportSnap.data() } as Report
    }
    return null
  } catch (error) {
    console.error('리포트 조회 실패:', error)
    throw new Error('리포트 조회에 실패했습니다.')
  }
}

export async function getUserReports(userId: string, limitCount = 20): Promise<Report[]> {
  try {
    const reportsRef = collection(db, 'reports')
    const q = query(
      reportsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    const reports: Report[] = []
    
    snapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report)
    })
    
    return reports
  } catch (error) {
    console.error('리포트 목록 조회 실패:', error)
    throw new Error('리포트 목록 조회에 실패했습니다.')
  }
}

// 공유 관련 함수
export async function createShareLink(reportId: string, permissions: 'view' | 'edit' = 'view'): Promise<string> {
  try {
    const shareUrl = `${window.location.origin}/shared/${reportId}`
    
    await updateReport(reportId, {
      shareSettings: {
        isPublic: true,
        shareUrl,
        permissions: { public: permissions }
      }
    })
    
    return shareUrl
  } catch (error) {
    console.error('공유 링크 생성 실패:', error)
    throw new Error('공유 링크 생성에 실패했습니다.')
  }
}

export async function updateSharePermissions(
  reportId: string,
  userId: string,
  permission: 'view' | 'edit' | null
): Promise<void> {
  try {
    const reportRef = doc(db, 'reports', reportId)
    const reportSnap = await getDoc(reportRef)
    
    if (reportSnap.exists()) {
      const report = reportSnap.data() as Report
      const currentPermissions = report.shareSettings?.permissions || {}
      
      if (permission === null) {
        // 권한 제거
        delete currentPermissions[userId]
      } else {
        // 권한 추가/업데이트
        currentPermissions[userId] = permission
      }
      
      await updateDoc(reportRef, {
        'shareSettings.permissions': currentPermissions,
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('공유 권한 업데이트 실패:', error)
    throw new Error('공유 권한 업데이트에 실패했습니다.')
  }
}
