'use client'

import { useState, useEffect } from 'react'
import { AreaChart, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import ChartPreview from '@/components/ChartPreview'
import ChartTemplateSelector from '@/components/ChartTemplateSelector'
import DataPreview from '@/components/DataPreview'
import ChartSettingsPanel from '@/components/ChartSettingsPanel'
import AISummaryPanel from '@/components/AISummaryPanel'
import SavePanel from '@/components/SavePanel'
import { ParsedData } from '@/types/chart'
import { ChartConfig, ChartCustomization } from '@/types/chart'
import { generateAIRecommendations } from '@/utils/aiRecommendations'
import { useRouter, useSearchParams } from 'next/navigation'
import { getChart } from '@/utils/firebase/firestore'

export default function ChartPage() {
  const [data, setData] = useState<ParsedData | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ChartConfig | null>(null)
  const [customization, setCustomization] = useState<ChartCustomization>({
    showLegend: true,
    showGrid: true,
  })
  const [aiRecommendations, setAiRecommendations] = useState<ChartConfig[]>([])
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [existingChartId, setExistingChartId] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // URL에서 차트 ID 확인
    const chartId = searchParams.get('id')
    
    if (chartId) {
      // 기존 차트 불러오기
      loadExistingChart(chartId)
    } else {
      // 새로운 차트 생성
      loadNewChartData()
    }
  }, [searchParams])

  const loadExistingChart = async (chartId: string) => {
    try {
      const chart = await getChart(chartId)
      if (chart) {
        setExistingChartId(chartId)
        setData(chart.data)
        setSelectedTemplate({
          type: chart.type,
          options: chart.options
        })
        setCustomization({
          ...chart.options,
          title: chart.title,
          description: chart.description
        })
      }
    } catch (error) {
      console.error('차트 로딩 실패:', error)
      // 실패하면 새로운 차트로 처리
      loadNewChartData()
    }
  }

  const loadNewChartData = () => {
    // localStorage에서 차트 데이터 가져오기
    const storedData = localStorage.getItem('chartData')
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setData(parsedData)
      
      // AI 추천 생성
      generateAIRecommendationsAsync(parsedData)
    }
  }

  const generateAIRecommendationsAsync = async (parsedData: ParsedData) => {
    setIsLoadingAI(true)
    try {
      const recommendations = await generateAIRecommendations(parsedData)
      setAiRecommendations(recommendations)
      
      // 첫 번째 추천 차트를 기본으로 선택 (기존 차트 편집이 아닌 경우)
      if (recommendations.length > 0 && !existingChartId) {
        setSelectedTemplate(recommendations[0])
      }
    } catch (error) {
      console.error('AI 추천 생성 실패:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">데이터를 로딩하는 중...</p>
          <Link href="/upload" className="text-primary hover:underline">
            파일 업로드 페이지로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/upload" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>업로드</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <AreaChart className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-bold">ChartAI</h1>
              {existingChartId && <span className="text-sm text-gray-500">(편집 모드)</span>}
            </div>
          </div>
          <nav className="flex gap-4 items-center">
            <button 
              onClick={() => generateAIRecommendationsAsync(data)}
              disabled={isLoadingAI}
              className="flex items-center gap-2 text-primary hover:text-primary/80 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoadingAI ? '분석 중...' : 'AI 재분석'}
            </button>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              로그인
            </Link>
            <Link href="/signup" className="btn-primary">
              회원가입
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Data Preview & Template Selector */}
          <div className="lg:col-span-3 space-y-6">
            <DataPreview data={data} />
            <ChartTemplateSelector
              aiRecommendations={aiRecommendations}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              isLoadingAI={isLoadingAI}
            />
          </div>

          {/* Center - Chart Preview */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {existingChartId ? '차트 편집' : '차트 미리보기'}
              </h2>
              <ChartPreview
                data={data}
                chartConfig={selectedTemplate}
                customization={customization}
              />
            </div>
          </div>

          {/* Right Sidebar - Settings & AI Summary */}
          <div className="lg:col-span-3 space-y-6">
            <ChartSettingsPanel
              customization={customization}
              onChange={setCustomization}
            />
            <AISummaryPanel
              data={data}
              chartConfig={selectedTemplate}
            />
            <SavePanel
              data={data}
              chartConfig={selectedTemplate}
              customization={customization}
              existingChartId={existingChartId || undefined}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
