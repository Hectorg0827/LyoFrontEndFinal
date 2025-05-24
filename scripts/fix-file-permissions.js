#!/usr/bin/env node

/**
 * Fix File Permissions Script
 *
 * This script fixes permissions on shell scripts and adds untracked files to Git
 * to prevent them from appearing red in VS Code.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Fixing File Permissions & Git Status ===');

// Function to run shell commands
function runCommand(cmd, silent = false) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    if (!silent) {
      console.error(`Command failed: ${cmd}`);
      console.error(error.message);
    }
    return null;
  }
}

// Function to recursively find files by extension
function findFilesByExtension(dir, ext, results = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      findFilesByExtension(filePath, ext, results);
    } else if (file.endsWith(ext)) {
      results.push(filePath);
    }
  });

  return results;
}

// Make all shell scripts executable
console.log('\n1. Making shell scripts executable...');
const scriptDir = path.join(process.cwd(), 'scripts');
const shellScripts = [
  ...findFilesByExtension(scriptDir, '.sh'),
];

shellScripts.forEach(script => {
  fs.chmodSync(script, 0o755); // rwxr-xr-x
  console.log(`✅ Made executable: ${path.relative(process.cwd(), script)}`);
});

// Check for untracked script files
console.log('\n2. Checking for untracked script files...');
const gitUntrackedOutput = runCommand('git ls-files --others --exclude-standard scripts/', true) || '';
const untrackedFiles = gitUntrackedOutput.trim().split('\n').filter(Boolean);

if (untrackedFiles.length > 0) {
  console.log(`Found ${untrackedFiles.length} untracked files in scripts directory.`);
  
  // Ask user if they want to add these files to Git
  console.log('\nFiles that would be added to Git:');
  untrackedFiles.forEach(file => console.log(`- ${file}`));
  
  console.log('\nTo add these files to Git (which will fix the red color):');
  console.log('Run: git add ' + untrackedFiles.join(' '));
  
  console.log('\n3. You can also add them all with:');
  console.log('git add scripts/*.js scripts/*.sh scripts/backup-shell-scripts/*.sh');
} else {
  console.log('No untracked script files found.');
}

console.log('\n=== Permissions Fix Complete ===');
console.log('Files should no longer appear red in VS Code after refreshing.');
