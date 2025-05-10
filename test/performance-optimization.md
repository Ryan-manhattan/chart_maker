# 성능 최적화 및 개선 계획

## 🔍 현재 상태 분석

### 주요 성능 이슈
1. **번들 크기**
   - Chart.js와 react-chartjs-2로 인한 큰 번들 크기
   - Firebase SDK 전체 포함
   - Unused imports 및 중복 코드

2. **메모리 관리**
   - 대용량 CSV 파일 처리 시 메모리 부하
   - 다중 차트 렌더링 시 메모리 누수 가능성
   - 이미지 업로드/다운로드 최적화 필요

3. **네트워크 최적화**
   - Firebase Storage 이미지 로딩 지연
   - 차트 이미지 캐싱 미적용
   - API 호출 최적화 부족

## 🚀 최적화 전략

### 1. 번들 크기 최적화

#### 1.1 Dynamic Imports
```typescript
// Before
import ChartPreview from '@/components/ChartPreview'

// After
const ChartPreview = lazy(() => import('@/components/ChartPreview'))
```

#### 1.2 Chart.js 트리 쉐이킹
```typescript
// Before
import Chart from 'chart.js/auto'

// After
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)
```

#### 1.3 Firebase 트리 쉐이킹
```typescript
// Before
import firebase from 'firebase/app'

// After
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
// 필요한 모듈만 import
```

### 2. 코드 분할 (Code Splitting)

#### 2.1 라우트 기반 분할
```typescript
// app/layout.tsx
const Dashboard = lazy(() => import('./dashboard/page'))
const ReportBuilder = lazy(() => import('./report-builder/page'))
```

#### 2.2 컴포넌트 기반 분할
```typescript
// 무거운 컴포넌트들 지연 로딩
const ChartEditorModal = lazy(() => import('@/components/MultiFile/ChartEditorModal'))
const ChartGrid = lazy(() => import('@/components/MultiFile/ChartGrid'))
```

### 3. 캐싱 전략

#### 3.1 브라우저 캐싱
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

#### 3.2 Firebase 캐싱
```typescript
// utils/firebase/storage.ts
const getCachedImage = async (imageUrl: string) => {
  const cached = sessionStorage.getItem(imageUrl)
  if (cached) {
    return cached
  }
  
  const response = await fetch(imageUrl)
  const blob = await response.blob()
  const base64 = await blobToBase64(blob)
  
  sessionStorage.setItem(imageUrl, base64)
  return base64
}
```

### 4. 이미지 최적화

#### 4.1 이미지 압축
```typescript
// utils/imageOptimization.ts
export const compressImage = async (
  dataUrl: string,
  maxWidth = 800,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      ctx.drawImage(img, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}
```

#### 4.2 WebP 포맷 사용
```typescript
// 차트 이미지 저장 시 WebP 포맷 우선 사용
const saveChartImage = async (canvas: HTMLCanvasElement) => {
  const supportsWebP = await supportsWebPFormat()
  const format = supportsWebP ? 'image/webp' : 'image/png'
  const quality = supportsWebP ? 0.8 : 1.0
  
  return canvas.toDataURL(format, quality)
}
```

### 5. 데이터 처리 최적화

#### 5.1 청크 단위 파일 처리
```typescript
// utils/fileParser.ts
export const parseFileInChunks = async (
  file: File,
  chunkSize = 1024 * 1024 // 1MB
): Promise<ParsedData> => {
  const chunks = []
  let offset = 0
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize)
    const result = await parseChunk(chunk)
    chunks.push(result)
    offset += chunkSize
  }
  
  return mergeChunks(chunks)
}
```

#### 5.2 Web Workers 활용
```typescript
// workers/csv-parser.worker.ts
self.onmessage = async (event) => {
  const { file, options } = event.data
  
  try {
    const result = await Papa.parse(file, options)
    self.postMessage({ success: true, data: result })
  } catch (error) {
    self.postMessage({ success: false, error: error.message })
  }
}
```

### 6. React 최적화

#### 6.1 메모이제이션
```typescript
// 컴포넌트 메모이제이션
const ChartPreview = React.memo(({ data, config }) => {
  // ...
})

// 커스텀 훅 메모이제이션
const useChartData = (rawData: any[]) => {
  return useMemo(() => {
    return processChartData(rawData)
  }, [rawData])
}
```

#### 6.2 가상화 (Virtualization)
```typescript
// 대용량 리스트 가상화
import { FixedSizeList as List } from 'react-window'

const VirtualizedList = ({ items }: { items: any[] }) => (
  <List
    height={400}
    itemCount={items.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index]}
      </div>
    )}
  </List>
)
```

## 📊 성능 측정 및 모니터링

### 1. 웹 바이탈 측정
```typescript
// pages/_app.tsx
export function reportWebVitals(metric: any) {
  console.log(metric)
  
  // Google Analytics로 전송
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true,
    })
  }
}
```

### 2. 번들 분석
```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "latest"
  }
}
```

### 3. 성능 대시보드
```typescript
// components/PerformanceDashboard.tsx
const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
  })
  
  useEffect(() => {
    // 성능 메트릭 수집
    measurePerformance(setMetrics)
  }, [])
  
  return (
    <div>
      <h2>성능 메트릭</h2>
      <div>FCP: {metrics.fcp}ms</div>
      <div>LCP: {metrics.lcp}ms</div>
      <div>FID: {metrics.fid}ms</div>
      <div>CLS: {metrics.cls}</div>
    </div>
  )
}
```

## 🛠 구현 우선순위

### Phase 1: 즉시 적용 가능한 최적화
1. ✅ Firebase 트리 쉐이킹
2. ✅ Chart.js 최적화
3. ✅ 이미지 압축 적용
4. ✅ 기본 캐싱 전략

### Phase 2: 중급 최적화
1. 🔄 Dynamic imports 적용
2. 🔄 Web Workers 구현
3. 🔄 청크 단위 파일 처리
4. 🔄 React 메모이제이션

### Phase 3: 고급 최적화
1. ⏳ CDN 도입
2. ⏳ 서버 사이드 렌더링 최적화
3. ⏳ 엣지 캐싱
4. ⏳ 성능 모니터링 시스템

## 📈 예상 성능 개선 효과

| 개선사항 | 예상 효과 |
|---------|----------|
| 번들 크기 최적화 | 40% 감소 |
| 이미지 최적화 | 로딩 시간 60% 단축 |
| 캐싱 전략 | 재방문 시 80% 빠른 로딩 |
| 코드 분할 | 초기 로딩 시간 50% 단축 |
| 전체 최적화 | Lighthouse 점수 90+ 달성 |

## 🚨 주의사항
1. 과도한 최적화는 개발 복잡도 증가
2. 메모리 사용량 증가 주의
3. 호환성 문제 확인 필요
4. A/B 테스트로 효과 검증

---

작성일: 2025-05-11
