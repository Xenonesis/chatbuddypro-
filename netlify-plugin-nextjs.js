// Configuration for @netlify/plugin-nextjs
module.exports = {
  // Disable image optimization, which can cause issues
  images: {
    loader: 'custom',
    loaderFile: './imageLoader.js',
  },
  // Apply special handling for Next.js 15+
  nextVersion: 15,
  // Include important files for deployment
  includeFiles: [
    'next.config.js',
    '.env.local',
    'package.json',
    'public/**',
  ],
  // Debug mode to help identify issues
  debug: true,
}; 