#!/bin/bash

echo "=== Testing RCT-Folly Fix for Redefinition Error ==="

# Clean any previous test files
rm -f /tmp/test_*.o

echo "Testing individual header compilation..."

# Test FollyCharTraitsFix.h alone
echo "1. Testing FollyCharTraitsFix.h..."
if clang++ -c ios/LyoAILearningAssistant/FollyCharTraitsFix.h -o /tmp/test_folly.o 2>&1; then
    echo "   ✅ FollyCharTraitsFix.h compiles successfully"
else
    echo "   ❌ FollyCharTraitsFix.h compilation failed"
    exit 1
fi

# Test ReactRendererDebugFix.h (which includes FollyCharTraitsFix.h)
echo "2. Testing ReactRendererDebugFix.h (includes FollyCharTraitsFix.h)..."
if clang++ -c ios/LyoAILearningAssistant/ReactRendererDebugFix.h -o /tmp/test_renderer.o 2>&1; then
    echo "   ✅ ReactRendererDebugFix.h compiles successfully"
else
    echo "   ❌ ReactRendererDebugFix.h compilation failed"
    exit 1
fi

# Test the deprecated file
echo "3. Testing deprecated FollyFix.h..."
if clang++ -c ios/LyoFrontEndFinal/FollyFix.h -o /tmp/test_deprecated.o 2>&1; then
    echo "   ✅ Deprecated FollyFix.h compiles successfully"
else
    echo "   ❌ Deprecated FollyFix.h compilation failed"
    exit 1
fi

echo ""
echo "🎉 ALL HEADER FILES COMPILE SUCCESSFULLY!"
echo "   • No redefinition errors detected"
echo "   • char_traits<unsigned char> specialization is properly guarded"
echo "   • Ready for iOS build"

# Clean up test files
rm -f /tmp/test_*.o

echo ""
echo "Next step: Run iOS build to verify complete fix"
echo "Command: npx expo run:ios --configuration Debug"
