#!/usr/bin/env node

/**
 * Fix Red Files in Xcode
 * 
 * This script addresses issues with red files in Xcode by:
 * 1. Checking .gitignore to ensure iOS files aren't excluded
 * 2. Rebuilding iOS project properly
 * 3. Ensuring proper file permissions
 * 4. Updating project references
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n=== Fixing Red Files in Xcode ===\n');

// Helper function to run commands
function runCommand(command, errorMessage) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${errorMessage || 'Command failed'}: ${error.message}`);
    return false;
  }
}

// 1. Check and modify .gitignore if needed
function updateGitIgnore() {
  console.log('Checking .gitignore file...');
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    let content = fs.readFileSync(gitignorePath, 'utf8');
    
    // Temporarily comment out iOS exclusions
    const originalContent = content;
    let modified = false;
    
    if (content.includes('# ios')) {
      console.log('iOS exclusions are already commented in .gitignore');
    } else if (content.includes('ios/')) {
      content = content.replace(/^ios\//gm, '# ios/');
      modified = true;
    }
    
    if (content.includes('ios/Pods/')) {
      content = content.replace(/^ios\/Pods\//gm, '# ios/Pods/');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(gitignorePath, content);
      console.log('Modified .gitignore to temporarily allow iOS files');
      
      // Save the original for restoration later
      fs.writeFileSync(`${gitignorePath}.backup`, originalContent);
    }
  } else {
    console.warn('.gitignore file not found');
  }
}

// 2. Make sure iOS directory exists and has proper permissions
function fixIosDirectory() {
  console.log('Checking iOS directory...');
  
  const iosDir = path.join(process.cwd(), 'ios');
  
  if (!fs.existsSync(iosDir)) {
    console.log('iOS directory does not exist, will be recreated by prebuild');
  } else {
    console.log('Setting proper permissions for iOS directory...');
    runCommand('chmod -R +rw ./ios', 'Failed to set permissions');
  }
}

// 3. Run the complete rebuild process
function rebuildIosProject() {
  console.log('\nRebuilding iOS project...\n');
  
  // Clean up any existing iOS build
  console.log('Cleaning previous build...');
  runCommand('rm -rf ios', 'Failed to remove iOS directory');
  runCommand('rm -rf ~/Library/Developer/Xcode/DerivedData', 'Failed to clean DerivedData');
  
  // Install dependencies
  console.log('\nInstalling dependencies...');
  if (!runCommand('npm install --legacy-peer-deps', 'Failed to install npm dependencies')) {
    return false;
  }
  
  // Run expo prebuild
  console.log('\nRunning expo prebuild...');
  if (!runCommand('npx expo prebuild --platform ios', 'Failed to prebuild iOS project')) {
    return false;
  }
  
  // Apply patches
  console.log('\nPatching Podfile and pods...');
  runCommand('node scripts/patch-podfile.js', 'Failed to patch Podfile');
  runCommand('node scripts/patch-pods.js', 'Failed to patch pods');
  
  // Install pods
  console.log('\nInstalling pods...');
  if (!runCommand('cd ios && pod install', 'Failed to install pods')) {
    return false;
  }
  
  return true;
}

// 4. Open Xcode using our script
function openXcode() {
  console.log('\nOpening Xcode workspace...');
  runCommand('sh scripts/open-xcode.sh', 'Failed to open Xcode');
}

// Main execution flow
(async function main() {
  try {
    updateGitIgnore();
    fixIosDirectory();
    
    if (rebuildIosProject()) {
      console.log('\n=== iOS project rebuilt successfully! ===');
      console.log('\nNext steps:');
      console.log('1. Wait for Xcode to completely open and index the project');
      console.log('2. If files are still red, close Xcode and run this script again');
      console.log('3. Try building the project with Product > Build');
      
      openXcode();
    } else {
      console.error('\n=== iOS rebuild failed, see errors above ===');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
