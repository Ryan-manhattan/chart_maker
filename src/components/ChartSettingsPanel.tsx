'use client'

import { ChartCustomization } from '@/types/chart'
import { Settings, Type, Palette, Grid, Tag } from 'lucide-react'
import { useState } from 'react'

interface ChartSettingsPanelProps {
  customization: ChartCustomization
  onChange: (customization: ChartCustomization) => void
}

const colorPresets = [
  {
    name: '기본',
    colors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
  },
  {
    name: '비즈니스',
    colors: ['#1E293B', '#3B82F6', '#14B8A6', '#64748B', '#0EA5E9']
  },
  {
    name: '파스텔',
    colors: ['#93C5FD', '#86EFAC', '#FCD34D', '#FCA5A5', '#C4B5FD']
  },
  {
    name: '단색',
    colors: ['#64748B', '#475569', '#334155', '#1E293B', '#0F172A']
  },
]

const ChartSettingsPanel: React.FC<ChartSettingsPanelProps> = ({ 
  customization, 
  onChange 
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'colors' | 'advanced'>('basic')

  const updateCustomization = (key: keyof ChartCustomization, value: any) => {
    onChange({
      ...customization,
      [key]: value,
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">차트 설정</h3>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-3 py-2 text-sm font-medium ${
            activeTab === 'basic'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600'
          }`}
        >
          기본
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`px-3 py-2 text-sm font-medium ${
            activeTab === 'colors'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600'
          }`}
        >
          색상
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-3 py-2 text-sm font-medium ${
            activeTab === 'advanced'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600'
          }`}
        >
          고급
        </button>
      </div>

      {/* 기본 설정 */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              차트 제목
            </label>
            <input
              type="text"
              value={customization.title || ''}
              onChange={(e) => updateCustomization('title', e.target.value)}
              placeholder="차트 제목을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              범례 표시
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={customization.showLegend ?? true}
                onChange={(e) => updateCustomization('showLegend', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              격자 표시
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={customization.showGrid ?? true}
                onChange={(e) => updateCustomization('showGrid', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      )}

      {/* 색상 설정 */}
      {activeTab === 'colors' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              색상 테마 선택
            </label>
            <div className="grid grid-cols-2 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateCustomization('colors', preset.colors)}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-md hover:border-primary"
                >
                  <div className="flex gap-1">
                    {preset.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-700">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용자 정의 색상
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(customization.colors || colorPresets[0].colors).map((color, index) => (
                <div key={index} className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...(customization.colors || colorPresets[0].colors)]
                      newColors[index] = e.target.value
                      updateCustomization('colors', newColors)
                    }}
                    className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 고급 설정 */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X축 레이블
            </label>
            <input
              type="text"
              value={customization.xAxisLabel || ''}
              onChange={(e) => updateCustomization('xAxisLabel', e.target.value)}
              placeholder="X축 레이블"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Y축 레이블
            </label>
            <input
              type="text"
              value={customization.yAxisLabel || ''}
              onChange={(e) => updateCustomization('yAxisLabel', e.target.value)}
              placeholder="Y축 레이블"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ChartSettingsPanel
