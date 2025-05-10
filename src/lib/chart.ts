// Chart.js 최적화: 필요한 컴포넌트만 등록
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  RadarController,
  PolarAreaController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js'

// 필요한 컴포넌트만 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  RadarController,
  PolarAreaController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// 차트 옵션 미리 정의 (메모리 효율화)
export const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
      },
    },
  },
}

// 차트 타입별 최적화된 옵션
export const chartTypeOptions = {
  bar: {
    ...defaultChartOptions,
    indexAxis: 'x' as const,
  },
  line: {
    ...defaultChartOptions,
    tension: 0.1,
    fill: false,
  },
  pie: {
    ...defaultChartOptions,
    cutout: 0,
  },
  doughnut: {
    ...defaultChartOptions,
    cutout: '60%',
  },
  radar: {
    ...defaultChartOptions,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
      },
    },
  },
  polarArea: {
    ...defaultChartOptions,
    scales: {
      r: {
        beginAtZero: true,
      },
    },
  },
}

export default ChartJS
