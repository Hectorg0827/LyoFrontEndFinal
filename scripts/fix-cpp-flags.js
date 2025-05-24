#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Fixing C++ Compiler Flags ===');

// Print current directory for debugging
console.log(`Current directory: ${process.cwd()}`);
const pbxprojPath = path.join(process.cwd(), 'ios', 'Pods', 'Pods.xcodeproj', 'project.pbxproj');

try {
    console.log(`Checking ${pbxprojPath}`);
    if (!fs.existsSync(pbxprojPath)) {
        console.error('❌ Pods.xcodeproj/project.pbxproj file not found!');
        // List ios directory contents for debugging
        try {
            console.log('iOS directory contents:');
            console.log(fs.readdirSync(path.join(process.cwd(), 'ios')).join('\n'));
            
            if (fs.existsSync(path.join(process.cwd(), 'ios', 'Pods'))) {
                console.log('Pods directory contents:');
                console.log(fs.readdirSync(path.join(process.cwd(), 'ios', 'Pods')).join('\n'));
            }
        } catch (e) {
            console.error(`Error listing directories: ${e.message}`);
        }
        process.exit(1);
    }

    // Read the project.pbxproj file
    let content = fs.readFileSync(pbxprojPath, 'utf8');

    // Check if there are any React components using c++17 standard
    const reactComponentsWithCpp17 = content.includes('CLANG_CXX_LANGUAGE_STANDARD = "c++17"');
    
    if (reactComponentsWithCpp17) {
        // Replace c++17 with c++20
        content = content.replace(/CLANG_CXX_LANGUAGE_STANDARD = "c\+\+17"/g, 'CLANG_CXX_LANGUAGE_STANDARD = "c++20"');
        
        // Write the modified content back to the file
        fs.writeFileSync(pbxprojPath, content);
        console.log('✅ Updated C++ standard from c++17 to c++20 for React components');
    } else {
        console.log('ℹ️ No components using c++17 standard found, no changes needed');
    }

    // Add any other needed C++ flag fixes here
    console.log('\nFurther fixing pod specs for c++ standard compatibility...');
    
    const podsDir = path.join(process.cwd(), 'ios', 'Pods');
    const rendererdebugPodspecPath = path.join(podsDir, 'React-rendererdebug.podspec');
    
    if (fs.existsSync(rendererdebugPodspecPath)) {
        let podspecContent = fs.readFileSync(rendererdebugPodspecPath, 'utf8');
        
        // Check if we need to update React-rendererdebug.podspec
        if (!podspecContent.includes('c++20')) {
            podspecContent = podspecContent.replace(
                /spec\.compiler_flags = copts/g, 
                'spec.compiler_flags = copts + " -std=c++20"'
            );
            
            fs.writeFileSync(rendererdebugPodspecPath, podspecContent);
            console.log('✅ Updated React-rendererdebug.podspec to use c++20 standard');
        }
    }

    console.log('\n=== C++ Flags Fix Complete ===');
    console.log('Run "cd ios && pod install" to apply changes, then build the project again.');

} catch (error) {
    console.error(`❌ Error fixing C++ flags: ${error.message}`);
    process.exit(1);
}
