import { ParsedData, ChartConfig, ChartCustomization, ChartData } from '@/types/chart'

export const prepareChartData = (
  data: ParsedData,
  chartConfig: ChartConfig,
  customization: ChartCustomization
): ChartData => {
  // 기본 색상 팔레트
  const defaultColors = [
    '#4F46E5', // 인디고
    '#10B981', // 에메랄드
    '#F59E0B', // 앰버
    '#EF4444', // 레드
    '#8B5CF6', // 바이올렛
    '#14B8A6', // 틸
    '#F97316', // 오렌지
    '#6366F1', // 인디고 라이트
  ]

  // 사용자 지정 색상 또는 기본 색상 사용
  const colors = customization.colors || defaultColors

  // 첫 번째 열을 레이블로, 나머지 열을 데이터로 사용
  const labels = data.data.map(row => row[0]?.toString() || '')
  
  // 데이터셋 생성
  const datasets = data.headers.slice(1).map((header, index) => {
    const values = data.data.map(row => {
      const value = row[index + 1]
      // 숫자로 변환, 실패하면 0
      const numValue = typeof value === 'number' ? value : parseFloat(value)
      return isNaN(numValue) ? 0 : numValue
    })

    return {
      label: header,
      data: values,
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }
  })

  // 파이/도넛 차트의 경우 첫 번째 데이터셋만 사용
  if (chartConfig.type === 'pie' || chartConfig.type === 'doughnut') {
    return {
      labels,
      datasets: [{
        label: 'Values',
        data: datasets[0]?.data || [],
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
      }]
    }
  }

  // 스캐터/버블 차트의 경우 특별 처리
  if (chartConfig.type === 'scatter' || chartConfig.type === 'bubble') {
    const scatterData = data.data.map((row, index) => ({
      x: parseFloat(row[1]) || 0,
      y: parseFloat(row[2]) || 0,
      r: chartConfig.type === 'bubble' ? (parseFloat(row[3]) || 5) : undefined,
    }))

    return {
      labels: [],
      datasets: [{
        label: labels[0] || 'Data',
        data: scatterData,
        backgroundColor: colors[0],
        borderColor: colors[0],
        borderWidth: 1,
      }]
    }
  }

  return {
    labels,
    datasets,
  }
}

export const generateChartBase64 = async (chartRef: any): Promise<string> => {
  if (!chartRef?.current) {
    throw new Error('차트 참조가 없습니다.')
  }

  // Chart.js의 toBase64Image 메서드 사용
  const base64 = chartRef.current.toBase64Image('image/png', 1)
  return base64
}

export const downloadChart = (base64: string, filename: string = 'chart') => {
  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = base64
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
