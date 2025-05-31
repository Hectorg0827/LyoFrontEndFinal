#!/bin/zsh
# fix-ios-build.sh
# A comprehensive script to fix iOS build issues

echo "🔄 Step 1: Removing previous build artifacts..."
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf node_modules/expo-asset/ios/*.orig

echo "⚡ Step 2: Applying direct fix to ExpoAsset.podspec..."
PODSPEC_PATH="./node_modules/expo-asset/ios/ExpoAsset.podspec"

# Make a backup of the original file
cp "$PODSPEC_PATH" "${PODSPEC_PATH}.orig"

# Read the content
content=$(cat "$PODSPEC_PATH")

# Replace :ios => '13.0' with :ios => '14.0'
# This is safer than using sed as it will handle the case where it's already 14.0
if grep -q ":ios => '13.0'" "$PODSPEC_PATH"; then
  echo "Updating iOS platform from 13.0 to 14.0 in ExpoAsset.podspec..."
  sed -i '' "s/:ios => '13.0'/:ios => '14.0'/g" "$PODSPEC_PATH"
fi

echo "🔄 Step 3: Updating project configurations..."
# Update Podfile.properties.json
echo '{
  "expo.jsEngine": "hermes",
  "EX_DEV_CLIENT_NETWORK_INSPECTOR": "true",
  "ios.deploymentTarget": "14.0"
}' > ./ios/Podfile.properties.json

echo "🔄 Step 4: Running pod install with clean cache..."
cd ios
pod cache clean --all
pod install --repo-update

echo "✅ Completed iOS build fixes! If successful, you can now run:"
echo "npx expo run:ios --device"
