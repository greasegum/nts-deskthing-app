#!/bin/bash

# NTS DeskThing Test App - Deployment Script
# This script builds and packages the app for DeskThing testing

echo "🚀 NTS Radio DeskThing App - Deployment Script"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -f nts-deskthing-test.zip

# Build the app
echo "🔨 Building app..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build output directory not found"
    exit 1
fi

# Copy additional files
echo "📋 Copying additional files..."
cp public/manifest.json dist/
cp public/nts-icon-*.png dist/

# Create deployment package
echo "📦 Creating deployment package..."
cd dist && zip -r ../nts-deskthing-test.zip . && cd ..
if [ $? -ne 0 ]; then
    echo "❌ Failed to create ZIP package"
    exit 1
fi

# Check package size
PACKAGE_SIZE=$(du -h nts-deskthing-test.zip | cut -f1)

# Display results
echo ""
echo "✅ Deployment package created successfully!"
echo "📁 Package: nts-deskthing-test.zip"
echo "📊 Size: $PACKAGE_SIZE"
echo ""
echo "🚀 Next steps:"
echo "1. Open DeskThing Server app"
echo "2. Go to Apps > Upload App"
echo "3. Select: nts-deskthing-test.zip"
echo "4. Test on any connected DeskThing client"
echo ""
echo "🎯 Ready for DeskThing testing!"
echo "🎨 App now includes NTS Radio branding and icons!" 