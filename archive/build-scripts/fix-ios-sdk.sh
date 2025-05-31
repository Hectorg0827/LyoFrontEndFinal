#!/bin/bash

# iOS SDK Fix Script
# This script helps diagnose and fix Xcode/iOS SDK access issues

echo "🔧 iOS SDK Diagnostic and Fix Script"
echo "=================================="
echo ""

echo "1. Checking current Xcode installation..."
echo "Current Xcode path: $(xcode-select --print-path 2>/dev/null || echo 'NOT FOUND')"
echo ""

echo "2. Looking for Xcode installations..."
if [ -d "/Applications/Xcode.app" ]; then
    echo "✅ Xcode found at /Applications/Xcode.app"
    XCODE_PATH="/Applications/Xcode.app/Contents/Developer"
else
    echo "❌ Xcode not found at /Applications/Xcode.app"
    echo "Please install Xcode from the App Store first"
    exit 1
fi
echo ""

echo "3. Checking iOS SDK availability..."
IOS_SDK_PATH="${XCODE_PATH}/Platforms/iPhoneOS.platform/Developer/SDKs"
if [ -d "$IOS_SDK_PATH" ]; then
    echo "✅ iOS SDK directory found: $IOS_SDK_PATH"
    echo "Available iOS SDKs:"
    ls -la "$IOS_SDK_PATH" 2>/dev/null | grep "\.sdk$" || echo "No SDK directories found"
else
    echo "❌ iOS SDK directory not found: $IOS_SDK_PATH"
fi
echo ""

echo "4. Checking for UIKit header..."
UIKIT_HEADER="${IOS_SDK_PATH}/iPhoneOS.sdk/System/Library/Frameworks/UIKit.framework/Headers/UIKit.h"
if [ -f "$UIKIT_HEADER" ]; then
    echo "✅ UIKit header found: $UIKIT_HEADER"
else
    echo "❌ UIKit header not found: $UIKIT_HEADER"
    # Try alternative location
    ALT_UIKIT=$(find "$XCODE_PATH" -name "UIKit.h" 2>/dev/null | head -1)
    if [ -n "$ALT_UIKIT" ]; then
        echo "   Alternative UIKit found: $ALT_UIKIT"
    fi
fi
echo ""

echo "5. Checking command line tools..."
if command -v xcrun >/dev/null 2>&1; then
    echo "✅ xcrun command available"
    echo "iOS SDK path via xcrun: $(xcrun --sdk iphoneos --show-sdk-path 2>/dev/null || echo 'FAILED')"
else
    echo "❌ xcrun command not available"
fi
echo ""

echo "6. Attempting to fix Xcode path..."
echo "Setting Xcode developer directory to: $XCODE_PATH"
if sudo xcode-select --switch "$XCODE_PATH" 2>/dev/null; then
    echo "✅ Xcode path updated successfully"
else
    echo "❌ Failed to update Xcode path (may need admin privileges)"
    echo "Try running: sudo xcode-select --switch $XCODE_PATH"
fi
echo ""

echo "7. Testing basic iOS compilation..."
cat > /tmp/ios_test.m << 'EOF'
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

int main() {
    NSLog(@"UIKit test successful");
    return 0;
}
EOF

echo "Compiling test iOS application..."
if xcrun clang -framework Foundation -framework UIKit -o /tmp/ios_test /tmp/ios_test.m 2>/dev/null; then
    echo "✅ iOS compilation successful"
    rm -f /tmp/ios_test /tmp/ios_test.m
else
    echo "❌ iOS compilation failed"
    echo "Detailed error:"
    xcrun clang -framework Foundation -framework UIKit -o /tmp/ios_test /tmp/ios_test.m
    rm -f /tmp/ios_test.m
fi
echo ""

echo "8. Checking Node.js for React Native..."
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found"
    echo "Please install Node.js for React Native development"
fi
echo ""

echo "==================================="
echo "🎯 RECOMMENDATIONS:"
echo ""
if [ ! -d "/Applications/Xcode.app" ]; then
    echo "1. Install Xcode from the App Store"
elif [ ! -f "$UIKIT_HEADER" ]; then
    echo "1. Reinstall Xcode or run: sudo xcode-select --install"
    echo "2. Accept Xcode license: sudo xcodebuild -license accept"
else
    echo "1. iOS SDK appears to be available"
    echo "2. If compilation still fails, try:"
    echo "   - Clean project: rm -rf ios/build ios/DerivedData"
    echo "   - Reinstall pods: cd ios && pod install"
    echo "   - Try building from Xcode directly"
fi
echo ""
echo "After fixing Xcode/iOS SDK issues, the React Graphics C++20 fix should work!"
