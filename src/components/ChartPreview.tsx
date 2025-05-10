'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  ScatterController,
  BubbleController,
} from 'chart.js'
import { Bar, Line, Pie, Doughnut, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2'
import { ParsedData, ChartConfig, ChartCustomization } from '@/types/chart'
import { prepareChartData } from '@/utils/chartDataProcessor'

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  ScatterController,
  BubbleController,
  Title,
  Tooltip,
  Legend
)

interface ChartPreviewProps {
  data: ParsedData
  chartConfig: ChartConfig | null
  customization: ChartCustomization
}

const ChartPreview: React.FC<ChartPreviewProps> = ({ data, chartConfig, customization }) => {
  const chartRef = useRef<ChartJS>(null)

  if (!chartConfig) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <p>차트 템플릿을 선택해주세요</p>
      </div>
    )
  }

  // 차트 데이터 준비
  const processedData = prepareChartData(data, chartConfig, customization)

  // 차트 옵션 설정
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: customization.showLegend,
        position: 'top' as const,
      },
      title: {
        display: !!customization.title,
        text: customization.title || '',
      },
    },
    scales: ['bar', 'line', 'scatter', 'bubble'].includes(chartConfig.type) ? {
      x: {
        display: true,
        title: {
          display: !!customization.xAxisLabel,
          text: customization.xAxisLabel || '',
        },
        grid: {
          display: customization.showGrid,
        },
      },
      y: {
        display: true,
        title: {
          display: !!customization.yAxisLabel,
          text: customization.yAxisLabel || '',
        },
        grid: {
          display: customization.showGrid,
        },
      },
    } : undefined,
  }

  // 차트 타입에 따른 컴포넌트 렌더링
  const renderChart = () => {
    switch (chartConfig.type) {
      case 'bar':
        return <Bar ref={chartRef} data={processedData} options={options} />
      case 'line':
        return <Line ref={chartRef} data={processedData} options={options} />
      case 'pie':
        return <Pie ref={chartRef} data={processedData} options={options} />
      case 'doughnut':
        return <Doughnut ref={chartRef} data={processedData} options={options} />
      case 'radar':
        return <Radar ref={chartRef} data={processedData} options={options} />
      case 'polarArea':
        return <PolarArea ref={chartRef} data={processedData} options={options} />
      case 'bubble':
        return <Bubble ref={chartRef} data={processedData} options={options} />
      case 'scatter':
        return <Scatter ref={chartRef} data={processedData} options={options} />
      default:
        return <Bar ref={chartRef} data={processedData} options={options} />
    }
  }

  return (
    <div className="relative h-64 md:h-96">
      {renderChart()}
    </div>
  )
}

export default ChartPreview
