#!/bin/bash

echo "🔍 Diagnosing Swift Compilation Issues"
echo "====================================="

PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
IOS_DIR="${PROJECT_ROOT}/ios"

echo ""
echo "📱 Project Information:"
echo "   Root: ${PROJECT_ROOT}"
echo "   iOS: ${IOS_DIR}"

echo ""
echo "🔧 Swift Configuration:"
# Check Swift version
if command -v swift &> /dev/null; then
    echo "   Swift Version: $(swift --version | head -1)"
else
    echo "   ❌ Swift not found in PATH"
fi

echo ""
echo "📋 Xcode Configuration:"
if command -v xcodebuild &> /dev/null; then
    echo "   Xcode Version: $(xcodebuild -version | head -1)"
    echo "   SDK Version: $(xcodebuild -showsdks | grep iphoneos | tail -1)"
else
    echo "   ❌ Xcode build tools not found"
fi

echo ""
echo "🎯 Checking for Swift files in project..."
find "${IOS_DIR}" -name "*.swift" 2>/dev/null | head -10 || echo "   No Swift files found"

echo ""
echo "📦 Checking Pod dependencies with Swift..."
if [ -f "${IOS_DIR}/Podfile.lock" ]; then
    echo "   Pods with Swift dependencies:"
    grep -A1 -B1 "swift" "${IOS_DIR}/Podfile.lock" | head -10 || echo "   No Swift pods detected"
else
    echo "   ❌ Podfile.lock not found"
fi

echo ""
echo "🔍 Checking for Swift-related build settings..."
if [ -f "${IOS_DIR}/LyoAILearningAssistant.xcodeproj/project.pbxproj" ]; then
    echo "   Swift settings in project:"
    grep -E "(SWIFT_|CLANG_ENABLE_MODULES|ALWAYS_EMBED_SWIFT)" "${IOS_DIR}/LyoAILearningAssistant.xcodeproj/project.pbxproj" | head -5
else
    echo "   ❌ Project file not found"
fi

echo ""
echo "🧹 Build artifacts status:"
if [ -d "${IOS_DIR}/build" ]; then
    echo "   Build directory exists ($(du -sh "${IOS_DIR}/build" 2>/dev/null | cut -f1))"
else
    echo "   ✅ Build directory clean"
fi

if [ -d "${IOS_DIR}/DerivedData" ]; then
    echo "   DerivedData exists ($(du -sh "${IOS_DIR}/DerivedData" 2>/dev/null | cut -f1))"
else
    echo "   ✅ DerivedData clean"
fi

echo ""
echo "💡 Recommendations:"
echo "   1. Clean build: rm -rf ios/build ios/DerivedData"
echo "   2. Reinstall pods: cd ios && pod install"
echo "   3. Reset Metro cache: npx react-native start --reset-cache"
echo "   4. Try Xcode build: open ios/LyoAILearningAssistant.xcworkspace"

echo ""
echo "🚀 To fix SwiftEmitModule errors, try:"
echo "   1. Ensure all Swift pods are properly installed"
echo "   2. Check Xcode build settings for Swift version consistency"
echo "   3. Verify no conflicting Swift versions in dependencies"
