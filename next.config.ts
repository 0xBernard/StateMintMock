import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/StateMintMock' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/StateMintMock/' : '',
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    const paths: { [key: string]: { page: string; query?: any } } = {
      '/': { page: '/' },
      '/marketplace': { page: '/marketplace' },
      '/portfolio': { page: '/portfolio' },
      '/demo': { page: '/demo' },
      '/mobile': { page: '/mobile' },
    };

    // Add coin detail pages
    const coinIds = [
      '1794-flowing-hair',
      '1804-draped-bust', 
      '1913-liberty-nickel',
      '1894-s-barber-dime',
      '1909-s-vdb-lincoln-cent',
      '1916-d-mercury-dime',
      '1949-s-roosevelt-dime',
      '1953-s-jefferson-nickel',
      '1932-d-washington-quarter',
      '1960-d-washington-quarter',
      '1967-washington-quarter',
      '1953-s-franklin-half-dollar',
      '1841-seated-liberty-half-dime',
      '1879-seated-liberty-quarter',
      '1911-barber-dime',
      '1895-o-barber-half-dollar'
    ];

    coinIds.forEach((coinId) => {
      paths[`/coin/${coinId}`] = {
        page: '/coin/[id]',
        query: { id: coinId },
      };
    });

    return paths;
  },
};

export default nextConfig;
