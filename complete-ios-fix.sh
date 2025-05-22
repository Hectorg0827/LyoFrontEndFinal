#!/bin/bash

echo "🛠️ Fixing iOS build issues for Lyo App..."

# Step 1: Fix the patch file
echo "📝 Creating proper patch for expo-asset..."
mkdir -p ./patches
cat > ./patches/expo-asset+8.10.1.patch << 'EOL'
diff --git a/node_modules/expo-asset/ios/ExpoAsset.podspec b/node_modules/expo-asset/ios/ExpoAsset.podspec
index a57cf86..b4796d5 100644
--- a/node_modules/expo-asset/ios/ExpoAsset.podspec
+++ b/node_modules/expo-asset/ios/ExpoAsset.podspec
@@ -11,7 +11,8 @@ Pod::Spec.new do |s|
   s.author         = package['author']
   s.homepage       = package['homepage']
   s.platforms      = {
-    :ios => '13.0',
+    :ios => '14.0',
     :osx => '11.0',
+    :tvos => '14.0'
   }
   s.swift_version  = '5.4'
EOL
echo "✅ Created proper patch file for expo-asset"

# Step 2: Update the Podfile
echo "📝 Updating iOS deployment target in Podfile..."
if [ -f "./ios/Podfile" ]; then
  sed -i '' 's/ios, podfile_properties\['"'"'ios.deploymentTarget'"'"'\] || '"'"'13.0'"'"'/ios, podfile_properties\['"'"'ios.deploymentTarget'"'"'\] || '"'"'14.0'"'"'/g' ./ios/Podfile
  echo "✅ Updated Podfile to use iOS 14.0"
else
  echo "⚠️ Podfile not found."
fi

# Step 3: Update the Podfile.properties.json
echo "📝 Updating Podfile.properties.json..."
if [ -f "./ios/Podfile.properties.json" ]; then
  # Check if ios.deploymentTarget is already in the file
  if grep -q "ios.deploymentTarget" ./ios/Podfile.properties.json; then
    # Replace the existing value
    sed -i '' 's/"ios.deploymentTarget": "[0-9.]*"/"ios.deploymentTarget": "14.0"/g' ./ios/Podfile.properties.json
  else
    # Add the property if it doesn't exist
    sed -i '' 's/}$/,\n  "ios.deploymentTarget": "14.0"\n}/g' ./ios/Podfile.properties.json
  fi
  echo "✅ Updated Podfile.properties.json"
else
  # Create the file if it doesn't exist
  mkdir -p ./ios
  cat > ./ios/Podfile.properties.json << 'EOL'
{
  "expo.jsEngine": "hermes",
  "EX_DEV_CLIENT_NETWORK_INSPECTOR": "true",
  "ios.deploymentTarget": "14.0"
}
EOL
  echo "✅ Created Podfile.properties.json"
fi

# Step 4: Update deployment target in Xcode project
echo "📝 Updating deployment target in Xcode project..."
if [ -f "./ios/LyoAILearningAssistant.xcodeproj/project.pbxproj" ]; then
  sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = 13.0;/IPHONEOS_DEPLOYMENT_TARGET = 14.0;/g' ./ios/LyoAILearningAssistant.xcodeproj/project.pbxproj
  echo "✅ Updated deployment target in Xcode project"
else
  echo "⚠️ Xcode project file not found."
fi

# Step 5: Clean node_modules if requested
echo "📦 Do you want to clean node_modules and reinstall (y/n)? This may help resolve dependency issues."
read -r clean_choice
if [[ $clean_choice == "y" || $clean_choice == "Y" ]]; then
  echo "🧹 Cleaning node_modules..."
  rm -rf node_modules
  echo "📦 Installing dependencies..."
  npm install
else
  echo "📦 Applying patches without reinstalling dependencies..."
  npx patch-package
fi

# Step 6: Clean and rebuild iOS
echo "🧹 Cleaning iOS build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

echo "📱 Rebuilding iOS project..."
npx expo prebuild --platform ios --clean

echo "🔍 Do you want to install pods now (y/n)?"
read -r pods_choice
if [[ $pods_choice == "y" || $pods_choice == "Y" ]]; then
  echo "📦 Installing pods..."
  cd ios && pod install
  echo "✅ Pods installed"
else
  echo "⚠️ Skipping pod installation. Run 'cd ios && pod install' manually when ready."
fi

echo "🚀 Setup complete! Try running the app with 'npx expo run:ios'"
