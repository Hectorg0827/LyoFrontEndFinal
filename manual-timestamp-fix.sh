#!/bin/zsh
# manual fix for duplicate output timestamps

echo "📝 Fixing the 'Multiple commands produce' error..."
echo "This script will manually edit the Xcode project file to fix the duplicate output paths issue."

PROJECT_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Create backup
BACKUP_FILE="${PROJECT_FILE}.timestamp-fix.bak"
cp "${PROJECT_FILE}" "${BACKUP_FILE}"
echo "✅ Created backup at: ${BACKUP_FILE}"

# Create an edited version of the file
TMP_FILE=$(mktemp)

# Process the file line by line
cat "${PROJECT_FILE}" | while IFS= read -r line; do
  # If we find the marker for the Start Packager section
  if [[ "$line" == *"FD10A7F022414F080027D42C /* Start Packager */"* ]]; then
    echo "Found Start Packager section"
    inStartPackager=1
  fi
  
  # If we're in the Start Packager section and find the timestamp line
  if [[ -n "$inStartPackager" && "$line" == *"react-native-bundle.timestamp"* ]]; then
    echo "Replacing output path..."
    # Replace the line with our modified version
    echo '				"${DERIVED_FILE_DIR}/react-native-packager.timestamp",' >> "$TMP_FILE"
    # Reset the flag since we made the change
    inStartPackager=""
  else
    # Copy the line unchanged
    echo "$line" >> "$TMP_FILE"
  fi
done

# Replace the original file with our edited version
cp "$TMP_FILE" "${PROJECT_FILE}"
rm "$TMP_FILE"

echo "✅ Updated the project file"

# Clean derived data
echo "🧹 Cleaning derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant-*

echo "✅ Fix completed!"
echo ""
echo "Next steps:"
echo "1. Open the Xcode workspace: open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
echo "2. Build the project (Command+B) or run on a simulator (Command+R)"
