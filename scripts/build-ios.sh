#!/bin/bash

# LyoAILearningAssistant - Standardized iOS Build Script
# Phase 3: Build Process Standardization

set -e  # Exit on any error

echo "🍎 Starting iOS Build Process..."
echo "================================================"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
handle_error() {
    log "❌ ERROR: $1"
    exit 1
}

# Check dependencies
log "🔍 Checking dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    log "📦 Installing npm dependencies..."
    npm install || handle_error "Failed to install npm dependencies"
fi

# Check if Pods directory exists
if [ ! -d "ios/Pods" ]; then
    log "🔧 Installing iOS pods..."
    cd ios && pod install && cd .. || handle_error "Failed to install pods"
fi

# Verify our expo-device patch is applied
log "🩹 Verifying expo-device patch..."
if ! grep -q "import TargetConditionals" node_modules/expo-device/ios/UIDevice.swift; then
    log "⚠️  Applying expo-device patch..."
    npm run postinstall || handle_error "Failed to apply patches"
fi

# Clean previous builds if requested
if [ "$1" = "--clean" ]; then
    log "🧹 Cleaning previous builds..."
    rm -rf ios/build
    rm -rf ios/DerivedData
fi

# Build configuration
CONFIGURATION=${2:-"Debug"}
TARGET=${3:-"simulator"}  # Default to simulator for easier builds
log "🏗️  Building iOS app (Configuration: $CONFIGURATION, Target: $TARGET)..."

# Run the build
if [ "$CONFIGURATION" = "Release" ]; then
    log "🚀 Building for Release..."
    if [ "$TARGET" = "device" ]; then
        npx expo run:ios --configuration Release --device || handle_error "iOS Release device build failed"
    else
        npx expo run:ios --configuration Release --simulator || handle_error "iOS Release simulator build failed"
    fi
else
    log "🔨 Building for Debug..."
    if [ "$TARGET" = "device" ]; then
        npx expo run:ios --device || handle_error "iOS Debug device build failed"
    else
        npx expo run:ios --simulator || handle_error "iOS Debug simulator build failed"
    fi
fi

log "✅ iOS build completed successfully!"
echo "================================================"
