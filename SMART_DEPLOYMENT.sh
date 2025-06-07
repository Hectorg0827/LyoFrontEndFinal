#!/bin/bash
# SMART_DEPLOYMENT.sh - Intelligent iOS Device Deployment with Real-time Error Fixing
# Deploys LyoAI Learning Assistant to Hector's iPhone with automatic error resolution

set -e

PROJECT_DIR="/Users/republicalatuya/Desktop/LyoFrontEndFinal"
DEVICE_LOG="device_build_live.log"
METRO_LOG="metro_live.log"
ERROR_LOG="deployment_errors.log"
SUCCESS_LOG="deployment_success.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO $(date '+%H:%M:%S')]${NC} $1" | tee -a "$SUCCESS_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS $(date '+%H:%M:%S')]${NC} $1" | tee -a "$SUCCESS_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING $(date '+%H:%M:%S')]${NC} $1" | tee -a "$ERROR_LOG"
}

log_error() {
    echo -e "${RED}[ERROR $(date '+%H:%M:%S')]${NC} $1" | tee -a "$ERROR_LOG"
}

log_step() {
    echo -e "${PURPLE}[STEP $(date '+%H:%M:%S')]${NC} $1" | tee -a "$SUCCESS_LOG"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up background processes..."
    pkill -f "expo start" 2>/dev/null || true
    pkill -f "Metro" 2>/dev/null || true
    pkill -f "react-native" 2>/dev/null || true
}

# Error fixing functions
fix_node_modules() {
    log_warning "Fixing node_modules issues..."
    rm -rf node_modules package-lock.json yarn.lock 2>/dev/null || true
    npm cache clean --force
    npm install --legacy-peer-deps
}

fix_cocoapods() {
    log_warning "Fixing CocoaPods issues..."
    if [[ -d "ios" ]]; then
        cd ios
        rm -rf Pods Podfile.lock DerivedData ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true
        pod deintegrate 2>/dev/null || true
        pod setup 2>/dev/null || true
        pod install --repo-update --clean-install
        cd ..
    fi
}

fix_expo_cache() {
    log_warning "Clearing Expo cache..."
    npx expo install --fix
    rm -rf .expo ~/.expo/cache 2>/dev/null || true
    npx expo prebuild --clean
}

fix_cpp_issues() {
    log_warning "Fixing C++ compilation issues..."
    # Update app.json to fix C++ standards
    cat > app.json << 'EOF'
{
  "expo": {
    "name": "Lyo - AI Learning Assistant",
    "slug": "lyo-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.lyo.LyoAILearningAssistant",
      "deploymentTarget": "14.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.lyo.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "14.0",
            "cppLanguageStandard": "c++20",
            "cLanguageStandard": "c17"
          },
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "minSdkVersion": 23
          }
        }
      ]
    ],
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
EOF
}

# Device connection verification
verify_device_connection() {
    log_step "Verifying iOS device connection..."
    
    if ! command -v xcrun &> /dev/null; then
        log_error "Xcode command line tools not found!"
        return 1
    fi
    
    local devices=$(xcrun xctrace list devices 2>/dev/null | grep "iPhone" | grep -v "Simulator" || true)
    if [[ -z "$devices" ]]; then
        log_error "No iOS devices found! Please connect Hector's iPhone and trust this computer."
        return 1
    fi
    
    log_success "iOS devices found:"
    echo "$devices" | while read line; do
        log_info "  $line"
    done
    
    return 0
}

# Real-time error monitoring
monitor_build_errors() {
    local log_file="$1"
    local timeout_minutes=30
    local start_time=$(date +%s)
    
    while true; do
        if [[ -f "$log_file" ]]; then
            # Check for various error patterns
            if grep -q "ENOTEMPTY" "$log_file" 2>/dev/null; then
                log_error "ENOTEMPTY error detected - fixing node_modules..."
                return 1  # Signal to retry
            fi
            
            if grep -q "CocoaPods could not find compatible versions" "$log_file" 2>/dev/null; then
                log_error "CocoaPods version conflict detected - fixing..."
                return 1
            fi
            
            if grep -q "clang: error: unknown argument: '-fconcepts'" "$log_file" 2>/dev/null; then
                log_error "C++ concepts error detected - fixing..."
                return 1
            fi
            
            if grep -q "ExpoModulesCore.*not found" "$log_file" 2>/dev/null; then
                log_error "ExpoModulesCore not found - fixing cache..."
                return 1
            fi
            
            # Check for success patterns
            if grep -q "Build succeeded" "$log_file" 2>/dev/null; then
                log_success "Build completed successfully!"
                return 0
            fi
            
            if grep -q "Installing.*on device" "$log_file" 2>/dev/null; then
                log_success "App installation in progress..."
            fi
        fi
        
        # Timeout check
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        if [[ $elapsed -gt $((timeout_minutes * 60)) ]]; then
            log_error "Build timeout after $timeout_minutes minutes"
            return 1
        fi
        
        sleep 5
    done
}

