import * as Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { ParsedData } from '@/types/chart'

// 최적화된 파일 파싱 함수들

/**
 * 청크 단위로 CSV 파일 파싱
 * @param file - 파일 객체
 * @param chunkSize - 청크 크기 (bytes)
 * @param onProgress - 진행률 콜백
 * @returns 파싱된 데이터
 */
export const parseCSVInChunks = async (
  file: File,
  chunkSize = 1024 * 1024, // 1MB 청크
  onProgress?: (progress: number) => void
): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    let allData: any[] = []
    let headers: string[] = []
    let totalRead = 0
    let currentRow = 0
    let isFirstChunk = true
    
    const parseConfig: Papa.ParseConfig = {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: '',
      delimitersToGuess: [',', '\t', '|', ';'],
      worker: true, // Worker 스레드 사용
      chunk: (results: Papa.ParseResult<any>, parser: Papa.Parser) => {
        if (isFirstChunk) {
          headers = results.meta.fields || []
          isFirstChunk = false
        }
        
        allData = [...allData, ...results.data]
        totalRead += results.data.length
        currentRow += results.data.length
        
        // 진행률 업데이트
        const progress = Math.min((file.size > 0 ? totalRead / file.size : 0) * 100, 100)
        onProgress?.(progress)
        
        // 메모리 관리: 너무 많은 데이터가 쌓이면 일시 중단
        if (allData.length > 50000) {
          parser.pause()
          setTimeout(() => parser.resume(), 100)
        }
      },
      complete: () => {
        resolve({
          headers,
          data: allData,
          rowCount: currentRow,
          preview: allData.slice(0, 10)
        })
      },
      error: (error) => {
        reject(new Error(`CSV 파싱 오류: ${error.message}`))
      }
    }
    
    Papa.parse(file, parseConfig)
  })
}

/**
 * 메모리 효율적인 Excel 파싱
 */
