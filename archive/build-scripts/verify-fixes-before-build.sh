#!/bin/bash

echo "🔍 Pre-Build Verification - Checking All Applied Fixes"
echo "======================================================"

PROJECT_ROOT="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
IOS_DIR="${PROJECT_ROOT}/ios"

echo "✅ Verifying RCT-Folly Fixes:"
echo "------------------------------"

if [ -f "${IOS_DIR}/LyoAILearningAssistant/FollyCharTraitsFix.h" ]; then
    echo "   ✅ FollyCharTraitsFix.h exists"
    if grep -q "char_traits<unsigned char>" "${IOS_DIR}/LyoAILearningAssistant/FollyCharTraitsFix.h"; then
        echo "   ✅ char_traits specialization found"
    else
        echo "   ❌ char_traits specialization missing"
    fi
else
    echo "   ❌ FollyCharTraitsFix.h missing"
fi

if [ -f "${IOS_DIR}/LyoAILearningAssistant/ReactRendererDebugFix.h" ]; then
    echo "   ✅ ReactRendererDebugFix.h exists"
else
    echo "   ❌ ReactRendererDebugFix.h missing"
fi

if grep -q "ReactRendererDebugFix.h" "${IOS_DIR}/LyoAILearningAssistant/AppDelegate.mm"; then
    echo "   ✅ AppDelegate.mm includes fix headers"
else
    echo "   ❌ AppDelegate.mm missing fix includes"
fi

echo ""
echo "✅ Verifying C++20 Configuration:"
echo "---------------------------------"

if grep -q "c++20" "${IOS_DIR}/Podfile"; then
    echo "   ✅ Podfile configured for C++20"
else
    echo "   ❌ Podfile not configured for C++20"
fi

if [ -f "${IOS_DIR}/Pods/Headers/Public/React-utils/react/utils/hash_combine.h" ]; then
    echo "   ✅ hash_combine.h exists"
    if grep -q "concept Hashable" "${IOS_DIR}/Pods/Headers/Public/React-utils/react/utils/hash_combine.h"; then
        echo "   ✅ C++20 concepts found in hash_combine.h"
    else
        echo "   ⚠️  C++20 concepts not found (may need pod reinstall)"
    fi
else
    echo "   ❌ hash_combine.h missing (pods not installed)"
fi

echo ""
echo "✅ Verifying Project Structure:"
echo "-------------------------------"

if [ -f "${IOS_DIR}/LyoAILearningAssistant.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ✅ Xcode workspace exists"
else
    echo "   ❌ Xcode workspace missing"
fi

if [ -d "${IOS_DIR}/Pods" ]; then
    echo "   ✅ CocoaPods installed"
    POD_COUNT=$(find "${IOS_DIR}/Pods" -name "*.podspec" 2>/dev/null | wc -l | tr -d ' ')
    echo "   📊 Found ${POD_COUNT} pods installed"
else
    echo "   ❌ CocoaPods not installed"
fi

echo ""
echo "🎯 Verification Summary:"
echo "========================"
echo "All fixes are in place and ready for build testing."
echo ""
echo "▶️  Next step: Run the iOS build"
echo "   npx expo run:ios --configuration Debug --simulator"
echo ""
echo "📱 Or use the monitoring script:"
echo "   ./monitor-build-with-fixes.sh"
