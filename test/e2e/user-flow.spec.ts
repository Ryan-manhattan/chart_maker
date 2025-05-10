import { test, expect } from '@playwright/test'

test.describe('ChartAI 전체 사용자 플로우 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('홈페이지 렌더링 확인', async ({ page }) => {
    await expect(page.locator('h1').first()).toHaveText('AI가 만드는 완벽한 차트')
    await expect(page.locator('text=새 차트 만들기')).toBeVisible()
  })

  test('파일 업로드 플로우', async ({ page }) => {
    // 업로드 페이지로 이동
    await page.click('text=새 차트 만들기')
    await expect(page).toHaveURL('/upload')
    
    // 파일 업로드 영역 확인
    await expect(page.locator('text=파일을 업로드하세요')).toBeVisible()
    
    // CSV 파일 업로드 시뮬레이션
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('날짜,매출\\n2024-01,100\\n2024-02,200\\n2024-03,300')
    })
    
    // 파일 업로드 확인
    await expect(page.locator('text=test.csv')).toBeVisible()
    
    // 차트 생성 버튼 클릭
    await page.click('text=차트 생성')
    await expect(page).toHaveURL('/chart')
  })

  test('차트 생성 플로우', async ({ page }) => {
    // 차트 페이지로 직접 이동 (업로드 후 상태 가정)
    await page.goto('/chart')
    
    // 차트 템플릿 선택
    await expect(page.locator('text=차트 템플릿')).toBeVisible()
    await page.click('button[data-testid="bar-chart-template"]')
    
    // 차트 커스터마이징
    await page.click('text=차트 설정')
    await page.fill('input[name="title"]', '월별 매출 현황')
    
    // 차트 미리보기 확인
    await expect(page.locator('canvas')).toBeVisible()
    
    // 저장 버튼 확인
    await expect(page.locator('text=내 폴더에 저장')).toBeVisible()
  })

  test('로그인 플로우', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.click('text=로그인')
    await expect(page).toHaveURL('/login')
    
    // 로그인 폼 확인
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // 구글 로그인 버튼 확인
    await expect(page.locator('text=Google로 로그인')).toBeVisible()
  })

  test('대시보드 플로우', async ({ page }) => {
    // 대시보드 페이지로 이동 (로그인 상태 가정)
    await page.goto('/dashboard')
    
    // 탭 메뉴 확인
    await expect(page.locator('text=차트')).toBeVisible()
    await expect(page.locator('text=폴더')).toBeVisible()
    await expect(page.locator('text=리포트')).toBeVisible()
    
    // 새로 만들기 드롭다운 확인
    await page.click('text=새로 만들기')
    await expect(page.locator('text=새 차트')).toBeVisible()
    await expect(page.locator('text=새 리포트')).toBeVisible()
  })

  test('리포트 빌더 플로우', async ({ page }) => {
    // 리포트 빌더 페이지로 이동
    await page.goto('/report-builder')
    
    // 리포트 제목 입력
    await page.fill('input[placeholder="리포트 제목"]', '월간 종합 리포트')
    
    // 파일 업로드 탭 확인
    await expect(page.locator('text=파일 업로드')).toBeVisible()
    await expect(page.locator('text=차트 관리')).toBeVisible()
    await expect(page.locator('text=미리보기')).toBeVisible()
    
    // 다중 파일 업로드 영역 확인
    await expect(page.locator('text=파일을 업로드하세요')).toBeVisible()
  })

  test('공유 기능 확인', async ({ page }) => {
    // 공유 차트 페이지로 이동 (공유 링크 가정)
    const sharedUrl = '/shared/test-chart-id'
    await page.goto(sharedUrl)
    
    // 공유된 차트 페이지 요소 확인
    await expect(page.locator('text=공유된 차트')).toBeVisible()
    await expect(page.locator('canvas')).toBeVisible()
    
    // 다운로드 버튼 확인
    await expect(page.locator('text=PNG')).toBeVisible()
    await expect(page.locator('text=JPG')).toBeVisible()
  })
})

test.describe('성능 테스트', () => {
  test('페이지 로딩 시간 확인', async ({ page }) => {
    const start = Date.now()
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    const end = Date.now()
    
    const loadTime = end - start
    console.log(`홈페이지 로딩 시간: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000) // 3초 이내 로딩
  })

  test('차트 렌더링 성능', async ({ page }) => {
    await page.goto('/chart')
    
    // 차트 렌더링 시간 측정
    const start = Date.now()
    await page.waitForSelector('canvas')
    const end = Date.now()
    
    const renderTime = end - start
    console.log(`차트 렌더링 시간: ${renderTime}ms`)
    expect(renderTime).toBeLessThan(1000) // 1초 이내 렌더링
  })
})

test.describe('에러 처리 테스트', () => {
  test('잘못된 파일 형식 업로드', async ({ page }) => {
    await page.goto('/upload')
    
    // 지원하지 않는 파일 형식 업로드
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('잘못된 파일입니다.')
    })
    
    // 에러 메시지 확인
    await expect(page.locator('text=지원하지 않는 파일 형식입니다')).toBeVisible()
  })

  test('대용량 파일 업로드 제한', async ({ page }) => {
    await page.goto('/upload')
    
    // 10MB 이상 파일 업로드 시도
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'a')
    const fileInput = page.locator('input[type="file"]')
    
    await fileInput.setInputFiles({
      name: 'large.csv',
      mimeType: 'text/csv',
      buffer: largeBuffer
    })
    
    // 에러 메시지 확인
    await expect(page.locator('text=파일 크기가 10MB를 초과합니다')).toBeVisible()
  })
})

test.describe('반응형 디자인 테스트', () => {
  test('모바일 화면 레이아웃', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:3000')
    
    // 모바일 네비게이션 메뉴 확인
    await expect(page.locator('text=새 차트 만들기')).toBeVisible()
    
    // 대시보드도 모바일에서 테스트
    await page.goto('/dashboard')
    await expect(page.locator('text=내 대시보드')).toBeVisible()
  })

  test('태블릿 화면 레이아웃', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/report-builder')
    
    // 탭 메뉴 레이아웃 확인
    await expect(page.locator('text=파일 업로드')).toBeVisible()
    await expect(page.locator('text=차트 관리')).toBeVisible()
  })
})
