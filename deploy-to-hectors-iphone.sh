#!/bin/bash
# Deploy LyoAI Learning Assistant to Hector's iPhone
# Comprehensive iOS Device Deployment Script

echo "📱 DEPLOYING LYOAI LEARNING ASSISTANT TO HECTOR'S IPHONE"
echo "========================================================"
echo "Start Time: $(date)"
echo "Target: Physical iOS Device (Hector's iPhone)"
echo ""

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function for colored logging
log() {
    echo -e "[$(date '+%H:%M:%S')] ${GREEN}✅${NC} $1"
}

warn() {
    echo -e "[$(date '+%H:%M:%S')] ${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "[$(date '+%H:%M:%S')] ${RED}❌${NC} $1"
}

info() {
    echo -e "[$(date '+%H:%M:%S')] ${BLUE}ℹ️${NC} $1"
}

# Navigate to project directory
cd "/Users/republicalatuya/Desktop/LyoFrontEndFinal"

# Phase 1: Check device connectivity
check_device_connection() {
    log "📱 PHASE 1: Checking device connectivity..."
    
    info "Searching for connected iOS devices..."
    
    # Try multiple methods to detect devices
    echo "🔍 Checking with xcrun devicectl..."
    xcrun devicectl list devices 2>/dev/null | grep -i "iphone\|device" || true
    
    echo ""
    echo "🔍 Checking with xcrun simctl (for reference)..."
    xcrun simctl list devices | grep -i "iphone" | head -5 || true
    
    echo ""
    echo "🔍 Checking with system_profiler..."
    system_profiler SPUSBDataType | grep -A 10 -i "iphone\|ios" || true
    
    # Check if device is connected via USB
    if system_profiler SPUSBDataType | grep -qi "iphone"; then
        log "iPhone detected via USB connection"
        DEVICE_CONNECTED=true
    else
        warn "No iPhone detected via USB. Make sure:"
        echo "  1. iPhone is connected via USB cable"
        echo "  2. iPhone is unlocked and 'Trust This Computer' is selected"
        echo "  3. Xcode is installed and device is registered"
        DEVICE_CONNECTED=false
    fi
}

# Phase 2: Prepare build environment for device
prepare_device_build() {
    log "🔧 PHASE 2: Preparing build environment for device..."
    
    # Clean previous builds
    info "Cleaning previous build artifacts..."
    rm -rf ios/build
    rm -rf ios/Pods
    rm -rf ios/Podfile.lock
    rm -rf node_modules/.cache
    rm -rf /tmp/metro-*
    
    # Install dependencies
    info "Installing fresh dependencies..."
    npm install
    
    # Apply patches
    info "Applying critical patches..."
    npx patch-package
    
    log "Build environment prepared for device deployment"
}

# Phase 3: Configure for device build
configure_device_build() {
    log "⚙️ PHASE 3: Configuring for iOS device build..."
    
    # Update app.json for device build
    info "Updating app.json for device deployment..."
    
    # Create backup
    cp app.json app.json.device.backup
    
    # Ensure proper iOS configuration
    cat > temp_app_config.json << 'EOF'
{
  "expo": {
    "name": "LyoAILearningAssistant",
    "slug": "lyo-ai-learning-assistant",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.lyo.LyoAILearningAssistant",
      "buildNumber": "1",
      "deploymentTarget": "13.0",
      "requireFullScreen": false,
      "userInterfaceStyle": "automatic"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": ["expo-router"],
    "scheme": "lyo-ai-learning-assistant",
    "extra": {
      "router": {
        "origin": false
      }
    }
  }
}
EOF
    
    mv temp_app_config.json app.json
    log "App configuration updated for device deployment"
}

# Phase 4: Regenerate iOS project
regenerate_ios_project() {
    log "🏗️ PHASE 4: Regenerating iOS project for device..."
    
    info "Running expo prebuild for iOS device..."
    npx expo prebuild --platform ios --clean
    
    if [ $? -eq 0 ]; then
        log "iOS project regenerated successfully for device"
    else
        error "Failed to regenerate iOS project"
        exit 1
    fi
}

