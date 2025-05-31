#!/bin/bash

# Lyo Mobile App Build Script
echo "🚀 Building Lyo Mobile App for deployment..."

# Navigate to project directory
cd "/Users/republicalatuya/Desktop/LyoFrontEndFinal"

# Set environment for production build
export EXPO_ENV=production

echo "📱 Building Android APK..."
eas build --platform android --profile preview --non-interactive

echo "🍏 Building iOS IPA..."
eas build --platform ios --profile preview --non-interactive

echo "✅ Build process completed!"
echo "📦 Check your EAS dashboard for download links"
