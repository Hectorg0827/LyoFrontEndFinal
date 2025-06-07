#!/bin/bash

# C++20 Fix and Clean Build Script
echo "🔧 Fixing C++20 Configuration and Rebuilding iOS"
echo "================================================="

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Navigate to project root
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

log "🧹 Cleaning previous build artifacts..."
rm -rf ios/build
rm -rf ios/DerivedData
rm -rf ios/Pods
rm -rf ios/Podfile.lock

success "Build artifacts cleaned"

log "🔄 Reinstalling pods with C++20 configuration..."
cd ios
pod install --repo-update
cd ..

success "Pods reinstalled with C++20 support"

log "🚀 Starting clean iOS build with C++20..."
npx expo run:ios --clear

success "iOS build completed with C++20 support!"
