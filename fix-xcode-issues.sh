#!/bin/zsh
# Fix Xcode build phases and duplicate files

echo "🛠 Fixing Xcode build issues..."

# Remove the duplicate ExpoModulesProvider.swift file
if [ -f "/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Pods-LyoAILearningAssistant/ExpoModulesProvider.swift" ]; then
  echo "🗑 Removing duplicate ExpoModulesProvider.swift..."
  rm -f "/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/Pods-LyoAILearningAssistant/ExpoModulesProvider.swift"
fi

# If there's also one in the main project directory, remove that too
if [ -f "/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant/ExpoModulesProvider.swift" ]; then
  echo "🗑 Removing ExpoModulesProvider.swift from main project..."
  rm -f "/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant/ExpoModulesProvider.swift"
fi

# Create a simple Ruby script to update the build phases
cat > "/Users/republicalatuya/Desktop/LyoFrontEndFinal/fix_build_phases.rb" << 'EOF'
require 'xcodeproj'

# Open the project
project_path = '/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj'
project = Xcodeproj::Project.open(project_path)

main_target = project.targets.find { |t| t.name == 'LyoAILearningAssistant' }
if main_target.nil?
  puts "❌ Could not find main target 'LyoAILearningAssistant'"
  exit 1
end

puts "✓ Found main target"

# Find the build phases
bundle_react_phase = main_target.shell_script_build_phases.find { |phase| phase.name == 'Bundle React Native code and images' }
start_packager_phase = main_target.shell_script_build_phases.find { |phase| phase.name == 'Start Packager' }

# Fix Bundle React Native code and images build phase
if bundle_react_phase
  puts "Updating 'Bundle React Native code and images' build phase..."
  bundle_react_phase.output_paths = ['$(DERIVED_FILE_DIR)/react-native-bundle.temp']
  bundle_react_phase.always_out_of_date = false
else
  puts "❌ Could not find 'Bundle React Native code and images' build phase"
end

# Fix Start Packager build phase
if start_packager_phase
  puts "Updating 'Start Packager' build phase..."
  start_packager_phase.output_paths = ['$(SRCROOT)/.packager-output']
  start_packager_phase.always_out_of_date = false
else
  puts "❌ Could not find 'Start Packager' build phase"
end

# Fix file references - remove any duplicate references to ExpoModulesProvider.swift
all_files = project.files
expo_module_files = all_files.select { |file| file.path.end_with?('ExpoModulesProvider.swift') }

if expo_module_files.length > 1
  puts "Found #{expo_module_files.length} references to ExpoModulesProvider.swift, removing duplicates..."
  
  # Keep only the one in Pods/Target Support Files
  correct_file = expo_module_files.find { |file| file.real_path.to_s.include?('Pods/Target Support Files') }
  if correct_file
    puts "Keeping: #{correct_file.real_path}"
    expo_module_files.each do |file|
      next if file == correct_file
      puts "Removing reference: #{file.real_path}"
      file.remove_from_project
    end
  else
    puts "❌ Could not find the correct ExpoModulesProvider.swift file in Pods/Target Support Files"
  end
elsif expo_module_files.length == 0
  puts "❌ No references to ExpoModulesProvider.swift found in project"
else
  puts "✓ Only one reference to ExpoModulesProvider.swift found"
end

# Save the project
project.save
puts "✅ Project updated successfully"
EOF

# Run the Ruby script to fix build phases
echo "📝 Updating Xcode project configuration..."
gem install xcodeproj --no-document
ruby "/Users/republicalatuya/Desktop/LyoFrontEndFinal/fix_build_phases.rb"

echo "✨ Done! Now try building the project again in Xcode."
echo "To open the workspace, run: open /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcworkspace"
