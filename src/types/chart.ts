export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter'

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

export interface ChartConfig {
  type: ChartType
  data: ChartData
  options?: any
}

export interface ParsedData {
  headers: string[]
  data: any[]
  rowCount: number
  preview: any[]
}

export interface ChartCustomization {
  title?: string
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  chartType?: ChartType
  xAxisLabel?: string
  yAxisLabel?: string
}

export interface ChartRecommendation {
  type: ChartType
  title: string
  description: string
  confidence: number
  previewData: ChartData
}
