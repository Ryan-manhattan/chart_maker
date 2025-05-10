import { ParsedData, ChartConfig, ChartRecommendation, ChartType } from '@/types/chart'
import { inferColumnTypes } from './fileParser'

// 간단한 AI 추천 로직 (실제로는 OpenAI API를 사용할 예정)
export const generateAIRecommendations = async (data: ParsedData): Promise<ChartConfig[]> => {
  // 컬럼 타입 분석
  const columnTypes = inferColumnTypes(data.data, data.headers)
  
  // 데이터 특성 분석
  const numericColumns = Object.entries(columnTypes).filter(([_, type]) => type === 'number')
  const categoryColumns = Object.entries(columnTypes).filter(([_, type]) => type === 'string')
  const dateColumns = Object.entries(columnTypes).filter(([_, type]) => type === 'date')
  
  // 추천 로직
  const recommendations: ChartRecommendation[] = []
  
  // 1. 시계열 데이터가 있으면 라인 차트 추천
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    recommendations.push({
      type: 'line',
      title: '시계열 트렌드 차트',
      description: '시간에 따른 변화를 보여주는 라인 차트',
      confidence: 0.9,
      previewData: generatePreviewData('line', data),
    })
  }
  
  // 2. 카테고리 데이터가 있으면 바 차트 추천
  if (categoryColumns.length > 0 && numericColumns.length > 0) {
    recommendations.push({
      type: 'bar',
      title: '카테고리별 비교 차트',
      description: '각 카테고리별 값을 비교하는 바 차트',
      confidence: 0.85,
      previewData: generatePreviewData('bar', data),
    })
  }
  
  // 3. 비율 데이터가 있으면 파이 차트 추천
  if (numericColumns.length === 1 && categoryColumns.length === 1) {
    recommendations.push({
      type: 'pie',
      title: '비율 분포 차트',
      description: '전체에서 각 항목이 차지하는 비율을 보여주는 파이 차트',
      confidence: 0.8,
      previewData: generatePreviewData('pie', data),
    })
  }
  
  // 4. 다중 수치 컬럼이 있으면 레이더 차트 추천
  if (numericColumns.length >= 3) {
    recommendations.push({
      type: 'radar',
      title: '다차원 분석 차트',
      description: '여러 지표를 동시에 비교하는 레이더 차트',
      confidence: 0.75,
      previewData: generatePreviewData('radar', data),
    })
  }
  
  // 기본 추천이 없으면 바 차트 추천
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'bar',
      title: '기본 바 차트',
      description: '데이터를 막대 그래프로 표현하는 기본 차트',
      confidence: 0.6,
      previewData: generatePreviewData('bar', data),
    })
  }
  
  // 신뢰도 순으로 정렬
  recommendations.sort((a, b) => b.confidence - a.confidence)
  
  // ChartConfig 형태로 변환
  return recommendations.map(rec => ({
    type: rec.type,
    data: rec.previewData,
    options: {
      plugins: {
        title: {
          display: true,
          text: rec.title,
        },
      },
    },
  }))
}

// 미리보기 데이터 생성
const generatePreviewData = (type: ChartType, data: ParsedData) => {
  // 샘플 데이터 가져오기 (최대 5개 항목)
  const sampleData = data.preview || data.data.slice(0, 5)
  const labels = sampleData.map(row => row[0]?.toString() || '')
  
  // 기본 색상 팔레트
  const colors = [
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
  ]
  
  // 숫자 데이터만 추출
  const numericValues = sampleData.map(row => {
    const value = row[1]
    return typeof value === 'number' ? value : parseFloat(value) || 0
  })
  
  // 차트 타입별 데이터 구조
  switch (type) {
    case 'pie':
    case 'doughnut':
      return {
        labels,
        datasets: [{
          data: numericValues,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        }],
      }
    
    case 'radar':
      return {
        labels: data.headers.slice(1, 6), // 최대 5개 지표
        datasets: [{
          label: 'Sample Data',
          data: sampleData[0]?.slice(1, 6).map((v: any) => 
            typeof v === 'number' ? v : parseFloat(v) || 0
          ) || [],
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: '#4F46E5',
          borderWidth: 2,
        }],
      }
    
    default: // bar, line, etc.
      return {
        labels,
        datasets: [{
          label: data.headers[1] || 'Data',
          data: numericValues,
          backgroundColor: '#4F46E5',
          borderColor: '#4F46E5',
          borderWidth: 1,
        }],
      }
  }
}

// 실제 OpenAI API 호출 (미래 구현 예정)
export const generateAIRecommendationsWithAPI = async (
  data: ParsedData
): Promise<ChartConfig[]> => {
  try {
    // 실제 OpenAI API 호출 코드가 여기에 들어갈 예정
    const response = await fetch('/api/ai-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          headers: data.headers,
          preview: data.preview,
          rowCount: data.rowCount,
        },
      }),
    })
    
    if (!response.ok) {
      throw new Error('AI 추천 생성 실패')
    }
    
    const result = await response.json()
    return result.recommendations
  } catch (error) {
    console.error('AI 추천 생성 중 오류:', error)
    // 오류 발생 시 기본 추천 사용
    return generateAIRecommendations(data)
  }
}

// 차트 적합도 점수 계산
export const calculateChartFitScore = (
  chartType: ChartType,
  data: ParsedData
): number => {
  const columnTypes = inferColumnTypes(data.data, data.headers)
  const numericCount = Object.values(columnTypes).filter(t => t === 'number').length
  const categoryCount = Object.values(columnTypes).filter(t => t === 'string').length
  const dateCount = Object.values(columnTypes).filter(t => t === 'date').length
  
  let score = 0
  
  switch (chartType) {
    case 'line':
      score += dateCount * 30 // 시계열 데이터에 적합
      score += numericCount * 20
      break
      
    case 'bar':
      score += categoryCount * 25 // 카테고리 비교에 적합
      score += numericCount * 20
      break
      
    case 'pie':
    case 'doughnut':
      score += (categoryCount === 1 && numericCount === 1) ? 40 : 0
      break
      
    case 'radar':
      score += numericCount >= 3 ? 35 : 0 // 다차원 비교에 적합
      break
      
    case 'scatter':
    case 'bubble':
      score += numericCount >= 2 ? 30 : 0 // 상관관계 분석에 적합
      break
      
    default:
      score = 10 // 기본 점수
  }
  
  // 0-100 사이로 정규화
  return Math.min(100, Math.max(0, score))
}
