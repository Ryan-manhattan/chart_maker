'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { UploadedFile } from '@/types/report'

interface MultiFileUploaderProps {
  files: UploadedFile[]
  onFilesAdded: (files: File[]) => Promise<void>
  onFileRemove: (fileId: string) => void
  maxFiles?: number
  maxFileSize?: number
  isLoading?: boolean
}

const MultiFileUploader: React.FC<MultiFileUploaderProps> = ({
  files,
  onFilesAdded,
  onFileRemove,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  isLoading = false
}) => {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)

    // 파일 수 제한 체크
    if (files.length + acceptedFiles.length > maxFiles) {
      setError(`최대 ${maxFiles}개의 파일만 업로드 가능합니다.`)
      return
    }

    // 거부된 파일 처리
    if (rejectedFiles && rejectedFiles.length > 0) {
      const reasons = rejectedFiles.map(file => {
        const errors = file.errors.map((err: any) => err.message).join(', ')
        return `${file.file.name}: ${errors}`
      })
      setError(reasons.join('\n'))
    }

    // 파일 업로드
    if (acceptedFiles.length > 0) {
      try {
        await onFilesAdded(acceptedFiles)
      } catch (error) {
        setError('파일 업로드 중 오류가 발생했습니다.')
      }
    }
  }, [files.length, maxFiles, onFilesAdded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: maxFileSize,
    multiple: true,
    disabled: isLoading
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <Upload className={`w-12 h-12 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? '파일을 여기에 놓아주세요' : '파일을 업로드하세요'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              CSV, Excel 파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-gray-400 mt-1">
              최대 {maxFiles}개, 각 파일 최대 {formatFileSize(maxFileSize)}
            </p>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
        </div>
      )}

      {/* 업로드된 파일 목록 */}
      {files.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
            업로드된 파일 ({files.length}/{maxFiles})
          </div>
          <div className="divide-y divide-gray-200">
            {files.map((file) => (
              <div key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                          {file.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                        <span>{file.parsedData.rowCount}행</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <button
                      onClick={() => onFileRemove(file.id)}
                      disabled={isLoading}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          파일 업로드 중...
        </div>
      )}
    </div>
  )
}

export default MultiFileUploader
