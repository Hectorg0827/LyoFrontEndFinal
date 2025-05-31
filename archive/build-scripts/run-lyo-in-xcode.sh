#!/bin/zsh

# All-in-one script to set up Lyo app for iOS development
# This script will:
# 1. Create native iOS files
# 2. Configure the iOS project for Lyo
# 3. Install and update CocoaPods
# 4. Link React Native with iOS
# 5. Open the project in Xcode

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

# Project directories
LYO_PROJECT_DIR="$HOME/Desktop/LyoFrontEndFinal"
TEMP_PROJECT_DIR="$HOME/Desktop/LyoTemp"

# Display header
echo "${BLUE}====================================================${RESET}"
echo "${BOLD}${YELLOW}Lyo App - All-in-One iOS Setup${RESET}"
echo "${BLUE}====================================================${RESET}"

# Check for Xcode
if ! xcode-select -p &>/dev/null; then
    echo "${RED}Xcode not found. Please install Xcode from the App Store.${RESET}"
    exit 1
fi

# Navigate to Desktop
cd "$HOME/Desktop" || { echo "${RED}Failed to navigate to Desktop directory${RESET}"; exit 1; }

# Clean up any existing temporary project
if [ -d "$TEMP_PROJECT_DIR" ]; then
    echo "\n${YELLOW}Removing existing temporary project...${RESET}"
    rm -rf "$TEMP_PROJECT_DIR"
fi

# STEP 1: Create temporary React Native project
echo "\n${YELLOW}1. Creating temporary React Native project...${RESET}"
npx react-native init LyoTemp --version 0.71.8 || { 
    echo "${RED}Failed to create temporary React Native project.${RESET}"
    echo "${YELLOW}Trying alternative approach...${RESET}"
    
    npx create-react-native-app LyoTemp || {
        echo "${RED}Failed to create temporary project.${RESET}"
        exit 1
    }
}

# Verify the temporary project was created correctly
if [ ! -d "$TEMP_PROJECT_DIR/ios" ]; then
    echo "${RED}iOS directory was not created in temporary project.${RESET}"
    exit 1
fi

# STEP 2: Copy and configure iOS files
echo "\n${YELLOW}2. Copying and configuring iOS files...${RESET}"
# Backup any existing iOS directory
if [ -d "$LYO_PROJECT_DIR/ios" ]; then
    mkdir -p "$LYO_PROJECT_DIR/ios-backup"
    cp -R "$LYO_PROJECT_DIR/ios/"* "$LYO_PROJECT_DIR/ios-backup/"
    rm -rf "$LYO_PROJECT_DIR/ios"
fi

# Copy the iOS directory
cp -R "$TEMP_PROJECT_DIR/ios" "$LYO_PROJECT_DIR/" || {
    echo "${RED}Failed to copy iOS directory to Lyo project.${RESET}"
    exit 1
}

# Update project files with Lyo app name and bundle ID
echo "${YELLOW}Updating project configuration...${RESET}"
find "$LYO_PROJECT_DIR/ios" -type f -name "*.pbxproj" -exec sed -i '' 's/LyoTemp/LyoApp/g' {} \;
find "$LYO_PROJECT_DIR/ios" -type f -name "*.pbxproj" -exec sed -i '' 's/org.reactjs.native.example.LyoTemp/com.lyo.app/g' {} \;
find "$LYO_PROJECT_DIR/ios" -type f -name "Info.plist" -exec sed -i '' 's/LyoTemp/Lyo - AI Learning Assistant/g' {} \;

# STEP 3: Install and update CocoaPods
echo "\n${YELLOW}3. Setting up CocoaPods...${RESET}"
# Install CocoaPods if not installed
if ! command -v pod &> /dev/null; then
    echo "${YELLOW}Installing CocoaPods...${RESET}"
    sudo gem install cocoapods || {
        echo "${RED}Failed to install CocoaPods.${RESET}"
        echo "${YELLOW}Please try: sudo gem install cocoapods -n /usr/local/bin${RESET}"
        exit 1
    }
fi

# Create or update index.js entry point for React Native CLI
if [ ! -f "$LYO_PROJECT_DIR/index.js" ]; then
    echo "\n${YELLOW}Creating index.js entry point...${RESET}"
    cat > "$LYO_PROJECT_DIR/index.js" << EOF
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
EOF
fi

# Create or update metro.config.js for better module resolution
echo "${YELLOW}Setting up Metro bundler configuration...${RESET}"
cat > "$LYO_PROJECT_DIR/metro.config.js" << EOF
// Learn more https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [projectRoot];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the root node_modules
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
EOF

# Install needed dependencies
echo "${YELLOW}Installing additional dependencies...${RESET}"
cd "$LYO_PROJECT_DIR" || { echo "${RED}Failed to navigate to Lyo project directory${RESET}"; exit 1; }
npm install --save react-native-unimodules @react-native-community/cli-platform-ios

# Install pods
echo "${YELLOW}Installing CocoaPods dependencies...${RESET}"
cd "$LYO_PROJECT_DIR/ios" || { echo "${RED}Failed to navigate to iOS directory${RESET}"; exit 1; }
pod install || {
    echo "${RED}Pod install failed. Trying pod repo update first...${RESET}"
    pod repo update && pod install || {
        echo "${RED}Still failed to install CocoaPods dependencies.${RESET}"
        exit 1
    }
}

# STEP 4: Clean up and open in Xcode
echo "\n${YELLOW}4. Cleaning up temporary files and opening in Xcode...${RESET}"
# Clean up temporary project
rm -rf "$TEMP_PROJECT_DIR"

# Open Xcode workspace
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
echo "  4. If you encounter build errors, try cleaning the build folder (Cmd+Shift+K) and rebuilding"

echo "\n${YELLOW}Troubleshooting:${RESET}"
echo "  • If Metro bundler doesn't start automatically, run 'npm start' in the project directory"
echo "  • For linking issues, check the 'Build Phases' > 'Link Binary With Libraries' section"
echo "  • For module not found errors, try 'pod install' again in the ios directory"

echo "\n${BLUE}====================================================${RESET}"
