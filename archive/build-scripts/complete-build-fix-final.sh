#!/bin/bash

echo "🚀 Complete iOS Build Fix Script"
echo "================================="

PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
IOS_DIR="${PROJECT_ROOT}/ios"

cd "$PROJECT_ROOT"

echo "Step 1: Applying RCT-Folly fixes..."
# Our RCT-Folly fixes are already in place in the header files

echo "Step 2: Fixing Swift compilation issues..."
# Clean build artifacts
rm -rf "${IOS_DIR}/build"
rm -rf "${IOS_DIR}/DerivedData" 
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant* 2>/dev/null || true

echo "Step 3: Reinstalling pods..."
cd "${IOS_DIR}"
pod deintegrate
pod install

echo "Step 4: Building iOS app..."
cd "$PROJECT_ROOT"
npx expo run:ios --configuration Debug

echo "✅ Build process completed!"
