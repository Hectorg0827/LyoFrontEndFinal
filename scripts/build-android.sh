#!/bin/bash

# LyoAILearningAssistant - Standardized Android Build Script
# Phase 3: Build Process Standardization

set -e  # Exit on any error

echo "🤖 Starting Android Build Process..."
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

# Verify our expo-device patch is applied
log "🩹 Verifying expo-device patch..."
if ! grep -q "import TargetConditionals" node_modules/expo-device/ios/UIDevice.swift; then
    log "⚠️  Applying expo-device patch..."
    npm run postinstall || handle_error "Failed to apply patches"
fi

# Clean previous builds if requested
if [ "$1" = "--clean" ]; then
    log "🧹 Cleaning previous builds..."
    rm -rf android/.gradle
    rm -rf android/app/build
fi

# Build configuration
VARIANT=${2:-"debug"}
log "🏗️  Building Android app (Variant: $VARIANT)..."

# Run the build
if [ "$VARIANT" = "release" ]; then
    log "🚀 Building for Release..."
    npx expo run:android --variant release || handle_error "Android Release build failed"
else
    log "🔨 Building for Debug..."
    npx expo run:android || handle_error "Android Debug build failed"
fi

log "✅ Android build completed successfully!"
echo "================================================"
