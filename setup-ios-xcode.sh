#!/bin/zsh

# Automated script to create iOS build files for Lyo app and open in Xcode
# This script will:
# 1. Create a temporary React Native project
# 2. Copy iOS files to Lyo project
# 3. Set up the iOS environment
# 4. Install CocoaPods
# 5. Open the project in Xcode

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

# Main Lyo project directory
LYO_PROJECT_DIR="$HOME/Desktop/LyoFrontEndFinal"
TEMP_PROJECT_DIR="$HOME/Desktop/LyoTemp"

# Display header
echo "${BLUE}====================================================${RESET}"
echo "${BOLD}${YELLOW}Lyo App - Automated iOS Setup for Xcode${RESET}"
echo "${BLUE}====================================================${RESET}"

# Navigate to Desktop
cd "$HOME/Desktop" || { echo "${RED}Failed to navigate to Desktop directory${RESET}"; exit 1; }

# Clean up any existing temporary project
if [ -d "$TEMP_PROJECT_DIR" ]; then
    echo "\n${YELLOW}Removing existing temporary project...${RESET}"
    rm -rf "$TEMP_PROJECT_DIR"
fi

# Create temporary React Native project with same RN version
echo "\n${YELLOW}1. Creating temporary React Native project...${RESET}"
npx react-native init LyoTemp --version 0.71.8 || { 
    echo "${RED}Failed to create temporary React Native project.${RESET}"
    echo "${YELLOW}Trying alternative approach...${RESET}"
    
    # Try with create-react-native-app as fallback
    npx create-react-native-app LyoTemp || {
        echo "${RED}Failed to create temporary project with create-react-native-app too.${RESET}"
        exit 1
    }
}

# Verify the temporary project was created correctly
if [ ! -d "$TEMP_PROJECT_DIR/ios" ]; then
    echo "${RED}iOS directory was not created in temporary project.${RESET}"
    exit 1
fi

# Copy iOS directory to Lyo project
echo "\n${YELLOW}2. Copying iOS files to Lyo project...${RESET}"
mkdir -p "$LYO_PROJECT_DIR/ios-backup"

# Backup any existing iOS directory
if [ -d "$LYO_PROJECT_DIR/ios" ]; then
    echo "${YELLOW}Backing up existing iOS directory...${RESET}"
    cp -R "$LYO_PROJECT_DIR/ios/"* "$LYO_PROJECT_DIR/ios-backup/"
    rm -rf "$LYO_PROJECT_DIR/ios"
fi

# Copy the iOS directory
cp -R "$TEMP_PROJECT_DIR/ios" "$LYO_PROJECT_DIR/" || {
    echo "${RED}Failed to copy iOS directory to Lyo project.${RESET}"
    exit 1
}

# Change app name and bundle identifier in project.pbxproj
echo "\n${YELLOW}3. Configuring iOS project for Lyo...${RESET}"
PBXPROJ_FILE="$LYO_PROJECT_DIR/ios/LyoTemp.xcodeproj/project.pbxproj"
if [ -f "$PBXPROJ_FILE" ]; then
    echo "${YELLOW}Updating project configuration...${RESET}"
    sed -i '' 's/LyoTemp/LyoApp/g' "$PBXPROJ_FILE"
    sed -i '' 's/org.reactjs.native.example.LyoTemp/com.lyo.app/g' "$PBXPROJ_FILE"
fi

# Update Info.plist
INFO_PLIST="$LYO_PROJECT_DIR/ios/LyoTemp/Info.plist"
if [ -f "$INFO_PLIST" ]; then
    echo "${YELLOW}Updating Info.plist...${RESET}"
    sed -i '' 's/LyoTemp/Lyo - AI Learning Assistant/g' "$INFO_PLIST"
fi

# Install CocoaPods if not installed
if ! command -v pod &> /dev/null; then
    echo "\n${YELLOW}4. Installing CocoaPods...${RESET}"
    sudo gem install cocoapods || {
        echo "${RED}Failed to install CocoaPods. Please install it manually:${RESET}"
        echo "${YELLOW}sudo gem install cocoapods${RESET}"
        exit 1
    }
else
    echo "\n${YELLOW}4. CocoaPods is already installed.${RESET}"
fi

# Install pods
echo "\n${YELLOW}5. Installing CocoaPods dependencies...${RESET}"
cd "$LYO_PROJECT_DIR/ios" || { echo "${RED}Failed to navigate to iOS directory${RESET}"; exit 1; }
pod install || {
    echo "${RED}Failed to install CocoaPods dependencies.${RESET}"
    echo "${YELLOW}Trying with pod repo update first...${RESET}"
    pod repo update && pod install || {
        echo "${RED}Still failed to install CocoaPods dependencies.${RESET}"
        exit 1
    }
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
    exit 1
}

# Clean up temporary project
echo "\n${YELLOW}7. Cleaning up temporary files...${RESET}"
rm -rf "$TEMP_PROJECT_DIR"

echo "\n${GREEN}Setup complete! The Lyo app is now open in Xcode.${RESET}"
echo "${YELLOW}In Xcode:${RESET}"
echo "  1. Select your simulator or device from the scheme dropdown"
echo "  2. Click the Run button (▶️) to build and run the app"
echo "  3. If you encounter signing issues, go to the Signing & Capabilities tab"
echo "     and select your development team"
echo "\n${BLUE}====================================================${RESET}"
