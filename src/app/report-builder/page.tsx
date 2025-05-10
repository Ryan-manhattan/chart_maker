'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReportProvider, useReport } from '@/contexts/ReportContext'
import MultiFileUploader from '@/components/MultiFile/MultiFileUploader'
import ChartGrid from '@/components/MultiFile/ChartGrid'
import ChartEditorModal from '@/components/MultiFile/ChartEditorModal'
import { ReportChart } from '@/types/report'
import { Save, Share2, LayoutGrid, Upload, FileText, Eye, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

const ReportBuilderContent = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'charts' | 'preview'>('files')
  const [showChartEditor, setShowChartEditor] = useState(false)
  const [editingChart, setEditingChart] = useState<ReportChart | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const {
    files,
    charts,
    layout,
    title,
    description,
    isLoading,
    error,
    addFiles,
    removeFile,
    addChart,
    updateChart,
    removeChart,
    updateLayout,
    saveReport,
    updateTitle,
    updateDescription
  } = useReport()

  const handleAddChart = () => {
    setEditingChart(undefined)
    setShowChartEditor(true)
  }

  const handleEditChart = (chart: ReportChart) => {
    setEditingChart(chart)
    setShowChartEditor(true)
  }

  const handleSaveChart = (chart: ReportChart) => {
    if (editingChart) {
      updateChart(chart.id, chart)
    } else {
      addChart(chart)
    }
    setShowChartEditor(false)
    setEditingChart(undefined)
  }

  const handleSaveReport = async () => {
    setIsSaving(true)
    try {
      const reportId = await saveReport()
      router.push(`/report/${reportId}`)
    } catch (error) {
      console.error('리포트 저장 실패:', error)
      alert('리포트 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
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
                <input
                  type="text"
                  value={title}
                  onChange={(e) => updateTitle(e.target.value)}
                  className="text-xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-primary rounded px-2"
                  placeholder="리포트 제목"
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => updateDescription(e.target.value)}
                  className="mt-1 block text-sm text-gray-500 bg-transparent border-none outline-none focus:ring-2 focus:ring-primary rounded px-2"
                  placeholder="리포트 설명 (선택사항)"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveReport}
                disabled={isSaving || charts.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                저장
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Share2 className="w-4 h-4" />
                공유
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('files')}
              className={`pb-3 px-2 border-b-2 transition-colors ${
                activeTab === 'files'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                파일 업로드
              </span>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`pb-3 px-2 border-b-2 transition-colors ${
                activeTab === 'charts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                차트 관리
              </span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-3 px-2 border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                미리보기
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <MultiFileUploader
              files={files}
              onFilesAdded={addFiles}
              onFileRemove={removeFile}
              isLoading={isLoading}
            />
            {files.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab('charts')}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  파일 업로드 완료 - 차트 생성하기
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="h-[calc(100vh-300px)]">
            {charts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 차트가 없습니다
                </h3>
                <p className="text-gray-500 mb-6">
                  업로드한 파일로 첫 번째 차트를 만들어보세요
                </p>
                <button
                  onClick={handleAddChart}
                  disabled={files.length === 0}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  차트 추가
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm h-full overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">차트 관리</h3>
                  <button
                    onClick={handleAddChart}
                    disabled={files.length === 0}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    차트 추가
                  </button>
                </div>
                <ChartGrid
                  charts={charts}
                  layout={layout}
                  onChartEdit={handleEditChart}
                  onChartRemove={removeChart}
                  onLayoutChange={updateLayout}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-gray-600 mt-2">{description}</p>
              )}
            </div>
            
            {charts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">미리보기할 차트가 없습니다.</p>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>

      {/* 차트 편집 모달 */}
      <ChartEditorModal
        isOpen={showChartEditor}
        onClose={() => setShowChartEditor(false)}
        files={files}
        chart={editingChart}
        onSave={handleSaveChart}
      />
    </div>
  )
}

// 메인 페이지 컴포넌트
export default function ReportBuilderPage() {
  return (
    <ReportProvider>
      <ReportBuilderContent />
    </ReportProvider>
  )
}
