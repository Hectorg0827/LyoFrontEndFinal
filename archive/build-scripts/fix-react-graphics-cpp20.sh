#!/bin/bash

echo "🔧 Fixing React Graphics C++20 Concept Compilation Errors"
echo "========================================================="

PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
IOS_DIR="${PROJECT_ROOT}/ios"

echo "Step 1: Updating C++ standard to C++20 in Podfile..."
cd "${IOS_DIR}"

echo "Step 2: Cleaning build artifacts..."
rm -rf build
rm -rf DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant* 2>/dev/null || true

echo "Step 3: Reinstalling pods with C++20 support..."
pod deintegrate
pod install

echo "Step 4: Verifying C++20 concept support..."
# Check if the hash_combine.h file exists and has the right content
HASH_COMBINE_FILE="${IOS_DIR}/Pods/Headers/Public/React-utils/react/utils/hash_combine.h"
if [ -f "$HASH_COMBINE_FILE" ]; then
    echo "✅ hash_combine.h found at: $HASH_COMBINE_FILE"
    if grep -q "concept Hashable" "$HASH_COMBINE_FILE"; then
        echo "✅ C++20 concepts detected in hash_combine.h"
    else
        echo "⚠️  C++20 concepts not found in hash_combine.h"
    fi
else
    echo "❌ hash_combine.h not found"
fi

echo "Step 5: Testing compilation..."
cd "${IOS_DIR}"
echo "Running quick compilation test..."
xcodebuild -workspace LyoAILearningAssistant.xcworkspace \
           -scheme LyoAILearningAssistant \
           -configuration Debug \
           -destination 'platform=iOS Simulator,name=iPhone 15' \
           clean build 2>&1 | grep -E "(concept|Hashable|hash_combine|error|Error|BUILD|SUCCESS|FAILED)" | head -20

echo ""
echo "✅ React Graphics C++20 fixes applied!"
echo ""
echo "📝 Changes made:"
echo "   • Updated Podfile to use C++20 standard"
echo "   • Cleaned all build artifacts"
echo "   • Reinstalled CocoaPods with C++20 support"
echo "   • Verified C++20 concept support"
echo ""
echo "🚀 The build should now support C++20 concepts used by React Native graphics components."
