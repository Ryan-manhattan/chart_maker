'use client'

import { useState } from 'react'
import { File, CheckCircle, ArrowDown } from 'lucide-react'

interface FilePreviewProps {
  rawData: string[][]  // 파싱되지 않은 원시 데이터
  fileName: string
  onStartRowSelect: (rowIndex: number) => void
  onConfirm: () => void
}

const FilePreview: React.FC<FilePreviewProps> = ({
  rawData,
  fileName,
  onStartRowSelect,
  onConfirm,
}) => {
  const [selectedRow, setSelectedRow] = useState(0)

  const handleRowSelect = (rowIndex: number) => {
    setSelectedRow(rowIndex)
    onStartRowSelect(rowIndex)
  }

  // 자동 추천: 숫자가 많이 포함된 행 찾기
  const recommendStartRow = () => {
    let maxNumericCount = 0
    let recommendedRow = 0

    rawData.forEach((row, index) => {
      const numericCount = row.filter(cell => {
        const num = parseFloat(cell || '')
        return !isNaN(num) && isFinite(num)
      }).length

      if (numericCount > maxNumericCount) {
        maxNumericCount = numericCount
        recommendedRow = index
      }
    })

    return recommendedRow
  }

  const recommendedRow = recommendStartRow()

  // 표시할 행 제한 (처음 20행)
  const displayRows = rawData.slice(0, 20)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <File className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">파일 미리보기</h3>
        <span className="text-sm text-gray-500">({fileName})</span>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">
          데이터가 시작되는 행을 선택해주세요. 선택한 행은 컬럼명(헤더)으로 사용됩니다.
        </p>
        {recommendedRow !== selectedRow && (
          <button
            onClick={() => handleRowSelect(recommendedRow)}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <ArrowDown className="w-3 h-3" />
            AI 추천: {recommendedRow + 1}행을 데이터 시작 행으로 사용
          </button>
        )}
      </div>

      {/* 데이터 테이블 */}
      <div className="overflow-x-auto mb-6">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <tbody>
              {displayRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedRow === rowIndex
                      ? 'bg-primary/10 border-primary/30'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleRowSelect(rowIndex)}
                >
                  <td className="px-3 py-2 w-12">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedRow === rowIndex
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedRow === rowIndex && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-gray-500 text-xs">{rowIndex + 1}행</span>
                    </div>
                  </td>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 max-w-xs truncate">
                      <span className={selectedRow === rowIndex ? 'font-medium' : ''}>
                        {cell || <span className="text-gray-400">—</span>}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rawData.length > 20 && (
        <p className="text-xs text-gray-500 mb-6">
          * 처음 20행만 표시됩니다. 전체 데이터는 {rawData.length}행입니다.
        </p>
      )}

      {/* 선택 요약 */}
      <div className="bg-gray-50 rounded-md p-4 mb-6">
        <div className="text-sm">
          <p className="text-gray-600">
            선택된 시작 행: <span className="font-medium text-gray-900">{selectedRow + 1}행</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            컬럼명: {rawData[selectedRow]?.map(cell => cell || '(빈 값)').join(', ')}
          </p>
        </div>
      </div>

      {/* 확인 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          뒤로
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          차트 생성하기
        </button>
      </div>
    </div>
  )
}

export default FilePreview
