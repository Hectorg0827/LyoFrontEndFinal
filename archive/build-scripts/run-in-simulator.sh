#!/bin/bash

# Run Lyo app in iOS Simulator
# This script launches the iOS simulator and starts the Expo app

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}=========================================${RESET}"
echo -e "${YELLOW}Lyo App - iOS Simulator Launcher${RESET}"
echo -e "${BLUE}=========================================${RESET}"

# Navigate to project directory
cd "$(dirname "$0")" || exit

# 1. Clean caches
echo -e "\n${YELLOW}1. Cleaning project caches...${RESET}"
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# 2. Launch iOS simulator if not already running
echo -e "\n${YELLOW}2. Launching iOS Simulator...${RESET}"

# Check if simulator is already running
if ! xcrun simctl list devices | grep -q "Booted"; then
  # Get a default iPhone device
  DEVICE_ID=$(xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | head -1 | sed -E 's/.*\(([A-Z0-9-]+)\).*/\1/')
  
  if [ -z "$DEVICE_ID" ]; then
    echo -e "${YELLOW}No iPhone simulator found. Attempting to open default simulator...${RESET}"
    open -a Simulator
  else
    echo -e "${YELLOW}Booting iPhone simulator...${RESET}"
    xcrun simctl boot "$DEVICE_ID"
    open -a Simulator
  fi
  
  # Wait for simulator to fully boot
  echo -e "${YELLOW}Waiting for simulator to boot...${RESET}"
  sleep 10
else
  echo -e "${GREEN}Simulator is already running.${RESET}"
fi

# 3. Start Expo development server
echo -e "\n${YELLOW}3. Starting Expo development server...${RESET}"
echo -e "${GREEN}When the Metro bundler starts, the app should open in your simulator.${RESET}"
echo -e "${YELLOW}If not, press 'i' in the terminal to launch in the iOS simulator.${RESET}"
echo -e "${YELLOW}Press Ctrl+C to quit the server when done.${RESET}\n"

# Start Expo with clean cache and direct to iOS
npx expo start --clear --ios

echo -e "\n${GREEN}Done!${RESET}"
