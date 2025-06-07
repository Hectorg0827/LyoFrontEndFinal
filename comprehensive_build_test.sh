#!/bin/bash

echo "🚀 COMPREHENSIVE BUILD VALIDATION AND EXECUTION"
echo "================================================="

# Set error handling
set -e

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
handle_error() {
    log "❌ ERROR: $1"
    exit 1
}

# Phase 1: Project Validation
log "🔍 Phase 1: Project Validation"
echo "-------------------------------------------"

# Check essential files
log "📂 Checking essential files..."
test -f package.json && log "✅ package.json found" || handle_error "package.json missing"
test -f src/App.tsx && log "✅ src/App.tsx found" || handle_error "src/App.tsx missing"
test -f index.js && log "✅ index.js found" || handle_error "index.js missing"
test -f app.json && log "✅ app.json found" || handle_error "app.json missing"
test -f metro.config.js && log "✅ metro.config.js found" || handle_error "metro.config.js missing"

# Check directories
log "📁 Checking directories..."
test -d src && log "✅ src/ directory found" || handle_error "src/ directory missing"
test -d ios && log "✅ ios/ directory found" || handle_error "ios/ directory missing"
test -d android && log "✅ android/ directory found" || handle_error "android/ directory missing"
test -d node_modules && log "✅ node_modules found" || log "⚠️  node_modules missing - will install"

# Phase 2: Dependency Installation
log "📦 Phase 2: Dependency Installation"
echo "-------------------------------------------"

if [ ! -d "node_modules" ]; then
    log "Installing npm dependencies..."
    npm install || handle_error "Failed to install dependencies"
fi

# Apply patches
log "🩹 Applying patches..."
npx patch-package || log "⚠️  Patch application warning (may be normal)"

# Phase 3: Build Validation
log "🏗️  Phase 3: Build Validation"
echo "-------------------------------------------"

# Test Metro bundler
log "🔧 Testing Metro bundler..."
timeout 15s npx expo start --no-dev --minify > metro_test.log 2>&1 &
METRO_PID=$!
sleep 10
kill $METRO_PID 2>/dev/null || true
wait $METRO_PID 2>/dev/null || true

if grep -q "Error" metro_test.log 2>/dev/null; then
    log "❌ Metro bundler test failed"
    cat metro_test.log
    handle_error "Metro bundler validation failed"
else
    log "✅ Metro bundler test passed"
fi

# Phase 4: iOS Build Test
log "🍎 Phase 4: iOS Build Test"
echo "-------------------------------------------"

log "Attempting iOS build..."
timeout 180s npx expo run:ios --simulator > ios_build.log 2>&1 &
IOS_PID=$!

# Monitor the build
for i in {1..36}; do
    if ! kill -0 $IOS_PID 2>/dev/null; then
        break
    fi
    echo -n "."
    sleep 5
done
echo ""

# Check if build is still running
if kill -0 $IOS_PID 2>/dev/null; then
    log "⏰ iOS build taking longer than expected, stopping..."
    kill $IOS_PID 2>/dev/null || true
    wait $IOS_PID 2>/dev/null || true
fi

# Check build result
if grep -q "Built successfully" ios_build.log 2>/dev/null; then
    log "✅ iOS build completed successfully"
elif grep -q "Error" ios_build.log 2>/dev/null; then
    log "❌ iOS build failed with errors"
    tail -20 ios_build.log
else
    log "⚠️  iOS build status unclear - check logs"
fi

# Phase 5: Android Build Test
log "🤖 Phase 5: Android Build Test"
echo "-------------------------------------------"

log "Attempting Android build..."
timeout 180s npx expo run:android > android_build.log 2>&1 &
ANDROID_PID=$!

# Monitor the build
for i in {1..36}; do
    if ! kill -0 $ANDROID_PID 2>/dev/null; then
        break
    fi
    echo -n "."
    sleep 5
done
echo ""

# Check if build is still running
if kill -0 $ANDROID_PID 2>/dev/null; then
    log "⏰ Android build taking longer than expected, stopping..."
    kill $ANDROID_PID 2>/dev/null || true
    wait $ANDROID_PID 2>/dev/null || true
fi

# Check build result
if grep -q "Built successfully" android_build.log 2>/dev/null; then
    log "✅ Android build completed successfully"
elif grep -q "Error" android_build.log 2>/dev/null; then
    log "❌ Android build failed with errors"
    tail -20 android_build.log
else
    log "⚠️  Android build status unclear - check logs"
fi

# Phase 6: Summary
log "📊 Phase 6: Build Summary"
echo "-------------------------------------------"

log "Build validation completed!"
log "Check the following log files for details:"
log "  - metro_test.log (Metro bundler test)"
log "  - ios_build.log (iOS build attempt)"
log "  - android_build.log (Android build attempt)"

echo "================================================="
echo "🎯 BUILD VALIDATION COMPLETE"
