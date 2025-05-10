'use client'

import { ParsedData } from '@/types/chart'
import { Table, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface DataPreviewProps {
  data: ParsedData
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  const [showAll, setShowAll] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(data.headers)

  const displayData = showAll ? data.data : data.preview

  const toggleColumn = (header: string) => {
    setSelectedColumns(prev => 
      prev.includes(header) 
        ? prev.filter(h => h !== header)
        : [...prev, header]
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">데이터 미리보기</h3>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          {showAll ? (
            <>
              <EyeOff className="w-4 h-4" />
              요약
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              전체
            </>
          )}
        </button>
      </div>

      {/* 컬럼 선택 */}
      <div className="mb-3">
        <h4 className="text-xs text-gray-500 mb-2">사용할 컬럼 선택</h4>
        <div className="flex flex-wrap gap-1">
          {data.headers.map((header) => (
            <button
              key={header}
              onClick={() => toggleColumn(header)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedColumns.includes(header)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {header}
            </button>
          ))}
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {data.headers.map((header) => (
                <th 
                  key={header} 
                  className={`px-2 py-1 text-left text-xs font-medium text-gray-500 ${
                    selectedColumns.includes(header) ? '' : 'opacity-50'
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {data.headers.map((header, colIndex) => (
                  <td 
                    key={`${rowIndex}-${colIndex}`} 
                    className={`px-2 py-1 text-gray-700 ${
                      selectedColumns.includes(header) ? '' : 'opacity-50'
                    }`}
                  >
                    {row[colIndex] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 통계 정보 */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>총 {data.rowCount}개 행</span>
          <span>{selectedColumns.length}/{data.headers.length} 컬럼 선택됨</span>
        </div>
      </div>
    </div>
  )
}

export default DataPreview
