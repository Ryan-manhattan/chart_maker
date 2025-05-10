'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getUserCharts, getUserFolders, getUserReports } from '@/utils/firebase/firestore'
import { Chart, Folder, Report } from '@/utils/firebase/firestore'
import { 
  Folder as FolderIcon, 
  FileText, 
  Grid, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Share2,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  FileBarChart,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'

const Dashboard = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'charts' | 'folders' | 'reports'>('charts')
  const [charts, setCharts] = useState<Chart[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewDropdown, setShowNewDropdown] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      fetchUserData()
    }
  }, [user, loading, router])

  const fetchUserData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const [chartsData, foldersData, reportsData] = await Promise.all([
        getUserCharts(user.uid),
        getUserFolders(user.uid),
        getUserReports(user.uid)
      ])

      setCharts(chartsData)
      setFolders(foldersData)
      setReports(reportsData)
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: any) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString('ko-KR')
    }
    return new Date(date).toLocaleDateString('ko-KR')
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">내 대시보드</h1>
              <p className="text-sm text-gray-500 mt-1">
                {user?.email || ''} • {charts.length}개 차트 • {folders.length}개 폴더 • {reports.length}개 리포트
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNewDropdown(!showNewDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                새로 만들기
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showNewDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <Link
                    href="/upload"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setShowNewDropdown(false)}
                  >
                    <Grid className="w-4 h-4" />
                    새 차트
                  </Link>
                  <Link
                    href="/report-builder"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setShowNewDropdown(false)}
                  >
                    <FileBarChart className="w-4 h-4" />
                    새 리포트
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      setShowNewDropdown(false)
                      // 폴더 생성 로직 추가 예정
                    }}
                  >
                    <FolderIcon className="w-4 h-4" />
                    새 폴더
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex gap-6 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('charts')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'charts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              차트
            </button>
            <button
              onClick={() => setActiveTab('folders')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'folders'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              폴더
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              리포트
            </button>
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 검색 및 필터 */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            필터
          </button>
        </div>

        {/* 컨텐츠 그리드 */}
        {activeTab === 'charts' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {charts
              .filter(chart => chart.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((chart) => (
                <div key={chart.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
                  <div className="aspect-video bg-gray-100 relative">
                    {chart.imageUrl ? (
                      <img
                        src={chart.imageUrl}
                        alt={chart.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Grid className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Link href={`/chart/${chart.id}`}>
                        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                      </Link>
                      <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <Share2 className="w-4 h-4 text-white" />
                      </button>
                      <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <Edit2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{chart.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(chart.createdAt)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full">
                        {chart.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'folders' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders
              .filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((folder) => (
                <div key={folder.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FolderIcon className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{folder.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(folder.createdAt)}
                      </p>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports
              .filter(report => report.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((report) => (
                <Link key={report.id} href={`/report/${report.id}`}>
                  <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <h3 className="font-medium text-gray-900">{report.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{formatDate(report.updatedAt)}</span>
                            <span>{report.charts?.length || 0}개 차트</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}

        {/* 빈 상태 */}
        {((activeTab === 'charts' && charts.length === 0) ||
          (activeTab === 'folders' && folders.length === 0) ||
          (activeTab === 'reports' && reports.length === 0)) && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {activeTab === 'charts' && '아직 생성된 차트가 없습니다.'}
              {activeTab === 'folders' && '아직 생성된 폴더가 없습니다.'}
              {activeTab === 'reports' && '아직 생성된 리포트가 없습니다.'}
            </p>
            <button
              onClick={() => setShowNewDropdown(!showNewDropdown)}
              className="mt-4 text-primary hover:underline"
            >
              {activeTab === 'charts' && '첫 번째 차트 만들기'}
              {activeTab === 'folders' && '첫 번째 폴더 만들기'}
              {activeTab === 'reports' && '첫 번째 리포트 만들기'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
