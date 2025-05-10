#!/bin/bash

# 배포 전 체크 스크립트

echo "🚀 배포 전 체크 시작..."

# 1. 환경 변수 확인
echo "📝 환경 변수 확인 중..."
if [ ! -f .env.production ]; then
    echo "❌ .env.production 파일이 없습니다."
    exit 1
fi

# 2. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 3. TypeScript 타입 체크
echo "🔍 TypeScript 타입 체크 중..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ TypeScript 타입 에러가 있습니다."
    exit 1
fi

# 4. ESLint 검사
echo "🔍 ESLint 검사 중..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint 에러가 있습니다."
    exit 1
fi

# 5. 테스트 실행
echo "🧪 테스트 실행 중..."
npm run test
if [ $? -ne 0 ]; then
    echo "❌ 테스트 실패"
    exit 1
fi

# 6. 프로덕션 빌드 테스트
echo "🏗️ 프로덕션 빌드 테스트 중..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패"
    exit 1
fi

# 7. 번들 크기 분석
echo "📊 번들 크기 분석 중..."
npm run analyze

# 8. Lighthouse 성능 테스트
echo "⚡ Lighthouse 성능 테스트 중..."
npm run lighthouse

echo "✅ 모든 체크 완료! 배포 준비가 되었습니다."
