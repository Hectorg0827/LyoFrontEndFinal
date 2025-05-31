#!/bin/bash

# Fix for "Bundle React Native code and images" script phase warning
# This script enables dependency analysis to prevent the script from running on every build

echo "🔧 Fixing Bundle React Native code and images script phase..."

PROJECT_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Create backup
BACKUP_FILE="${PROJECT_FILE}.bak.$(date +%Y%m%d%H%M%S)"
echo "📋 Creating backup at: ${BACKUP_FILE}"
cp "${PROJECT_FILE}" "${BACKUP_FILE}"

# Fix the alwaysOutOfDate setting and add output files for dependency analysis
echo "🛠️ Updating build phase configuration..."

# 1. Change alwaysOutOfDate from 1 to 0 (enable dependency analysis)
sed -i '' 's/alwaysOutOfDate = 1;/alwaysOutOfDate = 0;/g' "${PROJECT_FILE}"

# 2. Add output files for proper dependency tracking
# Find the Bundle React Native build phase and add output paths
perl -i -pe 'BEGIN{undef $/;} s/(name = "Bundle React Native code and images";\s*outputPaths = \(\s*)\);/\1\t\t\t\t"\$\{DERIVED_FILE_DIR\}\/react-native-bundle\.timestamp",\n\t\t\t\);/gs' "${PROJECT_FILE}"

echo "✅ Build phase configuration updated successfully!"

echo ""
echo "📝 Changes made:"
echo "   • Set 'alwaysOutOfDate = 0' to enable dependency analysis"
echo "   • Added output file for proper dependency tracking"
echo ""
echo "🎯 This will prevent the script from running on every build and eliminate the warning."
echo ""
echo "📋 Next steps:"
echo "1. Clean build folder in Xcode (⌘⇧K)"
echo "2. Build the project (⌘R)"
echo ""
echo "💡 If you need to revert changes, restore from: ${BACKUP_FILE}"
