'use client'

import Link from 'next/link'
import { AreaChart, Upload, MousePointer, Download, LogOut, LayoutDashboard, FileBarChart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, signOut } = useAuth()
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-background">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AreaChart className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">ChartAI</h1>
          </div>
          <nav className="flex gap-4 items-center">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  대시보드
                </Link>
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI가 만드는 완벽한 차트
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          CSV 또는 Excel 파일만 업로드하면, AI가 데이터에 가장 적합한 차트를 자동으로 추천하고 생성해드립니다.
        </p>
        <div className="flex gap-4 justify-center items-center flex-wrap">
          {user ? (
            <>
              <Link href="/upload" className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
                <Upload className="w-5 h-5" />
                새 차트 만들기
              </Link>
              <Link href="/report-builder" className="bg-white border border-primary text-primary rounded-md text-lg px-8 py-3 inline-flex items-center gap-2 hover:bg-primary/5 transition-colors">
                <FileBarChart className="w-5 h-5" />
                리포트 만들기
              </Link>
              <Link href="/dashboard" className="border border-gray-300 text-gray-700 rounded-md text-lg px-8 py-3 inline-flex items-center gap-2 hover:bg-gray-50 transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                내 차트 보기
              </Link>
            </>
          ) : (
            <Link href="/upload" className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
              <Upload className="w-5 h-5" />
              데이터 업로드하기
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">
          {user ? '강력한 기능들' : '간단한 3단계로 완성'}
        </h2>
        {user ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AreaChart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">단일 차트</h3>
              <p className="text-gray-600">
                하나의 파일로 빠르게 차트를 생성하세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileBarChart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">다중 파일 리포트</h3>
              <p className="text-gray-600">
                여러 파일 데이터로 종합 리포트를 제작하세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">공유 및 협업</h3>
              <p className="text-gray-600">
                팀원과 간편하게 차트를 공유하고 협업하세요
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. 업로드</h3>
              <p className="text-gray-600">
                CSV 또는 Excel 파일을 드래그하여 업로드하세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MousePointer className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">2. 선택</h3>
              <p className="text-gray-600">
                AI가 추천하는 차트 중 원하는 것을 선택하세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. 저장</h3>
              <p className="text-gray-600">
                커스터마이징 후 이미지로 저장하세요
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Sample Charts Preview */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">
          다양한 차트 유형 지원
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-48 flex items-center justify-center">
            <div className="w-full h-full bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-48 flex items-center justify-center">
            <div className="w-full h-full bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-48 flex items-center justify-center">
            <div className="w-full h-full bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AreaChart className="w-6 h-6 text-primary" />
              <span className="text-gray-600">ChartAI</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="/about">소개</Link>
              <Link href="/pricing">요금제</Link>
              <Link href="/support">고객지원</Link>
              <Link href="/privacy">개인정보처리방침</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
