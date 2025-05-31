#!/bin/zsh

# Direct React Native init script for Lyo app
# This approach creates a new React Native project and copies just the iOS directory

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

# Project directories
LYO_PROJECT_DIR="$HOME/Desktop/LyoFrontEndFinal"
TEMP_DIR="$HOME/Desktop/LyoTemp"

# Display header
echo "${BLUE}====================================================${RESET}"
echo "${BOLD}${YELLOW}Lyo App - Direct iOS Setup${RESET}"
echo "${BLUE}====================================================${RESET}"

# Clean up any existing temporary directory
if [ -d "$TEMP_DIR" ]; then
  echo "\n${YELLOW}Removing existing temporary project...${RESET}"
  rm -rf "$TEMP_DIR"
fi

# Create a temporary React Native project
echo "\n${YELLOW}1. Creating temporary React Native project...${RESET}"
cd "$HOME/Desktop" || exit 1

# Install React Native CLI if needed
if ! command -v react-native &> /dev/null; then
  echo "${YELLOW}Installing React Native CLI...${RESET}"
  npm install -g react-native-cli
fi

# Create the project with the same React Native version
npx react-native init LyoTemp --version 0.71.8

# Check if the project was created correctly
if [ ! -d "$TEMP_DIR" ]; then
  echo "${RED}Failed to create temporary React Native project.${RESET}"
  exit 1
fi

# Check if iOS directory was created
if [ ! -d "$TEMP_DIR/ios" ]; then
  echo "${RED}iOS directory not created in temporary project.${RESET}"
  exit 1
fi

# Copy iOS directory to Lyo project
echo "\n${YELLOW}2. Copying iOS directory to Lyo project...${RESET}"
if [ -d "$LYO_PROJECT_DIR/ios" ]; then
  echo "${YELLOW}Backing up existing iOS directory...${RESET}"
  mkdir -p "$LYO_PROJECT_DIR/ios-backup"
  cp -R "$LYO_PROJECT_DIR/ios/"* "$LYO_PROJECT_DIR/ios-backup/" 2>/dev/null || true
  rm -rf "$LYO_PROJECT_DIR/ios"
fi

cp -R "$TEMP_DIR/ios" "$LYO_PROJECT_DIR/" || {
  echo "${RED}Failed to copy iOS directory.${RESET}"
  exit 1
}

# Update iOS project name and bundle ID
echo "\n${YELLOW}3. Updating iOS project configuration...${RESET}"

# Update project.pbxproj
find "$LYO_PROJECT_DIR/ios" -name "project.pbxproj" -exec sed -i '' "s/LyoTemp/LyoApp/g" {} \;
find "$LYO_PROJECT_DIR/ios" -name "project.pbxproj" -exec sed -i '' "s/org.reactjs.native.example.LyoTemp/com.lyo.app/g" {} \;

# Update Info.plist
find "$LYO_PROJECT_DIR/ios" -name "Info.plist" -exec sed -i '' "s/LyoTemp/Lyo - AI Learning Assistant/g" {} \;

# Install CocoaPods if needed
echo "\n${YELLOW}4. Setting up CocoaPods...${RESET}"
if ! command -v pod &> /dev/null; then
  echo "${YELLOW}Installing CocoaPods...${RESET}"
  sudo gem install cocoapods
fi

# Install pods
cd "$LYO_PROJECT_DIR/ios" || {
  echo "${RED}Failed to navigate to iOS directory.${RESET}"
  exit 1
}

pod install || {
  echo "${RED}Pod installation failed. Trying pod repo update...${RESET}"
  pod repo update
  pod install || {
    echo "${RED}Still failed to install pods.${RESET}"
    exit 1
  }
}

# Clean up temporary project
echo "\n${YELLOW}5. Cleaning up and opening in Xcode...${RESET}"
rm -rf "$TEMP_DIR"

# Open in Xcode
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
echo "  4. If the app doesn't connect to your React Native code, run 'npm start' in a separate terminal"

echo "\n${BLUE}====================================================${RESET}"
