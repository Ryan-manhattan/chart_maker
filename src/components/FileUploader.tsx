'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react'
import { parseFile, readRawFile, parseFileWithStartRow, RawFileData } from '@/utils/fileParser'
import { useRouter } from 'next/navigation'
import FilePreview from './FilePreview'

interface FileUploaderProps {
  onFileUpload?: (data: any) => void
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'preview' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rawFileData, setRawFileData] = useState<RawFileData | null>(null)
  const [selectedStartRow, setSelectedStartRow] = useState(0)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const router = useRouter()

  const processFile = useCallback(async (file: File, startRow?: number) => {
    console.log('파일 처리 시작:', file.name, '시작 행:', startRow)
    setUploadStatus('uploading')
    setError(null)
    setFileName(file.name)

    try {
      let parsedData
      if (startRow !== undefined) {
        parsedData = await parseFileWithStartRow(file, startRow)
      } else {
        parsedData = await parseFile(file)
      }
      
      console.log('파일 파싱 완료:', parsedData)
      
      setUploadStatus('success')
      
      if (onFileUpload) {
        onFileUpload(parsedData)
      }

      // 차트 페이지로 이동
      setTimeout(() => {
        localStorage.setItem('chartData', JSON.stringify(parsedData))
        router.push('/chart')
      }, 1000)
    } catch (err) {
      console.error('파일 업로드 오류:', err)
      setUploadStatus('error')
      setError(err instanceof Error ? err.message : '파일 업로드 중 오류가 발생했습니다.')
    }
  }, [onFileUpload, router])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    console.log('파일 드롭:', file.name)
    setCurrentFile(file)
    setUploadStatus('uploading')
    setError(null)
    setFileName(file.name)

    try {
      // 먼저 원시 데이터를 읽어서 미리보기 표시
      const rawData = await readRawFile(file)
      console.log('원시 데이터 읽기 완료:', rawData)
      
      setRawFileData(rawData)
      setUploadStatus('preview')
    } catch (err) {
      console.error('파일 읽기 오류:', err)
      setUploadStatus('error')
      setError(err instanceof Error ? err.message : '파일 읽기 중 오류가 발생했습니다.')
    }
  }, [])

  const handleStartRowSelect = useCallback((rowIndex: number) => {
    setSelectedStartRow(rowIndex)
  }, [])

  const handleConfirm = useCallback(() => {
    if (currentFile) {
      processFile(currentFile, selectedStartRow)
    }
  }, [currentFile, selectedStartRow, processFile])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles = [],
    rejectedFiles = [],
  } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  })

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'border-blue-400 bg-blue-50'
      case 'preview':
        return 'border-gray-300 bg-white'
      case 'success':
        return 'border-green-400 bg-green-50'
      case 'error':
        return 'border-red-400 bg-red-50'
      default:
        return isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 bg-white'
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        )
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-600" />
      default:
        return <Upload className="w-8 h-8 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return '파일을 처리하고 있습니다...'
      case 'success':
        return `${fileName} 업로드 완료! 차트 페이지로 이동합니다...`
      case 'error':
        return error || '업로드 실패'
      default:
        return isDragActive
          ? '파일을 여기에 드롭하세요'
          : '파일을 드래그하거나 클릭하여 업로드하세요'
    }
  }

  // 미리보기 상태일 때는 FilePreview 컴포넌트 표시
  if (uploadStatus === 'preview' && rawFileData) {
    return (
      <FilePreview
        rawData={rawFileData.rawData}
        fileName={rawFileData.fileName}
        onStartRowSelect={handleStartRowSelect}
        onConfirm={handleConfirm}
      />
    )
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${getStatusColor()}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {getStatusIcon()}
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {getStatusText()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              CSV, XLS, XLSX 파일만 업로드 가능 (최대 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* 파일 정보 표시 */}
      {acceptedFiles && acceptedFiles.length > 0 && uploadStatus !== 'success' && uploadStatus !== 'preview' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2">
            <File className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">{acceptedFiles[0].name}</span>
            <span className="text-xs text-gray-500">
              ({(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        </div>
      )}

      {/* 거부된 파일 정보 */}
      {rejectedFiles && rejectedFiles.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <h4 className="text-sm font-medium text-red-900">업로드 실패한 파일:</h4>
          <ul className="mt-1">
            {rejectedFiles.map(({ file, errors }) => (
              <li key={file.name} className="text-sm text-red-700">
                {file.name} - {errors[0]?.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default FileUploader
