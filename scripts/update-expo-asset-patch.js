#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n=== Updating patch for expo-asset ===\n');

const patchDir = path.join(process.cwd(), 'patches');
const oldPatchPath = path.join(patchDir, 'expo-asset+8.10.1.patch');
const newVersion = '10.0.10';
const newPatchPath = path.join(patchDir, `expo-asset+${newVersion}.patch`);

// Check if the old patch exists
if (!fs.existsSync(oldPatchPath)) {
  console.error(`Error: Old patch file not found at ${oldPatchPath}`);
  process.exit(1);
}

try {
  // Read the old patch content
  const oldPatchContent = fs.readFileSync(oldPatchPath, 'utf8');
  
  // Update the patch content with the new version
  const newPatchContent = oldPatchContent
    .replace(/expo-asset\+8\.10\.1/g, `expo-asset+${newVersion}`)
    .replace(/node_modules\/expo-asset/g, 'node_modules/expo-asset');
  
  // Write the new patch file
  fs.writeFileSync(newPatchPath, newPatchContent);
  
  console.log(`Created new patch file: ${newPatchPath}`);
  
  // Remove the old patch
  fs.unlinkSync(oldPatchPath);
  console.log(`Removed old patch file: ${oldPatchPath}`);
  
  // Re-apply the patch
  console.log('\nRe-applying the patch...');
  try {
    execSync('npx patch-package', { stdio: 'inherit' });
    console.log('\nPatch successfully applied!');
  } catch (error) {
    console.error('\nError applying patch:', error.message);
  }
  
} catch (error) {
  console.error(`Error updating patch: ${error.message}`);
}

console.log('\n=== Done ===\n');
