#!/bin/bash

# Build Test Script for React Graphics C++20 Fix
# This script tests if the C++20 configuration is working for React Native iOS build

echo "=== React Graphics C++20 Build Test ==="
echo "Testing iOS build configuration for C++20 concepts support"
echo ""

# Change to iOS directory
cd "$(dirname "$0")/ios" || exit 1

echo "1. Checking Xcode and iOS SDK availability..."
xcode-select --print-path
xcrun --sdk iphoneos --show-sdk-path
echo ""

echo "2. Checking Node.js configuration..."
if [ -f ".xcode.env.local" ]; then
    echo "Found .xcode.env.local:"
    cat .xcode.env.local
else
    echo "No .xcode.env.local found"
fi
echo ""

echo "3. Checking CocoaPods configuration..."
if [ -f "Podfile.lock" ]; then
    echo "Podfile.lock exists - pods are installed"
    echo "React-graphics version: $(grep -A1 "React-graphics" Podfile.lock | head -2)"
else
    echo "Podfile.lock not found - need to run pod install"
fi
echo ""

echo "4. Testing C++20 compilation directly..."
cat > cpp20_test.cpp << 'EOF'
#include <concepts>
#include <iostream>

template<typename T>
concept Hashable = requires(T a) {
    { std::hash<T>{}(a) } -> std::convertible_to<std::size_t>;
};

template<Hashable T>
void test_concept(T value) {
    std::cout << "Hash: " << std::hash<T>{}(value) << std::endl;
}

int main() {
    test_concept(42);
    test_concept(std::string("test"));
    std::cout << "C++20 concepts working!" << std::endl;
    return 0;
}
EOF

echo "Compiling C++20 test..."
if xcrun clang++ -std=c++20 -fconcepts -o cpp20_test cpp20_test.cpp 2>/dev/null; then
    echo "✅ C++20 concepts compilation successful"
    ./cpp20_test
    rm -f cpp20_test cpp20_test.cpp
else
    echo "❌ C++20 concepts compilation failed"
    xcrun clang++ -std=c++20 -fconcepts -o cpp20_test cpp20_test.cpp
    rm -f cpp20_test.cpp
fi
echo ""

echo "5. Checking specific React Graphics header..."
REACT_GRAPHICS_HEADER="Pods/Headers/Public/react_renderer_graphics/react/renderer/graphics/platform/ios/RCTComponentViewDescriptor.h"
if [ -f "$REACT_GRAPHICS_HEADER" ]; then
    echo "✅ React Graphics headers found"
else
    echo "❌ React Graphics headers not found at: $REACT_GRAPHICS_HEADER"
    echo "Looking for alternative paths..."
    find Pods -name "*hash_combine*" -type f 2>/dev/null | head -5
fi
echo ""

echo "6. Testing basic iOS framework access..."
cat > ios_test.m << 'EOF'
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

int main() {
    NSLog(@"Foundation and UIKit imported successfully");
    return 0;
}
EOF

echo "Compiling iOS framework test..."
if xcrun clang -framework Foundation -framework UIKit -o ios_test ios_test.m 2>/dev/null; then
    echo "✅ iOS frameworks accessible"
    rm -f ios_test ios_test.m
else
    echo "❌ iOS frameworks not accessible"
    xcrun clang -framework Foundation -framework UIKit -o ios_test ios_test.m
    rm -f ios_test.m
fi
echo ""

echo "7. Quick build attempt (dry run)..."
echo "Running: xcodebuild -workspace LyoAILearningAssistant.xcworkspace -scheme LyoAILearningAssistant -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 15' -dry-run"
if xcodebuild -workspace LyoAILearningAssistant.xcworkspace -scheme LyoAILearningAssistant -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 15' -dry-run >/dev/null 2>&1; then
    echo "✅ Build configuration valid"
else
    echo "❌ Build configuration has issues"
fi
echo ""

echo "=== Test Complete ==="
echo "If C++20 concepts compilation worked, the React Graphics fix should work."
echo "If iOS frameworks are accessible, the main.m UIKit issue should be resolvable."
echo "If the build configuration is valid, we can proceed with a full build."
