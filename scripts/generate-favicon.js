const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Installing required packages...');
try {
  execSync('npm install --no-save sharp to-ico');
  console.log('Packages installed successfully.');
} catch (error) {
  console.error('Failed to install packages:', error);
  process.exit(1);
}

const sharp = require('sharp');
const toIco = require('to-ico');

const PUBLIC_DIR = path.join(__dirname, '../public');
const SVG_FILE = path.join(PUBLIC_DIR, 'chatbuddy-favicon.svg');
const ICO_FILE = path.join(PUBLIC_DIR, 'favicon.ico');

async function generateFavicon() {
  console.log('Generating favicon.ico from SVG...');
  
  try {
    // Generate different PNG sizes for the favicon
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngBuffers = [];
    
    for (const size of sizes) {
      const pngBuffer = await sharp(SVG_FILE)
        .resize(size, size)
        .png()
        .toBuffer();
      
      pngBuffers.push(pngBuffer);
    }
    
    // Convert PNG buffers to ICO file
    const icoBuffer = await toIco(pngBuffers);
    
    // Write the ICO file
    fs.writeFileSync(ICO_FILE, icoBuffer);
    
    console.log(`Favicon.ico generated successfully at ${ICO_FILE}`);
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon(); 