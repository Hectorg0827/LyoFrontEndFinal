const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running enhanced patch-pods.js for iOS 15.0 compatibility');

// Helper to ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Check if we have the expo-asset directory and create it if needed
const assetDir = path.join(__dirname, '../node_modules/expo-asset');
const assetIosDir = path.join(assetDir, 'ios');
ensureDirectoryExists(assetIosDir);

// Patch ExpoAsset.podspec
const assetPodspecPath = path.join(assetIosDir, 'ExpoAsset.podspec');

// The full podspec content we want to ensure is set correctly
const fullAssetPodspec = `
require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name = 'ExpoAsset'
  s.version = package['version']
  s.summary = package['description'] || 'Expo Asset'
  s.description = package['description'] || 'Expo Asset module'
  s.license = package['license'] || 'MIT'
  s.author = package['author'] || 'Expo'
  s.homepage = package['homepage'] || 'https://docs.expo.dev'
  s.platform = :ios, '15.0' # Hard-coded to 15.0
  s.swift_version = '5.4'
  s.source = { :git => 'https://github.com/expo/expo.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'

  s.source_files = "**/*.{h,m,swift}"

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
`.trim();

// Write our full podspec - overwriting any existing one to ensure it's correct
fs.writeFileSync(assetPodspecPath, fullAssetPodspec);
console.log('✅ ExpoAsset.podspec created/overwritten with iOS 15.0 target');

// Patch ExpoModulesCore.podspec too
const modulesCorePodspecPath = path.join(__dirname, '../node_modules/expo-modules-core/ExpoModulesCore.podspec');
if (fs.existsSync(modulesCorePodspecPath)) {
  try {
    let modulesCorePodspec = fs.readFileSync(modulesCorePodspecPath, 'utf8');
    
    if (modulesCorePodspec.includes("s.platform = :ios")) {
      const originalContent = modulesCorePodspec;
      modulesCorePodspec = modulesCorePodspec.replace(/s\.platform = :ios, ['"](\d+\.\d+)['"]/, "s.platform = :ios, '15.0'");
      
      if (originalContent !== modulesCorePodspec) {
        fs.writeFileSync(modulesCorePodspecPath, modulesCorePodspec);
        console.log('✅ ExpoModulesCore.podspec patched successfully for iOS 15.0');
      } else {
        console.log('ℹ️ ExpoModulesCore.podspec already has iOS 15.0 target');
      }
    } else {
      console.log('⚠️ ExpoModulesCore.podspec does not contain platform line to patch');
    }
  } catch (error) {
    console.error('❌ Error patching ExpoModulesCore.podspec:', error);
  }
} else {
  console.log('⚠️ ExpoModulesCore.podspec not found');
}

// Double check that the patch file doesn't cause conflicts with newer expo-asset
try {
  console.log('🔍 Checking for patch-package conflicts...');
  const patchPath = path.join(__dirname, '../patches');
  if (fs.existsSync(patchPath)) {
    const files = fs.readdirSync(patchPath);
    const assetPatchFiles = files.filter(file => file.startsWith('expo-asset+'));
    
    if (assetPatchFiles.length > 0) {
      console.log(`⚠️ Found patch files that might conflict: ${assetPatchFiles.join(', ')}`);
      console.log('ℹ️ Consider running: npx patch-package expo-asset');
    } else {
      console.log('✅ No conflicting patch files found');
    }
  }
} catch (error) {
  console.error('❌ Error checking patch files:', error);
}

console.log('✅ All podspecs patched for iOS 15.0 compatibility');
