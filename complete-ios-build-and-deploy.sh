#!/bin/bash

# LyoAILearningAssistant - Complete iOS Build Script
# This script will build and deploy the iOS app to device/simulator

set -e  # Exit on any error

echo "🍎 Starting Complete iOS Build & Deploy Process..."
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

# Cleanup function
cleanup() {
    log "🧹 Cleaning up any hanging processes..."
    pkill -f "expo" || true
    pkill -f "metro" || true
}

# Set cleanup trap
trap cleanup EXIT

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

log "🔍 Verifying project setup..."

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

# Clean build if first argument is --clean
if [ "$1" = "--clean" ]; then
    log "🧹 Cleaning previous builds..."
    rm -rf ios/build
    rm -rf ios/DerivedData
    cd ios && pod install --repo-update && cd ..
fi

# Check for connected devices
log "📱 Checking for connected iOS devices..."
connected_devices=$(xcrun devicectl list devices | grep -E "iPhone|iPad" | grep "Connected" || true)

if [ -n "$connected_devices" ]; then
    log "✅ Found connected iOS devices:"
    echo "$connected_devices"
    BUILD_TARGET="--device"
else
    log "📲 No physical devices found, using simulator..."
    BUILD_TARGET=""
fi

# Start the build
log "🚀 Starting iOS build..."
log "Using expo run:ios $BUILD_TARGET"

# Run with timeout to prevent hanging
timeout 600 npx expo run:ios $BUILD_TARGET || handle_error "iOS build failed or timed out"

log "✅ iOS build completed successfully!"
log "🎉 App should be launching on your device/simulator!"
echo "================================================"
