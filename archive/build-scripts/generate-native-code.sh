#!/bin/zsh

# Script to generate native iOS and Android project files for an Expo project

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

# Project directory
PROJECT_DIR="$HOME/Desktop/LyoFrontEndFinal"

# Display header
echo "${BLUE}====================================================${RESET}"
echo "${BOLD}${YELLOW}Lyo App - Generate Native iOS/Android Code${RESET}"
echo "${BLUE}====================================================${RESET}"

# Navigate to project directory
cd "$PROJECT_DIR" || { echo "${RED}Failed to navigate to $PROJECT_DIR${RESET}"; exit 1; }

echo "\n${YELLOW}1. Cleaning project...${RESET}"
rm -rf node_modules
rm -rf ios
rm -rf android
rm -f yarn.lock
rm -f package-lock.json # In case it exists

echo "\n${YELLOW}2. Ensuring expo-cli is a local dependency...${RESET}"
# Check if expo-cli is in devDependencies or dependencies
if ! grep -q '"expo-cli"' package.json; then
  echo "Adding expo-cli to devDependencies..."
  yarn add expo-cli --dev || { echo "${RED}Failed to add expo-cli. Please check your Yarn setup.${RESET}"; exit 1; }
else
  echo "expo-cli already found in package.json."
fi

echo "\n${YELLOW}3. Installing dependencies using Yarn...${RESET}"
yarn install || { echo "${RED}yarn install failed. Please check your Yarn setup and network connection.${RESET}"; exit 1; }

echo "\n${YELLOW}4. Creating index.js if it doesn\'t exist...${RESET}"
if [ ! -f "index.js" ]; then
  echo "Creating index.js..."
  cat > index.js << EOF
import { registerRootComponent } from 'expo';
import App from './App'; // Assuming App.tsx is your root component

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
EOF
else
  echo "index.js already exists."
fi

echo "\n${YELLOW}5. Generating iOS native project...${RESET}"
# Use npx to ensure the locally installed (or fetched) expo-cli is used
npx expo prebuild --platform ios --clean || {
  echo "${RED}iOS prebuild failed. See errors above.${RESET}"
  echo "${YELLOW}Attempting to generate Android project anyway...${RESET}"
}

if [ -d "ios" ]; then
  echo "\n${GREEN}iOS project generated successfully in '$PROJECT_DIR/ios' !${RESET}"
  echo "${YELLOW}You can now open it in Xcode: open $PROJECT_DIR/ios/*.xcworkspace${RESET}"
else
  echo "\n${RED}Failed to generate iOS project directory.${RESET}"
fi

echo "\n${YELLOW}6. Generating Android native project...${RESET}"
npx expo prebuild --platform android --clean || {
  echo "${RED}Android prebuild failed. See errors above.${RESET}"
}

if [ -d "android" ]; then
  echo "\n${GREEN}Android project generated successfully in '$PROJECT_DIR/android' !${RESET}"
  echo "${YELLOW}You can now open it in Android Studio.${RESET}"
else
  echo "\n${RED}Failed to generate Android project directory.${RESET}"
fi

echo "\n${BLUE}====================================================${RESET}"
if [ -d "ios" ] || [ -d "android" ]; then
  echo "${GREEN}Native code generation process completed.${RESET}"
  echo "If one platform failed, check the logs above for specific errors."
else
  echo "${RED}Native code generation FAILED for both platforms.${RESET}"
  echo "Please review the logs for errors. Common issues include:"
  echo "  - Incorrect app.json configuration (e.g., missing bundleIdentifier for iOS, package for Android)"
  echo "  - Network issues preventing download of native templates or tools"
  echo "  - Problems with global Node/NPM/Yarn setup or permissions"
  echo "  - Insufficient disk space or incompatible system libraries"
fi
echo "${BLUE}====================================================${RESET}"
