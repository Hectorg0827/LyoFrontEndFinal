#!/bin/bash

# Script to start the development server and configure proper connection
echo "🚀 Starting Development Server with Proper Configuration"
echo "===================================================="

# Navigate to project directory
cd /Users/republicalatuya/Desktop/LyoFrontEndFinal

# Kill any existing Metro process
echo "🧹 Cleaning up any existing Metro processes..."
lsof -ti:8081 | xargs kill -9 2>/dev/null

# Clear React Native cache
echo "🧹 Clearing React Native cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*
rm -rf node_modules/.cache
watchman watch-del-all 2>/dev/null

# Start the Metro bundler with explicit host configuration
echo "🚀 Starting Metro bundler with explicit host configuration..."
export REACT_NATIVE_PACKAGER_HOSTNAME=localhost
npx expo start --clear --port 8081
