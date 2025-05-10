# ChartAI 프로덕션 배포 가이드

## 🚀 배포 준비 체크리스트

### 1. 환경 변수 설정

#### 프로덕션 환경 변수 (`.env.production`)
```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id

# OpenAI API (선택사항)
OPENAI_API_KEY=your_production_openai_api_key

# 분석 및 모니터링
NEXT_PUBLIC_GOOGLE_ANALYTICS=your_ga_tracking_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# 보안
NEXTAUTH_SECRET=generate_new_random_secret
NEXTAUTH_URL=https://your-domain.com

# 도메인 설정
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Firebase 프로덕션 설정

#### 보안 규칙 (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 차트 보안 규칙
    match /charts/{chartId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         resource.data.shareSettings.isPublic == true);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // 리포트 보안 규칙
    match /reports/{reportId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         resource.data.shareSettings.isPublic == true);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // 폴더 보안 규칙
    match /folders/{folderId} {
      allow read, write: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

#### 보안 규칙 (Storage)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 차트 이미지
    match /charts/{userId}/{chartId}.{ext} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        ext in ['png', 'jpg', 'jpeg', 'webp'] &&
        request.resource.size < 10 * 1024 * 1024; // 10MB 제한
    }
    
    // 업로드 파일
    match /files/{userId}/{fileName} {
      allow read: if request.auth != null && 
        request.auth.uid == userId;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 100 * 1024 * 1024; // 100MB 제한
    }
  }
}
```

### 3. 성능 최적화 설정

#### next.config.js (프로덕션)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 이미지 최적화
  images: {
    domains: ['firebasestorage.googleapis.com', 'your-domain.com'],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; connect-src 'self' https:;",
          },
        ],
      },
    ]
  },
  
  // 캐싱 설정
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*\.(?:jpg|jpeg|png|webp|avif|ico))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000',
          },
        ],
      },
    ]
  },
  
  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/charts',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
```

### 4. 배포 플랫폼별 설정

#### Vercel 배포
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ]
}
```

#### Netlify 배포
```toml
# netlify.toml
[build]
  publish = ".next"
  command = "npm run build"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "origin-when-cross-origin"

[[redirects]]
  from = "/charts"
  to = "/dashboard"
  status = 301
```

#### Docker 배포
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]
```

#### Kubernetes 배포
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chartai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chartai
  template:
    metadata:
      labels:
        app: chartai
    spec:
      containers:
      - name: chartai
        image: your-registry/chartai:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_FIREBASE_API_KEY
          valueFrom:
            secretKeyRef:
              name: chartai-secrets
              key: firebase-api-key
---
apiVersion: v1
kind: Service
metadata:
  name: chartai-service
spec:
  selector:
    app: chartai
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

### 5. 모니터링 및 분석

#### 성능 모니터링
```javascript
// lib/analytics.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

// Google Analytics
export const pageview = (url: string) => {
  window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label: string
  value: number
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
```

#### 사용자 메트릭 수집
```javascript
// lib/metrics.ts
export const trackChartCreation = (chartType: string) => {
  event({
    action: 'chart_created',
    category: 'Charts',
    label: chartType,
    value: 1,
  })
}

export const trackReportGeneration = (reportType: string) => {
  event({
    action: 'report_generated',
    category: 'Reports',
    label: reportType,
    value: 1,
  })
}
```

### 6. 백업 전략

#### Firebase 백업 스크립트
```javascript
// scripts/backup-firebase.js
const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

// Firebase Admin 초기화
const serviceAccount = require('./serviceAccount.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function backupFirestore() {
  const backup = {}
  const collections = ['charts', 'reports', 'folders']
  
  for (const collection of collections) {
    backup[collection] = []
    const snapshot = await db.collection(collection).get()
    
    snapshot.forEach((doc) => {
      backup[collection].push({
        id: doc.id,
        data: doc.data()
      })
    })
  }
  
  const timestamp = new Date().toISOString()
  const filename = `backup-${timestamp}.json`
  
  fs.writeFileSync(path.join('./backups', filename), JSON.stringify(backup, null, 2))
  console.log(`백업 완료: ${filename}`)
}

backupFirestore()
```

### 7. CI/CD 파이프라인

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests
      run: npm run test
    
    - name: Run lint
      run: npm run lint
    
    - name: Run type check
      run: npm run typecheck
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      env:
        VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
        VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      run: |
        npm install -g vercel
        vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 8. 보안 체크리스트

- [ ] 모든 환경 변수가 안전하게 설정됨
- [ ] Firebase 보안 규칙 테스트 완료
- [ ] HTTPS 설정 완료
- [ ] Content Security Policy 적용
- [ ] XSS 방어 헤더 설정
- [ ] CSRF 토큰 구현
- [ ] Rate Limiting 설정
- [ ] 민감한 정보 하드코딩 제거
- [ ] 의존성 보안 검사 완료

### 9. 성능 최종 확인

#### Lighthouse 대시보드
```javascript
// scripts/lighthouse-check.js
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']})
  const options = {logLevel: 'info', output: 'html', onlyCategories: ['performance'], port: chrome.port}
  const runnerResult = await lighthouse('https://your-domain.com', options)
  
  console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100)
  
  await chrome.kill()
}

runLighthouse()
```

### 10. 배포 후 체크리스트

배포 완료 후 다음 항목들을 확인하세요:

- [ ] 모든 페이지가 정상적으로 로딩됨
- [ ] 로그인/회원가입 기능 정상 작동
- [ ] 파일 업로드 기능 정상 작동
- [ ] 차트 생성 및 저장 정상 작동
- [ ] 공유 링크 정상 생성 및 접근
- [ ] 리포트 생성 기능 정상 작동
- [ ] 이미지 다운로드 정상 작동
- [ ] 모바일 반응형 정상 동작
- [ ] 성능 지표 목표 달성
- [ ] 보안 스캔 통과
- [ ] 백업 자동화 정상 작동
- [ ] 모니터링 대시보드 연결

### 11. 롤백 전략

```bash
# 빠른 롤백 스크립트
#!/bin/bash
# rollback.sh

echo "Rolling back to previous version..."

# Vercel 롤백
vercel rollback --token=$VERCEL_TOKEN

# Docker 롤백
docker tag your-registry/chartai:previous-version your-registry/chartai:latest
docker push your-registry/chartai:latest

# Kubernetes 롤백
kubectl rollout undo deployment/chartai

echo "Rollback completed"
```

---

## 📝 배포 순서

1. **준비 단계**
   - 환경 변수 설정
   - Firebase 보안 규칙 적용
   - 성능 최적화 확인

2. **테스트 단계**
   - 로컬 프로덕션 빌드 테스트
   - E2E 테스트 실행
   - 성능 테스트 실행

3. **배포 단계**
   - CI/CD 파이프라인 실행
   - 도메인 연결
   - SSL 인증서 설정

4. **검증 단계**
   - 기능 테스트
   - 성능 측정
   - 보안 검사

5. **모니터링**
   - 에러 로그 확인
   - 성능 지표 모니터링
   - 사용자 피드백 수집

## 🚨 긴급 상황 대응

```
문제 발생 시 즉시 조치:
1. 에러 로그 확인 (Sentry/Console)
2. 성능 메트릭 확인 (Lighthouse/Analytics)
3. 필요시 즉시 롤백
4. 문제 원인 파악 및 수정
5. 수정 사항 배포
```

---

작성일: 2025-05-11
업데이트: 프로덕션 배포 준비 완료
