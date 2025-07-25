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
  // Use export for Netlify
  output: process.env.NETLIFY ? 'export' : 'standalone',
  
  // Disable image optimization for Netlify compatibility
  images: {
    unoptimized: true,
    domains: ['oybdzbyqormgynyjwyyc.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Enhance performance with webpack optimizations
  webpack: (config, { isServer, dev }) => {
    try {
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
      
      // Add performance optimizations for production
      if (!dev) {
        // Enable module concatenation for better tree-shaking
        config.optimization.concatenateModules = true;
        
        // Reduce bundle size by removing console in production
        config.optimization.minimizer = config.optimization.minimizer || [];
        config.optimization.minimizer.push(
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
          })
        );
        
        // Add additional performance hints
        config.performance = {
          hints: 'warning',
          maxEntrypointSize: 512000,
          maxAssetSize: 512000,
        };
        
        // Split chunks more aggressively for better caching
        if (!isServer) {
          config.optimization.splitChunks = {
            chunks: 'all',
            maxInitialRequests: 25,
            minSize: 20000,
            cacheGroups: {
              default: false,
              vendors: false,
              framework: {
                chunks: 'all',
                name: 'framework',
                test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
                priority: 40,
                enforce: true,
              },
              lib: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                  try {
                    // Add null check with optional chaining to handle cases where module.context might be undefined
                    const match = module.context?.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                    // Only access index [1] if match exists, otherwise use a fallback value
                    const packageName = match ? match[1] : 'unknown';
                    return `npm.${packageName.replace('@', '')}`;
                  } catch (error) {
                    // Fallback in case of any other errors
                    console.warn('Error in webpack chunk naming:', error);
                    return 'npm.vendor';
                  }
                },
                priority: 30,
                minChunks: 1,
                reuseExistingChunk: true,
              },
              commons: {
                name: 'commons',
                minChunks: 2,
                priority: 20,
              },
              shared: {
                name: false,
                priority: 10,
                minChunks: 2,
                reuseExistingChunk: true,
              },
            },
          };
        }
      }
      
      return config;
    } catch (error) {
      console.error('Error in webpack configuration:', error);
      // Return the original config to prevent build failures
      return config;
    }
  },
  
  // Enable progressive web app features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'framer-motion',
    ],
  },
  
  // For Netlify deployment
  trailingSlash: false,
  
  // Add compression
  compress: true,
  
  // Add security headers
  headers: async () => {
    return [
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
    ];
  },
};

module.exports = nextConfig; 