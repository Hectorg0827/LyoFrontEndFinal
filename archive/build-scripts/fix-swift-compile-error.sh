#!/bin/bash

echo "🔧 Fixing Swift Compilation Error (SwiftEmitModule)"
echo "=================================================="

PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
IOS_DIR="${PROJECT_ROOT}/ios"
PROJECT_FILE="${IOS_DIR}/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Create backup
BACKUP_FILE="${PROJECT_FILE}.swift_fix_backup.$(date +%Y%m%d%H%M%S)"
echo "📋 Creating backup at: ${BACKUP_FILE}"
cp "${PROJECT_FILE}" "${BACKUP_FILE}"

echo ""
echo "🧹 Step 1: Cleaning build artifacts..."
rm -rf "${IOS_DIR}/build"
rm -rf "${IOS_DIR}/DerivedData"
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant* 2>/dev/null || true

echo ""
echo "🔧 Step 2: Fixing Swift compilation settings..."

# Ensure Swift is properly configured
if ! grep -q "ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES" "${PROJECT_FILE}"; then
    echo "Adding ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES setting..."
    # Add to both Debug and Release configurations
    sed -i '' '/ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;/a\
				ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES = YES;
' "${PROJECT_FILE}"
fi

# Set proper Swift optimization levels
sed -i '' 's/SWIFT_OPTIMIZATION_LEVEL = "-Onone";/SWIFT_OPTIMIZATION_LEVEL = "-O";/g' "${PROJECT_FILE}"

# Ensure proper Swift version
sed -i '' 's/SWIFT_VERSION = [0-9.]*;/SWIFT_VERSION = 5.0;/g' "${PROJECT_FILE}"

echo ""
echo "🔧 Step 3: Fixing module compilation settings..."

# Fix module compilation issues
if ! grep -q "DEFINES_MODULE = YES" "${PROJECT_FILE}"; then
    echo "Adding DEFINES_MODULE setting..."
    sed -i '' '/ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;/a\
				DEFINES_MODULE = YES;
' "${PROJECT_FILE}"
fi

# Enable modules
if ! grep -q "CLANG_ENABLE_MODULES = YES" "${PROJECT_FILE}"; then
    echo "Enabling Clang modules..."
    sed -i '' '/ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;/a\
				CLANG_ENABLE_MODULES = YES;
' "${PROJECT_FILE}"
fi

echo ""
echo "🔧 Step 4: Updating C++ standard to C++20 for React Native compatibility..."
cd "${IOS_DIR}"
# The Podfile has been updated to use C++20, now reinstall pods
echo "Deintegrating pods..."
pod deintegrate --silent
echo "Installing pods with C++20 support..."
pod install --silent

echo ""
echo "🔧 Step 5: Resetting Metro bundler cache..."
cd "${PROJECT_ROOT}"
npx react-native start --reset-cache > /dev/null 2>&1 &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null || true

echo ""
echo "✅ Swift compilation fixes applied successfully!"
echo ""
echo "📝 Changes made:"
echo "   • Cleaned all build artifacts and derived data"
echo "   • Set ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES = YES"
echo "   • Set DEFINES_MODULE = YES"
echo "   • Enabled CLANG_ENABLE_MODULES"
echo "   • Set proper Swift optimization level"
echo "   • Reinstalled CocoaPods dependencies"
echo "   • Reset Metro bundler cache"
echo ""
echo "🚀 Next steps:"
echo "1. Try building again: npx expo run:ios --configuration Debug"
echo "2. If issues persist, try building in Xcode directly"
echo ""
echo "💡 Backup saved at: ${BACKUP_FILE}"
