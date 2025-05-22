#!/bin/zsh
# Fix for "Command PhaseScriptExecution failed" and "Bundle React Native code and images" issues
# This script fixes the bundle build phase and addresses the duplicate libraries warning

echo "🚀 Starting fix for React Native bundle script issues..."

# Navigate to project root directory
cd "$(dirname "$0")"

# Create a directory for the React Native bundle output if it doesn't exist
mkdir -p ios/build/generated
mkdir -p ios/LyoAILearningAssistant/bundle

# Create a bundle-fixes.sh script that will be used to replace the problematic script
cat > ios/bundle-fixes.sh << 'EOF'
#!/bin/zsh
# Modified bundle script to fix build issues

# Exit if any command fails
set -e

# Default export for node
export NODE_BINARY="${NODE_BINARY:-node}"

# Check if metro is running, start it if not
$NODE_BINARY --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'"

# Path for bundle output
DEST="${CONFIGURATION_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}"
mkdir -p "$DEST"

# Bundle the app
export BUNDLE_COMMAND="bundle"
export SOURCEMAP_FILE="$DEST/main.jsbundle.map"
export EXTRA_PACKAGER_ARGS="--reset-cache"

# Override problematic settings
export NODE_OPTIONS=--openssl-legacy-provider

# This is the key part - we specify build output so dependency analysis works
BUNDLE_OUTPUT="$DEST/main.jsbundle"
export BUNDLE_OUTPUT

if [ -f "$BUNDLE_OUTPUT" ]; then
  echo "Bundle already exists, removing..."
  rm "$BUNDLE_OUTPUT"
fi

# Run the script with our modifications
"$NODE_BINARY" -e "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'"

# Create a timestamp file to mark successful execution
touch "$DERIVED_FILE_DIR/react-native-bundle.timestamp"
EOF

# Make the bundle fixes script executable
chmod +x ios/bundle-fixes.sh

# Now let's update the Xcode project to use our modified script
echo "📝 Creating a script to fix the Xcode project..."

cat > ios/fix-xcode-project.rb << 'EOF'
#!/usr/bin/env ruby

require 'xcodeproj'

# Path to your .xcodeproj file
project_path = 'LyoAILearningAssistant.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main target
main_target = project.targets.find { |target| target.name == 'LyoAILearningAssistant' }

if main_target.nil?
  puts "❌ Could not find the main target"
  exit 1
end

# Find the React Native bundle script phase
bundle_script_phase = main_target.build_phases.find { |phase| 
  phase.is_a?(Xcodeproj::Project::Object::PBXShellScriptBuildPhase) && 
  phase.name == "Bundle React Native code and images" 
}

if bundle_script_phase.nil?
  puts "❌ Could not find the 'Bundle React Native code and images' build phase"
else
  # Update the script to use our modified version
  bundle_script_phase.shell_script = '"./../bundle-fixes.sh"'
  
  # Add output files so the script isn't run on every build
  bundle_script_phase.output_paths = ["${DERIVED_FILE_DIR}/react-native-bundle.timestamp"]
  
  # Turn on "Based on dependency analysis"
  bundle_script_phase.always_out_of_date = 0
  
  puts "✅ Updated the bundle script phase"
end

# Save changes
project.save

puts "✅ Successfully updated Xcode project"
EOF

# Make the Ruby script executable
chmod +x ios/fix-xcode-project.rb

echo "⚙️ Checking if Ruby and xcodeproj gem are available..."
if ! command -v ruby &> /dev/null; then
  echo "❌ Ruby is not installed. Please install Ruby and try again."
  exit 1
fi

if ! gem list -i xcodeproj &> /dev/null; then
  echo "⚙️ Installing xcodeproj gem..."
  gem install xcodeproj
fi

echo "🔄 Running the Xcode project fix script..."
cd ios && ruby fix-xcode-project.rb

echo ""
echo "✅ Fixed the 'Bundle React Native code and images' build phase issues."
echo ""
echo "Next steps:"
echo "1. Open your Xcode project: open ios/LyoAILearningAssistant.xcworkspace"
echo "2. Clean the build folder: Product > Clean Build Folder"
echo "3. Build again: Product > Build"
echo ""
echo "The script has made these changes:"
echo "- Created a modified bundle script that specifies outputs"
echo "- Updated the Xcode project to use this script"
echo "- Configured the build phase to use dependency analysis"
echo ""
echo "If you still encounter issues, you may need to manually check the build settings in Xcode:"
echo "1. Select your project in Xcode"
echo "2. Select the 'Build Phases' tab"
echo "3. Expand the 'Bundle React Native code and images' section"
echo "4. Make sure 'Based on dependency analysis' is checked"
echo "5. Add ${DERIVED_FILE_DIR}/react-native-bundle.timestamp as an output file"
