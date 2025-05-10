'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { 
  ReportContextType, 
  ReportState, 
  UploadedFile, 
  ReportChart, 
  ReportLayout, 
  ChartPosition,
  Report
} from '@/types/report'
import { parseFile } from '@/utils/fileParser'
import { saveReport as saveReportToFirestore, getReport } from '@/utils/firebase/firestore'
import { uploadDataFile } from '@/utils/firebase/storage'
import { useAuth } from '@/contexts/AuthContext'

const defaultLayout: ReportLayout = {
  type: 'grid',
  columns: 2,
  rows: 2,
  gaps: { x: 16, y: 16 }
}

const initialState: ReportState = {
  files: [],
  charts: [],
  layout: defaultLayout,
  title: '새 리포트',
  description: '',
  isLoading: false,
  error: null
}

const ReportContext = createContext<ReportContextType | null>(null)

interface ReportProviderProps {
  children: ReactNode
}

export const ReportProvider = ({ children }: ReportProviderProps) => {
  const [state, setState] = useState<ReportState>(initialState)
  const { user } = useAuth()

  // 파일 관련 메서드
  const addFiles = useCallback(async (files: File[]) => {
    if (!user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const uploadPromises = files.map(async (file) => {
        // 파일 파싱
        const parsedData = await parseFile(file)
        
        // Firebase Storage에 업로드
        const uploadedFile = await uploadDataFile(file, user.uid)
        
        const fileObj: UploadedFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.name.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 
                file.name.toLowerCase().endsWith('.xls') ? 'xls' : 'csv',
          parsedData,
          uploadedAt: new Date(),
          size: file.size,
          url: uploadedFile.url
        }
        
        return fileObj
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      
      setState(prev => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles],
        isLoading: false
      }))
    } catch (error) {
      console.error('파일 업로드 실패:', error)
      setState(prev => ({
        ...prev,
        error: '파일 업로드에 실패했습니다.',
        isLoading: false
      }))
    }
  }, [user])

  const removeFile = useCallback((fileId: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId),
      charts: prev.charts.filter(chart => chart.fileId !== fileId)
    }))
  }, [])

  const updateFile = useCallback((fileId: string, updates: Partial<UploadedFile>) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      )
    }))
  }, [])

  // 차트 관련 메서드
  const addChart = useCallback((chart: Omit<ReportChart, 'id'>) => {
    const newChart: ReportChart = {
      ...chart,
      id: `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    setState(prev => ({
      ...prev,
      charts: [...prev.charts, newChart]
    }))
  }, [])

  const updateChart = useCallback((chartId: string, updates: Partial<ReportChart>) => {
    setState(prev => ({
      ...prev,
      charts: prev.charts.map(chart => 
        chart.id === chartId ? { ...chart, ...updates } : chart
      )
    }))
  }, [])

  const removeChart = useCallback((chartId: string) => {
    setState(prev => ({
      ...prev,
      charts: prev.charts.filter(chart => chart.id !== chartId)
    }))
  }, [])

  // 레이아웃 관련 메서드
  const updateLayout = useCallback((layout: ReportLayout) => {
    setState(prev => ({ ...prev, layout }))
  }, [])

  const updateChartPosition = useCallback((chartId: string, position: ChartPosition) => {
    setState(prev => ({
      ...prev,
      charts: prev.charts.map(chart => 
        chart.id === chartId ? { ...chart, position } : chart
      )
    }))
  }, [])

  // 리포트 관련 메서드
  const saveReport = useCallback(async (): Promise<string> => {
    if (!user) throw new Error('로그인이 필요합니다.')

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        title: state.title,
        description: state.description,
        files: state.files,
        charts: state.charts,
        layout: state.layout,
        shareSettings: {
          isPublic: false,
          permissions: {}
        }
      }

      const reportId = await saveReportToFirestore(reportData)
      
      setState(prev => ({ ...prev, isLoading: false }))
      
      return reportId
    } catch (error) {
      console.error('리포트 저장 실패:', error)
      setState(prev => ({
        ...prev,
        error: '리포트 저장에 실패했습니다.',
        isLoading: false
      }))
      throw error
    }
  }, [user, state])

  const loadReport = useCallback(async (reportId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const report = await getReport(reportId)
      
      if (!report) {
        throw new Error('리포트를 찾을 수 없습니다.')
      }

      setState({
        files: report.files,
        charts: report.charts,
        layout: report.layout,
        title: report.title,
        description: report.description || '',
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('리포트 로딩 실패:', error)
      setState(prev => ({
        ...prev,
        error: '리포트를 불러오는데 실패했습니다.',
        isLoading: false
      }))
    }
  }, [])

  const clearReport = useCallback(() => {
    setState(initialState)
  }, [])

  // 메타데이터 관련 메서드
  const updateTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, title }))
  }, [])

  const updateDescription = useCallback((description: string) => {
    setState(prev => ({ ...prev, description }))
  }, [])

  const contextValue: ReportContextType = {
    ...state,
    addFiles,
    removeFile,
    updateFile,
    addChart,
    updateChart,
    removeChart,
    updateLayout,
    updateChartPosition,
    saveReport,
    loadReport,
    clearReport,
    updateTitle,
    updateDescription
  }

  return (
    <ReportContext.Provider value={contextValue}>
      {children}
    </ReportContext.Provider>
  )
}

export const useReport = () => {
  const context = useContext(ReportContext)
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider')
  }
  return context
}

export default ReportContext
