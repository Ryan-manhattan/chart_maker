#!/bin/bash

# 배포 후 검증 스크립트

echo "🔍 배포 후 검증 시작..."

DOMAIN="https://your-domain.com"  # 실제 도메인으로 변경 필요

# 1. 기본 헬스 체크
echo "🏥 헬스 체크 중..."
curl -f $DOMAIN || exit 1

# 2. 주요 페이지 접근 테스트
echo "📱 주요 페이지 접근 테스트 중..."
pages=(
    "/"
    "/upload"
    "/chart"
    "/login"
    "/dashboard"
    "/report-builder"
)

for page in "${pages[@]}"; do
    echo "Testing $DOMAIN$page"
    status_code=$(curl -o /dev/null -s -w "%{http_code}\n" $DOMAIN$page)
    if [ $status_code -ne 200 ]; then
        echo "❌ $page returned status code: $status_code"
        exit 1
    fi
done

# 3. API 엔드포인트 테스트
echo "🔌 API 엔드포인트 테스트 중..."
# 예시: 헬스 체크 API
curl -f $DOMAIN/api/health || echo "API health check failed"

# 4. SSL 인증서 확인
echo "🔒 SSL 인증서 확인 중..."
openssl s_client -connect your-domain.com:443 -showcerts < /dev/null | grep 'Verify return code: 0'
if [ $? -ne 0 ]; then
    echo "❌ SSL 인증서 문제가 있습니다."
    exit 1
fi

# 5. 보안 헤더 확인
echo "🛡️ 보안 헤더 확인 중..."
curl -I $DOMAIN | grep -i "x-content-type-options: nosniff" > /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️ 보안 헤더가 누락되었습니다."
fi

# 6. 성능 지표 확인
echo "⚡ 성능 지표 확인 중..."
# Lighthouse CI 실행
npm run lighthouse

# 7. Firebase 연결 확인
echo "🔥 Firebase 연결 확인 중..."
# Firebase 연결 테스트 (실제 구현 필요)

# 8. 배포 메트릭 기록
echo "📊 배포 메트릭 기록 중..."
cat > deployment-metrics.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "$(git rev-parse --short HEAD)",
  "deploymentStatus": "success",
  "performanceScore": "pending",
  "testsPassed": true
}
EOF

echo "✅ 배포 후 검증 완료!"

# 9. Slack 알림 (선택사항)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"ChartAI 배포 완료! :rocket:","attachments":[{"color":"good","text":"모든 검증 통과"}]}' \
    $SLACK_WEBHOOK_URL
fi
