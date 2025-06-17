const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT_DIR = path.join(__dirname, '../public');
const SVG_SOURCE = path.join(__dirname, '../public/favicon.svg');

// Sizes to generate
const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'icon.png', size: 192 },
  { name: 'apple-icon.png', size: 180 },
  { name: 'icon-512.png', size: 512 },
  { name: 'maskable-icon.png', size: 512 }, // Same size but will have padding
];

async function generateFavicons() {
  try {
    const svgBuffer = fs.readFileSync(SVG_SOURCE);

    for (const { name, size } of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, name);
      
      let sharpInstance = sharp(svgBuffer).resize(size, size);
      
      // For maskable icon, add padding (25% on each side according to guidelines)
      if (name === 'maskable-icon.png') {
        const padding = Math.floor(size * 0.25);
        const actualSize = size - (padding * 2);
        
        sharpInstance = sharp(svgBuffer)
          .resize(actualSize, actualSize)
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 59, g: 130, b: 246, alpha: 1 } // #3B82F6
          });
      }
      
      await sharpInstance
        .png()
        .toFile(outputPath);
      
      console.log(`Generated ${name} (${size}x${size})`);
    }

    // Also generate favicon.ico (multi-size ICO file)
    // This requires a different approach, typically you'd use a package like 'ico-converter'
    // For simplicity, we'll just use the 32x32 PNG as favicon.ico
    fs.copyFileSync(
      path.join(OUTPUT_DIR, 'favicon-32x32.png'),
      path.join(OUTPUT_DIR, 'favicon.ico')
    );
    console.log('Favicon generation complete!');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

// Run the function
generateFavicons(); 