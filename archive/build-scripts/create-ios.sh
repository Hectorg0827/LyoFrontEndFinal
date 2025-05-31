#!/bin/bash

# Script to manually create iOS files and open in Xcode
# This script will create a bare React Native project and move necessary files

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "${BLUE}=========================================${RESET}"
echo -e "${YELLOW}Lyo App - Manual Xcode Setup${RESET}"
echo -e "${BLUE}=========================================${RESET}"

# Navigate to project directory
cd "$(dirname "$0")" || exit

# Create a temporary directory for the new project
echo -e "\n${YELLOW}1. Creating a bare React Native project...${RESET}"
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Init a new React Native project with Expo
npx react-native init LyoTemp --version 0.71.8

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to create React Native project. Trying alternative method...${RESET}"
  rm -rf "$TEMP_DIR"
  
  # Try alternative with Expo
  cd "$(dirname "$0")" || exit
  npx create-expo-app LyoTemp --template bare-minimum
  cd LyoTemp
fi

# Check if iOS directory was created
if [ -d "ios" ]; then
  echo -e "${GREEN}iOS project files created!${RESET}"
  
  # Copy the iOS directory to the original project
  echo -e "\n${YELLOW}2. Moving iOS files to the Lyo project...${RESET}"
  PROJECT_DIR="$(dirname "$0")"
  cp -R ios "$PROJECT_DIR"/
  
  # Go back to original project
  cd "$PROJECT_DIR" || exit
  
  # Install cocoapods if needed
  echo -e "\n${YELLOW}3. Installing CocoaPods dependencies...${RESET}"
  cd ios
  pod install
  cd ..
  
  # Open the Xcode workspace
  echo -e "\n${YELLOW}4. Opening project in Xcode...${RESET}"
  open ios/*.xcworkspace
  
  echo -e "\n${GREEN}Done! The Lyo app iOS project is now open in Xcode.${RESET}"
  echo -e "${YELLOW}In Xcode, select a simulator or connected device, then click the Run button (▶).${RESET}"
else
  echo -e "${RED}Failed to create iOS project files.${RESET}"
fi
