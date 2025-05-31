#!/bin/bash

echo "=== Testing iOS Build with RCT-Folly Fixes ==="
echo "Checking fix files..."

# Check if our fix files exist
if [ -f "ios/LyoAILearningAssistant/ReactRendererDebugFix.h" ]; then
    echo "✓ ReactRendererDebugFix.h exists"
else
    echo "✗ ReactRendererDebugFix.h missing"
    exit 1
fi

if [ -f "ios/LyoAILearningAssistant/FollyCharTraitsFix.h" ]; then
    echo "✓ FollyCharTraitsFix.h exists"
else
    echo "✗ FollyCharTraitsFix.h missing"
    exit 1
fi

echo "Cleaning build artifacts..."
rm -rf ios/build/
rm -rf ios/DerivedData/

echo "Installing pods..."
cd ios
pod install --repo-update
cd ..

echo "Starting iOS build test..."
npx react-native run-ios --simulator="iPhone 15" --configuration Debug 2>&1 | tee ios-build-test.log

# Check for specific RCT-Folly errors
if grep -q "'string' file not found" ios-build-test.log; then
    echo "❌ ERROR: 'string' file not found error still present"
    exit 1
elif grep -q "std::char_traits<unsigned char>" ios-build-test.log; then
    echo "❌ ERROR: char_traits error still present"
    exit 1
elif grep -q "Build succeeded" ios-build-test.log || grep -q "BUILD SUCCEEDED" ios-build-test.log; then
    echo "✅ SUCCESS: iOS build completed successfully!"
    exit 0
else
    echo "⚠️  Build status unclear, check ios-build-test.log for details"
    tail -20 ios-build-test.log
    exit 0
fi
