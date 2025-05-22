#!/bin/bash
# Script to update Xcode project to use simple-bundle.sh instead of ultimate-bundle.sh

echo "🔧 Updating Xcode project to use simple-bundle.sh for bundling..."

# Define file paths
PROJECT_FILE="ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"
BACKUP_FILE="ios/LyoAILearningAssistant.xcodeproj/project.pbxproj.bak"

# Create backup
cp "$PROJECT_FILE" "$BACKUP_FILE"
echo "📑 Created backup of project file at $BACKUP_FILE"

# Replace the bundle script reference - using sed with specific pattern
sed -i '' 's/shellScript = "\.\.\/ultimate-bundle\.sh";/shellScript = "\.\.\/simple-bundle\.sh";/' "$PROJECT_FILE"

# Verify the change
if grep -q "shellScript = \"\.\.\/simple-bundle\.sh\";" "$PROJECT_FILE"; then
    echo "✅ Successfully updated bundle script reference in Xcode project"
else
    echo "❌ Failed to update project file. Restoring backup..."
    cp "$BACKUP_FILE" "$PROJECT_FILE"
    exit 1
fi

# Make sure simple-bundle.sh is executable
chmod +x ios/simple-bundle.sh
echo "🔑 Made simple-bundle.sh executable"

echo "✨ Bundle script update complete! Try building your project now."
echo "💡 If you need to revert changes, the backup is at: $BACKUP_FILE"
