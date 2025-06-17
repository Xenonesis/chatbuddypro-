// Custom image loader for Next.js Images component
module.exports = function customLoader({ src, width, quality }) {
  // For relative URLs, just return the URL with width and quality params
  if (src.startsWith('/')) {
    return `${src}?w=${width}&q=${quality || 75}`;
  }
  
  // For absolute URLs, ensure they include width and quality params
  // This allows external images to work properly
  return src;
} 