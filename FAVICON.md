# Favicon and Brand Identity Setup

This document outlines the favicon and brand identity setup for ChatBuddy.

## Files Overview

The following files are part of the brand identity setup:

- `favicon.ico` - Classic favicon file (32x32)
- `favicon.svg` - Vector version of the favicon
- `favicon-16x16.png` - Small favicon for older browsers (16x16)
- `favicon-32x32.png` - Standard favicon size (32x32)
- `icon.png` - Web app icon for PWA and homescreen (192x192)
- `icon-512.png` - Large icon for PWA and splash screens (512x512)
- `apple-icon.png` - Icon for iOS devices (180x180)
- `maskable-icon.png` - Special icon with padding for Android adaptive icons (512x512)
- `og-image.png` - OpenGraph image for social media sharing (1200x630)
- `manifest.json` - Web app manifest for PWA functionality

## How It Works

1. In `layout.tsx`, metadata is defined to reference these icons
2. The manifest.json file is linked in the metadata
3. Different devices use different icon formats:
   - Browsers use favicon.ico, favicon-16x16.png, favicon-32x32.png
   - iOS uses apple-icon.png
   - Android uses icon.png, icon-512.png, and maskable-icon.png
   - Social media platforms use og-image.png

## Regenerating the Icons

Two scripts are included to regenerate the icons if the brand identity changes:

1. `scripts/generate-favicons.js` - Generates all favicon sizes from `favicon.svg`
2. `scripts/generate-opengraph.js` - Generates the OpenGraph image

To run these scripts:

```bash
# Install dependencies
npm install --save-dev sharp canvas

# Generate favicons
node scripts/generate-favicons.js

# Generate OpenGraph image
node scripts/generate-opengraph.js
```

## Design Guidelines

The ChatBuddy brand uses a gradient from blue (`#3B82F6`) to indigo (`#4F46E5`). The logo features a chat bubble design with three dots.

For any future brand updates, maintain these core elements while ensuring:

1. Icons are clear and recognizable at small sizes
2. The gradient and chat bubble concept is preserved
3. A proper safe zone is maintained (especially for maskable icons)
4. OpenGraph images follow the 1200x630 dimension standard 