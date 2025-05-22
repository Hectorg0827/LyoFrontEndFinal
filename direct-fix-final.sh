#!/bin/zsh
# Extra simple direct fix for multiple output commands issue

echo "Fixing the duplicate output paths issue..."

PROJECT_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Create backup
BACKUP_FILE="${PROJECT_FILE}.bak.$(date +%s)"
cp "${PROJECT_FILE}" "${BACKUP_FILE}"
echo "✅ Created backup at: ${BACKUP_FILE}"

# Direct string replacement for Start Packager section's output path
sed -i '' 's/FD10A7F022414F080027D42C.*Start Packager.*outputPaths = (.*"\${DERIVED_FILE_DIR}\/react-native-bundle\.timestamp"/FD10A7F022414F080027D42C \/* Start Packager *\/ = {\\n\\t\\t\\tisa = PBXShellScriptBuildPhase;\\n\\t\\t\\tbuildActionMask = 2147483647;\\n\\t\\t\\tfiles = (\\n\\t\\t\\t);\\n\\t\\t\\tinputFileListPaths = (\\n\\t\\t\\t);\\n\\t\\t\\tinputPaths = (\\n\\t\\t\\t);\\n\\t\\t\\tname = "Start Packager";\\n\\t\\t\\toutputFileListPaths = (\\n\\t\\t\\t);\\n\\t\\t\\toutputPaths = (\\n\\t\\t\\t\\t"\${DERIVED_FILE_DIR}\/react-native-packager.timestamp"/g' "${PROJECT_FILE}"

echo "✅ Updated project file with unique output paths"

# Clean derived data to ensure a clean build
rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant-*

echo "✅ Fixed the duplicate outputs issue and cleaned derived data"
echo ""
echo "Next steps:"
echo "1. Open the Xcode workspace: open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
echo "2. Build the project (Command+B)"
