#!/bin/bash

# Script to build and run Lyo app in Xcode
# This script creates an iOS build and opens it in Xcode

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "${BLUE}=========================================${RESET}"
echo -e "${YELLOW}Lyo App - Xcode Build Script${RESET}"
echo -e "${BLUE}=========================================${RESET}"

# Navigate to project directory
cd "$(dirname "$0")" || exit

# 1. Clean caches
echo -e "\n${YELLOW}1. Cleaning project caches...${RESET}"
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# 2. Install necessary dependencies
echo -e "\n${YELLOW}2. Installing required dependencies...${RESET}"
npm install expo-dev-client
npm install

# 3. Configure eas.json if it doesn't exist
if [ ! -f "eas.json" ]; then
  echo -e "\n${YELLOW}3. Creating eas.json configuration...${RESET}"
  cat > eas.json << EOF
{
  "cli": {
    "version": ">= 3.13.3"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
EOF
  echo -e "${GREEN}Created eas.json${RESET}"
else
  echo -e "\n${YELLOW}3. eas.json already exists. Skipping creation.${RESET}"
fi

# 4. Generate native code
echo -e "\n${YELLOW}4. Generating native iOS code...${RESET}"
npx expo prebuild -p ios

# 5. Check if iOS directory was created
if [ ! -d "ios" ]; then
  echo -e "\n${RED}iOS directory not created. Trying alternate method...${RESET}"
  npx expo run:ios --no-build
  
  if [ ! -d "ios" ]; then
    echo -e "\n${RED}Failed to create iOS project files. Please try running: npx expo run:ios${RESET}"
    exit 1
  fi
fi

# 6. Open Xcode project
echo -e "\n${YELLOW}5. Opening project in Xcode...${RESET}"
open ios/*.xcworkspace

echo -e "\n${GREEN}Done! The Lyo app project is now open in Xcode.${RESET}"
echo -e "${YELLOW}In Xcode, select a simulator or connected device, then click the Run button (▶).${RESET}"