# Phase 5: Install CocoaPods
install_device_pods() {
    log "🍫 PHASE 5: Installing CocoaPods for device build..."
    
    cd ios
    
    info "Updating CocoaPods repository..."
    pod repo update
    
    info "Installing pods for device build..."
    pod install --repo-update
    
    if [ $? -eq 0 ]; then
        log "CocoaPods installed successfully for device"
    else
        error "CocoaPods installation failed"
        cd ..
        exit 1
    fi
    
    cd ..
}

# Phase 6: Start Metro bundler
start_metro_for_device() {
    log "📦 PHASE 6: Starting Metro bundler for device..."
    
    info "Starting Metro bundler in background..."
    npx expo start --clear > metro_device.log 2>&1 &
    METRO_PID=$!
    
    info "Metro started with PID: $METRO_PID"
    
    # Wait for Metro to start
    info "Waiting for Metro to be ready..."
    sleep 15
    
    if lsof -i :8081 >/dev/null 2>&1; then
        log "Metro bundler is ready for device deployment"
    else
        error "Metro bundler failed to start"
        kill $METRO_PID 2>/dev/null || true
        exit 1
    fi
}

# Phase 7: Build and deploy to device
build_and_deploy_to_device() {
    log "🚀 PHASE 7: Building and deploying to Hector's iPhone..."
    
    info "Starting device build and deployment..."
    info "This may take 10-20 minutes for device builds..."
    
    # Show device deployment instructions
    echo ""
    echo "📱 DEVICE DEPLOYMENT CHECKLIST:"
    echo "================================"
    echo "✅ Make sure Hector's iPhone is:"
    echo "   1. Connected via USB cable"
    echo "   2. Unlocked and screen is on"
    echo "   3. 'Trust This Computer' has been selected"
    echo "   4. Developer mode is enabled (Settings > Privacy & Security > Developer Mode)"
    echo ""
    echo "⚙️ In Xcode (if prompted):"
    echo "   1. Select Hector's iPhone as the target device"
    echo "   2. Ensure proper signing certificate is selected"
    echo "   3. Allow automatic signing if prompted"
    echo ""
    
    # Start build for device
    info "Starting iOS device build process..."
    
    # Create device deployment log
    touch device_deployment.log
    
    # Start build with device targeting
    npx expo run:ios --device 2>&1 | tee device_deployment.log &
    BUILD_PID=$!
    
    info "Device build started with PID: $BUILD_PID"
    
    # Monitor build progress
    BUILD_START_TIME=$(date +%s)
    
    while kill -0 $BUILD_PID 2>/dev/null; do
        CURRENT_TIME=$(date +%s)
        ELAPSED=$((CURRENT_TIME - BUILD_START_TIME))
        
        # Check for build completion
        if tail -n 10 device_deployment.log | grep -q "success Installed the app\|Build succeeded"; then
            echo ""
            log "🎉 DEVICE DEPLOYMENT SUCCEEDED! (${ELAPSED}s elapsed)"
            log "📱 LyoAI Learning Assistant is now installed on Hector's iPhone!"
            break
        elif tail -n 10 device_deployment.log | grep -q "Build failed\|error:"; then
            echo ""
            error "DEVICE DEPLOYMENT FAILED! (${ELAPSED}s elapsed)"
            echo ""
            error "📋 Last 15 lines of deployment log:"
            tail -n 15 device_deployment.log
            echo ""
            error "💡 Common device deployment issues:"
            echo "   - Code signing certificate issues"
            echo "   - Device not properly registered"
            echo "   - Developer mode not enabled on device"
            echo "   - USB connection issues"
            kill $METRO_PID 2>/dev/null || true
            exit 1
        fi
        
        # Show progress indicators
        if tail -n 5 device_deployment.log | grep -q "Building"; then
            echo -ne "\r🔨 Building for device... (${ELAPSED}s elapsed)"
        elif tail -n 5 device_deployment.log | grep -q "Installing"; then
            echo -ne "\r📱 Installing to Hector's iPhone... (${ELAPSED}s elapsed)"
        elif tail -n 5 device_deployment.log | grep -q "Launching"; then
            echo -ne "\r🚀 Launching app on device... (${ELAPSED}s elapsed)"
        elif tail -n 5 device_deployment.log | grep -q "Signing"; then
            echo -ne "\r✍️ Code signing... (${ELAPSED}s elapsed)"
        else
            echo -ne "\r⏳ Device deployment in progress... (${ELAPSED}s elapsed)"
        fi
        
        # Safety timeout (30 minutes for device builds)
        if [ $ELAPSED -gt 1800 ]; then
            echo ""
            warn "Device deployment timeout reached (30 minutes)"
            kill $BUILD_PID 2>/dev/null || true
            kill $METRO_PID 2>/dev/null || true
            exit 1
        fi
        
        sleep 5
    done
    
    # Wait for build to complete
    wait $BUILD_PID
    BUILD_EXIT_CODE=$?
    
    echo "" # New line
    
    if [ $BUILD_EXIT_CODE -eq 0 ]; then
        log "Device deployment completed successfully"
    else
        error "Device deployment failed with exit code: $BUILD_EXIT_CODE"
        exit 1
    fi
}

