import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ParsedData, ChartConfig, ChartType } from '@/types/chart'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { data } = await request.json()
    
    // OpenAI에게 데이터 분석 요청
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `당신은 데이터 시각화 전문가입니다. 주어진 데이터를 분석하여 최적의 차트 타입을 추천해주세요.
          
          다음 차트 타입 중에서 추천해주세요:
          - bar: 카테고리별 값 비교
          - line: 시계열 트렌드 분석
          - pie: 비율 분포 표현
          - doughnut: 비율 분포 표현 (도넛 형태)
          - scatter: 두 변수 간 관계 분석
          - bubble: 세 변수 간 관계 분석
          - radar: 다차원 비교 분석
          - polarArea: 극좌표 영역 차트
          
          응답은 다음 JSON 형식으로 해주세요:
          {
            "recommendations": [
              {
                "type": "차트타입",
                "title": "차트 제목",
                "description": "차트 설명",
                "reason": "추천 이유",
                "confidence": 0.0-1.0,
                "config": {
                  "labelColumn": "라벨로 사용할 컬럼",
                  "valueColumns": ["값으로 사용할 컬럼들"],
                  "options": "추가 옵션"
                }
              }
            ]
          }`
        },
        {
          role: "user",
          content: `다음 데이터를 분석해서 최적의 차트를 추천해주세요:
          
          헤더: ${JSON.stringify(data.headers)}
          미리보기 데이터: ${JSON.stringify(data.preview)}
          전체 행 수: ${data.rowCount}
          
          최소 2개, 최대 4개의 차트를 추천해주세요. 각 추천에 대해 구체적인 이유와 설정값을 포함해주세요.`
        }
      ],
      temperature: 0.3,
    })
    
    const aiResponse = completion.choices[0].message.content
    if (!aiResponse) {
      throw new Error('AI로부터 응답을 받지 못했습니다.')
    }
    const recommendations = JSON.parse(aiResponse)
    
    // ChartConfig 형태로 변환
    const chartConfigs: ChartConfig[] = recommendations.recommendations.map((rec: any) => ({
      type: rec.type as ChartType,
      data: generateChartData(rec, data),
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: rec.title,
          },
          legend: {
            position: 'top' as const,
          },
          tooltip: {
            mode: 'index' as const,
            intersect: false,
          },
        },
        ...(rec.type === 'line' && {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }),
      },
      metadata: {
        description: rec.description,
        reason: rec.reason,
        confidence: rec.confidence,
      },
    }))
    
    return NextResponse.json({
      recommendations: chartConfigs,
      success: true,
    })
  } catch (error) {
    console.error('OpenAI API 오류:', error)
    
    // OpenAI API 오류 시 기본 추천 반환
    const fallbackRecommendations = await generateFallbackRecommendations(
      JSON.parse(await request.text()).data
    )
    
    return NextResponse.json({
      recommendations: fallbackRecommendations,
      success: true,
      fallback: true,
    })
  }
}

// 차트 데이터 생성
function generateChartData(recommendation: any, data: ParsedData) {
  const { config } = recommendation
  const { labelColumn, valueColumns } = config
  
  // 샘플 데이터 또는 실제 데이터 사용
  const sampleData = data.preview || data.data.slice(0, 10)
  
  // 라벨과 값 추출
  const labelIndex = data.headers.indexOf(labelColumn)
  const valueIndices = valueColumns.map((col: string) => data.headers.indexOf(col))
  
  const labels = sampleData.map(row => row[labelIndex]?.toString() || '')
  
  // 차트 타입별 데이터 구조
  if (recommendation.type === 'pie' || recommendation.type === 'doughnut') {
    return {
      labels,
      datasets: [{
        label: valueColumns[0],
        data: sampleData.map(row => Number(row[valueIndices[0]]) || 0),
        backgroundColor: generateColors(labels.length),
        borderWidth: 1,
      }],
    }
  } else if (recommendation.type === 'radar') {
    return {
      labels: valueColumns,
      datasets: [{
        label: labels[0],
        data: valueIndices.map((idx: number) => Number(sampleData[0][idx]) || 0),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75, 192, 192)',
      }],
    }
  } else {
    // bar, line, scatter 등
    return {
      labels,
      datasets: valueColumns.map((col: string, i: number) => ({
        label: col,
        data: sampleData.map(row => Number(row[valueIndices[i]]) || 0),
        backgroundColor: generateColors(1)[0],
        borderColor: generateColors(1)[0],
        borderWidth: 1,
        tension: recommendation.type === 'line' ? 0.1 : 0,
      })),
    }
  }
}

// 색상 팔레트 생성
function generateColors(count: number): string[] {
  const baseColors = [
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
  ]
  
  const colors = []
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length])
  }
  return colors
}

// 폴백 추천 생성
async function generateFallbackRecommendations(data: ParsedData): Promise<ChartConfig[]> {
  // 기본 로직으로 추천 생성
  const recommendations: ChartConfig[] = []
  
  // 간단한 바 차트
  recommendations.push({
    type: 'bar',
    data: {
      labels: data.preview?.map(row => row[0]?.toString() || '') || [],
      datasets: [{
        label: data.headers[1] || 'Value',
        data: data.preview?.map(row => Number(row[1]) || 0) || [],
        backgroundColor: '#4F46E5',
      }],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '기본 막대 차트',
        },
      },
    },
    metadata: {
      description: '기본 데이터 비교 차트입니다.',
      confidence: 0.5,
    },
  })
  
  return recommendations
}
