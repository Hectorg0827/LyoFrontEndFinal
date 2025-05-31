#!/bin/zsh
# Final Fix for iOS Build Issues

echo "🔧 Running final iOS build fix..."

# Create Supporting directory if it doesn't exist
mkdir -p /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant/Supporting

# Create our simplified ExpoModulesProvider.swift
cat > /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant/Supporting/ExpoModulesProvider.swift << 'EOF'
// ExpoModulesProvider.swift - Simplified version
// This version does not depend on ExpoModulesCore

import Foundation

// A simplified version that doesn't require ExpoModulesCore
@objc public class ExpoModulesProvider: NSObject {
    @objc public static func modulesForAppDelegate() -> [AnyClass] {
        return []
    }
}
EOF

echo "✓ Created simplified ExpoModulesProvider.swift"

# Create a script to manually add our file to the Xcode project
cat > /Users/republicalatuya/Desktop/LyoFrontEndFinal/fix_xcode_project.rb << 'EOF'
require 'xcodeproj'

# Path to your project
project_path = '/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main target
main_target = project.targets.find { |t| t.name == 'LyoAILearningAssistant' }
if main_target.nil?
  puts "❌ Could not find target 'LyoAILearningAssistant'"
  exit 1
end

# Find the main group
main_group = project.main_group.find_subpath('LyoAILearningAssistant')
if main_group.nil?
  puts "❌ Could not find main group 'LyoAILearningAssistant'"
  exit 1
end

# Create or find Supporting group
supporting_group = main_group.find_subpath('Supporting')
if supporting_group.nil?
  supporting_group = main_group.new_group('Supporting')
end

# Check if the file already exists in the project
file_path = '/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant/Supporting/ExpoModulesProvider.swift'
file_ref = supporting_group.files.find { |file| file.path == File.basename(file_path) }

# Remove existing file if it exists
if file_ref
  file_ref.remove_from_project
end

# Add file to project
file_ref = supporting_group.new_file(file_path)

# Add file to main target
main_target.add_file_references([file_ref])

# Remove any references to ExpoModulesProvider.swift from the Pods group
pods_group = project.main_group.find_subpath('Pods')
if pods_group
  pods_files = pods_group.recursive_children.select { |child| 
    child.path && child.path.end_with?('ExpoModulesProvider.swift')
  }
  
  pods_files.each do |file|
    puts "Removing file from Pods: #{file.path}"
    file.remove_from_project
  end
end

# Save the project
project.save
puts "✓ Project updated successfully!"
EOF

# Run the Ruby script
echo "📝 Updating Xcode project configuration..."
gem install xcodeproj --no-document
ruby /Users/republicalatuya/Desktop/LyoFrontEndFinal/fix_xcode_project.rb

echo "🧹 Cleaning Xcode project..."
rm -rf /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/build
rm -f /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Pods/Target\ Support\ Files/Pods-LyoAILearningAssistant/ExpoModulesProvider.swift

echo "✨ Done! Now follow these steps:"
echo "1. Open Xcode with: open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
echo "2. Clean the build folder: Product > Clean Build Folder"
echo "3. Build the project (Command+B)"
echo ""
echo "If you still see errors, please let me know what they are."
