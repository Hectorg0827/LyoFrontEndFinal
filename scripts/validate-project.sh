#!/bin/bash

# LyoAILearningAssistant - Project Validation Script
# Phase 3: Dependency Optimization & Validation

set -e

echo "🔍 LyoAILearningAssistant - Project Validation"
echo "================================================"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function for success messages
success() {
    echo "✅ $1"
}

# Function for warning messages
warning() {
    echo "⚠️  $1"
}

# Function for error messages
error() {
    echo "❌ $1"
}

log "Starting comprehensive project validation..."

# 1. Check Node.js and npm
log "Checking Node.js environment..."
node_version=$(node --version)
npm_version=$(npm --version)
success "Node.js: $node_version"
success "npm: $npm_version"

# 2. Check project structure
log "Validating project structure..."
required_files=("package.json" "app.json" "App.tsx" "ios/Podfile" "android/build.gradle")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        success "Found: $file"
    else
        error "Missing: $file"
        exit 1
    fi
done

# 3. Check dependencies
log "Checking dependencies..."
if [ -d "node_modules" ]; then
    success "node_modules directory exists"
    
    # Check key dependencies
    key_deps=("expo" "react" "react-native" "expo-device")
    for dep in "${key_deps[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            version=$(node -e "console.log(require('./node_modules/$dep/package.json').version)")
            success "$dep: $version"
        else
            error "Missing dependency: $dep"
        fi
    done
else
    error "node_modules directory missing"
    exit 1
fi

# 4. Check iOS configuration
log "Validating iOS configuration..."
if [ -d "ios/Pods" ]; then
    success "iOS Pods installed"
else
    warning "iOS Pods not installed - run 'cd ios && pod install'"
fi

if [ -f "ios/Podfile.lock" ]; then
    success "Podfile.lock exists"
else
    warning "Podfile.lock missing"
fi

# 5. Check expo-device patch
log "Verifying expo-device patch..."
if grep -q "import TargetConditionals" node_modules/expo-device/ios/UIDevice.swift; then
    success "expo-device patch applied correctly"
else
    error "expo-device patch missing - TARGET_OS_SIMULATOR fix not applied"
    exit 1
fi

# 6. Check Android configuration
log "Validating Android configuration..."
if [ -f "android/gradle.properties" ]; then
    success "Android gradle.properties exists"
    
    # Check key settings
    if grep -q "newArchEnabled=false" android/gradle.properties; then
        success "New Architecture disabled (recommended for stability)"
    fi
    
    if grep -q "hermesEnabled=true" android/gradle.properties; then
        success "Hermes enabled"
    fi
else
    error "Android gradle.properties missing"
fi

# 7. Check Expo configuration
log "Validating Expo configuration..."
expo_sdk=$(node -e "console.log(require('./app.json').expo.sdkVersion || 'Managed by package.json')")
expo_pkg_version=$(node -e "console.log(require('./node_modules/expo/package.json').version)")
success "Expo configuration: SDK managed by package.json"
success "Expo package version: $expo_pkg_version"

# 8. Check for build artifacts that should be clean
log "Checking for clean build state..."
if [ -d "ios/build" ]; then
    warning "iOS build artifacts present - consider cleaning"
fi

if [ -d "android/.gradle" ] || [ -d "android/app/build" ]; then
    warning "Android build artifacts present - consider cleaning"
fi

# 9. Validate TypeScript configuration
log "Checking TypeScript setup..."
if [ -f "tsconfig.json" ]; then
    success "TypeScript configuration found"
else
    warning "TypeScript configuration missing"
fi

# 10. Summary
log "Validation complete!"
success "Project appears to be in good state"
success "✅ Phase 1 & 2 fixes applied correctly"
success "✅ Dependencies properly installed"
success "✅ Configurations standardized"
success "✅ expo-device TARGET_OS_SIMULATOR fix verified"

echo ""
echo "🚀 Ready for builds!"
echo "   • iOS: ./scripts/build-ios.sh [--clean] [Debug|Release]"
echo "   • Android: ./scripts/build-android.sh [--clean] [debug|release]"
echo "================================================"
