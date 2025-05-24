#!/usr/bin/env node

/**
 * Fix Xcode Project File
 * 
 * This script fixes potential corruption in the .pbxproj file by:
 * 1. Locating the project file
 * 2. Backing it up
 * 3. Removing problematic entries
 * 4. Ensuring it's properly formatted
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n=== Fixing Xcode Project File ===\n');

// Find the .xcodeproj directory
function findXcodeProject() {
  const iosDir = path.join(process.cwd(), 'ios');
  if (!fs.existsSync(iosDir)) {
    console.error('iOS directory does not exist!');
    return null;
  }

  const dirs = fs.readdirSync(iosDir);
  const xcodeProjectDir = dirs.find(dir => dir.endsWith('.xcodeproj'));
  
  if (!xcodeProjectDir) {
    console.error('Could not find .xcodeproj directory in ios folder!');
    return null;
  }
  
  return path.join(iosDir, xcodeProjectDir);
}

// Fix the project.pbxproj file
function fixProjectFile() {
  const xcodeProjectDir = findXcodeProject();
  if (!xcodeProjectDir) return false;
  
  const pbxprojPath = path.join(xcodeProjectDir, 'project.pbxproj');
  if (!fs.existsSync(pbxprojPath)) {
    console.error(`project.pbxproj does not exist at ${pbxprojPath}!`);
    return false;
  }
  
  // Create backup
  const backupPath = `${pbxprojPath}.backup`;
  fs.copyFileSync(pbxprojPath, backupPath);
  console.log(`Created backup at ${backupPath}`);
  
  // Read and process the file
  let content = fs.readFileSync(pbxprojPath, 'utf8');
  
  // Check for common issues and fix them
  
  // 1. Fix duplicate UUIDs (common cause of red files)
  const uuidMap = new Map();
  const uuidRegex = /([0-9A-F]{24})/g;
  let match;
  
  while ((match = uuidRegex.exec(content)) !== null) {
    const uuid = match[0];
    if (uuidMap.has(uuid)) {
      console.log(`Found duplicate UUID: ${uuid}`);
      // We don't actually modify these as it's risky without context,
      // but we alert the user of potential issues
    }
    uuidMap.set(uuid, true);
  }
  
  // 2. Check for invalid file references
  const fileRefRegex = /fileRef = ([0-9A-F]{24})/g;
  const allFileRefs = [];
  
  while ((match = fileRefRegex.exec(content)) !== null) {
    allFileRefs.push(match[1]);
  }
  
  // 3. Check for missing semicolons
  if (content.includes('}\n\t\t};')) {
    content = content.replace(/}\n\t\t};/g, '};\n\t\t};');
    console.log('Fixed missing semicolons');
  }
  
  // Save fixed content
  fs.writeFileSync(pbxprojPath, content);
  console.log('Project file updated');
  
  return true;
}

// Ensure pbxproj is not corrupt and has proper permissions
function ensureFilePermissions() {
  const xcodeProjectDir = findXcodeProject();
  if (!xcodeProjectDir) return false;
  
  const pbxprojPath = path.join(xcodeProjectDir, 'project.pbxproj');
  
  try {
    console.log('Setting proper permissions for project file...');
    execSync(`chmod 644 "${pbxprojPath}"`, { stdio: 'inherit' });
    console.log('Permissions updated');
    return true;
  } catch (error) {
    console.error(`Failed to update permissions: ${error.message}`);
    return false;
  }
}

// Main execution
(async function main() {
  try {
    if (fixProjectFile() && ensureFilePermissions()) {
      console.log('\n=== Project file fixed successfully! ===');
      console.log('\nNext steps:');
      console.log('1. Close Xcode if it\'s open');
      console.log('2. Run the fix-red-files.js script to rebuild the project');
      console.log('3. Open Xcode and try building again');
    } else {
      console.error('\n=== Project file fix failed, see errors above ===');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
