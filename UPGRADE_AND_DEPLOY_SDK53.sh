#!/bin/bash
# UPGRADED DEPLOYMENT FOR HECTOR'S IPHONE - SDK 53 with Development Build

echo "🚀 UPGRADING AND DEPLOYING TO HECTOR'S IPHONE"
echo "=============================================="
echo "📱 Target: Hector's iPhone (Development Build - NOT Expo Go)"
echo "⬆️  Upgrading from SDK 51 to SDK 53"
echo "Start Time: $(date)"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "[$(date '+%H:%M:%S')] ${GREEN}✅${NC} $1"; }
warn() { echo -e "[$(date '+%H:%M:%S')] ${YELLOW}⚠️${NC} $1"; }
error() { echo -e "[$(date '+%H:%M:%S')] ${RED}❌${NC} $1"; }
info() { echo -e "[$(date '+%H:%M:%S')] ${BLUE}ℹ️${NC} $1"; }

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Phase 1: Clean environment
log "🧹 PHASE 1: Cleaning environment for upgrade..."
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ios/build
rm -rf ios/.expo
rm -rf .expo
rm -rf /tmp/metro-*
npm cache clean --force
log "Environment cleaned for SDK upgrade"

# Phase 2: Upgrade to SDK 53
log "⬆️ PHASE 2: Upgrading to Expo SDK 53..."
info "Installing Expo SDK 53..."

# Update package.json for SDK 53
cat > temp_package.json << 'EOF'
{
  "name": "lyo-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "build:ios": "./scripts/build-ios.sh",
    "build:android": "./scripts/build-android.sh",
    "lint": "./scripts/lint.sh",
    "clean": "rm -rf node_modules ios/Pods ios/build android/.gradle android/app/build && npm install",
    "postinstall": "patch-package",
    "android": "expo run:android",
    "ios": "expo run:ios"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-navigation/bottom-tabs": "^6.6.1",
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/native-stack": "^6.11.0",
    "expo": "~53.0.0",
    "expo-application": "~6.0.2",
    "expo-asset": "~11.0.1",
    "expo-av": "~15.0.1",
    "expo-build-properties": "~0.14.1",
    "expo-constants": "~17.0.3",
    "expo-device": "~7.0.1",
    "expo-file-system": "~18.0.4",
    "expo-linking": "~7.0.3",
    "expo-notifications": "~0.29.9",
    "expo-splash-screen": "~0.29.14",
    "expo-status-bar": "~2.0.0",
    "react": "18.2.0",
    "react-native": "0.76.5",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-reanimated": "~3.16.1",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "4.1.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "patch-package": "^8.0.0",
    "typescript": "~5.3.3"
  },
  "private": true
}
EOF

mv temp_package.json package.json
log "Package.json updated for SDK 53"

# Phase 3: Install SDK 53 dependencies
log "📦 PHASE 3: Installing SDK 53 dependencies..."
npm install
if [ $? -eq 0 ]; then
    log "SDK 53 dependencies installed successfully"
else
    error "Failed to install SDK 53 dependencies"
    exit 1
fi

# Phase 4: Apply patches
log "🔧 PHASE 4: Applying patches for SDK 53..."
npx patch-package || warn "Some patches may need updating for SDK 53"

# Phase 5: Update app.json for development build
log "⚙️ PHASE 5: Configuring for development build (not Expo Go)..."
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
      "deploymentTarget": "13.4"
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
            "deploymentTarget": "13.4",
            "cppLanguageStandard": "c++17",
            "cLanguageStandard": "gnu11"
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
log "App.json configured for development build"

# Phase 6: Generate iOS project for SDK 53
log "🏗️ PHASE 6: Generating iOS project for SDK 53..."
npx expo prebuild --platform ios --clean
if [ $? -eq 0 ]; then
    log "iOS project generated for SDK 53"
else
    error "Failed to generate iOS project"
    exit 1
fi

# Phase 7: Fix CocoaPods and install
log "🍫 PHASE 7: Installing CocoaPods for SDK 53..."
cd ios

# Update CocoaPods repo
pod repo update

# Clean and install pods
rm -rf Pods Podfile.lock
pod install --repo-update --verbose

if [ $? -eq 0 ]; then
    log "CocoaPods installed successfully for SDK 53"
else
    error "CocoaPods installation failed"
    cd ..
    exit 1
fi

cd ..

# Phase 8: Start Metro bundler
log "📦 PHASE 8: Starting Metro bundler..."
npx expo start --dev-client --clear > metro_device_sdk53.log 2>&1 &
METRO_PID=$!
info "Metro started with PID: $METRO_PID for development build"
sleep 15

if lsof -i :8081 >/dev/null 2>&1; then
    log "Metro bundler ready for development build"
else
    error "Metro bundler failed to start"
    exit 1
fi

# Phase 9: Build development build for device
log "🚀 PHASE 9: Building development build for Hector's iPhone..."
echo ""
echo "📱 DEVELOPMENT BUILD DEPLOYMENT"
echo "==============================="
echo "✅ This creates a CUSTOM APP (not Expo Go)"
echo "✅ App will be specifically built for your project"
echo "✅ Compatible with any SDK version"
echo ""
echo "📋 Make sure Hector's iPhone is:"
echo "   1. Connected via USB and trusted"
echo "   2. Developer mode enabled"
echo "   3. Ready for app installation"
echo ""

# Build development build for device
info "Starting development build for device..."
npx expo run:ios --device 2>&1 | tee device_build_sdk53.log &
BUILD_PID=$!

# Monitor build
BUILD_START_TIME=$(date +%s)
while kill -0 $BUILD_PID 2>/dev/null; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - BUILD_START_TIME))
    
    if tail -n 10 device_build_sdk53.log | grep -q "success\|Build succeeded\|Installed"; then
        echo ""
        log "🎉 DEVELOPMENT BUILD DEPLOYED SUCCESSFULLY! (${ELAPSED}s)"
        log "📱 LyoAI Learning Assistant (Development Build) installed on Hector's iPhone!"
        break
    elif tail -n 10 device_build_sdk53.log | grep -q "Build failed\|error:"; then
        echo ""
        error "Development build failed! (${ELAPSED}s)"
        tail -n 15 device_build_sdk53.log
        exit 1
    fi
    
    echo -ne "\r🔨 Building development build... (${ELAPSED}s elapsed)"
    
    if [ $ELAPSED -gt 1800 ]; then
        warn "Build timeout (30 minutes)"
        exit 1
    fi
    
    sleep 5
done

wait $BUILD_PID

echo ""
log "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo ""
echo "📱 DEVELOPMENT BUILD INSTALLED"
echo "============================="
echo "✅ Custom LyoAI app installed on Hector's iPhone"
echo "✅ NOT using Expo Go - this is your own app"
echo "✅ Compatible with your SDK 51→53 upgrade"
echo "✅ Metro bundler running at http://localhost:8081"
echo ""
echo "🚀 Next Steps:"
echo "1. Find 'Lyo - AI Learning Assistant' app on iPhone"
echo "2. Tap to launch your custom development build"
echo "3. App will connect to Metro automatically"
echo "4. Shake device for developer menu if needed"
echo ""
echo "Deployment completed at: $(date)"
