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
  // Use standalone for Netlify to support API routes
  output: 'standalone',
  
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
          maxEntrypointSize: 400000, // 400KB
          maxAssetSize: 400000, // 400KB
        };
        
        // Tree shaking optimizations
        config.optimization.usedExports = true;
        config.optimization.sideEffects = false;
        
        // Add module resolution optimizations
        config.resolve.alias = {
          ...config.resolve.alias,
          // Use lighter alternatives where possible
          'react-syntax-highlighter/dist/esm': 'react-syntax-highlighter/dist/cjs',
        };
        
        // Split chunks more aggressively for better caching
        if (!isServer) {
          config.optimization.splitChunks = {
            chunks: 'all',
            maxInitialRequests: 30,
            minSize: 20000,
            maxSize: 500000, // 500KB max chunk size
            cacheGroups: {
              default: false,
              vendors: false,
              // React framework
              framework: {
                chunks: 'all',
                name: 'framework',
                test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
                priority: 40,
                enforce: true,
              },
              // Large libraries that should be separate
              syntaxHighlighter: {
                test: /[\\/]node_modules[\\/]react-syntax-highlighter[\\/]/,
                name: 'syntax-highlighter',
                chunks: 'all',
                priority: 35,
                enforce: true,
              },
              framerMotion: {
                test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
                name: 'framer-motion',
                chunks: 'async', // Load only when needed
                priority: 35,
                enforce: true,
              },
              radixUI: {
                test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                name: 'radix-ui',
                chunks: 'all',
                priority: 34,
                enforce: true,
              },
              supabase: {
                test: /[\\/]node_modules[\\/]@supabase[\\/]/,
                name: 'supabase',
                chunks: 'all',
                priority: 33,
                enforce: true,
              },
              // Other npm packages
              lib: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                  try {
                    const match = module.context?.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                    const packageName = match ? match[1] : 'unknown';
                    return `npm.${packageName.replace('@', '')}`;
                  } catch (error) {
                    console.warn('Error in webpack chunk naming:', error);
                    return 'npm.vendor';
                  }
                },
                priority: 30,
                minChunks: 1,
                reuseExistingChunk: true,
                maxSize: 300000, // 300KB max for lib chunks
              },
              commons: {
                name: 'commons',
                minChunks: 2,
                priority: 20,
                maxSize: 200000, // 200KB max for commons
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
      'react-syntax-highlighter',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
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