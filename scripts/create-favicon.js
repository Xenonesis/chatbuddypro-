const fs = require('fs');
const path = require('path');
const https = require('https');

const PUBLIC_DIR = path.join(__dirname, '../public');
const SVG_FILE = path.join(PUBLIC_DIR, 'chatbuddy-favicon.svg');
const ICO_FILE = path.join(PUBLIC_DIR, 'favicon.ico');

// Read the SVG content
const svgContent = fs.readFileSync(SVG_FILE, 'utf8');

// Function to convert SVG to ICO using a free online conversion API
function convertSvgToIco() {
  console.log('Creating basic favicon.ico file...');
  
  // Create a basic 16x16 favicon in lieu of a proper conversion
  // This is a simple blue chat bubble icon
  const faviconBytes = Buffer.from([
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00,
    0x20, 0x00, 0x68, 0x04, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00,
    0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x01, 0x00,
    0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x00, 0x00, 0x00,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x00, 0x00, 0x00, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff,
    0x45, 0x6e, 0xff, 0x45, 0x6e, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);
  
  fs.writeFileSync(ICO_FILE, faviconBytes);
  console.log(`Basic favicon.ico created at ${ICO_FILE}`);
}

// Run the conversion
convertSvgToIco(); 