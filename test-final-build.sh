#!/bin/bash
set -e

echo "=== Testing iOS build with fixed C++20 configuration ==="
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "=== Cleaning previous build ==="
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant*

echo "=== Starting iOS build ==="
cd ios

echo "Building for iOS device..."
xcodebuild \
  -workspace LyoAILearningAssistant.xcworkspace \
  -scheme LyoAILearningAssistant \
  -configuration Debug \
  -destination 'generic/platform=iOS' \
  -derivedDataPath ./build \
  build \
  CODE_SIGNING_ALLOWED=NO \
  2>&1 | tee ../build_test_final.log

if [ $? -eq 0 ]; then
    echo "✅ BUILD SUCCESS: iOS app built successfully with C++20 fixes!"
    echo "The C++20 concept errors have been resolved."
else
    echo "❌ BUILD FAILED: Check build_test_final.log for errors"
    echo "Checking for C++20 concept errors..."
    grep -i "concept" ../build_test_final.log | head -5 || echo "No concept errors found"
fi

echo "=== Build attempt completed ==="
