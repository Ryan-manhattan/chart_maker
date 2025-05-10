'use client'

import { useState } from 'react'
import { ReportChart, ReportLayout } from '@/types/report'
import { Edit2, Trash2, Move, Grid, MoreVertical } from 'lucide-react'
import ChartPreview from '@/components/ChartPreview'

interface ChartGridProps {
  charts: ReportChart[]
  layout: ReportLayout
  onChartEdit: (chart: ReportChart) => void
  onChartRemove: (chartId: string) => void
  onLayoutChange: (layout: ReportLayout) => void
  isEditable?: boolean
}

const ChartGrid: React.FC<ChartGridProps> = ({
  charts,
  layout,
  onChartEdit,
  onChartRemove,
  onLayoutChange,
  isEditable = true
}) => {
  const [selectedChart, setSelectedChart] = useState<string | null>(null)

  const getGridStyle = () => {
    if (layout.type === 'grid') {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
        gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
        gap: `${layout.gaps.y}px ${layout.gaps.x}px`,
        width: '100%',
        height: '100%'
      }
    }
    return {
      position: 'relative' as const,
      width: '100%',
      height: '100%'
    }
  }

  const getChartStyle = (chart: ReportChart) => {
    if (layout.type === 'free') {
      return {
        position: 'absolute' as const,
        left: `${chart.position.x}px`,
        top: `${chart.position.y}px`,
        width: `${chart.position.width}px`,
        height: `${chart.position.height}px`
      }
    }
    return {}
  }

  const handleLayoutTypeChange = (type: 'grid' | 'free') => {
    onLayoutChange({
      ...layout,
      type
    })
  }

  const handleGridChange = (key: keyof ReportLayout, value: any) => {
    onLayoutChange({
      ...layout,
      [key]: value
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* 레이아웃 컨트롤 */}
      {isEditable && (
        <div className="flex items-center gap-4 p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">레이아웃:</span>
            <button
              onClick={() => handleLayoutTypeChange('grid')}
              className={`px-3 py-1 text-sm rounded ${
                layout.type === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-1" />
              그리드
            </button>
            <button
              onClick={() => handleLayoutTypeChange('free')}
              className={`px-3 py-1 text-sm rounded ${
                layout.type === 'free'
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              <Move className="w-4 h-4 inline mr-1" />
              자유 배치
            </button>
          </div>

          {layout.type === 'grid' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">열:</span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={layout.columns}
                  onChange={(e) => handleGridChange('columns', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">행:</span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={layout.rows}
                  onChange={(e) => handleGridChange('rows', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 차트 그리드 */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <div style={getGridStyle()} className="min-h-full">
          {charts.map((chart) => (
            <div
              key={chart.id}
              style={getChartStyle(chart)}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all ${
                selectedChart === chart.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedChart(chart.id)}
            >
              {/* 차트 헤더 */}
              <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm text-gray-900">{chart.title}</h3>
                  {chart.description && (
                    <p className="text-xs text-gray-500 mt-1">{chart.description}</p>
                  )}
                </div>
                {isEditable && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onChartEdit(chart)
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onChartRemove(chart.id)
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* 차트 컨텐츠 */}
              <div className="p-4">
                <div style={{ height: 'calc(100% - 64px)' }}>
                  <ChartPreview
                    data={chart.data}
                    config={{
                      type: chart.type,
                      options: chart.options
                    }}
                    customization={{}}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* 비어있는 차트 슬롯 (그리드 모드) */}
          {layout.type === 'grid' && charts.length < layout.columns * layout.rows && (
            Array.from({ length: layout.columns * layout.rows - charts.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-white/50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
              >
                <span className="text-gray-400 text-sm">빈 슬롯</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ChartGrid
