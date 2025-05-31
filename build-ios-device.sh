#!/bin/bash

# iOS Device Build - Final Execution Script
# Automated build process for physical iOS device

echo "📱 iOS Device Build - Final Execution"
echo "====================================="

# Navigate to project directory
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

echo "🔄 Project: $PROJECT_ROOT"
echo "⏰ Started: $(date)"
echo ""

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 - SUCCESS"
    else
        echo "❌ $1 - FAILED"
        exit 1
    fi
}

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
check_success "npm install"

# Step 2: Install iOS dependencies  
echo "🍎 Installing iOS dependencies..."
cd ios
pod install
check_success "pod install"
cd ..

# Step 3: Build for device
echo "🚀 Building for iOS device..."
echo "⚠️  Make sure your iOS device is connected and unlocked!"
echo ""

# Give user time to prepare device
echo "Device Setup Checklist:"
echo "□ iOS device connected via USB"
echo "□ Device unlocked"
echo "□ 'Trust This Computer' confirmed on device"
echo "□ Developer Mode enabled (iOS 16+)"
echo ""

read -p "Press Enter when device is ready, or Ctrl+C to cancel..."

echo ""
echo "🏗️  Starting device build... (this may take 5-15 minutes)"
npx expo run:ios --device

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 iOS Device Build Complete!"
    echo "================================"
    echo ""
    echo "✅ App should now be installed on your device"
    echo "📱 Look for 'Lyo - AI Learning Assistant' on your home screen"
    echo ""
    echo "🔐 If prompted on device:"
    echo "   • Go to Settings > General > VPN & Device Management"  
    echo "   • Trust the developer certificate"
    echo ""
    echo "🎯 Your iOS app is ready to use!"
else
    echo ""
    echo "❌ Build failed. Check the error messages above."
    echo ""
    echo "Common solutions:"
    echo "• Ensure device is connected and unlocked"
    echo "• Try building to simulator first: npx expo run:ios --simulator"
    echo "• Check code signing in Xcode"
    echo ""
fi
