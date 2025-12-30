import type { NextConfig } from "next";

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
    optimizeCss: true,
  },

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Next.js framework chunk
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Common libraries
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'commons',
            priority: 30,
            minChunks: 2,
            maxSize: 244000, // 244KB
          },
          // Radix UI components
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix',
            priority: 35,
            enforce: true,
          },
          // Lucide icons
          icons: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'icons',
            priority: 35,
            enforce: true,
          },
          // Tutorial system
          tutorial: {
            test: /[\\/]lib[\\/]tutorial[\\/]/,
            name: 'tutorial',
            priority: 20,
            minChunks: 1,
          },
          // Shared components
          shared: {
            test: /[\\/]components[\\/]shared[\\/]/,
            name: 'shared',
            priority: 20,
            minChunks: 2,
          },
        },
      };

      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Bundle analyzer (only in development)
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
