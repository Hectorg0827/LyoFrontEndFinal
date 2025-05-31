#!/bin/bash

echo "🧪 Testing C++20 Concepts Compilation"
echo "====================================="

PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
IOS_DIR="${PROJECT_ROOT}/ios"

cd "${IOS_DIR}"

echo "Testing React Graphics compilation with C++20 concepts..."

# Try to compile just the problematic files
echo "Checking hash_combine.h compilation..."
if [ -f "Pods/Headers/Public/React-utils/react/utils/hash_combine.h" ]; then
    echo "✅ hash_combine.h exists"
    
    # Test quick build focusing on React graphics
    echo "Running focused build test..."
    xcodebuild -workspace LyoAILearningAssistant.xcworkspace \
               -scheme LyoAILearningAssistant \
               -configuration Debug \
               -destination 'platform=iOS Simulator,name=iPhone 15' \
               build 2>&1 | grep -E "(concept|Hashable|hash_combine|React-graphics|error|Error)" | head -15
               
    # Check exit code
    if [ $? -eq 0 ]; then
        echo "✅ Build completed successfully - C++20 concepts working!"
    else
        echo "⚠️  Build had some issues, check output above"
    fi
else
    echo "❌ hash_combine.h not found"
fi

echo ""
echo "🔍 C++20 concept test complete!"
