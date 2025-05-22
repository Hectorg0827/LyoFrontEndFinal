#!/bin/bash
# Pre-build script to check for common issues before building

echo "🔍 Performing pre-build checks for React Native iOS project..."

# Check for Node.js
if command -v node &>/dev/null; then
  NODE_VERSION=$(node --version)
  echo "✅ Node.js found: $NODE_VERSION"
else
  echo "❌ Node.js not found! This is required for building."
  echo "   Please install Node.js and try again."
  exit 1
fi

# Check for existence of key files
if [ ! -f "ios/simple-bundle.sh" ]; then
  echo "❌ simple-bundle.sh script not found!"
  exit 1
fi

if [ ! -f "ios/LyoAILearningAssistant.xcodeproj/project.pbxproj" ]; then
  echo "❌ Xcode project file not found!"
  exit 1
fi

# Check if the script is properly referenced in the project
if ! grep -q "simple-bundle.sh" ios/LyoAILearningAssistant.xcodeproj/project.pbxproj; then
  echo "⚠️ Warning: simple-bundle.sh is not referenced in the Xcode project!"
  echo "   Please run fix-bundle-reference-final.sh to fix this issue."
else
  echo "✅ simple-bundle.sh correctly referenced in Xcode project"
fi

# Create necessary directories in advance
echo "📂 Creating necessary directories..."
mkdir -p ios/build/derived
mkdir -p ios/build/resources
mkdir -p ios/build/generated

# Check that script permissions are correct
chmod +x ios/simple-bundle.sh
echo "🔑 Ensured simple-bundle.sh is executable"

echo "✅ Pre-build checks completed successfully!"
echo "You can now proceed with your build."