# Main deployment function
deploy_to_device() {
    local attempt=1
    local max_attempts=3
    
    while [[ $attempt -le $max_attempts ]]; do
        log_step "Deployment attempt $attempt/$max_attempts"
        
        # Clean up previous logs
        rm -f "$DEVICE_LOG" "$METRO_LOG" "$ERROR_LOG"
        
        # Start device build directly (it will start Metro automatically)
        log_info "Starting iOS device build with Metro bundler..."
        
        # Use timeout to prevent hanging
        timeout 1800 npx expo run:ios --device --verbose > "$DEVICE_LOG" 2>&1 &
        local build_pid=$!
        
        # Monitor the build process in background
        (
            tail -f "$DEVICE_LOG" 2>/dev/null | while read line; do
                echo "[BUILD] $line"
                
                # Check for specific errors and fix them
                if echo "$line" | grep -q "ENOTEMPTY"; then
                    log_error "ENOTEMPTY detected - fixing..."
                    kill $build_pid 2>/dev/null || true
                    fix_node_modules
                    exit 1
                fi
                
                if echo "$line" | grep -q "CocoaPods could not find compatible versions"; then
                    log_error "CocoaPods error detected - fixing..."
                    kill $build_pid 2>/dev/null || true
                    fix_cocoapods
                    exit 1
                fi
                
                if echo "$line" | grep -q "clang: error: unknown argument: '-fconcepts'"; then
                    log_error "C++ error detected - fixing..."
                    kill $build_pid 2>/dev/null || true
                    fix_cpp_issues
                    exit 1
                fi
                
                if echo "$line" | grep -q "Successfully installed"; then
                    log_success "App successfully installed on device!"
                fi
            done
        ) &
        local monitor_pid=$!
        
        # Wait for build process
        if wait $build_pid 2>/dev/null; then
            log_success "Build process completed successfully!"
            kill $monitor_pid 2>/dev/null || true
            
            # Show final status
            echo
            echo "======================================="
            echo "🎉 DEPLOYMENT COMPLETE!"
            echo "======================================="
            echo "✅ App built successfully"
            echo "✅ Installing on Hector's iPhone"
            echo "✅ Check your iPhone for the app!"
            echo "======================================="
            
            return 0
        else
            log_error "Build process failed"
            kill $monitor_pid 2>/dev/null || true
            
            # Check what went wrong and try to fix
            if [[ -f "$DEVICE_LOG" ]]; then
                if grep -q "ENOTEMPTY" "$DEVICE_LOG"; then
                    fix_node_modules
                elif grep -q "CocoaPods" "$DEVICE_LOG"; then
                    fix_cocoapods
                elif grep -q "clang.*fconcepts" "$DEVICE_LOG"; then
                    fix_cpp_issues
                elif grep -q "ExpoModulesCore" "$DEVICE_LOG"; then
                    fix_expo_cache
                fi
            fi
        fi
        
        ((attempt++))
        if [[ $attempt -le $max_attempts ]]; then
            log_warning "Retrying in 10 seconds..."
            sleep 10
        fi
    done
    
    log_error "Deployment failed after $max_attempts attempts"
    return 1
}

# Main execution
main() {
    trap cleanup EXIT
    
    echo "======================================="
    echo "🚀 SMART iOS DEPLOYMENT STARTING"
    echo "======================================="
    echo "Target: Hector's iPhone"
    echo "App: LyoAI Learning Assistant"
    echo "Time: $(date)"
    echo "======================================="
    
    cd "$PROJECT_DIR"
    
    # Initial setup
    log_step "Phase 1: Environment Verification"
    if ! verify_device_connection; then
        log_error "Device verification failed"
        exit 1
    fi
    
    # Ensure we have latest dependencies
    log_step "Phase 2: Dependency Check"
    if [[ ! -d "node_modules" ]] || [[ ! -f "package-lock.json" ]]; then
        log_info "Installing dependencies..."
        npm install --legacy-peer-deps
    fi
    
    # Start deployment
    log_step "Phase 3: Smart Deployment with Auto-fixing"
    if deploy_to_device; then
        log_success "🎉 SUCCESS! LyoAI Learning Assistant deployed to Hector's iPhone!"
        echo
        echo "Next steps:"
        echo "1. Check your iPhone for the 'Lyo - AI Learning Assistant' app"
        echo "2. The app should launch automatically or you can tap to open it"
        echo "3. Test the avatar and other features!"
        echo
    else
        log_error "❌ DEPLOYMENT FAILED"
        echo
        echo "Check the logs for details:"
        echo "- Device build log: $DEVICE_LOG"
        echo "- Error log: $ERROR_LOG"
        exit 1
    fi
}

# Run main function
main "$@"
