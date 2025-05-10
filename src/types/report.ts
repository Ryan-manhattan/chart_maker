import { ParsedData, ChartConfig, ChartType } from './chart'

export interface UploadedFile {
  id: string
  name: string
  type: 'csv' | 'xlsx' | 'xls'
  parsedData: ParsedData
  uploadedAt: Date
  size: number
  url?: string  // Firebase Storage URL
}

export interface ChartPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface ReportChart extends ChartConfig {
  id: string
  fileId: string  // 참조할 파일 ID
  title: string
  description?: string
  selectedColumns: string[]
  position: ChartPosition
  options: any
}

export interface ReportLayout {
  type: 'grid' | 'free'
  columns: number
  rows: number
  gaps: { x: number; y: number }
}

export interface Report {
  id?: string
  userId: string
  title: string
  description?: string
  files: UploadedFile[]
  charts: ReportChart[]
  layout: ReportLayout
  shareSettings?: {
    isPublic: boolean
    shareUrl?: string
    permissions: Record<string, 'view' | 'edit'>
  }
  createdAt: Date | any
  updatedAt: Date | any
}

// 리포트 템플릿 타입
export interface ReportTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  layout: ReportLayout
  chartSlots: Array<{
    id: string
    type: ChartType
    title: string
    position: ChartPosition
    suggestedColumns: string[]
  }>
}

// 차트 편집 모달을 위한 타입
export interface ChartEditorModalProps {
  isOpen: boolean
  onClose: () => void
  files: UploadedFile[]
  chart?: ReportChart
  onSave: (chart: ReportChart) => void
}

// 리포트 상태 관리를 위한 타입
export interface ReportState {
  files: UploadedFile[]
  charts: ReportChart[]
  layout: ReportLayout
  title: string
  description: string
  isLoading: boolean
  error: string | null
}

export interface ReportContextType extends ReportState {
  // 파일 관련
  addFiles: (files: File[]) => Promise<void>
  removeFile: (fileId: string) => void
  updateFile: (fileId: string, updates: Partial<UploadedFile>) => void
  
  // 차트 관련
  addChart: (chart: Omit<ReportChart, 'id'>) => void
  updateChart: (chartId: string, updates: Partial<ReportChart>) => void
  removeChart: (chartId: string) => void
  
  // 레이아웃 관련
  updateLayout: (layout: ReportLayout) => void
  updateChartPosition: (chartId: string, position: ChartPosition) => void
  
  // 리포트 관련
  saveReport: () => Promise<string>
  loadReport: (reportId: string) => Promise<void>
  clearReport: () => void
  
  // 메타데이터
  updateTitle: (title: string) => void
  updateDescription: (description: string) => void
}
