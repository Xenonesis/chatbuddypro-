/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add output: 'standalone' to improve stability
  output: 'standalone',
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 