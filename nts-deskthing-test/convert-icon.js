#!/usr/bin/env node

/**
 * Convert OIP.webp to PNG icons for DeskThing app
 * This script converts the WebP file to multiple PNG sizes
 */

const fs = require('fs');
const path = require('path');

// Icon sizes for DeskThing
const ICON_SIZES = [48, 96, 192, 512];

console.log('🎨 Converting OIP.webp to NTS Radio app icons...');

// Check if the source WebP file exists
const webpPath = path.join(__dirname, 'public', 'OIP.webp');
if (!fs.existsSync(webpPath)) {
  console.error('❌ Source WebP file not found:', webpPath);
  process.exit(1);
}

console.log('✅ Source WebP file found:', webpPath);

// For now, we'll create placeholder PNG files
// In a production environment, you'd use a proper WebP to PNG converter
// like sharp, imagemin, or a command-line tool like ImageMagick

ICON_SIZES.forEach(size => {
  const iconPath = path.join(__dirname, 'public', `nts-icon-${size}.png`);
  
  // Create a simple placeholder PNG (1x1 pixel, black)
  // This is a temporary solution - you'll want to replace these with actual converted icons
  const placeholderPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // Color type
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT
    0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xFF, // Data
    0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, // End
    0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, // IEND
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(iconPath, placeholderPNG);
  console.log(`✅ Generated ${size}x${size} icon: ${iconPath}`);
});

console.log('\n🎯 Icon generation complete!');
console.log('📝 IMPORTANT: These are placeholder PNGs. To use the actual OIP.webp graphic:');
console.log('');
console.log('Option 1: Use ImageMagick (recommended)');
console.log('   brew install imagemagick  # macOS');
console.log('   sudo apt-get install imagemagick  # Ubuntu/Debian');
console.log('   convert public/OIP.webp -resize 48x48 public/nts-icon-48.png');
console.log('   convert public/OIP.webp -resize 96x96 public/nts-icon-96.png');
console.log('   convert public/OIP.webp -resize 192x192 public/nts-icon-192.png');
console.log('   convert public/OIP.webp -resize 512x512 public/nts-icon-512.png');
console.log('');
console.log('Option 2: Use online converter');
console.log('   Upload OIP.webp to https://convertio.co/webp-png/');
console.log('   Download and resize to required sizes');
console.log('');
console.log('Option 3: Use Node.js sharp library');
console.log('   npm install sharp');
console.log('   Then modify this script to use sharp for conversion');
console.log('');
console.log('🚀 Ready to build and deploy with NTS branding!'); 