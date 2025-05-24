const fs = require('fs');
const path = require('path');

const podfilePath = path.join(__dirname, '../ios/Podfile');
let content = fs.readFileSync(podfilePath, 'utf8');

// Replace platform line
content = content.replace(
  /platform :ios, podfile_properties\['ios.deploymentTarget'\] \|\| '13.0'/,
  "platform :ios, '14.0'"
);

// Add deployment target settings to post_install hook
content = content.replace(
  /post_install do \|installer\|/,
  `post_install do |installer|
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0'
      end
    end
    
    installer.generated_projects.each do |project|
      project.targets.each do |target|
        target.build_configurations.each do |config|
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '14.0'
        end
      end
    end`
);

fs.writeFileSync(podfilePath, content);
console.log('Podfile patched successfully!');
