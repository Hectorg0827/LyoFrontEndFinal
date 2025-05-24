#!/bin/bash
# Simple script to fresh-build iOS

echo "🧹 Cleaning environment..."
rm -rf ios
rm -rf ~/Library/Developer/Xcode/DerivedData

echo "🏗️ Rebuilding iOS project..."
npx expo prebuild --platform ios --clean

echo "📝 Patching podspecs..."
node scripts/patch-pods.js

echo "📦 Installing pods..."
cd ios && pod install

echo "✅ iOS build prepared! You can now run: npx expo run:ios"
