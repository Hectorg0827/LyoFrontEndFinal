#!/bin/zsh
# Fix duplicate output paths in Xcode project file

echo "Fixing 'Multiple commands produce' error in Xcode project..."

PROJECT_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Create backup of the project file
BACKUP_FILE="${PROJECT_FILE}.bak.$(date +%Y%m%d%H%M%S)"
echo "Creating backup at: ${BACKUP_FILE}"
cp "${PROJECT_FILE}" "${BACKUP_FILE}"

# Update the output path for the "Start Packager" phase to make it unique
echo "Updating output path for Start Packager phase..."

# Find the Start Packager section and update its output path
perl -i -pe 'BEGIN{undef $/;} s/(name = "Start Packager";\n.*?outputPaths = \(\n).*?(\"\$\{DERIVED_FILE_DIR\}\/react-native-bundle\.timestamp\")/\1\t\t\t\t\"\$\{DERIVED_FILE_DIR\}\/react-native-packager\.timestamp\"/gs' "${PROJECT_FILE}"

echo "✅ Fixed duplicate output paths in project file"
echo ""
echo "Next steps:"
echo "1. Clean the build folder: rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant-*"
echo "2. Rebuild the project in Xcode"
