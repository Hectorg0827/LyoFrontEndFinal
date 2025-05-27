#!/bin/bash

# Lyo Mobile App Build Instructions
echo "🚀 Lyo Mobile App Build Process"
echo "=============================="
echo ""

# Check current directory
echo "📁 Current directory:"
pwd
echo ""

# Check if in correct directory
if [[ ! -f "package.json" ]] || [[ ! -f "app.json" ]]; then
    echo "❌ Error: Please run this script from the LyoFrontEndFinal directory"
    echo "   cd /Users/republicalatuya/Desktop/LyoFrontEndFinal"
    exit 1
fi

echo "✅ In correct directory"
echo ""

# Check EAS CLI
echo "🔧 Checking EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Install with: npm install -g eas-cli"
    exit 1
fi

EAS_VERSION=$(eas --version)
echo "✅ EAS CLI installed: $EAS_VERSION"
echo ""

# Check login status
echo "👤 Checking EAS login status..."
if eas whoami &>/dev/null; then
    USERNAME=$(eas whoami)
    echo "✅ Logged in as: $USERNAME"
    echo ""
    
    echo "🏗️  Starting build process..."
    echo ""
    
    # Build Android
    echo "📱 Building Android APK..."
    echo "Command: eas build --platform android --profile preview"
    read -p "Press Enter to start Android build, or Ctrl+C to skip..."
    eas build --platform android --profile preview
    
    echo ""
    
    # Build iOS
    echo "🍏 Building iOS IPA..."
    echo "Command: eas build --platform ios --profile preview" 
    read -p "Press Enter to start iOS build, or Ctrl+C to skip..."
    eas build --platform ios --profile preview
    
    echo ""
    echo "✅ Build process completed!"
    echo "📦 Check your builds at: https://expo.dev/accounts/$(eas whoami)/projects/lyo-app/builds"
    
else
    echo "❌ Not logged in to EAS"
    echo ""
    echo "Please run the following commands manually:"
    echo "1. eas login"
    echo "2. eas build --platform android --profile preview"
    echo "3. eas build --platform ios --profile preview"
    echo ""
    echo "🔗 Create account at: https://expo.dev"
fi
