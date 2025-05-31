#!/bin/bash
# Fix for RCT-Folly std::char_traits issue with iOS SDK 18.4+

echo "🔧 Applying RCT-Folly fix for std::char_traits issue..."

# Navigate to project root
cd "$(dirname "$0")"

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/*LyoAILearningAssistant*

# Create patches directory if it doesn't exist
mkdir -p patches

# Create RCT-Folly patch
cat > patches/rct-folly-char-traits-fix.patch << 'EOF'
--- a/ios/Pods/RCT-Folly/folly/Range.h
+++ b/ios/Pods/RCT-Folly/folly/Range.h
@@ -47,6 +47,15 @@
 #include <folly/hash/SpookyHashV2.h>
 #include <folly/portability/Constexpr.h>
 
+// Fix for std::char_traits<unsigned char> issue with newer iOS SDK
+#if defined(__cplusplus) && __cplusplus >= 201703L
+namespace std {
+template <>
+struct char_traits<unsigned char> : public char_traits<char> {
+  using char_type = unsigned char;
+};
+}
+#endif
+
 namespace folly {
 
 template <class T>
EOF

echo "✅ RCT-Folly patch created"

# Apply additional Xcode project settings
echo "🔧 Updating build settings..."

# Create script to fix build settings in Xcode project
cat > fix-xcode-settings.rb << 'EOF'
require 'xcodeproj'

project_path = 'ios/LyoAILearningAssistant.xcodeproj'
project = Xcodeproj::Project.open(project_path)

project.targets.each do |target|
  if target.name == 'LyoAILearningAssistant'
    target.build_configurations.each do |config|
      # Set C++ language standard
      config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
      
      # Add preprocessor definitions
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_NO_CONFIG=1'
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_MOBILE=1'
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_USE_LIBCPP=1'
    end
  end
end

project.save
puts "Xcode project settings updated"
EOF

echo "✅ Build fix script ready"
echo ""
echo "🚀 To complete the fix:"
echo "1. Wait for pod install to complete"
echo "2. Run: ruby fix-xcode-settings.rb"
echo "3. Try building again"
echo ""
echo "If the issue persists, you can also try:"
echo "- Opening Xcode and setting C++ Language Dialect to 'C++17' manually"
echo "- Adding FOLLY_NO_CONFIG=1 to preprocessor definitions"
