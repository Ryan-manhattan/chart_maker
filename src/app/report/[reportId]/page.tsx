'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ReportProvider, useReport } from '@/contexts/ReportContext'
import ChartGrid from '@/components/MultiFile/ChartGrid'
import { Edit, Share2, Download, ArrowLeft, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { createShareLink } from '@/utils/firebase/firestore'

interface ReportPageProps {
  params: {
    reportId: string
  }
}

const ReportPageContent = ({ params }: ReportPageProps) => {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    charts,
    layout,
    title,
    description,
    loadReport
  } = useReport()

  useEffect(() => {
    loadReportData()
  }, [params.reportId])

  const loadReportData = async () => {
    try {
      await loadReport(params.reportId)
    } catch (error) {
      console.error('리포트 로딩 실패:', error)
      setError('리포트를 불러올 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      const url = await createShareLink(params.reportId, 'view')
      setShareUrl(url)
    } catch (error) {
      console.error('공유 링크 생성 실패:', error)
      alert('공유 링크 생성에 실패했습니다.')
    }
  }

  const handleCopyUrl = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
    }
  }

  const handleDownload = () => {
    // 리포트 PDF 다운로드 (추후 구현)
    alert('PDF 다운로드 기능은 준비 중입니다.')
  }

  const handleEdit = () => {
    router.push(`/report-builder?id=${params.reportId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">리포트를 불러올 수 없습니다</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>대시보드</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-500">{description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Edit className="w-4 h-4" />
                편집
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Share2 className="w-4 h-4" />
                공유
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                다운로드
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 공유 URL 섹션 */}
      {shareUrl && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-800">공유 링크가 생성되었습니다:</span>
                <code className="px-2 py-1 bg-white/50 rounded text-sm">{shareUrl}</code>
              </div>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 px-3 py-1 text-sm text-green-700 hover:bg-green-100 rounded"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    복사
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto p-6">
        {charts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">이 리포트에는 차트가 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-[600px]">
              <ChartGrid
                charts={charts}
                layout={layout}
                onChartEdit={() => {}}
                onChartRemove={() => {}}
                onLayoutChange={() => {}}
                isEditable={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 메인 페이지 컴포넌트
export default function ReportPage({ params }: ReportPageProps) {
  return (
    <ReportProvider>
      <ReportPageContent params={params} />
    </ReportProvider>
  )
}
