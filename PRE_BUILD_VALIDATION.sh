#!/bin/bash

# Quick Pre-Build Validation Script
echo "🔍 LyoAILearningAssistant - Pre-Build Validation"
echo "=============================================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Check 1: Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Check 2: npm
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Check 3: Project files
echo "3. Checking project files..."
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json missing"
    exit 1
fi

if [ -f "app.json" ]; then
    echo "✅ app.json exists"
else
    echo "❌ app.json missing"
    exit 1
fi

# Check 4: node_modules
echo "4. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    if [ -d "node_modules/expo" ]; then
        expo_version=$(node -e "console.log(require('./node_modules/expo/package.json').version)")
        echo "✅ Expo: $expo_version"
    else
        echo "❌ Expo not installed"
        exit 1
    fi
else
    echo "⚠️  node_modules missing - run 'npm install'"
    exit 1
fi

# Check 5: expo-device patch
echo "5. Checking expo-device patch..."
if [ -f "node_modules/expo-device/ios/UIDevice.swift" ]; then
    if grep -q "import TargetConditionals" node_modules/expo-device/ios/UIDevice.swift; then
        echo "✅ expo-device TARGET_OS_SIMULATOR fix applied"
    else
        echo "❌ expo-device patch missing"
        exit 1
    fi
else
    echo "❌ expo-device module not found"
    exit 1
fi

# Check 6: iOS setup
echo "6. Checking iOS setup..."
if [ -d "ios" ]; then
    echo "✅ iOS directory exists"
    if [ -f "ios/Podfile" ]; then
        echo "✅ Podfile exists"
    else
        echo "❌ Podfile missing"
        exit 1
    fi
else
    echo "❌ iOS directory missing"
    exit 1
fi

# Check 7: Xcode
echo "7. Checking Xcode..."
if command -v xcrun &> /dev/null; then
    echo "✅ Xcode command line tools available"
else
    echo "⚠️  Xcode command line tools not found"
    echo "   Run: xcode-select --install"
fi

# Check 8: CocoaPods
echo "8. Checking CocoaPods..."
if command -v pod &> /dev/null; then
    echo "✅ CocoaPods: $(pod --version)"
else
    echo "❌ CocoaPods not found"
    echo "   Install with: sudo gem install cocoapods"
    exit 1
fi

echo ""
echo "🎉 Pre-build validation completed successfully!"
echo "✅ Your project is ready for iOS build"
echo ""
echo "Next step: Run './FINAL_COMPLETE_IOS_BUILD.sh'"
echo "=============================================="
