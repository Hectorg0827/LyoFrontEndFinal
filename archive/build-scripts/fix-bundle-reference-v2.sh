#!/bin/bash
# Script to update Xcode project to use simple-bundle.sh instead of ultimate-bundle.sh

echo "🔧 Updating Xcode project to use simple-bundle.sh for bundling..."

# Define file paths
PROJECT_FILE="ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"
BACKUP_FILE="ios/LyoAILearningAssistant.xcodeproj/project.pbxproj.bak"

# Create backup
cp "$PROJECT_FILE" "$BACKUP_FILE"
echo "📑 Created backup of project file at $BACKUP_FILE"

# First, see if the file contains the reference we're looking for
if grep -q "../ultimate-bundle.sh" "$PROJECT_FILE"; then
    echo "🔍 Found reference to ultimate-bundle.sh in project file"
    
    # Use perl for more reliable regex replacement with quoted strings
    perl -i -pe 's/shellScript = "\.\.\/ultimate-bundle\.sh";/shellScript = "\.\.\/simple-bundle\.sh";/g' "$PROJECT_FILE"
    
    # Check if the replacement was successful
    if grep -q "../simple-bundle.sh" "$PROJECT_FILE"; then
        echo "✅ Successfully updated bundle script reference in Xcode project"
    else
        echo "❌ Failed to update bundle script reference"
        # Try an alternative approach using awk
        awk '{gsub(/shellScript = "\.\.\/ultimate-bundle\.sh";/, "shellScript = \"\.\.\/simple-bundle\.sh\";")}1' "$BACKUP_FILE" > "$PROJECT_FILE"
        
        # Check again
        if grep -q "../simple-bundle.sh" "$PROJECT_FILE"; then
            echo "✅ Successfully updated bundle script reference using alternative method"
        else
            echo "❌ Failed to update project file. Restoring backup..."
            cp "$BACKUP_FILE" "$PROJECT_FILE"
            exit 1
        fi
    fi
else
    echo "❓ Couldn't find reference to ultimate-bundle.sh in project file"
    echo "🔎 Let's check what's actually in there..."
    
    # Find the line with shellScript near the Bundle React Native section
    grep -A 5 -B 5 "Bundle React Native code and images" "$PROJECT_FILE" | grep shellScript
    
    echo "⚠️ Manual intervention required. Please update the bundle script reference manually."
    exit 1
fi

# Make sure simple-bundle.sh is executable
chmod +x ios/simple-bundle.sh
echo "🔑 Made simple-bundle.sh executable"

echo "✨ Bundle script update complete! Try building your project now."
echo "💡 If you need to revert changes, the backup is at: $BACKUP_FILE"
