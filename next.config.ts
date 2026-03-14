import type { NextConfig } from "next";

const assetVersion =
  process.env.NEXT_PUBLIC_ASSET_VERSION ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.SOURCE_VERSION ||
  Date.now().toString();

const nextConfig: NextConfig = {
  // Image optimization - DISABLED for memory efficiency
  // Your images are already WebP, so server-side processing is unnecessary
  images: {
    unoptimized: true, // Serve images directly without server processing
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Reduce memory usage for page rendering
  poweredByHeader: false, // Remove X-Powered-By header

  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-label',
      '@radix-ui/react-avatar',
      '@radix-ui/react-toast'
    ],
  },

  // Bundle analyzer (development only)
  webpack: (config, { dev }) => {
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
    }
    return config;
  },

  // Compiler optimizations (swcMinify is default in Next.js 15+)
  env: {
    NEXT_PUBLIC_ASSET_VERSION: assetVersion,
  },
  
  // Static optimization
  output: 'standalone',
  
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),

  // Headers for performance and reduced server load
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
    {
      // Static assets - aggressive caching
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      // HTML pages - allow browser caching with revalidation
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
      ],
    },
  ],
};

export default nextConfig;