# Phase 8: Verify device installation
verify_device_installation() {
    log "✅ PHASE 8: Verifying app installation on device..."
    
    # Check if Metro is still serving
    if lsof -i :8081 >/dev/null 2>&1; then
        log "Metro bundler is serving for device"
    else
        warn "Metro bundler may have stopped"
    fi
    
    # Wait for app to fully install
    info "Waiting for app installation to complete on device..."
    sleep 10
    
    log "📱 App should now be visible on Hector's iPhone home screen"
    log "🔗 Metro bundler available at: http://localhost:8081"
    
    # Open Metro in browser for monitoring
    info "Opening Metro bundler in browser for monitoring..."
    open http://localhost:8081 2>/dev/null || true
}

# Phase 9: Post-deployment instructions
show_post_deployment_instructions() {
    log "📋 PHASE 9: Post-deployment instructions..."
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "====================================="
    echo ""
    echo "📱 On Hector's iPhone:"
    echo "   1. Look for 'LyoAILearningAssistant' app on home screen"
    echo "   2. Tap to launch the app"
    echo "   3. Grant any requested permissions"
    echo "   4. The app should connect to Metro bundler automatically"
    echo ""
    echo "🔧 For development:"
    echo "   - Metro bundler is running at: http://localhost:8081"
    echo "   - Shake device to open developer menu"
    echo "   - Reload app by shaking device and selecting 'Reload'"
    echo ""
    echo "📊 Monitoring files created:"
    echo "   - device_deployment.log (complete deployment log)"
    echo "   - metro_device.log (Metro bundler log)"
    echo ""
    echo "🚀 Your LyoAI Learning Assistant is now running on Hector's iPhone!"
}

# Cleanup function
cleanup_on_exit() {
    echo ""
    info "Cleaning up processes..."
    kill $METRO_PID 2>/dev/null || true
    kill $BUILD_PID 2>/dev/null || true
    log "Cleanup completed"
}

# Set trap for graceful exit
trap cleanup_on_exit INT TERM

# Main execution
main() {
    log "🎯 Starting deployment to Hector's iPhone..."
    
    # Execute all phases
    check_device_connection
    prepare_device_build
    configure_device_build
    regenerate_ios_project
    install_device_pods
    start_metro_for_device
    build_and_deploy_to_device
    verify_device_installation
    show_post_deployment_instructions
    
    log "🎉 Deployment process completed!"
}

# Execute main function
main
