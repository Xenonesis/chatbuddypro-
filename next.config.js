/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add output: 'standalone' to improve stability
  output: 'standalone',
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add external packages that should be resolved during build time
  serverExternalPackages: ['react-syntax-highlighter'],
};

module.exports = nextConfig; 