# 배포 체크리스트

## GitHub에 푸시하기 전 확인사항

### 1. 환경 설정
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `.env.example` 파일이 모든 필요한 환경 변수를 포함하는지 확인
- [ ] `package.json`에 모든 의존성이 정확히 명시되어 있는지 확인

### 2. 보안
- [ ] API 키나 시크릿이 코드에 하드코딩되어 있지 않은지 확인
- [ ] `.gitignore`가 적절히 설정되어 있는지 확인
- [ ] Firebase 보안 규칙이 설정되어 있는지 확인

### 3. 빌드 테스트
- [ ] `npm install` 실행
- [ ] `npm run build` 성공하는지 확인
- [ ] `npm run start` 실행해서 프로덕션 빌드가 잘 동작하는지 확인

## GitHub 업로드

1. **리포지토리 생성**
   - https://github.com/Ryan-manhattan 접속
   - "New repository" 클릭
   - Repository name: `chart_maker`
   - Public으로 설정
   - "Create repository" 클릭

2. **로컬 연결**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: ChartAI project"
   git branch -M main
   git remote add origin [YOUR_REPO_URL]
   git push -u origin main
   ```

## Vercel 배포

### 1. Vercel CLI 설치
```bash
npm install -g vercel
```

### 2. Vercel 로그인
```bash
vercel login
```

### 3. 프로젝트 배포
```bash
# 첫 배포 (프로젝트 설정)
vercel

# 이후 배포
vercel --prod
```

### 4. 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수들을 설정해야 합니다:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXTAUTH_SECRET=your_secret
OPENAI_API_KEY=your_openai_key
```

### 5. 도메인 설정
- Vercel 대시보드에서 커스텀 도메인 설정
- Firebase Auth에서 새 도메인을 허용 도메인으로 추가

## 배포 후 확인사항

- [ ] 웹사이트가 정상적으로 로딩되는지 확인
- [ ] Firebase 인증이 작동하는지 확인
- [ ] 파일 업로드가 정상적으로 동작하는지 확인
- [ ] 차트 생성이 잘 되는지 확인
- [ ] 공유 기능이 동작하는지 확인

## 문제 해결

### 빌드 오류
- `next.config.js` 설정 확인
- TypeScript 에러 확인
- 의존성 버전 확인

### 런타임 오류
- 브라우저 콘솔 확인
- Vercel 함수 로그 확인
- Firebase 보안 규칙 확인

### 환경 변수 오류
- Vercel 대시보드에서 환경 변수 확인
- 변수명 오타 확인
- 클라이언트 측 변수는 `NEXT_PUBLIC_` 접두사 필요

## 유용한 명령어

```bash
# 로컬 개발
npm run dev

# 프로덕션 빌드
npm run build
npm run start

# Vercel 배포
vercel
vercel --prod

# GitHub 업데이트
git add .
git commit -m "Update: description"
git push origin main
```
