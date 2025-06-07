#!/bin/bash

# Essential iOS Build Script - Clean Solution
# Replaces all scattered build scripts with one reliable build process

set -e

echo "🍎 Lyo AI Learning Assistant - iOS Build"
echo "========================================"

PROJECT_ROOT=$(pwd)

# Prerequisites check
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js"
        exit 1
    fi
    
    if ! command -v pod &> /dev/null; then
        echo "❌ CocoaPods not found. Please install: sudo gem install cocoapods"
        exit 1
    fi
    
    if ! command -v xcodebuild &> /dev/null; then
        echo "❌ Xcode command line tools not found"
        exit 1
    fi
    
    echo "✅ Prerequisites verified"
}

# Clean build artifacts
clean_build() {
    echo "🧹 Cleaning build artifacts..."
    
    # Clean iOS
    rm -rf ios/build
    rm -rf ios/DerivedData
    
    # Clean Metro
    rm -rf /tmp/metro-*
    rm -rf /tmp/haste-map-*
    
    # Clean npm cache
    npm cache clean --force
    
    echo "✅ Clean completed"
}

# Install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    
    # Install npm packages
    npm install
    
    # Apply patches (this will apply the expo-device fix)
    npx patch-package
    
    # Install pods with proper configuration
    cd ios
    pod install --clean-install
    cd ..
    
    echo "✅ Dependencies installed"
}

# Build for iOS
build_ios() {
    echo "🏗️  Building iOS application..."
    
    # Start Metro in background
    echo "📱 Starting Metro bundler..."
    npx expo start --clear &
    METRO_PID=$!
    
    # Wait for Metro to start
    sleep 5
    
    # Build iOS
    npx expo run:ios --device
    BUILD_RESULT=$?
    
    # Stop Metro
    kill $METRO_PID 2>/dev/null || true
    
    if [ $BUILD_RESULT -eq 0 ]; then
        echo "✅ iOS build successful!"
        echo "📱 App should be running on your device/simulator"
    else
        echo "❌ iOS build failed"
        exit 1
    fi
}

# Main execution
main() {
    case "$1" in
        "--clean")
            check_prerequisites
            clean_build
            install_deps
            build_ios
            ;;
        "--install-only")
            check_prerequisites
            install_deps
            ;;
        *)
            check_prerequisites
            install_deps
            build_ios
            ;;
    esac
    
    echo ""
    echo "🎉 Build process completed!"
}

main "$@"
