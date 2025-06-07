#!/usr/bin/env ruby
# Force C++20 compilation for all targets in Xcode project to fix React Graphics C++20 concepts

require 'xcodeproj'

project_path = '/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj'
project = Xcodeproj::Project.open(project_path)

puts "🔧 Applying C++20 fixes to Xcode project..."

# Apply C++20 settings to ALL targets and configurations
project.targets.each do |target|
  puts "Configuring target: #{target.name}"
  
  target.build_configurations.each do |config|
    puts "  Config: #{config.name}"
    
    # Force C++20 language standard
    config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
    config.build_settings['GCC_C_LANGUAGE_STANDARD'] = 'c17'
    config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
    
    # Add C++20 compiler flags
    other_cflags = config.build_settings['OTHER_CFLAGS'] || []
    other_cflags = [other_cflags] if other_cflags.is_a?(String)
    other_cflags += ['-std=c++20', '-fconcepts', '-fcoroutines'] unless other_cflags.include?('-std=c++20')
    config.build_settings['OTHER_CFLAGS'] = other_cflags
    
    other_cplusplusflags = config.build_settings['OTHER_CPLUSPLUSFLAGS'] || []
    other_cplusplusflags = [other_cplusplusflags] if other_cplusplusflags.is_a?(String)
    other_cplusplusflags += ['-std=c++20', '-fconcepts', '-fcoroutines'] unless other_cplusplusflags.include?('-std=c++20')
    config.build_settings['OTHER_CPLUSPLUSFLAGS'] = other_cplusplusflags
    
    # Disable warnings that conflict with C++20
    config.build_settings['CLANG_WARN_CXX0X_EXTENSIONS'] = 'NO'
    config.build_settings['GCC_WARN_ABOUT_INVALID_OFFSETOF_MACRO'] = 'NO'
    config.build_settings['CLANG_WARN_DOCUMENTATION_COMMENTS'] = 'NO'
    
    # Enable modules and modern C++ features
    config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
    config.build_settings['CLANG_MODULES_AUTOLINK'] = 'YES'
    config.build_settings['ENABLE_STRICT_OBJC_MSGSEND'] = 'YES'
  end
end

# Apply same settings to project-level build configurations
project.build_configurations.each do |config|
  puts "Configuring project-level config: #{config.name}"
  
  config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
  config.build_settings['GCC_C_LANGUAGE_STANDARD'] = 'c17'
  config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
  
  other_cflags = config.build_settings['OTHER_CFLAGS'] || []
  other_cflags = [other_cflags] if other_cflags.is_a?(String)
  other_cflags += ['-std=c++20', '-fconcepts', '-fcoroutines'] unless other_cflags.include?('-std=c++20')
  config.build_settings['OTHER_CFLAGS'] = other_cflags
  
  other_cplusplusflags = config.build_settings['OTHER_CPLUSPLUSFLAGS'] || []
  other_cplusplusflags = [other_cplusplusflags] if other_cplusplusflags.is_a?(String)
  other_cplusplusflags += ['-std=c++20', '-fconcepts', '-fcoroutines'] unless other_cplusplusflags.include?('-std=c++20')
  config.build_settings['OTHER_CPLUSPLUSFLAGS'] = other_cplusplusflags
  
  config.build_settings['CLANG_WARN_CXX0X_EXTENSIONS'] = 'NO'
  config.build_settings['GCC_WARN_ABOUT_INVALID_OFFSETOF_MACRO'] = 'NO'
end

project.save

puts "✅ Applied comprehensive C++20 configuration to Xcode project"
puts "✅ This should resolve React Graphics C++20 concept compilation errors"
puts ""
puts "Next steps:"
puts "1. Clean build folder: rm -rf ~/Library/Developer/Xcode/DerivedData/LyoAILearningAssistant*"
puts "2. Clean Xcode build: Product > Clean Build Folder"
puts "3. Rebuild the project"
