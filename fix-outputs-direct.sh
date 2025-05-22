#!/bin/zsh
# Fix duplicate output paths in Xcode project file

echo "Fixing 'Multiple commands produce' error in Xcode project..."

PROJECT_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Create backup of the project file
BACKUP_FILE="${PROJECT_FILE}.bak.$(date +%Y%m%d%H%M%S)"
echo "Creating backup at: ${BACKUP_FILE}"
cp "${PROJECT_FILE}" "${BACKUP_FILE}"

echo "Updating output path for the Start Packager phase..."
sed -i.bak 's/\(FD10A7F022414F080027D42C.*\n.*\n.*\n.*\n.*\n.*\n.*outputPaths = (\n\)\(.*\)"${DERIVED_FILE_DIR}\/react-native-bundle\.timestamp",/\1\t\t\t\t"${DERIVED_FILE_DIR}\/react-native-packager\.timestamp",/g' "${PROJECT_FILE}"

echo "✅ Fixed duplicate output paths in project file"
echo ""
echo "Next steps:"
echo "1. Clean the build folder: rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant-*"
echo "2. Rebuild the project in Xcode"
