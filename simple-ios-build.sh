#!/bin/zsh

# Simple script to build Lyo app for iOS using Expo prebuild
# This script will:
# 1. Clean caches and install dependencies
# 2. Generate iOS native code with Expo
# 3. Install CocoaPods and open in Xcode

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

# Project directory
LYO_PROJECT_DIR="$HOME/Desktop/LyoFrontEndFinal"

# Display header
echo "${BLUE}====================================================${RESET}"
echo "${BOLD}${YELLOW}Lyo App - Simple iOS Build${RESET}"
echo "${BLUE}====================================================${RESET}"

# Navigate to project directory
cd "$LYO_PROJECT_DIR" || { echo "${RED}Failed to navigate to Lyo project directory${RESET}"; exit 1; }

# Clean caches
echo "\n${YELLOW}1. Cleaning caches and installing dependencies...${RESET}"
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Install required packages
echo "${YELLOW}Installing required packages...${RESET}"
npm install -g expo-cli @react-native-community/cli
npm install expo-dev-client
npm install

# Update necessary files
echo "\n${YELLOW}2. Configuring project for native build...${RESET}"

# Create index.js if it doesn't exist
if [ ! -f "index.js" ]; then
  echo "${YELLOW}Creating index.js entry point...${RESET}"
  cat > index.js << EOF
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
EOF
fi

# Generate native code with Expo
echo "\n${YELLOW}3. Generating iOS native code with Expo...${RESET}"
npx expo prebuild -p ios --clean || {
  echo "${RED}Prebuild failed. Trying alternative method...${RESET}"
  npx expo eject || {
    echo "${RED}Eject failed too. Cannot generate iOS directory.${RESET}"
    exit 1
  }
}

# Check if iOS directory was created
if [ ! -d "ios" ]; then
  echo "${RED}iOS directory was not created. Cannot continue.${RESET}"
  exit 1
fi

# Install CocoaPods
echo "\n${YELLOW}4. Installing CocoaPods dependencies...${RESET}"
cd ios || { echo "${RED}Failed to navigate to iOS directory${RESET}"; exit 1; }

# Install CocoaPods if not already installed
if ! command -v pod &> /dev/null; then
  echo "${YELLOW}Installing CocoaPods...${RESET}"
  sudo gem install cocoapods || {
    echo "${RED}Failed to install CocoaPods.${RESET}"
    exit 1
  }
fi

# Run pod install
pod install || {
  echo "${RED}Pod install failed. Trying pod repo update first...${RESET}"
  pod repo update && pod install || {
    echo "${RED}Still failed to install CocoaPods dependencies.${RESET}"
    exit 1
  }
}

# Open the project in Xcode
echo "\n${YELLOW}5. Opening project in Xcode...${RESET}"
WORKSPACE_FILE=$(find . -name "*.xcworkspace" | head -n 1)
if [ -z "$WORKSPACE_FILE" ]; then
  echo "${RED}Could not find .xcworkspace file.${RESET}"
  exit 1
fi

open "$WORKSPACE_FILE" || {
  echo "${RED}Failed to open Xcode workspace.${RESET}"
  echo "${YELLOW}Please open it manually: $LYO_PROJECT_DIR/ios/$WORKSPACE_FILE${RESET}"
}

echo "\n${GREEN}Setup complete! The Lyo app is now open in Xcode.${RESET}"
echo "\n${YELLOW}Build Instructions:${RESET}"
echo "  1. In Xcode, select a simulator from the scheme dropdown (e.g., iPhone 14)"
echo "  2. Click the Run button (▶️) or press Cmd+R to build and run"
echo "  3. If you see signing issues, go to Signing & Capabilities and select your development team"

echo "\n${BLUE}====================================================${RESET}"
