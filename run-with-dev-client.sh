#!/usr/bin/env bash
set -e

echo "Preparing Lyo app to run with Expo Dev Client..."

# Update package.json scripts
echo "Updating package.json scripts..."
npx json -I -f package.json -e 'this.main="node_modules/expo/AppEntry.js"; this.scripts.start="expo start --dev-client"; this.scripts.ios="expo start --dev-client --ios"; this.scripts.android="expo start --dev-client --android"'

# Remove any generated iOS/Android folders if present
echo "Cleaning any previous native builds..."
rm -rf ios android

# Update app.json to enable dev client
echo "Configuring app.json for dev client..."
npx json -I -f app.json -e 'this.expo.updates.enabled=true; this.expo.android=this.expo.android || {}; this.expo.ios=this.expo.ios || {}; this.expo.extra=this.expo.extra || {}; this.expo.extra.eas={}'

# Install necessary dependencies
echo "Installing necessary packages..."
yarn add expo-dev-client@~2.2.1 --dev || npm install expo-dev-client@~2.2.1 --save-dev

# Clear cache and start expo
echo "Starting Expo development server..."
npx expo start --dev-client --clear
