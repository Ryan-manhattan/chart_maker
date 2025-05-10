'use client'

import FileUploader from '@/components/FileUploader'
import Link from 'next/link'
import { AreaChart, ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function UploadPage() {
  const { user, signOut } = useAuth()
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>뒤로</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <AreaChart className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-bold">ChartAI</h1>
            </div>
          </div>
          <nav className="flex gap-4">
            {user ? (
              <>
                <span className="text-gray-600">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={signOut}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  로그인
                </Link>
                <Link href="/signup" className="btn-primary">
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            데이터 파일 업로드
          </h1>
          <p className="text-gray-600">
            CSV 또는 Excel 파일을 업로드하면 AI가 최적의 차트를 추천해드립니다
          </p>
        </div>

        <FileUploader />

        {/* Tips Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">업로드 팁</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 첫 번째 행은 컬럼명으로 인식됩니다</li>
            <li>• 지원 파일 형식: CSV, XLSX, XLS</li>
            <li>• 최대 파일 크기: 10MB</li>
            <li>• 빈 셀은 자동으로 0 또는 빈 문자열로 처리됩니다</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
