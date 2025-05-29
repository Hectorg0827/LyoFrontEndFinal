#!/bin/bash

echo "🧪 Testing RCT-Folly Fix Implementation"
echo "======================================"

IOS_DIR="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios"

echo "✅ Checking our fix files exist:"
if [ -f "${IOS_DIR}/LyoAILearningAssistant/FollyCharTraitsFix.h" ]; then
    echo "   ✓ FollyCharTraitsFix.h exists"
else
    echo "   ❌ FollyCharTraitsFix.h missing"
fi

if [ -f "${IOS_DIR}/LyoAILearningAssistant/ReactRendererDebugFix.h" ]; then
    echo "   ✓ ReactRendererDebugFix.h exists"
else
    echo "   ❌ ReactRendererDebugFix.h missing"
fi

echo ""
echo "✅ Checking AppDelegate.mm includes our fix:"
if grep -q "ReactRendererDebugFix.h" "${IOS_DIR}/LyoAILearningAssistant/AppDelegate.mm"; then
    echo "   ✓ AppDelegate.mm includes ReactRendererDebugFix.h"
else
    echo "   ❌ AppDelegate.mm missing ReactRendererDebugFix.h include"
fi

echo ""
echo "✅ Checking char_traits fix is in place:"
if grep -q "char_traits<unsigned char>" "${IOS_DIR}/LyoAILearningAssistant/FollyCharTraitsFix.h"; then
    echo "   ✓ char_traits<unsigned char> specialization found"
else
    echo "   ❌ char_traits<unsigned char> specialization missing"
fi

echo ""
echo "🧪 Testing compilation with our fixes..."
cd "${IOS_DIR}"
echo "Building project to test RCT-Folly fixes..."
xcodebuild -workspace LyoAILearningAssistant.xcworkspace -scheme LyoAILearningAssistant -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 15' clean build 2>&1 | grep -E "(char_traits|Folly|error|Error|BUILD|SUCCESS|FAILED)" | head -20

echo ""
echo "🔍 Fix validation complete!"
