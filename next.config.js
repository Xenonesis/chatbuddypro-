/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Modify the output strategy for better Netlify compatibility
  output: process.env.NETLIFY ? 'export' : 'standalone',
  // Disable image optimization for Netlify compatibility
  images: {
    unoptimized: true,
    domains: ['gphdrsfbypnckxbdjjap.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle react-markdown requiring fs
    if (!isServer) {
      // react-markdown sees process.platform so we need to set it
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.platform': JSON.stringify(''),
          'process.env.NODE_DEBUG': JSON.stringify(''),
        })
      );

      // Mock fs module for browser environment
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        url: require.resolve('url/'),
        http: false,
        https: false,
        os: false,
        zlib: false,
        assert: false,
        buffer: require.resolve('buffer/'),
        util: false,
      };

      // Fix for url module resolution issue
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/dist/compiled/url': require.resolve('url/'),
        'next/dist/compiled/path': require.resolve('path-browserify'),
      };
    }
    
    return config;
  },
  // For Netlify deployment
  trailingSlash: true,
}

module.exports = nextConfig; 