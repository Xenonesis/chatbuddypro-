const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const OUTPUT_DIR = path.join(__dirname, '../public');
const LOGO_PATH = path.join(__dirname, '../public/chatbuddy-logo.svg');

async function generateOGImage() {
  try {
    // Create a canvas (1200x630 is the recommended OG image size)
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    // Fill background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#3B82F6');  // Blue
    gradient.addColorStop(1, '#4F46E5');  // Indigo
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Load logo (note: node-canvas doesn't support SVG directly, so we would normally use a PNG)
    // For now, let's create a placeholder circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(600, 255, 150, 0, Math.PI * 2);
    ctx.fill();

    // Draw chat bubble design to mimic the logo
    ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
    ctx.beginPath();
    ctx.arc(550, 255, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(600, 255, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(650, 255, 30, 0, Math.PI * 2);
    ctx.fill();

    // Add site name
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('ChatBuddy', 600, 450);

    // Add tagline
    ctx.font = '32px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Multiple AI Models Chat', 600, 500);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'og-image.png'), buffer);
    console.log('OpenGraph image generated!');
  } catch (error) {
    console.error('Error generating OpenGraph image:', error);
  }
}

// Run the function
generateOGImage(); 