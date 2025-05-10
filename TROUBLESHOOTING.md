# ChartAI 트러블슈팅 가이드

## 자주 발생하는 문제들

### 1. 차트가 렌더링되지 않음
```
Error: "X" is not a registered scale.
```
**해결방법**: Chart.js 스케일과 컴포넌트가 제대로 등록되었는지 확인
```typescript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  // ... 필요한 컴포넌트들
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  // ... 필요한 컴포넌트들
)
```

### 2. 파일 업로드가 작동하지 않음
```
Failed to parse file
```
**해결방법**: 
- 파일 형식 확인 (CSV, XLSX, XLS만 지원)
- 파일 크기 확인 (10MB 이하)
- 브라우저의 JavaScript 권한 확인

### 3. Firebase 연결 오류
```
Firebase: No Firebase App '[DEFAULT]' has been created
```
**해결방법**: 
- `.env.local` 파일 생성 및 Firebase 설정 확인
- 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사)

### 4. TypeScript 에러
```
Module '"papaparse"' has no exported member 'ParseConfig'
```
**해결방법**: 타입 정의 설치
```bash
npm install --save-dev @types/papaparse
```

### 5. TailwindCSS 스타일이 적용되지 않음
**해결방법**: 
- `tailwind.config.js`의 content 경로 확인
- `globals.css`에서 Tailwind 디렉티브 확인

## 개발 모드에서 자주 발생하는 경고

### 1. Hydration 불일치
```
Warning: Prop `className` did not match
```
**해결방법**: 서버/클라이언트 렌더링 차이 최소화
- `use client` 디렉티브 사용
- 조건부 렌더링 시 key 속성 사용

### 2. Console 경고
```
Warning: A component is changing an uncontrolled input
```
**해결방법**: 초기값 설정
```typescript
const [value, setValue] = useState('')  // 빈 문자열로 초기화
```

## 성능 최적화 팁

1. **이미지 최적화**
   - Next.js Image 컴포넌트 사용
   - WebP 형식 사용 고려

2. **번들 크기 최적화**
   - Dynamic Import 사용
   - 사용하지 않는 Chart.js 컴포넌트 제외

3. **메모리 누수 방지**
   - useEffect cleanup 함수 사용
   - Chart.js 인스턴스 정리

## 배포 시 주의사항

1. **Vercel 배포**
   - 환경 변수 Vercel 대시보드에 설정
   - 빌드 명령어: `npm run build`

2. **Firebase 호스팅**
   - `firebase.json` 설정 필요
   - Next.js static export 고려

3. **도메인 설정**
   - CORS 설정 확인
   - Firebase Auth 도메인 화이트리스트 설정

## 디버깅 도구

1. **React DevTools**: 컴포넌트 상태 확인
2. **Network 탭**: API 요청 확인
3. **Console**: 에러 메시지 확인
4. **Application 탭**: localStorage, sessionStorage 확인

## 추가 도움이 필요한 경우

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Chart.js 공식 문서](https://www.chartjs.org/docs/latest/)
- [Firebase 공식 문서](https://firebase.google.com/docs)
- [TailwindCSS 공식 문서](https://tailwindcss.com/docs)

## 문제 제보

버그나 개선사항이 있다면 GitHub Issues에 제보해주세요:
1. 문제 상황 설명
2. 재현 단계
3. 기대했던 동작
4. 실제 동작
5. 환경 정보 (브라우저, OS 등)
