#!/bin/bash
# Complete iOS Build Fix Script
# This script applies all the fixes we've developed and runs a clean build

echo "🔧 Starting complete iOS build fix..."

cd "$(dirname "$0")/ios"

# 1. Clean previous builds
echo "1️⃣ Cleaning previous builds..."
rm -rf build/ Pods/ Podfile.lock ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant*

# 2. Use our strategic Podfile with C++ fixes
echo "2️⃣ Applying strategic Podfile with C++ compilation fixes..."
cp Podfile.strategic Podfile

# 3. Install pods with our C++ fixes
echo "3️⃣ Installing pods with C++ compatibility fixes..."
pod install --verbose

# 4. Verify the installation
if [ -d "Pods" ] && [ -f "Podfile.lock" ]; then
    echo "✅ Pod installation successful"
    echo "📋 Installed pods:"
    ls Pods/ | grep -v -E "(Headers|Local|Target|\.)"
else
    echo "❌ Pod installation failed"
    exit 1
fi

# 5. Test the build
echo "4️⃣ Testing iOS build with C++ fixes..."
cd ..
npx expo run:ios --no-install --no-bundler 2>&1 | tee ios_build_with_fixes.log

echo "🏁 Build test completed. Check ios_build_with_fixes.log for results."
echo ""
echo "🎯 Key fixes applied:"
echo "   ✅ glog C++20 concept elimination"
echo "   ✅ RCT-Folly string_view template compatibility"
echo "   ✅ C++17 standard enforcement"
echo "   ✅ iOS SDK compatibility flags"
echo ""
echo "If build succeeds, your C++ compilation errors are resolved! 🎉"
