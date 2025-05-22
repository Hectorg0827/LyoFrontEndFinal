#!/bin/zsh
# Script to launch the Lyo app in Expo Go

echo "===== Starting Lyo App Launch ====="

echo "\n1. Cleaning caches..."
rm -rf node_modules/.cache

echo "\n2. Launching iOS simulator..."
open -a Simulator

echo "\n3. Starting Expo Go..."
echo "\nIMPORTANT: Once the Metro bundler starts, press 'i' to launch on iOS"
echo "Press Ctrl+C to quit the server when done\n"

# Start Expo with a clean cache
npx expo start --clear

echo "\n===== Script Complete ====="