export const parseExcelOptimized = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result
        if (!data) throw new Error('파일 읽기 실패')
        
        onProgress?.(25)
        
        // Stream으로 Excel 읽기 (메모리 효율적)
        const workbook = XLSX.read(data, {
          type: 'array',
          cellStyles: false,
          cellFormulas: false,
          cellDates: true,
          cellNF: false,
          sheetStubs: false
        })
        
        onProgress?.(50)
        
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        onProgress?.(75)
        
        // JSON으로 변환 (배열 형태)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          dateNF: 'yyyy-mm-dd'
        })
        
        const headers = jsonData[0] as string[] || []
        const dataRows = jsonData.slice(1)
        
        onProgress?.(100)
        
        resolve({
          headers,
          data: dataRows.map(row => {
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header] = row[index]
            })
            return obj
          }),
          rowCount: dataRows.length,
          preview: dataRows.slice(0, 10).map(row => {
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header] = row[index]
            })
            return obj
          })
        })
      } catch (error) {
        reject(new Error(`Excel 파싱 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'))
    }
    
    // 파일을 ArrayBuffer로 읽기
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 파일 타입 감지 및 최적 파서 선택
 */
export const parseFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<ParsedData> => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const fileSize = file.size
  
  // 5MB 이상 파일은 청크 단위 파싱
  const useChunking = fileSize > 5 * 1024 * 1024
  
  switch (extension) {
    case 'csv':
      if (useChunking) {
        return parseCSVInChunks(file, 1024 * 1024, onProgress)
      } else {
        return new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            delimiter: '',
            delimitersToGuess: [',', '\t', '|', ';'],
            complete: (results) => {
              const headers = results.meta.fields || []
              const data = results.data as any[]
              
              resolve({
                headers,
                data,
                rowCount: data.length,
                preview: data.slice(0, 10)
              })
              onProgress?.(100)
            },
            error: (error) => {
              reject(new Error(`CSV 파싱 오류: ${error.message}`))
            }
          })
        })
      }
      
    case 'xlsx':
    case 'xls':
      return parseExcelOptimized(file, onProgress)
      
    default:
      throw new Error(`지원하지 않는 파일 형식: ${extension}`)
  }
}

/**
 * 시작 행부터 파일 파싱
 */
export const parseFileWithStartRow = async (
  file: File,
  startRow: number,
  onProgress?: (progress: number) => void
): Promise<ParsedData> => {
  const fullData = await parseFile(file, onProgress)
  
  if (startRow <= 0) return fullData
  
  return {
    ...fullData,
    headers: fullData.data[startRow - 1] 
      ? Object.keys(fullData.data[startRow - 1])
      : fullData.headers,
    data: fullData.data.slice(startRow),
    rowCount: fullData.data.length - startRow,
    preview: fullData.data.slice(startRow, startRow + 10)
  }
}

/**
 * 파일 내용의 처음 N행만 미리보기
 */
export const previewFile = async (
  file: File,
  lines = 20
): Promise<{ headers: string[]; rows: any[]; totalRows: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    let content = ''
    let position = 0
    const chunkSize = 1024
    
    const readChunk = () => {
      const chunk = file.slice(position, position + chunkSize)
      reader.readAsText(chunk)
    }
    
    reader.onload = (e) => {
      content += e.target?.result as string
      const rows = content.split('\n')
      
      if (rows.length >= lines || position >= file.size) {
        // 파싱
        const headers = rows[0].split(',').map(h => h.trim())
        const dataRows = rows.slice(1, lines).map(row => {
          const values = row.split(',')
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index]?.trim()
          })
          return obj
        })
        
        resolve({
          headers,
          rows: dataRows,
          totalRows: Math.floor(file.size / (content.length / rows.length))
        })
      } else {
        position += chunkSize
        readChunk()
      }
    }
    
    reader.onerror = () => {
      reject(new Error('파일 미리보기 실패'))
    }
    
    readChunk()
  })
}

/**
 * 파일 검증
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // 파일 크기 체크 (100MB 제한)
  if (file.size > 100 * 1024 * 1024) {
    return { isValid: false, error: '파일 크기가 100MB를 초과합니다.' }
  }
  
  // 파일 형식 체크
  const allowedExtensions = ['csv', 'xlsx', 'xls']
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { isValid: false, error: '지원하지 않는 파일 형식입니다. (CSV, Excel만 가능)' }
  }
  
  return { isValid: true }
}

/**
 * 파일 타입별 MIME 타입 확인
 */
export const getFileMimeType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'csv':
      return 'text/csv'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'xls':
      return 'application/vnd.ms-excel'
    default:
      return file.type || 'application/octet-stream'
  }
}

/**
 * 컨럼 타입 추론
 */
export const inferColumnTypes = (data: any[], headers: string[]): Record<string, 'number' | 'string' | 'date'> => {
  const columnTypes: Record<string, 'number' | 'string' | 'date'> = {}
  
  headers.forEach(header => {
    const values = data.map(row => row[header]).filter(v => v !== null && v !== undefined && v !== '')
    
    if (values.length === 0) {
      columnTypes[header] = 'string'
      return
    }
    
    // 숫자 타입 검사
    const numberValues = values.filter(v => !isNaN(Number(v)))
    const numberRatio = numberValues.length / values.length
    
    if (numberRatio > 0.8) {
      columnTypes[header] = 'number'
      return
    }
    
    // 날짜 타입 검사
    const dateValues = values.filter(v => {
      const date = new Date(v)
      return !isNaN(date.getTime()) && v.toString().match(/^\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{4}|^\d{1,2}-\d{1,2}-\d{4}$/)
    })
    const dateRatio = dateValues.length / values.length
    
    if (dateRatio > 0.8) {
      columnTypes[header] = 'date'
      return
    }
    
    // 기본은 문자열
    columnTypes[header] = 'string'
  })
  
  return columnTypes
}


export const readRawFile = async (file: File): Promise<{ content: string; encoding: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (!content) {
        reject(new Error('파일 읽기 실패'))
        return
      }
      
      // 인코딩 감지 (간단한 버전)
      const encoding = content.includes('\ufffd') ? 'UTF-8' : 'UTF-8'
      
      resolve({ content, encoding })
    }
    
    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'))
    }
    
    reader.readAsText(file, 'UTF-8')
  })
}
