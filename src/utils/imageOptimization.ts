/**
 * 이미지 최적화 유틸리티
 */

/**
 * 이미지 압축
 * @param dataUrl - 압축할 이미지 데이터 URL
 * @param maxWidth - 최대 너비 (기본값: 800px)
 * @param quality - 품질 (0-1, 기본값: 0.8)
 * @returns 압축된 이미지 데이터 URL
 */
export const compressImage = async (
  dataUrl: string,
  maxWidth = 800,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      
      let { width, height } = img
      
      // 비율 유지하면서 리사이즈
      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      // 이미지 품질 설정
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height)
      
      // WebP 지원 확인 후 포맷 선택
      const format = supportsWebP() ? 'image/webp' : 'image/jpeg'
      resolve(canvas.toDataURL(format, quality))
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = dataUrl
  })
}

/**
 * WebP 포맷 지원 확인
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5
}

/**
 * 차트 이미지 최적화
 * @param canvas - 차트 캔버스 엘리먼트
 * @param format - 이미지 포맷 ('png' | 'jpeg' | 'webp' | 'auto')
 * @param quality - 품질 (0-1)
 * @returns 최적화된 이미지 데이터 URL
 */
export const optimizeChartImage = async (
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp' | 'auto' = 'auto',
  quality = 0.9
): Promise<string> => {
  let selectedFormat = format
  
  if (format === 'auto') {
    selectedFormat = supportsWebP() ? 'webp' : 'png'
  }
  
  // PNG는 quality 무시
  const appliedQuality = selectedFormat === 'png' ? 1.0 : quality
  
  return canvas.toDataURL(`image/${selectedFormat}`, appliedQuality)
}

/**
 * Blob을 Base64로 변환
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Base64를 Blob으로 변환
 */
export const base64ToBlob = (base64: string): Blob => {
  const [header, data] = base64.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png'
  
  const byteCharacters = atob(data)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mime })
}

/**
 * 이미지 미리보기 생성
 * @param file - 이미지 파일
 * @param maxWidth - 최대 너비
 * @param maxHeight - 최대 높이
 * @returns 미리보기 이미지 URL
 */
export const createImagePreview = async (
  file: File,
  maxWidth = 200,
  maxHeight = 200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'))
        return
      }
      
      const dataUrl = e.target.result as string
      
      try {
        const compressed = await compressImage(dataUrl, Math.max(maxWidth, maxHeight), 0.7)
        resolve(compressed)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 이미지 크기 계산
 */
export const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      })
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = dataUrl
  })
}

/**
 * 이미지 캐시 관리
 */
class ImageCache {
  private cache: Map<string, string>
  private maxSize: number
  
  constructor(maxSize = 50) {
    this.cache = new Map()
    this.maxSize = maxSize
  }
  
  get(key: string): string | null {
    const value = this.cache.get(key)
    if (value) {
      // LRU: 최근 사용한 항목을 뒤로 이동
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value || null
  }
  
  set(key: string, value: string): void {
    // 캐시 크기 초과 시 가장 오래된 항목 제거
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, value)
  }
  
  clear(): void {
    this.cache.clear()
  }
}

export const imageCache = new ImageCache()
