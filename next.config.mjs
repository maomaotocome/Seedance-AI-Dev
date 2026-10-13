import bundleAnalyzer from '@next/bundle-analyzer';
import { createMDX } from 'fumadocs-mdx/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withMDX = createMDX();

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/core/i18n/request.ts',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the live editing preview independent from production builds and QA.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: false,
  poweredByHeader: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ['@libsql/client', '@libsql/isomorphic-ws'],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@swc/core-darwin-arm64',
      'node_modules/@swc/core-darwin-x64',
      'node_modules/@swc/core-win32-x64-msvc',
      'node_modules/typescript/**',
      'node_modules/eslint/**',
      'node_modules/prettier/**',
      'node_modules/babel-plugin-react-compiler/**',
      // Giant rendering libraries - safe to exclude from server worker
      'node_modules/shiki/**',
      'node_modules/@shikijs/**',
      'node_modules/mermaid/**',
      'node_modules/@tabler/icons-react/**',
      'node_modules/react-icons/**',
    ],
  },
  experimental: {
    mdxRs: true,
    optimizePackageImports: [
      'lucide-react',
      'react-icons/ri',
      'react-icons/lu',
      'react-icons/hi2',
      'react-icons/io5',
      'react-icons/go',
      '@tabler/icons-react',
      '@radix-ui/react-icons',
      'recharts',
      'framer-motion',
      'motion',
    ],
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), geolocation=(), microphone=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(withMDX(nextConfig)));
