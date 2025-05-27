#!/usr/bin/env bash
set -e

# This script creates a completely fresh app environment with minimal changes
# to get Expo Go working with Lyo

echo "Creating a fresh environment for Lyo app..."

# 1. Clean up existing directories
echo "Cleaning existing build artifacts..."
rm -rf ios android .expo/web .expo/ios .expo/android

# 2. Fix app.json - disable updates system
echo "Updating app.json configuration..."
cat > app.json << 'EOL'
{
  "expo": {
    "name": "Lyo - AI Learning Assistant",
    "slug": "lyo-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#121212"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.lyo.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#121212"
      },
      "package": "com.lyo.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-notifications",
      "expo-localization"
    ],
    "updates": {
      "enabled": false
    },
    "scheme": "lyoapp"
  }
}
EOL

# 3. Update package.json to reference expo/AppEntry.js
echo "Updating package.json configuration..."
npx json -I -f package.json -e 'this.main="node_modules/expo/AppEntry.js"'
npx json -I -f package.json -e 'this.scripts.start="expo start"; this.scripts.ios="expo start --ios"; this.scripts.android="expo start --android"'

# 4. Clean node_modules and reinstall dependencies
echo "Reinstalling dependencies..."
rm -rf node_modules
yarn install || npm install

echo "Done! Now run 'expo start' to launch the app in Expo Go."
