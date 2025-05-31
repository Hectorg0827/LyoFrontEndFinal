#!/bin/zsh
# Fix the Start Packager build phase

echo "📱 Fixing Start Packager build phase..."

# Update the script to include output files
cat > /tmp/fix_packager_phase.rb << 'RUBY_EOL'
require 'xcodeproj'

project_path = '/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main target
main_target = project.targets.find { |target| target.name == 'LyoAILearningAssistant' }
if main_target.nil?
  puts "❌ Could not find main target"
  exit 1
end

# Find the Start Packager build phase
start_packager_phase = main_target.shell_script_build_phases.find do |phase|
  phase.name.to_s.include?("Start Packager")
end

if start_packager_phase.nil?
  puts "❌ Could not find Start Packager build phase"
  exit 1
end

# Update the build phase to have output paths
puts "Updating Start Packager build phase..."
start_packager_phase.output_paths = [
  "$(SRCROOT)/.packager-output"
]

# Set based on dependency analysis to true
start_packager_phase.always_out_of_date = false

# Save the project
project.save
puts "✅ Successfully updated Start Packager build phase"
RUBY_EOL

# Run the Ruby script
gem install xcodeproj
ruby /tmp/fix_packager_phase.rb

echo "✨ Done fixing Start Packager build phase"
