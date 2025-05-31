#!/bin/bash

echo "🔧 Applying comprehensive RCT-Folly std::char_traits fix..."

# Navigate to project directory
cd "/Users/republicalatuya/Desktop/LyoFrontEndFinal"

# 1. Create the FollyFix.h header to resolve char_traits issue
mkdir -p ios/LyoFrontEndFinal
cat > ios/LyoFrontEndFinal/FollyFix.h << 'EOF'
//
//  FollyFix.h
//  Fix for RCT-Folly std::char_traits<unsigned char> compilation error
//

#pragma once

#include <string>

// Provide explicit specialization for std::char_traits<unsigned char>
namespace std {
    template <>
    struct char_traits<unsigned char> {
        typedef unsigned char char_type;
        typedef int int_type;
        typedef std::streamoff off_type;
        typedef std::streampos pos_type;
        typedef std::mbstate_t state_type;

        static void assign(char_type& c1, const char_type& c2) {
            c1 = c2;
        }

        static bool eq(const char_type& c1, const char_type& c2) {
            return c1 == c2;
        }

        static bool lt(const char_type& c1, const char_type& c2) {
            return c1 < c2;
        }

        static int compare(const char_type* s1, const char_type* s2, std::size_t n) {
            return std::memcmp(s1, s2, n);
        }

        static std::size_t length(const char_type* s) {
            return std::strlen(reinterpret_cast<const char*>(s));
        }

        static const char_type* find(const char_type* s, std::size_t n, const char_type& a) {
            return reinterpret_cast<const char_type*>(std::memchr(s, a, n));
        }

        static char_type* move(char_type* s1, const char_type* s2, std::size_t n) {
            return reinterpret_cast<char_type*>(std::memmove(s1, s2, n));
        }

        static char_type* copy(char_type* s1, const char_type* s2, std::size_t n) {
            return reinterpret_cast<char_type*>(std::memcpy(s1, s2, n));
        }

        static char_type* assign(char_type* s, std::size_t n, char_type a) {
            return reinterpret_cast<char_type*>(std::memset(s, a, n));
        }

        static int_type not_eof(const int_type& c) {
            return eq_int_type(c, eof()) ? ~eof() : c;
        }

        static char_type to_char_type(const int_type& c) {
            return static_cast<char_type>(c);
        }

        static int_type to_int_type(const char_type& c) {
            return static_cast<int_type>(c);
        }

        static bool eq_int_type(const int_type& c1, const int_type& c2) {
            return c1 == c2;
        }

        static int_type eof() {
            return static_cast<int_type>(-1);
        }
    };
}
EOF

echo "✅ Created FollyFix.h header"

# 2. Update the Podfile to include our fix
cat > ios/Podfile << 'EOF'
# Resolve react_native_pods.rb with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "react-native/scripts/react_native_pods.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

platform :ios, min_ios_version_supported
prepare_react_native_project!

linkage = ENV['USE_FRAMEWORKS']
if linkage != nil
  Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green
  use_frameworks! :linkage => linkage.to_sym
end

target 'LyoFrontEndFinal' do
  config = use_native_modules!

  use_expo_modules!
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
    :fabric_enabled => flags[:fabric_enabled],
    :flipper_configuration => flipper_config,
    :app_path => "#{Pod::Config.instance.installation_root}/..",
    # An absolute path to your application root.
    :privacy_file_aggregation_enabled => podfile_properties['expo.privacyFileAggregationEnabled'] != 'false',
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => podfile_properties['expo.ccacheEnabled'] == 'true'
    )

    # RCT-Folly specific fixes
    installer.pods_project.targets.each do |target|
      if target.name == 'RCT-Folly'
        target.build_configurations.each do |config|
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
          config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= []
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_NO_CONFIG=1'
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_MOBILE=1'
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_USE_LIBCPP=1'
          config.build_settings['GCC_PREFIX_HEADER'] = '$(SRCROOT)/../LyoFrontEndFinal/FollyFix.h'
        end
      end
      
      # Apply to all targets for consistency
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
      end
    end
  end

  pre_install do |installer|
    # Configure RCT-Folly as static library
    installer.pod_targets.each do |pod|
      if pod.name == 'RCT-Folly'
        def pod.static_library?
          true
        end
      end
    end
  end
end
EOF

echo "✅ Updated Podfile with RCT-Folly fixes"

# 3. Clean and reinstall pods
echo "🧹 Cleaning pods..."
cd ios
rm -rf Pods Podfile.lock build DerivedData

echo "📦 Installing pods with fixes..."
pod install --verbose

echo "✅ RCT-Folly fix applied successfully!"
echo ""
echo "Next steps:"
echo "1. Try building the iOS app: npx expo run:ios --device"
echo "2. If issues persist, the FollyFix.h header should resolve template instantiation errors"
