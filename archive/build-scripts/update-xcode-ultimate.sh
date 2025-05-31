#!/bin/zsh
# Update Xcode project to use the ultimate-bundle.sh script

echo "Updating Xcode project to use the ultimate-bundle.sh script..."

PROJECT_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Create backup of the project file
BACKUP_FILE="${PROJECT_FILE}.bak.$(date +%Y%m%d%H%M%S)"
echo "Creating backup at: ${BACKUP_FILE}"
cp "${PROJECT_FILE}" "${BACKUP_FILE}"

# Find the Bundle React Native code and images build phase and replace its script
echo "Modifying the bundle script reference..."

# The script uses perl to replace the old script content with the new one (../ultimate-bundle.sh)
perl -i -pe 'BEGIN{undef $/;} s/(shellScript = ").*?(";[ \t]*\n[ \t]*};[ \t]*\n[ \t]*FD10A7F022414F080027D42C)/\1\.\.\/ultimate-bundle\.sh\2/gs' "${PROJECT_FILE}"

# Add the output file path for dependency tracking if it's not there already
echo "Adding output file path for dependency tracking..."
perl -i -pe 'BEGIN{undef $/;} s/(outputPaths = \(\n[ \t]*\);)/outputPaths = \(\n\t\t\t\t\t\t\t"\$\{DERIVED_FILE_DIR\}\/react-native-bundle\.timestamp",\n\t\t\t\t\t\t\);/gs' "${PROJECT_FILE}"

# Also remove the existing line if it already has something to avoid duplicates
perl -i -pe 'BEGIN{undef $/;} s/(outputPaths = \(\n[ \t]*)".*?",\n[ \t]*(\);)/\1"\$\{DERIVED_FILE_DIR\}\/react-native-bundle\.timestamp",\n\t\t\t\t\t\t\2/gs' "${PROJECT_FILE}"

# Make sure the bundle script phase has proper settings
echo "Setting bundle script phase attributes..."
perl -i -pe 'BEGIN{undef $/;} s/(shellPath = ).*?(;)/\1\/bin\/bash\2/gs' "${PROJECT_FILE}"

echo "Xcode project file updated successfully"
echo ""
echo "Next steps:"
echo "1. Clean the build folder: rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant-*"
echo "2. Open the Xcode workspace: open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
echo "3. Clean build in Xcode (Product -> Clean Build Folder)"
echo "4. Build and run the project"
