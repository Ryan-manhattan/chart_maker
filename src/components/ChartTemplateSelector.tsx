'use client'

import { DragEvent, useState } from 'react'
import { ChartConfig, ChartType } from '@/types/chart'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Radar, 
  Sparkles, 
  CheckCircle,
  TrendingUp
} from 'lucide-react'

interface ChartTemplateSelectorProps {
  aiRecommendations: ChartConfig[]
  selectedTemplate: ChartConfig | null
  onTemplateSelect: (template: ChartConfig) => void
  isLoadingAI: boolean
}

const chartIcons: Record<ChartType, any> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  doughnut: PieChart,
  radar: Radar,
  polarArea: PieChart,
  bubble: TrendingUp,
  scatter: TrendingUp,
}

const ChartTemplateSelector: React.FC<ChartTemplateSelectorProps> = ({
  aiRecommendations,
  selectedTemplate,
  onTemplateSelect,
  isLoadingAI,
}) => {
  const [draggedTemplate, setDraggedTemplate] = useState<ChartConfig | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDragStart = (e: DragEvent<HTMLDivElement>, template: ChartConfig) => {
    setDraggedTemplate(template)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', template.type)
  }

  const handleDragEnd = () => {
    setDraggedTemplate(null)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    
    if (draggedTemplate) {
      onTemplateSelect(draggedTemplate)
    }
  }

  const isSelected = (template: ChartConfig) => {
    return selectedTemplate?.type === template.type
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-gray-900">차트 템플릿</h3>
      </div>

      {/* AI 추천 섹션 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">AI 추천</h4>
        {isLoadingAI ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {aiRecommendations.map((template, index) => {
              const Icon = chartIcons[template.type]
              return (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, template)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onTemplateSelect(template)}
                  className={`
                    p-3 border rounded-md cursor-move transition-all
                    ${isSelected(template) 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {template.type} 차트
                        </span>
                        {isSelected(template) && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {index === 0 ? '최고 추천' : '대안'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 드롭 존 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors
          ${dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300'
          }
        `}
      >
        <p className="text-sm text-gray-500">
          {dragOver 
            ? '여기에 드롭하세요' 
            : '템플릿을 드래그하여 선택하세요'
          }
        </p>
      </div>

      {/* 수동 차트 타입 선택 */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">모든 차트 타입</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(chartIcons).map(([type, Icon]) => (
            <button
              key={type}
              onClick={() => {
                const template: ChartConfig = {
                  type: type as ChartType,
                  data: {
                    labels: [],
                    datasets: []
                  }
                }
                onTemplateSelect(template)
              }}
              className={`
                p-2 border rounded-md flex items-center justify-center gap-2
                ${selectedTemplate?.type === type 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-primary/50'
                }
              `}
            >
              <Icon className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-700 capitalize">{type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChartTemplateSelector
