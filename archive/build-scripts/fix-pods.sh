#!/usr/bin/env bash
set -e

echo "Cleaning all Pods and derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ios/Pods
rm -rf ios/build

echo "Updating deployment target to iOS 14.0..."
cat > ios/Podfile.properties.json << 'INNER_EOL'
{
  "ios.deploymentTarget": "14.0",
  "newArchEnabled": "false",
  "ios.flipper": "false",
  "ios.useFrameworks": "false",
  "expo.jsEngine": "hermes"
}
INNER_EOL

echo "Ensuring deployment target in Podfile is also set to 14.0..."
sed -i '' 's/platform :ios.*/platform :ios, '\''14.0'\''/' ios/Podfile

echo "Running pod install with clean cache..."
cd ios
rm -rf Pods
rm -rf build
rm -f Podfile.lock
pod cache clean --all
pod install --repo-update

echo "Pod installation complete! Check for any errors above."
