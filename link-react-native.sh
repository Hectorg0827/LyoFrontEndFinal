#!/bin/zsh

# This script links the Lyo app's React Native code with the iOS native files
# Run this after setup-ios-xcode.sh if you have issues with the native code not connecting to your JS code

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

# Main Lyo project directory
LYO_PROJECT_DIR="$HOME/Desktop/LyoFrontEndFinal"

# Display header
echo "${BLUE}====================================================${RESET}"
echo "${BOLD}${YELLOW}Lyo App - Link React Native with iOS Native Code${RESET}"
echo "${BLUE}====================================================${RESET}"

# Navigate to Lyo project directory
cd "$LYO_PROJECT_DIR" || { echo "${RED}Failed to navigate to Lyo project directory${RESET}"; exit 1; }

# Check if the iOS directory exists
if [ ! -d "$LYO_PROJECT_DIR/ios" ]; then
    echo "${RED}iOS directory doesn't exist. Please run setup-ios-xcode.sh first.${RESET}"
    exit 1
fi

# Update app name in AppDelegate.m
APPDELEGATE_FILE=$(find "$LYO_PROJECT_DIR/ios" -name "AppDelegate.m" | head -n 1)
if [ -f "$APPDELEGATE_FILE" ]; then
    echo "\n${YELLOW}1. Updating AppDelegate.m...${RESET}"
    sed -i '' 's/LyoTemp/LyoApp/g' "$APPDELEGATE_FILE"
fi

# Create or update metro.config.js for better module resolution
echo "\n${YELLOW}2. Setting up Metro bundler configuration...${RESET}"
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

# Create or update index.js entry point for React Native CLI
if [ ! -f "$LYO_PROJECT_DIR/index.js" ]; then
    echo "\n${YELLOW}3. Creating index.js entry point for React Native...${RESET}"
    cat > "$LYO_PROJECT_DIR/index.js" << EOF
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
EOF
fi

# Install needed dependencies
echo "\n${YELLOW}4. Installing additional dependencies for native development...${RESET}"
npm install --save react-native-unimodules @react-native-community/cli-platform-ios

# Update pods
echo "\n${YELLOW}5. Updating CocoaPods dependencies...${RESET}"
cd "$LYO_PROJECT_DIR/ios" || { echo "${RED}Failed to navigate to iOS directory${RESET}"; exit 1; }
pod update || {
    echo "${RED}Failed to update CocoaPods dependencies.${RESET}"
    exit 1
}

# Open Xcode workspace
echo "\n${YELLOW}6. Opening project in Xcode...${RESET}"
WORKSPACE_FILE=$(find . -name "*.xcworkspace" | head -n 1)
if [ -z "$WORKSPACE_FILE" ]; then
    echo "${RED}Could not find .xcworkspace file.${RESET}"
    exit 1
fi

open "$WORKSPACE_FILE" || {
    echo "${RED}Failed to open Xcode workspace.${RESET}"
    echo "${YELLOW}Please open it manually: $LYO_PROJECT_DIR/ios/$WORKSPACE_FILE${RESET}"
}

echo "\n${GREEN}Linking complete! Try building the app in Xcode.${RESET}"
echo "${YELLOW}If you encounter build issues:${RESET}"
echo "  1. Check the 'Build Phases' > 'Link Binary With Libraries' section in Xcode"
echo "  2. Make sure all required frameworks are included"
echo "  3. Try cleaning the build folder (Cmd+Shift+K) and rebuilding"
echo "\n${BLUE}====================================================${RESET}"
