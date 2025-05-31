#!/bin/bash
set -e

echo "=== iOS Build Test with C++20 Fixes ==="
echo "Date: $(date)"
echo "Working directory: $(pwd)"

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

echo "=== Checking Xcode project settings ==="
# Check if our C++20 settings are in place
grep -n "CLANG_CXX_LANGUAGE_STANDARD.*c++20" ios/LyoAILearningAssistant.xcodeproj/project.pbxproj | head -5

echo "=== Starting iOS build for device ==="
cd ios

# Build for device
xcodebuild \
  -workspace LyoAILearningAssistant.xcworkspace \
  -scheme LyoAILearningAssistant \
  -configuration Debug \
  -destination 'generic/platform=iOS' \
  clean build \
  2>&1 | tee ../ios_build_test.log

echo "=== Build completed. Check ios_build_test.log for details ==="
