#!/bin/zsh
# Direct fix for the duplicate outputs issue

PROJECT_FILE="/Users/republicalatuya/Desktop/LyoFrontEndFinal/ios/LyoAILearningAssistant.xcodeproj/project.pbxproj"

# Create backup
cp "${PROJECT_FILE}" "${PROJECT_FILE}.bak.$(date +%s)"

# Extract the current content
content=$(cat "${PROJECT_FILE}")

# Replace "react-native-bundle.timestamp" with "react-native-packager.timestamp" in the Start Packager section
# This is a very targeted replace that only affects the Start Packager section
updated_content=$(echo "${content}" | awk '
  BEGIN { in_start_packager = 0; }
  /FD10A7F022414F080027D42C.*Start Packager/ { in_start_packager = 1; }
  in_start_packager && /outputPaths = \(/ { in_output_paths = 1; }
  in_output_paths && /react-native-bundle\.timestamp/ { 
    sub(/react-native-bundle\.timestamp/, "react-native-packager.timestamp");
    in_output_paths = 0;
  }
  { print; }
')

# Write the updated content back
echo "${updated_content}" > "${PROJECT_FILE}"

echo "✅ Fixed duplicate outputs issue"
