'use client'

import { ParsedData, ChartConfig } from '@/types/chart'
import { Brain, MessageCircle, Sparkles, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

interface AISummaryPanelProps {
  data: ParsedData
  chartConfig: ChartConfig | null
}

const AISummaryPanel: React.FC<AISummaryPanelProps> = ({ data, chartConfig }) => {
  const [summary, setSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [userQuestion, setUserQuestion] = useState('')

  useEffect(() => {
    if (data && chartConfig) {
      generateSummary()
    }
  }, [data, chartConfig])

  const generateSummary = async () => {
    setIsLoading(true)
    try {
      // 간단한 AI 요약 (실제로는 OpenAI API 사용 예정)
      const mockSummary = generateMockSummary(data, chartConfig)
      await new Promise(resolve => setTimeout(resolve, 1000)) // 로딩 시뮬레이션
      setSummary(mockSummary)
    } catch (error) {
      console.error('요약 생성 오류:', error)
      setSummary('요약을 생성할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockSummary = (data: ParsedData, chartConfig: ChartConfig | null): string => {
    if (!chartConfig) return ''

    const chartType = chartConfig.type
    const rowCount = data.rowCount
    const columnCount = data.headers.length
    
    // 간단한 통계 계산
    const firstNumericColumn = data.data[0]?.find((val: any) => !isNaN(Number(val)))
    const maxValue = Math.max(...data.data.map(row => {
      const val = row[1]
      return typeof val === 'number' ? val : parseFloat(val) || 0
    }))
    
    let summary = `이 ${chartType} 차트는 ${rowCount}개의 데이터 포인트를 ${columnCount}개의 컬럼으로 분석합니다.\n\n`
    
    switch (chartType) {
      case 'bar':
        summary += `막대 차트로 표현된 데이터에서 가장 높은 값은 ${maxValue.toFixed(2)}입니다. 이는 각 카테고리별로 수치를 비교하기에 적합한 시각화입니다.`
        break
      case 'line':
        summary += `선 차트로 표현된 데이터는 시간에 따른 추이를 잘 보여줍니다. 전체적인 트렌드를 파악하기 용이합니다.`
        break
      case 'pie':
        summary += `파이 차트로 표현된 데이터는 전체에서 각 항목이 차지하는 비율을 보여줍니다. 구성 요소의 상대적 크기를 한눈에 파악할 수 있습니다.`
        break
      default:
        summary += `${chartType} 차트 형태로 데이터를 시각화하여 패턴과 인사이트를 쉽게 파악할 수 있습니다.`
    }
    
    summary += `\n\n주요 인사이트:\n• 데이터의 분포가 상당히 ${maxValue > 100 ? '큰' : '적은'} 편입니다.\n• ${rowCount}개의 샘플을 통해 전체적인 경향을 파악할 수 있습니다.\n• 이 차트는 ${chartType === 'pie' ? '비율 분석' : chartType === 'line' ? '트렌드 분석' : '비교 분석'}에 최적화되어 있습니다.`
    
    return summary
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userQuestion.trim()) return

    // 여기에 AI 질문 처리 로직 추가 (미래 구현)
    console.log('사용자 질문:', userQuestion)
    setUserQuestion('')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-gray-900">AI 인사이트</h3>
      </div>

      {/* AI 요약 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">차트 분석 요약</h4>
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
          </div>
        ) : (
          <div className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded">
            {summary}
          </div>
        )}
      </div>

      {/* AI 챗봇 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          AI에게 질문하기
        </h4>
        <form onSubmit={handleQuestionSubmit} className="space-y-2">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="이 데이터에 대해 궁금한 점을 물어보세요..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!userQuestion.trim()}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            질문하기
          </button>
        </form>
      </div>
    </div>
  )
}

export default AISummaryPanel
