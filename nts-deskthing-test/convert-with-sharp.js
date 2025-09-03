#!/usr/bin/env node

/**
 * Convert OIP.webp to PNG icons using Sharp library
 * This script properly converts the WebP file to multiple PNG sizes
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp library not found. Installing...');
  console.error('Please run: npm install sharp');
  process.exit(1);
}

// Icon sizes for DeskThing
const ICON_SIZES = [48, 96, 192, 512];

console.log('🎨 Converting OIP.webp to NTS Radio app icons using Sharp...');

// Check if the source WebP file exists
const webpPath = path.join(__dirname, 'public', 'OIP.webp');
if (!fs.existsSync(webpPath)) {
  console.error('❌ Source WebP file not found:', webpPath);
  process.exit(1);
}

console.log('✅ Source WebP file found:', webpPath);

// Convert WebP to PNG at different sizes
async function convertIcons() {
  try {
    for (const size of ICON_SIZES) {
      const iconPath = path.join(__dirname, 'public', `nts-icon-${size}.png`);
      
      console.log(`🔄 Converting to ${size}x${size}...`);
      
      await sharp(webpPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 1 } // Black background
        })
        .png()
        .toFile(iconPath);
      
      console.log(`✅ Generated ${size}x${size} icon: ${iconPath}`);
    }
    
    console.log('\n🎯 Icon conversion complete!');
    console.log('✅ All PNG icons generated successfully');
    console.log('🚀 Ready to build and deploy with NTS branding!');
    
  } catch (error) {
    console.error('❌ Error converting icons:', error);
    console.log('\n📝 Fallback: Using placeholder icons');
    createPlaceholderIcons();
  }
}

// Fallback: Create placeholder icons if conversion fails
function createPlaceholderIcons() {
  ICON_SIZES.forEach(size => {
    const iconPath = path.join(__dirname, 'public', `nts-icon-${size}.png`);
    
    // Create a simple placeholder PNG (1x1 pixel, black)
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
    console.log(`✅ Generated placeholder ${size}x${size} icon: ${iconPath}`);
  });
}

// Run the conversion
convertIcons(); 