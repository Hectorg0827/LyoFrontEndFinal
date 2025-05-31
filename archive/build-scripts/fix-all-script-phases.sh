#!/bin/bash

# Fix Xcode warning: "Run script build phase will be run during every build because 
# the option to run the script phase 'Based on dependency analysis' is unchecked"

echo "🔧 Fixing Xcode script build phases to enable dependency analysis..."

PROJECT_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Check if project file exists
if [ ! -f "$PROJECT_FILE" ]; then
    echo "❌ Error: project.pbxproj file not found at $PROJECT_FILE"
    exit 1
fi

# Create backup
BACKUP_FILE="${PROJECT_FILE}.backup-$(date +%Y%m%d_%H%M%S)"
cp "$PROJECT_FILE" "$BACKUP_FILE"
echo "📁 Created backup: $BACKUP_FILE"

# Fix all script phases with alwaysOutOfDate = 1
echo "🔧 Fixing all script phases with alwaysOutOfDate = 1..."
sed -i '' 's/alwaysOutOfDate = 1;/alwaysOutOfDate = 0;/g' "$PROJECT_FILE"

# Add output files for dependency tracking if missing
echo "🔧 Adding output file paths for dependency tracking..."

# Add output path for Bundle React Native script if missing
if ! grep -q "react-native-bundle.timestamp" "$PROJECT_FILE"; then
    echo "   - Adding output path for Bundle React Native script"
    # This is a complex sed operation to add the output path
    sed -i '' '/name = "Bundle React Native code and images";/,/outputPaths = (/{ 
        /outputPaths = (/,/);/{
            /outputPaths = (/a\
				"${DERIVED_FILE_DIR}/react-native-bundle.timestamp",
        }
    }' "$PROJECT_FILE"
fi

# Add output path for Expo Configure project script if missing
if ! grep -q "expo-configure-project.timestamp" "$PROJECT_FILE"; then
    echo "   - Adding output path for Expo Configure project script"
    # This is a complex sed operation to add the output path
    sed -i '' '/name = "\[Expo\] Configure project";/,/outputPaths = (/{ 
        /outputPaths = (/,/);/{
            /outputPaths = (/a\
				"${DERIVED_FILE_DIR}/expo-configure-project.timestamp",
        }
    }' "$PROJECT_FILE"
fi

echo "✅ All script phase dependency analysis has been enabled!"
echo ""
echo "📝 Changes made:"
echo "   - Set alwaysOutOfDate = 0 for all script phases"
echo "   - Added output file paths for proper dependency tracking:"
echo "     • Bundle React Native: react-native-bundle.timestamp"
echo "     • Expo Configure: expo-configure-project.timestamp"
echo "   - Backup saved to: $BACKUP_FILE"
echo ""
echo "🎯 Next steps:"
echo "   1. Clean build (⌘⇧K) in Xcode"
echo "   2. Build project (⌘R) to verify warnings are gone"
echo ""
echo "🔄 To restore backup if needed:"
echo "   cp \"$BACKUP_FILE\" \"$PROJECT_FILE\""
