/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 성능 최적화
  swcMinify: true,
  
  // 번들 분석기 (환경 변수로 제어)
  ...(process.env.ANALYZE === 'true' && {
    plugins: [require('@next/bundle-analyzer')()]
  }),
  
  // 이미지 최적화
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 캐싱 최적화
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60',
          },
        ],
      },
      {
        source: '/:path*.{jpg,jpeg,png,webp,avif}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000',
          },
        ],
      },
    ]
  },
  
  // 압축 최적화
  compress: true,
  
  // 실험적 기능
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Turbo Mode (experimental)
    turbo: {
      loaders: {
        '.csv': 'csv-loader',
        '.xlsx': 'file-loader'
      }
    }
  },
  
  // 번들 최적화
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 빌드 최적화
    if (!dev && !isServer) {
      // Firebase SDK 트리 쉐이킹 최적화
      config.resolve.alias = {
        ...config.resolve.alias,
        '@firebase/app': require.resolve('@firebase/app'),
        '@firebase/auth': require.resolve('@firebase/auth'),
        '@firebase/firestore': require.resolve('@firebase/firestore'),
        '@firebase/storage': require.resolve('@firebase/storage'),
      }
      
      // Chart.js 트리 쉐이킹
      config.resolve.alias = {
        ...config.resolve.alias,
        'chart.js': require.resolve('chart.js/dist/chart.esm.js'),
      }
      
      // 번들 분석기 최적화
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          minRemainingSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            firebase: {
              test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
              name: 'firebase',
              priority: 10,
            },
            chart: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
              name: 'chart',
              priority: 9,
            },
            excel: {
              test: /[\\/]node_modules[\\/](xlsx|papaparse)[\\/]/,
              name: 'excel',
              priority: 8,
            },
          },
        },
      }
    }
    
    // CSV 로더 추가
    config.module.rules.push({
      test: /\.csv$/,
      use: ['csv-loader']
    })
    
    return config
  },
  
  // 런타임 구성
  poweredByHeader: false,
  
  // 리다이렉트 최적화
  async redirects() {
    return [
      {
        source: '/charts',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
        ],
      },
    ]
  },
}

module.exports = nextConfig
