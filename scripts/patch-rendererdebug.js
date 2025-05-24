#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Patching React-rendererdebug Podspec ===');
console.log(`Current directory: ${process.cwd()}`);

// Paths
const sourceDir = path.join(process.cwd(), 'node_modules', 'react-native', 'ReactCommon', 'react', 'renderer', 'debug');
console.log(`Source directory: ${sourceDir}`);
const podspecPath = path.join(sourceDir, 'React-rendererdebug.podspec');
console.log(`Podspec path: ${podspecPath}`);
const destPath = path.join(process.cwd(), 'ios', 'Pods', 'React-rendererdebug.podspec');
console.log(`Destination path: ${destPath}`);

try {
    // 1. Read the original podspec file
    console.log(`Reading original podspec: ${podspecPath}`);
    const originalContent = fs.readFileSync(podspecPath, 'utf8');
    
    // 2. Patch the content - replace rct_cxx_language_standard() with explicit c++20
    const patchedContent = originalContent.replace(
        'CLANG_CXX_LANGUAGE_STANDARD" => rct_cxx_language_standard()',
        'CLANG_CXX_LANGUAGE_STANDARD" => "c++20"'
    );
    
    // 3. Add additional patch to force c++20 in compiler flags
    const finalPatchedContent = patchedContent.replace(
        's.compiler_flags         = folly_compiler_flags',
        's.compiler_flags         = folly_compiler_flags + " -std=c++20"'
    );
    
    // 4. Write the patched file to the destination
    console.log(`Creating patched podspec in iOS directory`);
    fs.writeFileSync(destPath, finalPatchedContent);
    
    console.log(`✅ Successfully patched React-rendererdebug.podspec to use C++20`);
    console.log(`\nNext steps:`);
    console.log(`1. Run 'cd ios && pod install' to apply the patch`);
    console.log(`2. Build the project again`);
    
} catch (error) {
    console.error(`❌ Error patching React-rendererdebug podspec: ${error.message}`);
}
