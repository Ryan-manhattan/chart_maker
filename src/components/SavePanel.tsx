'use client'

import { ParsedData, ChartConfig, ChartCustomization } from '@/types/chart'
import { Download, Save, Share2, Folder, Image, Link2, Check, AlertCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { saveChart, updateChart, createShareLink } from '@/utils/firebase/firestore'
import { uploadChartImage, uploadDataFile } from '@/utils/firebase/storage'
import { useRouter } from 'next/navigation'
import { optimizeChartImage, compressImage } from '@/utils/imageOptimization'

interface SavePanelProps {
  data: ParsedData
  chartConfig: ChartConfig | null
  customization: ChartCustomization
  existingChartId?: string
}

const SavePanel: React.FC<SavePanelProps> = ({ 
  data, 
  chartConfig, 
  customization, 
  existingChartId 
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [fileName, setFileName] = useState('my-chart')
  const [savedChartId, setSavedChartId] = useState<string | null>(existingChartId || null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (customization.title) {
      setFileName(customization.title.replace(/[^a-z0-9]/gi, '_').toLowerCase())
    }
  }, [customization.title])

  const downloadAsImage = useCallback(async (format: 'png' | 'jpg' | 'webp' = 'png') => {
    try {
      const canvas = document.querySelector('canvas')
      if (!canvas) throw new Error('차트를 찾을 수 없습니다.')

      // 이미지 최적화
      const optimizedDataUrl = await optimizeChartImage(canvas, format === 'jpg' ? 'jpeg' : format, 0.9)
      
      const link = document.createElement('a')
      link.download = `${fileName}.${format}`
      link.href = optimizedDataUrl
      link.click()
    } catch (error) {
      console.error('이미지 다운로드 실패:', error)
      alert('이미지 다운로드에 실패했습니다.')
    }
  }, [fileName])

  const captureChartAsBlob = useCallback(async (): Promise<Blob> => {
    const canvas = document.querySelector('canvas')
    if (!canvas) {
      throw new Error('차트를 찾을 수 없습니다.')
    }

    // WebP를 지원하면 WebP로, 아니면 PNG로
    const dataUrl = await optimizeChartImage(canvas, 'auto', 0.85)
    
    // DataURL을 Blob으로 변환
    const response = await fetch(dataUrl)
    return response.blob()
  }, [])

  const saveToCloud = useCallback(async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      // 1. 차트 이미지 캡처 및 업로드
      let imageUrl = ''
      if (chartConfig) {
        const imageBlob = await captureChartAsBlob()
        const tempChartId = savedChartId || `temp_${Date.now()}`
        imageUrl = await uploadChartImage(imageBlob, tempChartId, user.uid)
      }

      // 3. 차트 메타데이터 저장
      const chartData = {
        userId: user.uid,
        fileId: existingChartId || '',
        type: chartConfig?.type || 'bar',
        title: customization.title || fileName,
        description: customization.description || '',
        data: {
          labels: data.labels,
          datasets: data.datasets,
        },
        options: {
          ...customization,
          ...chartConfig?.options
        },
        imageUrl
      }

      let chartId = savedChartId
      if (chartId) {
        // 기존 차트 업데이트
        await updateChart(chartId, chartData)
      } else {
        // 새로운 차트 저장
        chartId = await saveChart(chartData)
        setSavedChartId(chartId)
      }

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
      
    } catch (error) {
      console.error('저장 실패:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }, [user, router, chartConfig, savedChartId, data, customization, fileName, existingChartId])

  const shareChart = useCallback(async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setIsSharing(true)
    
    try {
      // 먼저 차트가 저장되어 있어야 함
      if (!savedChartId) {
        await saveToCloud()
        // 저장이 실패하면 공유도 안 함
        if (!savedChartId) {
          throw new Error('차트를 저장한 후 공유할 수 있습니다.')
        }
      }

      // 공유 링크 생성
      const url = await createShareLink(savedChartId, 'view')
      setShareUrl(url)

      // 클립보드에 복사
      await navigator.clipboard.writeText(url)
      
      // 브라우저 공유 API 사용 시도
      if (navigator.share) {
        const imageBlob = await captureChartAsBlob()
        const file = new File([imageBlob], `${fileName}.png`, { type: 'image/png' })
        
        await navigator.share({
          title: customization.title || 'My Chart',
          text: '차트를 공유합니다',
          url: url,
          files: [file]
        })
      }
    } catch (error) {
      console.error('공유 실패:', error)
      // 공유 API가 지원되지 않으면 이미지로 다운로드
      if (error instanceof Error && error.message.includes('share')) {
        downloadAsImage('png')
      }
    } finally {
      setIsSharing(false)
    }
  }, [user, router, savedChartId, saveToCloud, fileName, customization, downloadAsImage])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Save className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">저장 및 내보내기</h3>
      </div>

      {/* 파일명 입력 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          파일명
        </label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
          placeholder="차트 이름을 입력하세요"
        />
      </div>

      {/* 다운로드 버튼들 */}
      <div className="space-y-2">
        <button
          onClick={() => downloadAsImage('png')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <Image className="w-4 h-4" />
          PNG로 다운로드
        </button>
        
        <button
          onClick={() => downloadAsImage('jpg')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          JPG로 다운로드
        </button>
        
        <button
          onClick={() => downloadAsImage('webp')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Image className="w-4 h-4" />
          WebP로 다운로드 (최적화)
        </button>
      </div>

      {/* 구분선 */}
      <div className="my-4 border-t border-gray-200" />

      {/* 클라우드 저장 및 공유 */}
      {user ? (
        <div className="space-y-2">
          <button
            onClick={saveToCloud}
            disabled={isSaving}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
              isSaving 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                저장 중...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                저장됨
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                저장 실패
              </>
            ) : (
              <>
                <Folder className="w-4 h-4" />
                내 폴더에 저장
              </>
            )}
          </button>
          
          <button
            onClick={shareChart}
            disabled={isSharing}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
              isSharing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isSharing ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                공유 링크 생성 중...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                차트 공유하기
              </>
            )}
          </button>

          {/* 공유 URL 표시 */}
          {shareUrl && (
            <div className="mt-3 p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-900 mb-2">공유 링크가 생성되었습니다!</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-2 py-1 text-sm border border-green-200 rounded bg-white"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="p-1 hover:bg-green-100 rounded"
                >
                  <Link2 className="w-4 h-4 text-green-700" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 로그인 안내 */
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-900 mb-2">
              로그인하면 차트를 폴더별로 관리하고 협업할 수 있습니다.
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="text-sm text-primary hover:underline font-medium"
            >
              무료 회원가입하기
            </button>
          </div>
          
          {/* 임시 공유 기능 (로그인 없이) */}
          <button
            onClick={() => downloadAsImage('png')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            이미지로 다운로드
          </button>
        </div>
      )}
    </div>
  )
}

export default SavePanel
