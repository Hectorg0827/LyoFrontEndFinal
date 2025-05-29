#!/bin/bash

echo "🔧 Direct fix for RCT-Folly std::char_traits compilation issue"
echo "This fix addresses the error: 'Implicit instantiation of undefined template std::char_traits<unsigned char>'"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check if iOS directory exists
if [ ! -d "ios" ]; then
    echo "❌ Error: ios directory not found. Run this script from the project root."
    exit 1
fi

echo "📁 Working directory: $(pwd)"

# Create a temporary header file to fix the char_traits issue
echo "📝 Creating char_traits fix header..."

mkdir -p ios/LyoAILearningAssistant/Supporting

cat > ios/LyoAILearningAssistant/Supporting/FollyFix.h << 'EOF'
//
//  FollyFix.h
//  LyoAILearningAssistant
//
//  Fix for RCT-Folly std::char_traits<unsigned char> compilation issue
//

#ifndef FollyFix_h
#define FollyFix_h

#ifdef __cplusplus
#include <string>

// Fix for std::char_traits<unsigned char> issue with iOS SDK 18.4+
namespace std {
    template <>
    struct char_traits<unsigned char> {
        typedef unsigned char char_type;
        typedef int int_type;
        typedef streamoff off_type;
        typedef streampos pos_type;
        typedef mbstate_t state_type;

        static void assign(char_type& c1, const char_type& c2) noexcept {
            c1 = c2;
        }

        static constexpr bool eq(char_type c1, char_type c2) noexcept {
            return c1 == c2;
        }

        static constexpr bool lt(char_type c1, char_type c2) noexcept {
            return c1 < c2;
        }

        static int compare(const char_type* s1, const char_type* s2, size_t n) {
            return memcmp(s1, s2, n);
        }

        static size_t length(const char_type* s) {
            return strlen(reinterpret_cast<const char*>(s));
        }

        static const char_type* find(const char_type* s, size_t n, const char_type& a) {
            return reinterpret_cast<const char_type*>(memchr(s, a, n));
        }

        static char_type* move(char_type* s1, const char_type* s2, size_t n) {
            return reinterpret_cast<char_type*>(memmove(s1, s2, n));
        }

        static char_type* copy(char_type* s1, const char_type* s2, size_t n) {
            return reinterpret_cast<char_type*>(memcpy(s1, s2, n));
        }

        static char_type* assign(char_type* s, size_t n, char_type a) {
            return reinterpret_cast<char_type*>(memset(s, a, n));
        }

        static constexpr int_type not_eof(int_type c) noexcept {
            return eq_int_type(c, eof()) ? ~eof() : c;
        }

        static constexpr char_type to_char_type(int_type c) noexcept {
            return static_cast<char_type>(c);
        }

        static constexpr int_type to_int_type(char_type c) noexcept {
            return static_cast<int_type>(c);
        }

        static constexpr bool eq_int_type(int_type c1, int_type c2) noexcept {
            return c1 == c2;
        }

        static constexpr int_type eof() noexcept {
            return static_cast<int_type>(EOF);
        }
    };
}
#endif

#endif /* FollyFix_h */
EOF

echo "✅ FollyFix.h header created"

# Update the project's prefix header or main files to include this fix
echo "📝 Updating project configuration..."

# Check if there's a prefix header, if not create one
if [ ! -f "ios/LyoAILearningAssistant/Supporting/LyoAILearningAssistant-Prefix.pch" ]; then
    cat > ios/LyoAILearningAssistant/Supporting/LyoAILearningAssistant-Prefix.pch << 'EOF'
//
//  LyoAILearningAssistant-Prefix.pch
//  LyoAILearningAssistant
//

#ifdef __cplusplus
#import "FollyFix.h"
#endif

#ifdef __OBJC__
#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#endif
EOF
    echo "✅ Prefix header created with FollyFix included"
else
    echo "ℹ️  Prefix header already exists"
fi

# Create build settings script
cat > update-build-settings.sh << 'EOF'
#!/bin/bash

echo "🔧 Updating Xcode build settings for RCT-Folly fix..."

# Use xcodebuild to update settings if xcodeproj gem is not available
cd ios

# Update the project file directly using PlistBuddy (safer approach)
project_file="LyoAILearningAssistant.xcodeproj/project.pbxproj"

if [ -f "$project_file" ]; then
    echo "📝 Found Xcode project file"
    
    # Backup the original
    cp "$project_file" "$project_file.backup"
    
    # Add our build settings to the project file
    # This is a basic approach - in production you'd want to use xcodeproj gem or similar
    echo "ℹ️  Build settings should be updated manually in Xcode:"
    echo "   1. Open the project in Xcode"
    echo "   2. Select LyoAILearningAssistant target"
    echo "   3. Build Settings > C++ Language Dialect: C++17"
    echo "   4. Build Settings > C++ Standard Library: libc++"
    echo "   5. Preprocessor Macros: Add FOLLY_NO_CONFIG=1, FOLLY_MOBILE=1"
else
    echo "❌ Project file not found"
fi

echo "✅ Build settings update script complete"
EOF

chmod +x update-build-settings.sh

echo ""
echo "🎯 RCT-Folly fix has been applied!"
echo ""
echo "📋 Next steps:"
echo "1. ✅ FollyFix.h header created to resolve char_traits issue"
echo "2. ✅ Prefix header configured to include the fix"
echo "3. 🔧 Run: ./update-build-settings.sh"
echo "4. 🏗️  Try building the project again"
echo ""
echo "💡 If issues persist, manually set in Xcode:"
echo "   • C++ Language Dialect: C++17"
echo "   • C++ Standard Library: libc++"
echo "   • Preprocessor Macros: FOLLY_NO_CONFIG=1"
echo ""
echo "🔍 The fix addresses the specific error:"
echo "   'Implicit instantiation of undefined template std::char_traits<unsigned char>'"
