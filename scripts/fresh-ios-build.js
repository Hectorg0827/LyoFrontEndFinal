/**
 * fresh-ios-build.js
 * A clean approach to rebuilding the iOS project from scratch,
 * avoiding issues with the existing reset-ios-properly.js script
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const iosDir = path.join(projectRoot, 'ios');

// Logging helper
const log = (message) => console.log(`[fresh-ios] ${message}`);

// Command execution helper
const execute = (command, options = {}) => {
  log(`Running command: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    log(`Error executing command: ${command}`);
    log(error.toString());
    throw error;
  }
};

async function rebuildIOS() {
  try {
    log('Starting fresh iOS build process...');

    // Step 1: Clean up the environment
    log('Cleaning environment...');
    const derivedDataPath = path.join(process.env.HOME, 'Library/Developer/Xcode/DerivedData');
    if (fs.existsSync(derivedDataPath)) {
      await fs.remove(derivedDataPath);
      log('Removed Xcode DerivedData');
    }
    
    if (fs.existsSync(iosDir)) {
      await fs.remove(iosDir);
      log('Removed ios directory');
    }

    // Step 2: Regenerate iOS project with Expo
    log('Regenerating iOS project with Expo...');
    execute('npx expo prebuild --platform ios --clean');

    // Step 3: Check and ensure correct Podfile
    log('Verifying Podfile structure...');
    const podfilePath = path.join(iosDir, 'Podfile');
    if (!fs.existsSync(podfilePath)) {
      log('ERROR: Podfile not found after prebuild!');
      return;
    }

    // Step 4: Create a clean, minimal Podfile
    const existingPodfile = await fs.readFile(podfilePath, 'utf8');
    
    // Extract important elements from existing Podfile
    const targetNameMatch = existingPodfile.match(/target ['"]([^'"]+)['"]/);
    const targetName = targetNameMatch ? targetNameMatch[1] : 'LyoAILearningAssistant';
    
    // Create a clean Podfile
    const cleanPodfile = `
require File.join(File.dirname(\`node --print "require.resolve('expo/package.json')"\`), "scripts/autolinking")
require File.join(File.dirname(\`node --print "require.resolve('react-native/package.json')"\`), "scripts/react_native_pods")

require 'json'
podfile_properties = JSON.parse(File.read(File.join(__dir__, 'Podfile.properties.json'))) rescue {}

ENV['RCT_NEW_ARCH_ENABLED'] = '0' if podfile_properties['newArchEnabled'] == 'false'
ENV['EX_DEV_CLIENT_NETWORK_INSPECTOR'] = podfile_properties['EX_DEV_CLIENT_NETWORK_INSPECTOR']

# Force minimum iOS version to 15.0
platform :ios, '15.0'
install! 'cocoapods',
  :deterministic_uuids => false

prepare_react_native_project!

target '${targetName}' do
  use_expo_modules!

  config = use_native_modules!

  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
    :app_path => "#{Pod::Config.instance.installation_root}/..",
    :privacy_file_aggregation_enabled => podfile_properties['apple.privacyManifestAggregationEnabled'] != 'false'
  )
end

post_install do |installer|
  react_native_post_install(installer, config[:reactNativePath], :mac_catalyst_enabled => false)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
    end
  end
end
`.trim();

    await fs.writeFile(podfilePath, cleanPodfile);
    log('Created clean Podfile with iOS 15.0 target');

    // Step 5: Patch podspecs
    log('Patching podspecs...');
    execute('node scripts/patch-pods.js');

    // Step 6: Run pod install
    log('Installing pods...');
    execute('pod install', { cwd: iosDir });
    
    log('Fresh iOS build completed successfully! 🎉');
    log('You can now run: npx expo run:ios');
    
  } catch (error) {
    log('Fresh iOS build failed with error:');
    log(error.toString());
    process.exit(1);
  }
}

// Execute the function
rebuildIOS().catch(error => {
  log('Unhandled error:');
  log(error.toString());
  process.exit(1);
});
