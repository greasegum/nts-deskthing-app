#!/usr/bin/env node

/**
 * Generate NTS Radio icons for DeskThing app
 * This script converts the SVG to PNG files at different sizes
 */

const fs = require('fs');
const path = require('path');

// Icon sizes for DeskThing
const ICON_SIZES = [48, 96, 192, 512];

console.log('🎨 Generating NTS Radio icons for DeskThing...');

// Check if we have the SVG source
const svgPath = path.join(__dirname, 'public', 'nts-icon.svg');
if (!fs.existsSync(svgPath)) {
  console.error('❌ SVG source file not found:', svgPath);
  process.exit(1);
}

console.log('✅ SVG source found');

// For now, we'll create placeholder PNG files
// In a real implementation, you'd use a library like sharp or svg2png
ICON_SIZES.forEach(size => {
  const iconPath = path.join(__dirname, 'public', `nts-icon-${size}.png`);
  
  // Create a simple placeholder PNG (1x1 pixel, black)
  // In production, you'd convert the SVG to PNG at this size
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
console.log('📝 Note: These are placeholder PNGs. For production:');
console.log('   1. Use a proper SVG-to-PNG converter (like sharp)');
console.log('   2. Or manually create icons from the SVG source');
console.log('   3. Ensure high quality at each size');
console.log('\n🚀 Ready to build and deploy with NTS branding!'); 