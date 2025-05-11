'use client'

import { useState, useEffect } from 'react'
import { X, BarChart3, LineChart, PieChart, CircleDashed, Hexagon } from 'lucide-react'
import { UploadedFile, ReportChart, ChartPosition } from '@/types/report'
import { ChartType } from '@/types/chart'
import ChartPreview from '@/components/ChartPreview'

interface ChartEditorModalProps {
  isOpen: boolean
  onClose: () => void
  files: UploadedFile[]
  chart?: ReportChart
  onSave: (chart: ReportChart) => void
}

const chartTypes: Array<{ type: ChartType; icon: any; label: string }> = [
  { type: 'bar', icon: BarChart3, label: '막대 차트' },
  { type: 'line', icon: LineChart, label: '선 차트' },
  { type: 'pie', icon: PieChart, label: '파이 차트' },
  { type: 'doughnut', icon: CircleDashed, label: '도넛 차트' },
  { type: 'radar', icon: Hexagon, label: '레이더 차트' },
  // { type: 'polarArea', icon: PieChart, label: '극좌표 영역 차트' },
]

const ChartEditorModal: React.FC<ChartEditorModalProps> = ({
  isOpen,
  onClose,
  files,
  chart,
  onSave
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [previewData, setPreviewData] = useState<any>(null)

  // 기존 차트 편집인 경우 폼 초기화
  useEffect(() => {
    if (chart) {
      setSelectedFileId(chart.fileId)
      setSelectedColumns(chart.selectedColumns)
      setChartType(chart.type)
      setTitle(chart.title)
      setDescription(chart.description || '')
    } else {
      // 새 차트 생성 시 초기화
      setSelectedFileId('')
      setSelectedColumns([])
      setChartType('bar')
      setTitle('')
      setDescription('')
    }
  }, [chart])

  useEffect(() => {
    if (selectedFileId && selectedColumns.length > 0) {
      generatePreviewData()
    }
  }, [selectedFileId, selectedColumns, chartType])

  const generatePreviewData = () => {
    const file = files.find(f => f.id === selectedFileId)
    if (!file) return

    const data = file.parsedData.data

    // 첫 번째 컬럼은 레이블로 사용
    const labelColumn = selectedColumns[0]
    const dataColumns = selectedColumns.slice(1)

    const labels = data.map(row => row[labelColumn]?.toString() || '').slice(0, 10)
    const datasets = dataColumns.map(column => ({
      label: column,
      data: data.slice(0, 10).map(row => {
        const value = row[column]
        return typeof value === 'number' ? value : parseFloat(value) || 0
      }),
      backgroundColor: [
        '#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4'
      ],
      borderColor: '#ffffff',
      borderWidth: 1
    }))

    setPreviewData({
      labels,
      datasets
    })
  }

  const selectedFile = files.find(f => f.id === selectedFileId)
  const availableColumns = selectedFile?.parsedData.headers || []

  const handleColumnToggle = (column: string) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter(c => c !== column))
    } else {
      setSelectedColumns([...selectedColumns, column])
    }
  }

  const handleSave = () => {
    if (!selectedFileId || selectedColumns.length === 0 || !title) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    const defaultPosition: ChartPosition = {
      x: 0,
      y: 0,
      width: 400,
      height: 300
    }

    const newChart: ReportChart = {
      id: chart?.id || `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileId: selectedFileId,
      type: chartType,
      title,
      description,
      selectedColumns,
      position: chart?.position || defaultPosition,
      data: previewData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          title: {
            display: true,
            text: title
          }
        }
      }
    }

    onSave(newChart)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {chart ? '차트 편집' : '새 차트 만들기'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 설정 */}
            <div className="space-y-6">
              {/* 파일 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  데이터 소스
                </label>
                <select
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                >
                  <option value="">파일을 선택하세요</option>
                  {files.map(file => (
                    <option key={file.id} value={file.id}>
                      {file.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 컬럼 선택 */}
              {selectedFileId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    컬럼 선택
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded">
                    {availableColumns.map(column => (
                      <label key={column} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(column)}
                          onChange={() => handleColumnToggle(column)}
                          className="accent-primary"
                        />
                        <span className="text-sm">{column}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    첫 번째 컬럼은 레이블로 사용됩니다.
                  </p>
                </div>
              )}

              {/* 차트 타입 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  차트 타입
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {chartTypes.map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`p-3 rounded-lg border transition-all ${
                        chartType === type
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${
                        chartType === type ? 'text-primary' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs block ${
                        chartType === type ? 'text-primary' : 'text-gray-600'
                      }`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 차트 정보 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    차트 제목
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                    placeholder="차트 제목을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명 (선택)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                    placeholder="차트에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* 오른쪽: 미리보기 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미리보기
              </label>
              <div className="border border-gray-200 rounded-lg p-4 bg-white" style={{ height: '400px' }}>
                {previewData ? (
                  <ChartPreview
                    data={previewData}
                    config={{
                      type: chartType,
                      options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom'
                          },
                          title: {
                            display: true,
                            text: title || '차트 미리보기'
                          }
                        }
                      }
                    }}
                    customization={{}}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    데이터 소스와 컬럼을 선택하세요
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFileId || selectedColumns.length === 0 || !title}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {chart ? '업데이트' : '생성'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChartEditorModal
