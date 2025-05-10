# ChartAI 프로젝트 메모리

## 프로젝트 특화 지침 및 주의사항

### 개발 환경 설정
- Next.js 14 + TypeScript + TailwindCSS 스택 사용
- `src` 폴더 기반 디렉토리 구조
- App Router 사용 (`/app` 디렉토리)

### 차트 라이브러리 사용 시 주의사항
1. **Chart.js 컴포넌트 등록**
   - 모든 Chart.js 컴포넌트는 사용 전 반드시 등록 필요
   - `Chart.js`에서 필요한 컴포넌트들 import 하여 등록
   - 트리 쉐이킹 최적화 적용
   
2. **lucide-react 아이콘 오류 해결**
   - `ChartAreaIcon` → `AreaChart`로 변경 (정확한 아이콘 이름 사용)
   - `BarChart3`, `LineChart`, `PieChart` 등 정확한 이름으로 import

### 파일 업로드 관련
1. **react-dropzone 사용**
   - `acceptedFiles`, `rejectedFiles` 배열은 undefined 체크 필수
   - 파일 크기 제한: 10MB
   - CSV/Excel 파일만 허용

2. **파일 파싱**
   - CSV: `papaparse` 사용
   - Excel: `xlsx` 라이브러리 사용
   
3. **CSV 파싱 개선 사항** (2025-05-11 수정)
   - delimiter 자동 감지 옵션 추가 (`delimiter: ''`)
   - 구분자 후보 목록 제공 (`delimitersToGuess: [',', '\t', '|', ';']`)
   - 동적 타입 변환 활성화 (`dynamicTyping: true`)
   - 에러를 경고로 처리하여 파싱 계속 진행

### TypeScript 타입 관리
- 모든 undefined 상태 체크 필수
- 컴포넌트 props 타입 정의 철저히
- `types` 폴더에 모든 공통 타입 정의

### Firebase 연동
- 환경 변수로 민감 정보 관리
- Auth, Firestore, Storage 모듈 별도 초기화
- Firebase 설정은 `/lib` 폴더에서 관리

### Firebase Storage/Firestore 구현 (2025-05-11)
1. **Storage 유틸리티 함수**
   - `uploadFile()`: 일반 파일 업로드
   - `uploadChartImage()`: 차트 이미지 업로드
   - `uploadDataFile()`: 사용자별 데이터 파일 업로드
   - `deleteFile()`: 파일 삭제
   - `listUserFiles()`: 사용자 파일 목록 조회

2. **Firestore 유틸리티 함수**
   - **차트 관련**: `saveChart()`, `updateChart()`, `getChart()`, `getUserCharts()`
   - **폴더 관련**: `createFolder()`, `updateFolder()`, `getUserFolders()`
   - **리포트 관련**: `saveReport()`, `updateReport()`, `getReport()`, `getUserReports()`
   - **공유 관련**: `createShareLink()`, `updateSharePermissions()`

3. **SavePanel 컴포넌트 업데이트**
   - 클라우드 저장 기능 추가
   - 공유 링크 생성 기능
   - 기존 차트 업데이트/새 차트 저장 분기 처리
   - 저장 상태 표시 (성공/실패/진행 중)

4. **데이터 구조**
   - Chart 타입: 차트 메타데이터 및 설정
   - Folder 타입: 폴더 구조 관리
   - Report 타입: 다중 차트 리포트
   - 공유 설정: 공유 URL 및 권한 관리

### 다중 파일 리포트 시스템 (2025-05-11 구현)
1. **새로운 타입 정의** (`/types/report.ts`)
   - `UploadedFile`: 업로드된 파일 메타데이터
   - `ReportChart`: 리포트용 차트 설정
   - `ReportLayout`: 레이아웃 정보
   - `Report`: 리포트 전체 데이터 구조

2. **ReportContext**
   - 리포트 상태 관리 (파일, 차트, 레이아웃)
   - 파일 업로드/삭제 기능
   - 차트 추가/편집/삭제 기능
   - 레이아웃 관리 (그리드/자유 배치)
   - 리포트 저장/불러오기

3. **주요 컴포넌트**
   - **MultiFileUploader**: 여러 파일 동시 업로드
   - **ChartEditorModal**: 차트 생성/편집 모달
   - **ChartGrid**: 차트 배치 및 레이아웃 관리
   - **ReportBuilder**: 리포트 생성 페이지

4. **페이지 구조**
   - `/report-builder`: 리포트 생성/편집
   - `/report/[reportId]`: 개별 리포트 보기

### 성능 최적화 (2025-05-11 적용)
1. **번들 크기 최적화**
   - Chart.js 트리 쉐이킹 적용
   - Firebase SDK 트리 쉐이킹
   - Dynamic imports로 코드 분할
   - Webpack 설정 최적화

2. **이미지 최적화**
   - WebP 포맷 자동 적용
   - 이미지 압축 및 리사이징
   - 캐싱 전략 구현 (`imageCache` 클래스)
   - Canvas 이미지 최적화

3. **파일 처리 최적화**
   - 청크 단위 대용량 파일 파싱
   - Worker 스레드 활용 (`worker: true`)
   - 메모리 효율적인 Excel 처리
   - 파일 미리보기 최적화

4. **React 최적화**
   - `React.memo` 적용
   - `useCallback`, `useMemo` 활용
   - 불필요한 리렌더링 방지

### 테스트 환경 구축 (2025-05-11)
1. **Playwright E2E 테스트**
   - 전체 사용자 플로우 테스트
   - 성능 테스트 시나리오
   - 에러 처리 테스트
   - 반응형 디자인 테스트

2. **Lighthouse CI**
   - 성능 메트릭 자동 측정
   - 접근성 검사
   - SEO 최적화 확인
   - 번들 크기 모니터링

3. **성능 지표 설정**
   - FCP < 2초
   - LCP < 3초
   - CLS < 0.1
   - 번들 크기 < 1MB

### 개발 기록 (2025-05-11)
#### 전체 기능 테스트 및 최적화 완료 (✅)
1. **성능 최적화**
   - Next.js 설정 최적화
   - 번들 분할 전략 구현
   - 이미지 최적화 시스템
   - 파일 처리 성능 개선
   
2. **테스트 환경**
   - Playwright E2E 테스트 구축
   - Lighthouse CI 설정
   - 성능 대시보드 구현
   
3. **코드 품질 개선**
   - React hooks 최적화
   - TypeScript 타입 정의 강화
   - 에러 처리 개선

#### 배포 인프라 구축 완료 (✅)
1. **CI/CD 파이프라인**
   - GitHub Actions 워크플로 구성
   - 자동 테스트 및 빌드
   - Vercel 자동 배포
   - 수동 트리거 배포 옵션
   
2. **컨테이너화**
   - Dockerfile 작성
   - docker-compose.yml 설정
   - 멀티 스테이지 빌드 최적화
   - 환경 변수 관리
   
3. **Kubernetes 설정**
   - 배포 매니페스트 작성
   - 서비스 및 인그레스 설정
   - 시크릿 관리
   - 헬스 체크 및 리소스 제한
   
4. **백업 시스템**
   - Firebase 자동 백업 스크립트
   - 정기 백업 스케줄링
   - 백업 파일 관리
   - Slack 알림 연동
   
5. **배포 검증**
   - post-deploy 검증 스크립트
   - 헬스 체크 자동화
   - SSL 인증서 확인
   - 성능 지표 모니터링

### UI/UX 관련
1. **드래그 앤 드롭**
   - 템플릿 선택은 react-beautiful-dnd 사용 예정
   - 파일 업로드와 템플릿 선택 모두 드래그 앤 드롭 지원

2. **차트 커스터마이징**
   - 실시간 미리보기 필수
   - 색상, 레이블, 타입 등 상세 설정 가능

### 개발 패턴
1. **컴포넌트 분리**
   - 각 기능별로 컴포넌트 분리
   - 재사용 가능한 컴포넌트는 공통화
   
2. **상태 관리**
   - React Context 사용
   - 전역 상태는 최소화

3. **에러 처리**
   - try-catch 블록 적절히 사용
   - 사용자 친화적인 에러 메시지 제공

### Firebase 보안 규칙 (미구현)
```javascript
// Firestore 규칙 예시
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /charts/{chartId} {
      allow read: if isValidUser() && 
        (resource.data.userId == request.auth.uid ||
         resource.data.shareSettings.isPublic);
      allow write: if isValidUser() && 
        request.resource.data.userId == request.auth.uid;
    }
    
    match /reports/{reportId} {
      allow read: if isValidUser() &&
        (resource.data.userId == request.auth.uid ||
         resource.data.shareSettings.isPublic);
      allow write: if isValidUser() &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}

// Storage 규칙 예시
service firebase.storage {
  match /b/{bucket}/o {
    match /charts/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /files/{userId}/{allPaths=**} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### 배포 관련 주의사항 (2025-05-11)
1. **환경 변수 보안**
   - GitHub Secrets에 모든 민감 정보 저장
   - Vercel 환경 변수와 동기화
   - Firebase Service Account Key 관리
   - Slack Webhook URL 보안
   
2. **Dockerfile 최적화**
   - 멀티 스테이지 빌드로 이미지 크기 최소화
   - Node.js alpine 이미지 사용
   - .dockerignore 파일 관리
   - 빌드 인자로 환경 변수 전달
   
3. **Kubernetes 설정**
   - 리소스 요청/제한 설정
   - 3개 레플리카로 고가용성 보장
   - 헬스 체크 타임아웃 조정
   - Ingress TLS 설정
   
4. **CI/CD 최적화**
   - 캐시 전략 활용
   - 병렬 작업 실행
   - 테스트 실패 시 조기 종료
   - 배포 후 자동 검증
   
5. **백업 전략**
   - 일일 백업 (최근 7개 보관)
   - 메타데이터와 실제 파일 분리
   - 백업 상태 모니터링
   - 복구 테스트 주기적 수행

### 배포 트러블슈팅 (2025-05-11)
1. **일반적인 배포 오류**
   - 빌드 타임아웃: `npm run build` 최적화 필요
   - 환경 변수 미설정: GitHub Secrets 확인
   - Docker 이미지 크기: 멀티 스테이지 빌드 검증
   - Kubernetes 리소스 부족: 노드 스케일링
   
2. **Vercel 배포 문제**
   - 프로젝트 ID 불일치: VERCEL_PROJECT_ID 재확인
   - 빌드 오류: Next.js 설정 점검
   - 환경 변수 누락: Vercel 대시보드 설정
   - 배포 타임아웃: 함수 타임아웃 설정 증가
   
3. **Firebase 백업 이슈**
   - 서비스 어카운트 권한 부족
   - 백업 스토리지 용량 초과
   - 백업 스크립트 실행 오류
   - Slack 알림 실패

### 배포 체크리스트 정리
- [ ] 모든 환경 변수 설정 완료
- [ ] Firebase 보안 규칙 업데이트
- [ ] SSL 인증서 자동 갱신 설정
- [ ] Cloudflare/CDN 캐싱 규칙 설정
- [ ] 백업 스토리지 접근 권한 확인
- [ ] Grafana/DataDog 모니터링 설정
- [ ] Sentry 에러 트래킹 연동
- [ ] Lighthouse 점수 90+ 달성

### 최적화 고려사항
1. **성능**
   - 파일 크기 18kb 미만 유지
   - 긴 파일은 2-3개로 분할
   
2. **번들 크기**
   - 필요한 라이브러리만 import
   - Tree shaking 고려한 import 방식 사용
   
3. **배포 최적화**
   - CDN 엣지 캐싱 활용
   - 정적 자원 버저닝
   - 빌드 캐시 활용
   - Docker 레이어 캐싱

### AI 기능 개발 시 주의사항
- OpenAI API 키 환경 변수 관리
- AI 응답 오류 처리
- 토큰 제한 고려

### 알려진 이슈 및 개선사항
1. **성능 최적화**
   - 대용량 파일 업로드 시 메모리 관리 개선
   - 다중 차트 렌더링 최적화 필요
   
2. **UX 개선**
   - 리포트 빌더 진행 상태 표시 강화
   - 더 직관적인 레이아웃 편집 UI
   
3. **기능 확장**
   - 차트 애니메이션 추가
   - 고급 차트 타입 지원
   - PDF 다운로드 기능

### 성능 모니터링
- Lighthouse CI 자동화
- Bundle Analyzer 정기 실행
- 성능 대시보드 확인
- 사용자 메트릭 수집
- Vercel Analytics 통합
- Firebase Performance Monitoring
- Sentry 실시간 에러 추적
- Slack 배포 알림 자동화

---

마지막 업데이트: 2025-05-11 전체 기능 테스트, 성능 최적화 및 배포 인프라 구축 완료

### 배포 관련 스크립트 참고
```bash
# 빠른 배포 명령어
alias deploy-prod="git push origin main"
alias deploy-staging="gh workflow run deploy.yml -f environment=staging"

# 로컬 테스트
alias test-build="npm run build && npm run lighthouse"
alias docker-test="docker build --no-cache -t chartai:test . && docker run -p 3000:3000 chartai:test"

# 백업 관련
alias backup-now="node scripts/backup-firebase.js"
alias list-backups="ls -la backups/"

# 배포 검증
alias check-deploy="./scripts/post-deploy.sh https://your-domain.com"
alias monitor="watch 'kubectl get pods && kubectl logs -f deployment/chartai'"
```

### 필수 참고 링크
- 배포 워크플로: `.github/workflows/deploy.yml`
- Kubernetes 설정: `k8s/`
- 백업 스크립트: `scripts/backup-firebase.js`
- 배포 검증: `scripts/post-deploy.sh`
- Vercel 프로젝트: `https://vercel.com/dashboard`
- GitHub Actions: `https://github.com/your-org/chartai/actions`
