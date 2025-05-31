#!/bin/bash

echo "🚀 iOS Build Monitor - Testing All Applied Fixes"
echo "==============================================="

PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
BUILD_LOG="${PROJECT_ROOT}/build-monitor.log"

cd "${PROJECT_ROOT}"

echo "📱 Starting iOS build with all fixes applied..."
echo "   - RCT-Folly char_traits fixes"
echo "   - C++20 concept compatibility"
echo "   - Swift compilation fixes"
echo ""

echo "▶️  Running: npx expo run:ios --configuration Debug --simulator"
echo ""

# Start the build and capture output
npx expo run:ios --configuration Debug --simulator 2>&1 | tee "${BUILD_LOG}"

echo ""
echo "📊 Build Analysis:"
echo "=================="

# Check for our specific fixed errors
echo "✅ Checking for RCT-Folly fixes:"
if grep -q "string.*file not found" "${BUILD_LOG}"; then
    echo "   ❌ Still seeing 'string file not found' errors"
else
    echo "   ✅ No 'string file not found' errors detected"
fi

if grep -q "char_traits.*redefinition" "${BUILD_LOG}"; then
    echo "   ❌ Still seeing char_traits redefinition errors"
else
    echo "   ✅ No char_traits redefinition errors detected"
fi

echo ""
echo "✅ Checking for C++20 concept fixes:"
if grep -q "concept.*unknown" "${BUILD_LOG}"; then
    echo "   ❌ Still seeing C++20 concept errors"
else
    echo "   ✅ No C++20 concept errors detected"
fi

if grep -q "Hashable.*unknown" "${BUILD_LOG}"; then
    echo "   ❌ Still seeing Hashable concept errors"
else
    echo "   ✅ No Hashable concept errors detected"
fi

echo ""
echo "✅ Checking for Swift compilation:"
if grep -q "SwiftEmitModule.*failed" "${BUILD_LOG}"; then
    echo "   ⚠️  Swift compilation still has issues"
    echo "   📝 Check Swift module configuration"
else
    echo "   ✅ Swift compilation successful"
fi

echo ""
echo "🎯 Overall Build Status:"
if grep -q "BUILD SUCCEEDED" "${BUILD_LOG}"; then
    echo "   🎉 BUILD SUCCEEDED - All fixes working!"
elif grep -q "BUILD FAILED" "${BUILD_LOG}"; then
    echo "   ❌ Build failed - check log for remaining issues"
    echo "   📄 Full log saved at: ${BUILD_LOG}"
else
    echo "   ⏳ Build in progress or incomplete"
fi

echo ""
echo "📄 Full build log saved at: ${BUILD_LOG}"
echo "🔍 Review the log for detailed error information"
