#!/bin/bash

echo "🛠️ Fixing iOS build issues for Lyo App..."

# Step 1: Fix the Podfile and Podfile.properties.json
echo "📝 Updating iOS deployment target to 14.0..."
if [ -f "./ios/Podfile" ]; then
  sed -i '' 's/ios, podfile_properties\['"'"'ios.deploymentTarget'"'"'\] || '"'"'13.0'"'"'/ios, podfile_properties\['"'"'ios.deploymentTarget'"'"'\] || '"'"'14.0'"'"'/g' ./ios/Podfile
  echo "✅ Updated Podfile to use iOS 14.0"
else
  echo "⚠️ Podfile not found. Will be created during prebuild."
fi

# Step 2: Update Podfile.properties.json
echo "📝 Ensuring Podfile.properties.json has correct deployment target..."
mkdir -p ./ios
cat > ./ios/Podfile.properties.json << 'EOL'
{
  "expo.jsEngine": "hermes",
  "EX_DEV_CLIENT_NETWORK_INSPECTOR": "true",
  "ios.deploymentTarget": "14.0"
}
EOL
echo "✅ Created/Updated Podfile.properties.json"

# Step 3: Fix the expo-asset patch file
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

# Step 4: Apply patch if needed and install dependencies
echo "📦 Running npm install to apply patches..."
npm install
echo "✅ Dependencies installed"

# Step 5: Run the prebuild process
echo "🏗️ Running expo prebuild for iOS..."
npx expo prebuild --platform ios --clean
echo "✅ Prebuild completed"

echo "🚀 Setup complete! Now you can run 'npx expo run:ios' to build and run the app"
