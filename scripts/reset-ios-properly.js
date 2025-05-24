const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const iosDir = path.join(projectRoot, 'ios');
const podfilePath = path.join(projectRoot, 'ios', 'Podfile');

const log = (message) => console.log(`[reset-ios-properly] ${message}`);
const executeCommand = (command, options = {}) => {
  log(`Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
    throw error; // Re-throw to stop the script if a command fails
  }
};

async function resetIOS() {
  log('Starting proper iOS project reset...');

  // 1. Clean Xcode derived data
  log('Cleaning Xcode derived data...');
  const derivedDataPath = path.join(process.env.HOME, 'Library/Developer/Xcode/DerivedData');
  if (fs.existsSync(derivedDataPath)) {
    executeCommand(`rm -rf "${derivedDataPath}"`);
  } else {
    log('Xcode derived data path not found, skipping cleanup.');
  }

  // 2. Remove ios directory
  log('Removing existing ios directory...');
  if (fs.existsSync(iosDir)) {
    await fs.remove(iosDir);
    log('ios directory removed.');
  } else {
    log('ios directory not found, skipping removal.');
  }

  // 3. Clean npm cache and node_modules, then reinstall
  log('Cleaning npm cache, removing node_modules and package-lock.json...');
  executeCommand('npm cache clean --force');
  await fs.remove(path.join(projectRoot, 'node_modules'));
  await fs.remove(path.join(projectRoot, 'package-lock.json')); // Or yarn.lock if using Yarn
  log('Reinstalling npm dependencies...');
  executeCommand('npm install --legacy-peer-deps');

  // 4. Run expo prebuild
  log('Running expo prebuild to regenerate ios project...');
  executeCommand('npx expo prebuild --platform ios --clean');

  // 5. Verify Podfile exists and set deployment target
  if (!fs.existsSync(podfilePath)) {
    log('Podfile not found after prebuild. This is unexpected.');
    // Attempt to create a basic Podfile if Expo didn't
    // This is a fallback and might indicate deeper issues with prebuild
    log('Attempting to create a basic Podfile...');
    const defaultPodfileContent = `
require_relative '../node_modules/expo/scripts/autolinking'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '15.0' # Ensure this is 15.0 or higher for Expo 53

target 'LyoAILearningAssistant' do
  use_expo_modules!
  post_integrate do |installer|
    begin
      expo_patch_react_imports!(installer)
    rescue => e
      Pod::UI.warn e
    end
  end

  config = use_native_modules!

  use_react_native!(
    path: config[:reactNativePath],
    hermes_enabled: ENV['RCT_NEW_ARCH_ENABLED'] == '1' || ENV['EXPO_USE_HERMES'] == '1',
    fabric_enabled: ENV['RCT_NEW_ARCH_ENABLED'] == '1',
    # Other options...
  )

  post_install do |installer|
    react_native_post_install(installer)
    # Set deployment target for all pods
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
      end
    end
  end
end
`;
    await fs.writeFile(podfilePath, defaultPodfileContent);
    log('Basic Podfile created. Please review it.');
  } else {
    log('Podfile found. Modifying iOS deployment target to 15.0...');
    // Read the existing Podfile content
    let podfileContent = fs.readFileSync(podfilePath, 'utf8');

    // Ensure the platform is set to 15.0
    podfileContent = podfileContent.replace(/platform :ios, ['"].*?['"]/, "platform :ios, '15.0'");

    // Remove any existing post_install block(s)
    podfileContent = podfileContent.replace(/post_install do \|installer\|[\s\S]*?end\s*/g, '');

    // Define the new post_install block (ensure proper newlines)
    const newPostInstall = `
  post_install do |installer|
    react_native_post_install(installer, config[:reactNativePath], :mac_catalyst_enabled => false)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
      end
    end
  end
`;

    // Insert the new block before the final "end" of the file
    podfileContent = podfileContent.replace(/(\nend\s*)$/m, `\n${newPostInstall}\n$1`);

    // Write the modified content back to the Podfile
    fs.writeFileSync(podfilePath, podfileContent);
    log('Podfile modified to set IPHONEOS_DEPLOYMENT_TARGET to 15.0 for all targets.');
  }

  // 6. Run pod install
  log('Running pod install...');
  executeCommand('pod install', { cwd: iosDir });
  
  // 7. Patch podspecs (if necessary, e.g., from patch-pods.js)
  log('Running patch:pods script...');
  executeCommand('npm run patch:pods');


  // 8. Run project checks (if necessary, e.g., from check-project.js)
  log('Running check:project script...');
  executeCommand('npm run check:project');

  log('Proper iOS project reset completed successfully!');
  log('You should now be able to build the project using "npx expo run:ios" or Xcode.');
}

resetIOS().catch(error => {
  console.error('Failed to reset iOS project properly:', error);
  process.exit(1);
});
