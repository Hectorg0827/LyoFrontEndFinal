#!/bin/bash

# Manual C++20 xcconfig fix script
# Run this after pod install if C++20 settings are not applied

echo "=== Applying C++20 fixes to xcconfig files ==="

cd /Users/republicalatuya/Desktop/LyoFrontEndFinal/ios

DEBUG_XCCONFIG="Pods/Target Support Files/Pods-LyoAILearningAssistant/Pods-LyoAILearningAssistant.debug.xcconfig"
RELEASE_XCCONFIG="Pods/Target Support Files/Pods-LyoAILearningAssistant/Pods-LyoAILearningAssistant.release.xcconfig"

# Function to add C++20 settings to xcconfig file
apply_cpp20_fix() {
    local config_file="$1"
    local config_type="$2"
    
    echo "Applying C++20 fix to $config_type configuration..."
    
    # Check if C++20 settings already exist
    if grep -q "CLANG_CXX_LANGUAGE_STANDARD = c++20" "$config_file"; then
        echo "✅ C++20 settings already present in $config_type"
        return 0
    fi
    
    # Add C++20 settings
    echo "" >> "$config_file"
    echo "// C++20 Support for React Native concepts" >> "$config_file"
    echo "CLANG_CXX_LANGUAGE_STANDARD = c++20" >> "$config_file"
    echo "GCC_ENABLE_CPP_CONCEPTS = YES" >> "$config_file"
    
    # Update OTHER_CPLUSPLUSFLAGS to include C++20 flags
    if grep -q "OTHER_CPLUSPLUSFLAGS" "$config_file"; then
        # Append to existing OTHER_CPLUSPLUSFLAGS
        sed -i '' 's/OTHER_CPLUSPLUSFLAGS = \(.*\)/OTHER_CPLUSPLUSFLAGS = \1 -std=c++20 -fconcepts/' "$config_file"
    else
        # Add new OTHER_CPLUSPLUSFLAGS
        echo "OTHER_CPLUSPLUSFLAGS = -std=c++20 -fconcepts" >> "$config_file"
    fi
    
    echo "✅ Applied C++20 settings to $config_type"
}

# Apply fixes to both debug and release configurations
if [ -f "$DEBUG_XCCONFIG" ]; then
    apply_cpp20_fix "$DEBUG_XCCONFIG" "debug"
else
    echo "❌ Debug xcconfig file not found: $DEBUG_XCCONFIG"
fi

if [ -f "$RELEASE_XCCONFIG" ]; then
    apply_cpp20_fix "$RELEASE_XCCONFIG" "release"
else
    echo "❌ Release xcconfig file not found: $RELEASE_XCCONFIG"
fi

echo "=== C++20 xcconfig fixes completed ==="
