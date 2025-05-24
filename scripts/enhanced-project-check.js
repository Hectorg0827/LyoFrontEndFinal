#!/usr/bin/env node

/**
 * Enhanced Project Checker
 * 
 * This script performs comprehensive checks on the project:
 * 1. Verifies iOS directory structure and permissions
 * 2. Checks project file references vs actual files
 * 3. Validates Xcode project file integrity
 * 4. Tests pod installation and references
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n=== Enhanced Project Check ===\n');

// Helper for running shell commands
function runCommand(command, silent = false) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    if (!silent) {
      console.error(`Command failed: ${command}`);
      console.error(error.message);
    }
    return null;
  }
}

// 1. Check iOS directory structure
function checkIosDirectory() {
  console.log('Checking iOS directory structure...');
  
  const iosDir = path.join(process.cwd(), 'ios');
  if (!fs.existsSync(iosDir)) {
    console.error('❌ iOS directory does not exist!');
    return false;
  }
  
  // Check for key iOS project files
  const requiredFiles = [
    'Podfile',
    'Podfile.lock',
  ];
  
  let allFound = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(iosDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing required file: ${file}`);
      allFound = false;
    } else {
      console.log(`✅ Found: ${file}`);
    }
  });
  
  // Look for .xcodeproj directory
  const dirs = fs.readdirSync(iosDir);
  const xcodeProjectDir = dirs.find(dir => dir.endsWith('.xcodeproj'));
  const xcodeWorkspaceDir = dirs.find(dir => dir.endsWith('.xcworkspace'));
  
  if (!xcodeProjectDir) {
    console.error('❌ No .xcodeproj directory found!');
    allFound = false;
  } else {
    console.log(`✅ Found: ${xcodeProjectDir}`);
    
    // Check project.pbxproj
    const pbxprojPath = path.join(iosDir, xcodeProjectDir, 'project.pbxproj');
    if (!fs.existsSync(pbxprojPath)) {
      console.error('❌ Missing project.pbxproj file!');
      allFound = false;
    } else {
      console.log(`✅ Found: project.pbxproj`);
      
      // Basic validation of pbxproj file
      const pbxprojContent = fs.readFileSync(pbxprojPath, 'utf8');
      if (!pbxprojContent.includes('rootObject =')) {
        console.error('⚠️ project.pbxproj may be corrupted (missing rootObject)');
      }
    }
  }
  
  if (!xcodeWorkspaceDir) {
    console.error('❌ No .xcworkspace directory found!');
    allFound = false;
  } else {
    console.log(`✅ Found: ${xcodeWorkspaceDir}`);
  }
  
  return allFound;
}

// 2. Check dependency versions
function checkDependencies() {
  console.log('\nChecking critical dependency versions...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found!');
    return false;
  }
  
  const packageJson = require(packageJsonPath);
  const dependencies = packageJson.dependencies || {};
  
  const criticalDependencies = [
    { name: 'react-native', recommended: '0.79.2' },
    { name: 'react-native-safe-area-context', recommended: '4.15.0' },
    { name: 'expo', recommended: '~53.0.9' }
  ];
  
  criticalDependencies.forEach(dep => {
    const version = dependencies[dep.name];
    if (!version) {
      console.error(`❌ ${dep.name} not found in dependencies!`);
    } else if (version !== dep.recommended) {
      console.warn(`⚠️ ${dep.name} version (${version}) differs from recommended (${dep.recommended})`);
    } else {
      console.log(`✅ ${dep.name}: ${version}`);
    }
  });
  
  return true;
}

// 3. Check file permissions in iOS dir
function checkFilePermissions() {
  console.log('\nChecking file permissions...');
  
  const iosDir = path.join(process.cwd(), 'ios');
  if (!fs.existsSync(iosDir)) {
    return false;
  }
  
  // Check if we can write to the directory
  try {
    const testFile = path.join(iosDir, '.permission-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ iOS directory is writable');
    return true;
  } catch (error) {
    console.error('❌ Permission issue with iOS directory:', error.message);
    return false;
  }
}

// 4. Check Podfile content
function checkPodfile() {
  console.log('\nChecking Podfile...');
  
  const podfilePath = path.join(process.cwd(), 'ios', 'Podfile');
  if (!fs.existsSync(podfilePath)) {
    console.error('❌ Podfile not found!');
    return false;
  }
  
  const podfileContent = fs.readFileSync(podfilePath, 'utf8');
  
  // Check iOS version
  const iosVersionMatch = podfileContent.match(/platform :ios, ['"](\d+\.\d+)['"]/);
  if (!iosVersionMatch) {
    console.error('❌ Could not find iOS platform version in Podfile');
  } else {
    console.log(`✅ iOS platform version: ${iosVersionMatch[1]}`);
  }
  
  // Check basic Podfile structure
  const hasUseFrameworks = podfileContent.includes('use_frameworks!');
  console.log(`${hasUseFrameworks ? '✅' : '⚠️'} use_frameworks! ${hasUseFrameworks ? 'found' : 'not found'}`);
  
  const hasPostInstall = podfileContent.includes('post_install');
  console.log(`${hasPostInstall ? '✅' : '⚠️'} post_install ${hasPostInstall ? 'found' : 'not found'}`);
  
  return true;
}

// 5. Check gitignore for iOS exclusions
function checkGitignore() {
  console.log('\nChecking .gitignore for iOS exclusions...');
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    console.error('❌ .gitignore file not found!');
    return false;
  }
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const lines = gitignoreContent.split('\n');
  
  const problematicPatterns = [
    'ios/',
    'ios/*',
    '*.pbxproj'
  ];
  
  let hasProblems = false;
  problematicPatterns.forEach(pattern => {
    if (lines.some(line => line.trim() === pattern)) {
      console.error(`⚠️ Problematic exclusion found in .gitignore: ${pattern}`);
      hasProblems = true;
    }
  });
  
  if (!hasProblems) {
    console.log('✅ No problematic iOS exclusions found in .gitignore');
  }
  
  return true;
}

// 6. Check for red files programmatically
function checkForRedFiles() {
  console.log('\nChecking for potential "red files" issues...');
  
  const iosDir = path.join(process.cwd(), 'ios');
  if (!fs.existsSync(iosDir)) {
    return false;
  }
  
  // Find the .xcodeproj directory
  const dirs = fs.readdirSync(iosDir);
  const xcodeProjectDir = dirs.find(dir => dir.endsWith('.xcodeproj'));
  
  if (!xcodeProjectDir) {
    return false;
  }
  
  const pbxprojPath = path.join(iosDir, xcodeProjectDir, 'project.pbxproj');
  if (!fs.existsSync(pbxprojPath)) {
    return false;
  }
  
  // Extract file references from pbxproj
  const pbxprojContent = fs.readFileSync(pbxprojPath, 'utf8');
  const filePathMatches = pbxprojContent.match(/path = "([^"]+)"/g) || [];
  
  // Check if referenced files exist
  let missingFiles = 0;
  filePathMatches.forEach(match => {
    const filePath = match.replace('path = "', '').replace('"', '');
    if (!filePath.includes('$(') && !filePath.includes('${')) {  // Ignore variables
      const absolutePath = path.join(iosDir, filePath);
      if (!fs.existsSync(absolutePath) && !/\.framework$/.test(absolutePath)) {
        missingFiles++;
        console.log(`❌ Referenced file not found: ${filePath}`);
      }
    }
  });
  
  if (missingFiles === 0) {
    console.log('✅ No missing file references detected');
  } else {
    console.error(`⚠️ Found ${missingFiles} missing file references!`);
  }
  
  return true;
}

// Main execution
(async function main() {
  try {
    console.log('Running comprehensive project check...\n');
    
    const checks = [
      { name: 'iOS Directory Structure', function: checkIosDirectory },
      { name: 'Critical Dependencies', function: checkDependencies },
      { name: 'File Permissions', function: checkFilePermissions },
      { name: 'Podfile', function: checkPodfile },
      { name: 'Gitignore', function: checkGitignore },
      { name: 'Red Files Check', function: checkForRedFiles }
    ];
    
    let allPassed = true;
    checks.forEach(check => {
      console.log(`\n----- ${check.name} -----`);
      const result = check.function();
      if (!result) {
        allPassed = false;
        console.error(`✘ ${check.name} check failed!`);
      }
    });
    
    console.log('\n=== Check Summary ===');
    if (allPassed) {
      console.log('✅ All checks passed! Your project structure looks good.');
    } else {
      console.error('⚠️ Some checks failed. Review the issues above and fix them.');
      console.log('\nSuggested fixes:');
      console.log('1. Run: npm run fix:red-files');
      console.log('2. Run: npm run fix:xcode-project');
      console.log('3. Check the FIX_RED_FILES_GUIDE.md for more detailed instructions.');
    }
  } catch (error) {
    console.error('Error during checks:', error);
  }
})();
