#!/usr/bin/env bash
set -e

# Simple script to run the app with Expo Go
# Note: This is a simpler alternative to the development client approach,
# which will let you run the app directly in Expo Go without a development client

echo "Preparing Lyo app to run with Expo Go..."

# Ensure main is correctly set for Expo
if ! grep -q "node_modules/expo/AppEntry.js" package.json; then
  echo "Updating package.json main entry..."
  npx json -I -f package.json -e 'this.main="node_modules/expo/AppEntry.js"'
fi

# Update scripts to use standard Expo commands
echo "Updating package.json scripts..."
npx json -I -f package.json -e 'this.scripts.start="expo start"; this.scripts.ios="expo start --ios"; this.scripts.android="expo start --android"'

# Start Expo in development mode
echo "Starting Expo development server..."
npx expo start --clear
