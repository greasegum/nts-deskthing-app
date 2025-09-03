# 🎨 Icon Conversion Guide

This guide explains how to convert the `OIP.webp` file to PNG icons for the NTS Radio DeskThing app.

## 📁 Current Status

- ✅ **Source File**: `public/OIP.webp` (5.7KB)
- ✅ **Placeholder Icons**: Generated (48x48, 96x96, 192x192, 512x512)
- 🔄 **Next Step**: Convert WebP to actual PNG icons

## 🛠️ Conversion Methods

### **Method 1: Sharp Library (Recommended)**

```bash
# Install sharp
npm install sharp

# Run conversion script
node convert-with-sharp.js
```

This will automatically convert the WebP file to all required PNG sizes.

### **Method 2: ImageMagick (Command Line)**

```bash
# Install ImageMagick
# macOS:
brew install imagemagick

# Ubuntu/Debian:
sudo apt-get install imagemagick

# Windows:
# Download from https://imagemagick.org/script/download.php

# Convert to different sizes
convert public/OIP.webp -resize 48x48 public/nts-icon-48.png
convert public/OIP.webp -resize 96x96 public/nts-icon-96.png
convert public/OIP.webp -resize 192x192 public/nts-icon-192.png
convert public/OIP.webp -resize 512x512 public/nts-icon-512.png
```

### **Method 3: Online Converter**

1. Go to [Convertio](https://convertio.co/webp-png/) or [CloudConvert](https://cloudconvert.com/webp-to-png)
2. Upload `OIP.webp`
3. Convert to PNG
4. Download and resize to required sizes

### **Method 4: GIMP/Photoshop**

1. Open `OIP.webp` in GIMP or Photoshop
2. Export as PNG at each required size
3. Save with naming convention: `nts-icon-{size}.png`

## 📏 Required Icon Sizes

| Size | Filename | Use Case |
|------|----------|----------|
| 48x48 | `nts-icon-48.png` | Small displays |
| 96x96 | `nts-icon-96.png` | Standard app icons |
| 192x192 | `nts-icon-192.png` | High-res displays |
| 512x512 | `nts-icon-512.png` | Maximum quality |

## 🎯 Icon Requirements

- **Format**: PNG (transparent or solid background)
- **Aspect Ratio**: Square (1:1)
- **Background**: Black or transparent (matches NTS branding)
- **Quality**: High resolution, no compression artifacts

## ✅ Verification

After conversion, verify:

1. **File Sizes**: Icons should be larger than placeholder files
2. **Dimensions**: Check with image viewer or `file` command
3. **Quality**: Icons should be clear and recognizable
4. **Naming**: Files must match exactly: `nts-icon-{size}.png`

## 🚀 After Conversion

Once you have the real PNG icons:

1. **Replace placeholders**: The new icons will automatically replace the placeholder ones
2. **Build app**: `npm run build`
3. **Deploy**: `./deploy.sh`
4. **Test**: Upload to DeskThing Server

## 🔧 Troubleshooting

### **Sharp Installation Issues**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### **ImageMagick Issues**
```bash
# Check if installed
which convert

# Verify version
convert --version
```

### **File Permission Issues**
```bash
# Make scripts executable
chmod +x convert-icon.js
chmod +x convert-with-sharp.js
```

## 📝 Notes

- **Placeholder Icons**: Currently using 1x1 pixel black PNGs
- **Real Icons**: Will be much larger and higher quality
- **App Functionality**: Icons don't affect app functionality, only appearance
- **DeskThing**: Will display the icons in app launcher and menus

---

**🎨 Happy converting! Your NTS Radio app will look much better with real icons! 🚀** 