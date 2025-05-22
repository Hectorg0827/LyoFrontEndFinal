#!/bin/bash

# Script to update the Xcode project file with the simplified bundle script
set -e

echo "Updating Xcode project file for LyoAILearningAssistant with simplified bundle script"

PROJECT_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Create backup of the project file
BACKUP_FILE="${PROJECT_FILE}.bak"
echo "Creating backup at: ${BACKUP_FILE}"
cp "${PROJECT_FILE}" "${BACKUP_FILE}"

# Find the Bundle React Native code and images build phase and replace its script
echo "Modifying the bundle script reference..."

# The script uses perl to replace the old script content with the new one (../simple-bundle.sh)
perl -i -pe 'BEGIN{undef $/;} s/(shellScript = ").*?(";[ \t]*\n[ \t]*};[ \t]*\n[ \t]*FD10A7F022414F080027D42C)/\1\.\.\/simple-bundle\.sh\2/gs' "${PROJECT_FILE}"

# Add the output file path for dependency tracking
echo "Adding output file path for dependency tracking..."

perl -i -pe 'BEGIN{undef $/;} s/(outputPaths = \(\n[ \t]*\);)/outputPaths = \(\n\t\t\t\t\t\t\t"\$\{DERIVED_FILE_DIR\}\/react-native-bundle\.timestamp",\n\t\t\t\t\t\t\);/gs' "${PROJECT_FILE}"

echo "Xcode project file updated successfully"
echo "Next steps:"
echo "1. Open the Xcode workspace: LyoAILearningAssistant.xcworkspace"
echo "2. Clean the build folder (Product -> Clean Build Folder)"
echo "3. Build and run the project"
