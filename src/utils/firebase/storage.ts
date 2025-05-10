import { storage } from '@/lib/firebase'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  UploadResult 
} from 'firebase/storage'

export interface UploadOptions {
  metadata?: {
    customMetadata?: Record<string, string>
    contentType?: string
  }
}

export interface UploadedFile {
  url: string
  path: string
  name: string
  size: number
  uploadedAt: Date
}

/**
 * 파일을 Firebase Storage에 업로드
 */
export async function uploadFile(
  file: File,
  path: string,
  options?: UploadOptions
): Promise<UploadedFile> {
  try {
    const fileRef = ref(storage, path)
    
    // 메타데이터 설정
    const metadata = {
      ...options?.metadata,
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        ...options?.metadata?.customMetadata,
        originalName: file.name,
        size: file.size.toString(),
        uploadedAt: new Date().toISOString()
      }
    }
    
    // 파일 업로드
    const uploadResult: UploadResult = await uploadBytes(fileRef, file, metadata)
    
    // 다운로드 URL 획득
    const downloadURL = await getDownloadURL(uploadResult.ref)
    
    return {
      url: downloadURL,
      path: path,
      name: file.name,
      size: file.size,
      uploadedAt: new Date()
    }
  } catch (error) {
    console.error('파일 업로드 실패:', error)
    throw new Error('파일 업로드에 실패했습니다.')
  }
}

/**
 * 차트 이미지를 업로드
 */
export async function uploadChartImage(
  imageBlob: Blob,
  chartId: string,
  userId: string
): Promise<string> {
  const fileName = `${chartId}_${Date.now()}.png`
  const path = `charts/${userId}/${fileName}`
  
  try {
    const fileRef = ref(storage, path)
    await uploadBytes(fileRef, imageBlob, {
      contentType: 'image/png',
      customMetadata: {
        chartId,
        userId,
        createdAt: new Date().toISOString()
      }
    })
    
    return getDownloadURL(fileRef)
  } catch (error) {
    console.error('차트 이미지 업로드 실패:', error)
    throw new Error('차트 이미지 업로드에 실패했습니다.')
  }
}

/**
 * 파일 삭제
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const fileRef = ref(storage, path)
    await deleteObject(fileRef)
  } catch (error) {
    console.error('파일 삭제 실패:', error)
    throw new Error('파일 삭제에 실패했습니다.')
  }
}

/**
 * 사용자의 모든 파일 조회
 */
export async function listUserFiles(userId: string): Promise<string[]> {
  try {
    const userRef = ref(storage, `files/${userId}`)
    const result = await listAll(userRef)
    
    return Promise.all(
      result.items.map(item => getDownloadURL(item))
    )
  } catch (error) {
    console.error('파일 목록 조회 실패:', error)
    throw new Error('파일 목록 조회에 실패했습니다.')
  }
}

/**
 * CSV/Excel 파일 업로드 (사용자별 폴더 구조)
 */
export async function uploadDataFile(
  file: File,
  userId: string,
  folderId?: string
): Promise<UploadedFile> {
  const fileName = `${Date.now()}_${file.name}`
  const folderPath = folderId ? `files/${userId}/${folderId}` : `files/${userId}`
  const path = `${folderPath}/${fileName}`
  
  return uploadFile(file, path, {
    metadata: {
      customMetadata: {
        userId,
        folderId: folderId || 'root',
        fileType: 'data'
      }
    }
  })
}
