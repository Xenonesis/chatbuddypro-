/** @type {import('next').NextConfig} */
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
  webpack: (config, { isServer }) => {
    // Add polyfills and resolve modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        url: require.resolve('url/'),
      };

      // Fix for url module resolution issue
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/dist/compiled/url': require.resolve('url/'),
      };
    }
    
    return config;
  },
}

module.exports = nextConfig; 