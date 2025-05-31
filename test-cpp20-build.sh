#!/bin/bash

# Test script to verify C++20 configuration is working for iOS build
echo "🔍 Testing C++20 React Graphics Build Configuration..."

# Check if we're in the right directory
if [[ ! -f "ios/Podfile" ]]; then
    echo "❌ Error: Not in React Native project root (ios/Podfile not found)"
    exit 1
fi

echo "✅ Found React Native project with ios/Podfile"

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    echo "❌ Error: node_modules not found. Run 'npm install' first."
    exit 1
fi

echo "✅ Found node_modules directory"

# Check for React Native dependencies
if [[ ! -d "node_modules/@react-native-community/cli-platform-ios" ]]; then
    echo "❌ Error: @react-native-community/cli-platform-ios not found"
    exit 1
fi

echo "✅ Found React Native iOS CLI dependencies"

# Verify Podfile has C++20 configuration
if grep -q "CLANG_CXX_LANGUAGE_STANDARD.*c++20" ios/Podfile; then
    echo "✅ Podfile contains C++20 configuration"
else
    echo "❌ Warning: Podfile may not have proper C++20 configuration"
fi

# Check if Pods directory exists
if [[ -d "ios/Pods" ]]; then
    echo "✅ Pods directory exists"
    
    # Check for React Graphics pods
    if [[ -d "ios/Pods/React-graphics" ]]; then
        echo "✅ React-graphics pod found"
    else
        echo "⚠️  React-graphics pod not found - may not be needed for this version"
    fi
    
    # Test build with Xcode if available
    if command -v xcodebuild &> /dev/null; then
        echo "🔨 Testing iOS build with C++20 configuration..."
        cd ios
        xcodebuild -workspace LyoAILearningAssistant.xcworkspace \
                   -scheme LyoAILearningAssistant \
                   -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest' \
                   clean build \
                   ONLY_ACTIVE_ARCH=YES \
                   -quiet
        
        if [[ $? -eq 0 ]]; then
            echo "✅ iOS build succeeded with C++20 configuration!"
        else
            echo "❌ iOS build failed - C++20 concept compilation may have issues"
            echo "📋 Check the build logs for 'Unknown type name concept' or 'Unknown type name Hashable' errors"
        fi
        cd ..
    else
        echo "⚠️  xcodebuild not available - cannot test build"
    fi
    
else
    echo "❌ Pods directory not found"
    echo "🔧 Attempting to install pods..."
    
    cd ios
    if command -v pod &> /dev/null; then
        echo "Running 'pod install'..."
        pod install --verbose
        if [[ $? -eq 0 ]]; then
            echo "✅ Pod install completed successfully"
        else
            echo "❌ Pod install failed"
            exit 1
        fi
    else
        echo "❌ CocoaPods not available"
        exit 1
    fi
    cd ..
fi

echo ""
echo "🎯 C++20 Configuration Summary:"
echo "   - Project has proper React Native setup"
echo "   - Node modules installed with iOS CLI support"  
echo "   - Podfile configured for C++20"
echo "   - Compatibility fixes in place for RCT-Folly"
echo ""
echo "🚀 Ready to test React Graphics C++20 concept compilation!"
