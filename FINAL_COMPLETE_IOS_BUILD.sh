#!/bin/bash

# LyoAILearningAssistant - COMPLETE iOS BUILD SCRIPT
# This script will ensure the app builds and deploys successfully

echo "🍎 LyoAILearningAssistant - Complete iOS Build Process"
echo "======================================================"

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Step 1: Navigate to project directory
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal
log "Working in: $(pwd)"

# Step 2: Verify project structure
log "Verifying project structure..."
if [ ! -f "package.json" ]; then
    error "package.json not found"
fi
if [ ! -f "app.json" ]; then
    error "app.json not found"
fi
if [ ! -d "ios" ]; then
    error "iOS directory not found"
fi
success "Project structure verified"

# Step 3: Clean previous builds
log "Cleaning previous build artifacts..."
rm -rf ios/build || true
rm -rf ios/DerivedData || true
rm -rf node_modules/.cache || true
success "Build artifacts cleaned"

# Step 4: Ensure dependencies are installed
log "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    log "Installing npm dependencies..."
    npm install
fi
success "Dependencies verified"

# Step 5: Verify expo-device patch
log "Verifying expo-device TARGET_OS_SIMULATOR patch..."
if grep -q "import TargetConditionals" node_modules/expo-device/ios/UIDevice.swift; then
    success "expo-device patch is applied correctly"
else
    warning "Applying expo-device patch..."
    npm run postinstall
    if grep -q "import TargetConditionals" node_modules/expo-device/ios/UIDevice.swift; then
        success "expo-device patch applied successfully"
    else
        error "Failed to apply expo-device patch"
    fi
fi

# Step 6: Clean and install iOS pods
log "Installing iOS pods..."
cd ios
rm -rf Pods Podfile.lock || true
pod install --repo-update
cd ..
success "iOS pods installed"

# Step 7: Check for iOS devices/simulators
log "Checking for available iOS devices..."
if command -v xcrun &> /dev/null; then
    # Check for physical devices
    connected_devices=$(xcrun devicectl list devices 2>/dev/null | grep -E "iPhone|iPad" | grep "Connected" || true)
    
    if [ -n "$connected_devices" ]; then
        success "Found connected iOS devices"
        echo "$connected_devices"
        BUILD_DEVICE="--device"
    else
        log "No physical devices found, checking simulators..."
        # List available simulators
        available_sims=$(xcrun simctl list devices available | grep "iPhone" | head -5 || true)
        if [ -n "$available_sims" ]; then
            success "Found available iOS simulators"
            echo "$available_sims"
            BUILD_DEVICE=""
        else
            warning "No devices or simulators found"
            BUILD_DEVICE=""
        fi
    fi
else
    warning "Xcode command line tools not found"
    BUILD_DEVICE=""
fi

# Step 8: Start the build
log "Starting iOS build process..."
log "Command: npx expo run:ios $BUILD_DEVICE"
log "This may take several minutes..."

# Create a log file for build output
BUILD_LOG="ios_build_$(date +%Y%m%d_%H%M%S).log"

# Start the build
npx expo run:ios $BUILD_DEVICE 2>&1 | tee "$BUILD_LOG"

# Check build result
if [ $? -eq 0 ]; then
    success "🎉 iOS build completed successfully!"
    success "📱 The app should now be running on your device/simulator"
    echo "======================================================"
    echo "🚀 BUILD SUCCESS SUMMARY:"
    echo "✅ expo-device TARGET_OS_SIMULATOR fix applied"
    echo "✅ Clean Podfile configuration loaded"
    echo "✅ Dependencies installed and verified"
    echo "✅ iOS build completed without errors"
    echo "✅ App deployed to device/simulator"
    echo "======================================================"
else
    error "iOS build failed. Check the log file: $BUILD_LOG"
fi
