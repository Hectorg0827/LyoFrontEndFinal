#!/bin/bash
# clean-build.sh - Streamlined build process for Lyo AI Learning Assistant
set -e

echo "🧹 Cleaning previous build artifacts..."
rm -rf ios android

echo "🔄 Regenerating native projects with expo prebuild..."
npx expo prebuild --clean

echo "📦 Installing iOS dependencies..."
cd ios && pod install && cd ..

echo "✅ Native projects regenerated successfully!"
echo ""
echo "Next steps:"
echo "1. Run the app: npx expo run:ios (or npx expo run:android)"
echo "2. For development: npx expo start --dev-client"