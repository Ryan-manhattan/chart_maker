module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run start',
      url: [
        'http://localhost:3000',
        'http://localhost:3000/upload',
        'http://localhost:3000/chart',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/report-builder',
      ],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // 성능 메트릭
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // 번들 크기
        'total-byte-weight': ['warn', { maxNumericValue: 1000000 }],
        'dom-size': ['warn', { maxNumericValue: 1500 }],
        
        // 이미지 최적화
        'uses-optimized-images': 'error',
        'modern-image-formats': 'warn',
        'uses-responsive-images': 'warn',
        
        // JavaScript 최적화
        'unused-javascript': ['warn', { maxNumericValue: 500000 }],
        'remove-unused-code': 'warn',
        
        // 네트워크 최적화
        'uses-long-cache-ttl': 'warn',
        'efficient-animated-content': 'warn',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-reports',
    },
  },
}
