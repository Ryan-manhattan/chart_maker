'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getChart } from '@/utils/firebase/firestore'
import { Chart } from '@/utils/firebase/firestore'
import ChartPreview from '@/components/ChartPreview'
import { Download, Share2, ArrowLeft, Link2 } from 'lucide-react'

interface Props {
  params: {
    chartId: string
  }
}

const SharedChartPage = ({ params }: Props) => {
  const router = useRouter()
  const [chart, setChart] = useState<Chart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    fetchChart()
  }, [params.chartId])

  const fetchChart = async () => {
    try {
      const chartData = await getChart(params.chartId)
      
      if (!chartData) {
        setError('차트를 찾을 수 없습니다.')
        return
      }

      // 공유 설정 확인
      if (!chartData.shareSettings?.isPublic) {
        setError('이 차트는 공유되지 않았습니다.')
        return
      }

      setChart(chartData)
    } catch (error) {
      console.error('차트 로딩 실패:', error)
      setError('차트를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadAsImage = async (format: 'png' | 'jpg') => {
    try {
      const canvas = document.querySelector('canvas')
      if (!canvas) throw new Error('차트를 찾을 수 없습니다.')

      const link = document.createElement('a')
      link.download = `${chart?.title || 'chart'}.${format}`
      link.href = canvas.toDataURL(`image/${format}`)
      link.click()
    } catch (error) {
      console.error('다운로드 실패:', error)
      alert('다운로드에 실패했습니다.')
    }
  }

  const shareChart = async () => {
    setIsSharing(true)
    try {
      const url = window.location.href
      
      if (navigator.share) {
        await navigator.share({
          title: chart?.title || 'Shared Chart',
          text: '차트를 공유합니다',
          url: url
        })
      } else {
        // 클립보드에 복사
        await navigator.clipboard.writeText(url)
        alert('링크가 클립보드에 복사되었습니다!')
      }
    } catch (error) {
      console.error('공유 실패:', error)
      alert('공유에 실패했습니다.')
    } finally {
      setIsSharing(false)
    }
  }

  const goBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !chart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">차트를 불러올 수 없습니다</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={goBack}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{chart.title}</h1>
                {chart.description && (
                  <p className="text-sm text-gray-500">{chart.description}</p>
                )}
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadAsImage('png')}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                PNG
              </button>
              <button
                onClick={() => downloadAsImage('jpg')}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                JPG
              </button>
              <button
                onClick={shareChart}
                disabled={isSharing}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              >
                {isSharing ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                공유
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          {chart.data && chart.options && (
            <ChartPreview
              data={chart.data}
              config={{
                type: chart.type,
                options: chart.options
              }}
              customization={{
                title: chart.title,
                description: chart.description,
                ...chart.options
              }}
            />
          )}
        </div>

        {/* 차트 정보 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">차트 정보</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">타입</span>
              <p className="text-gray-900 capitalize">{chart.type}</p>
            </div>
            <div>
              <span className="text-gray-500">생성일</span>
              <p className="text-gray-900">
                {chart.createdAt ? new Date(chart.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">공유 URL</span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Link2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div>
              <span className="text-gray-500">권한</span>
              <p className="text-gray-900">읽기 전용</p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by ChartAI</p>
        </div>
      </div>
    </div>
  )
}

export default SharedChartPage
