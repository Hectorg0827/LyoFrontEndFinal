#!/bin/bash

echo "🔍 Validation Test for iOS Metro Configuration"
echo "============================================="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Check that our fixes are in place
echo "1. Checking Metro configuration..."
if grep -q "enhanceMiddleware" metro.config.js; then
    echo "✅ Metro config has bundle routing middleware"
else
    echo "❌ Metro config missing middleware"
fi

echo ""
echo "2. Checking iOS AppDelegate configuration..."
if grep -q 'jsBundleURLForBundleRoot:@"index"' ios/LyoAILearningAssistant/AppDelegate.mm; then
    echo "✅ iOS AppDelegate uses 'index' bundle root"
else
    echo "❌ iOS AppDelegate not configured correctly"
fi

echo ""
echo "3. Checking project structure..."
echo "   Package.json: $([ -f package.json ] && echo '✅ Present' || echo '❌ Missing')"
echo "   App.tsx: $([ -f App.tsx ] && echo '✅ Present' || echo '❌ Missing')"
echo "   index.js: $([ -f index.js ] && echo '✅ Present' || echo '❌ Missing')"
echo "   iOS project: $([ -d ios/LyoAILearningAssistant ] && echo '✅ Present' || echo '❌ Missing')"

echo ""
echo "4. Checking patch files..."
if [ -f "patches/expo-device+6.0.2.patch" ]; then
    echo "✅ Expo-device patch is present"
else
    echo "❌ Expo-device patch missing"
fi

echo ""
echo "5. Quick Metro test (won't start full server)..."
if command -v npx >/dev/null 2>&1; then
    echo "✅ NPX is available"
    if npx expo --version >/dev/null 2>&1; then
        echo "✅ Expo CLI is working"
    else
        echo "❌ Expo CLI not working"
    fi
else
    echo "❌ NPX not available"
fi

echo ""
echo "===================="
echo "VALIDATION COMPLETE"
echo "===================="

# Count issues
ISSUES=0
grep -q "enhanceMiddleware" metro.config.js || ((ISSUES++))
grep -q 'jsBundleURLForBundleRoot:@"index"' ios/LyoAILearningAssistant/AppDelegate.mm || ((ISSUES++))
[ -f package.json ] || ((ISSUES++))
[ -f App.tsx ] || ((ISSUES++))
[ -f index.js ] || ((ISSUES++))
[ -d ios/LyoAILearningAssistant ] || ((ISSUES++))

if [ $ISSUES -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED - Configuration looks good!"
    echo ""
    echo "🚀 Ready to run: ./definitive_ios_launch.sh"
else
    echo "❌ Found $ISSUES issues - check the output above"
fi
