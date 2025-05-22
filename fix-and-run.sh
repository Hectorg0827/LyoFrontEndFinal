#!/bin/bash

# Fix Lyo app issues and run on iOS
# Usage: ./fix-and-run.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}=========================================${RESET}"
echo -e "${YELLOW}Lyo App - Fix and Run Script${RESET}"
echo -e "${BLUE}=========================================${RESET}"

# Navigate to project directory
cd "$(dirname "$0")" || exit

echo -e "\n${YELLOW}1. Cleaning project caches...${RESET}"
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

echo -e "\n${YELLOW}2. Fixing package.json dependency conflicts...${RESET}"
# Remove react-native-dotenv from dependencies if it exists in devDependencies
sed -i '' '/"react-native-dotenv"/d' package.json

echo -e "\n${YELLOW}3. Installing required dependencies...${RESET}"
npm install --save-dev jest-expo @testing-library/jest-native @testing-library/react-native
npm install --save @react-native-community/datetimepicker react-native-markdown-display

echo -e "\n${YELLOW}4. Opening iOS Simulator...${RESET}"
open -a Simulator

echo -e "\n${YELLOW}5. Starting Expo development server...${RESET}"
echo -e "${GREEN}The app should open in your simulator shortly.${RESET}"
echo -e "${YELLOW}If it doesn't, press 'i' in the terminal when the Metro bundler starts.${RESET}"

# Wait for simulator to fully boot
sleep 5

# Start Expo with a clean cache
npx expo start --clear --ios

echo -e "\n${GREEN}Done!${RESET}"
