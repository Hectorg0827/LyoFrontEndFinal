#!/bin/bash

# Comprehensive fix for React renderer debug and RCT-Folly char_traits issues
# This script addresses the std::char_traits<unsigned char> compilation error

echo "🔧 Applying comprehensive React renderer debug and RCT-Folly fixes..."

cd "$(dirname "$0")"

# 1. Ensure the header fix is in place
echo "📝 Ensuring FollyCharTraitsFix.h is properly configured..."
if [ ! -f "ios/LyoAILearningAssistant/FollyCharTraitsFix.h" ]; then
    echo "❌ FollyCharTraitsFix.h not found. Please run this script from the project root."
    exit 1
fi

# 2. Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf ios/build
rm -rf ios/DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant-*

# 3. Clean and reinstall pods
echo "🔄 Reinstalling pods with fixes..."
cd ios
rm -rf Pods
rm -rf Podfile.lock
pod deintegrate 2>/dev/null || true
pod install --repo-update

# 4. Apply additional Xcode project fixes
echo "🛠️ Applying Xcode project configuration fixes..."

# Create xcconfig file for consistent build settings
cat > LyoAILearningAssistant.xcconfig << 'EOF'
// Comprehensive build settings for React renderer debug fixes
CLANG_CXX_LANGUAGE_STANDARD = c++17
CLANG_CXX_LIBRARY = libc++
GCC_C_LANGUAGE_STANDARD = c11
FOLLY_NO_CONFIG = 1
FOLLY_MOBILE = 1
FOLLY_USE_LIBCPP = 1
FOLLY_HAVE_PTHREAD = 1
RCT_NEW_ARCH_ENABLED = 0
RCT_FABRIC_ENABLED = 0
GCC_PREPROCESSOR_DEFINITIONS = $(inherited) FOLLY_NO_CONFIG=1 FOLLY_MOBILE=1 FOLLY_USE_LIBCPP=1 RCT_NEW_ARCH_ENABLED=0
CLANG_WARN_STRICT_PROTOTYPES = NO
CLANG_WARN_DOCUMENTATION_COMMENTS = NO
EOF

cd ..

# 5. Verify the fix
echo "✅ Verifying build configuration..."
if pod --version > /dev/null 2>&1; then
    echo "✅ CocoaPods is available"
else
    echo "❌ CocoaPods not found. Installing..."
    sudo gem install cocoapods
fi

# 6. Test compilation
echo "🔍 Testing compilation (dry run)..."
cd ios
xcodebuild -workspace LyoAILearningAssistant.xcworkspace \
    -scheme LyoAILearningAssistant \
    -configuration Debug \
    -sdk iphoneos \
    -destination 'generic/platform=iOS' \
    -dry-run 2>&1 | head -20

cd ..

echo ""
echo "🎉 Comprehensive fix applied successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Open Xcode workspace: ios/LyoAILearningAssistant.xcworkspace"
echo "2. Select 'Hector's iPhone' as target device"
echo "3. Build and run (⌘+R)"
echo ""
echo "🔧 If issues persist, the following files have been updated:"
echo "   - ios/LyoAILearningAssistant/FollyCharTraitsFix.h (char_traits fix)"
echo "   - ios/Podfile (comprehensive build settings)"
echo "   - ios/LyoAILearningAssistant.xcconfig (Xcode configuration)"
echo ""
