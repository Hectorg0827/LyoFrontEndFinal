#!/bin/zsh
# Super direct fix for duplicate output paths

echo "📝 Creating the manually edited project file..."

PROJECT_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Create backup
cp "${PROJECT_FILE}" "${PROJECT_FILE}.bak.$(date +%Y%m%d%H%M%S)"

# Make the edit with Perl which is more reliable for multi-line replacements
perl -i -0pe 's/(FD10A7F022414F080027D42C.*?outputPaths = \(\n\t+)"\\$\{DERIVED_FILE_DIR\}\/react-native-bundle\.timestamp"/\1"\\$\{DERIVED_FILE_DIR\}\/react-native-packager\.timestamp"/s' "${PROJECT_FILE}"

if [ $? -eq 0 ]; then
  echo "✅ Successfully updated the project file"
else
  echo "❌ Failed to update the project file"
  exit 1
fi

echo "🧹 Cleaning derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant-*

echo "✅ Fix completed!"
echo ""
echo "Next steps:"
echo "1. Open the Xcode workspace: open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
echo "2. Build the project (Command+B) or run on a simulator (Command+R)"
