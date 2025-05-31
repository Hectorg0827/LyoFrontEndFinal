#!/bin/zsh
# fix-expo-pod-issues.sh
# This script fixes common issues with Expo/React Native iOS builds

set -e  # Exit immediately if a command fails

echo "🧹 Step 1: Cleaning up previous build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

echo "📝 Step 2: Updating Podfile to use iOS 14.0 as minimum deployment target..."
# Already done via file edit

echo "🔄 Step 3: Checking node_modules is up to date..."
npm install

echo "📦 Step 4: Creating patches directory if it doesn't exist..."
mkdir -p patches

echo "🩹 Step 5: Creating patch for expo-asset..."
cat > patches/expo-asset+8.10.1.patch << 'EOF'
diff --git a/node_modules/expo-asset/ios/EXAsset.podspec b/node_modules/expo-asset/ios/EXAsset.podspec
index 34c74f08d..7e18e0844 100644
--- a/node_modules/expo-asset/ios/EXAsset.podspec
+++ b/node_modules/expo-asset/ios/EXAsset.podspec
@@ -11,7 +11,7 @@ Pod::Spec.new do |s|
   s.homepage     = "https://docs.expo.dev/versions/latest/sdk/asset/"
   s.platform     = :ios, "13.0"
   s.source       = { git: "https://github.com/expo/expo.git" }
-  s.ios.deployment_target = "13.0"
+  s.ios.deployment_target = "14.0"
 
   s.dependency "ExpoModulesCore"
 
EOF

echo "🔨 Step 6: Applying patches with patch-package..."
npx patch-package expo-asset

echo "🔄 Step 7: Updating app.json with iOS 14.0 minimum deployment target..."
# Create a backup of app.json
cp app.json app.json.backup

# Use jq if available, or a simple sed command if not
if command -v jq &> /dev/null; then
  jq '.expo.ios.deploymentTarget = "14.0"' app.json > app.json.tmp && mv app.json.tmp app.json
else
  # Simple sed approach (less robust but doesn't require jq)
  sed -i '' 's/"ios": {/"ios": {\n      "deploymentTarget": "14.0",/g' app.json
fi

echo "🔄 Step 8: Prebuild the iOS project with Expo..."
npx expo prebuild -p ios --clean

echo "🔄 Step 9: Installing pods with a clean environment..."
cd ios
pod install --repo-update

echo "✅ Setup complete! You can now run: npx expo run:ios --device"
