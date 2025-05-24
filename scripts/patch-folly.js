#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('=== Patching RCT-Folly.podspec ===');

// First, find the target podspec file
const podspecPath = path.join(process.cwd(), 'ios', 'Pods', 'RCT-Folly', 'RCT-Folly.podspec');

try {
    if (!fs.existsSync(podspecPath)) {
        console.error(`❌ Podspec file not found: ${podspecPath}`);
        process.exit(1);
    }

    // Read the original content
    let content = fs.readFileSync(podspecPath, 'utf8');

    // Check if it already includes the patch
    if (content.includes('# Patched for unsigned char template')) {
        console.log('✅ Podspec already patched. No changes needed.');
        process.exit(0);
    }

    // Add unique header for string_view compatibility with unsigned char
    const patchedContent = content.replace(
        'Pod::Spec.new do |spec|',
        'Pod::Spec.new do |spec|\n  # Patched for unsigned char template'
    );

    // Add our patch to add required headers for string_view with unsigned chars
    const finalContent = patchedContent.replace(
        's.dependency "boost"',
        's.dependency "boost"\n  s.compiler_flags = s.compiler_flags + " -DSTRING_VIEW_INCLUDE_CHAR_TRAITS=1"'
    );

    // Write the patched content back
    fs.writeFileSync(podspecPath, finalContent);
    console.log('✅ Successfully patched RCT-Folly.podspec for string_view compatibility');
    console.log('Run "cd ios && pod install" to apply changes');
} catch (error) {
    console.error(`❌ Error patching RCT-Folly.podspec: ${error.message}`);
}
