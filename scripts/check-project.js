const fs = require('fs');
const path = require('path');

// Function to add .gitattributes with pbxproj merge=union if not already present
function ensureGitAttributesHasMergeUnion() {
  const gitattributesPath = path.join(__dirname, '../.gitattributes');
  let content = '';
  
  if (fs.existsSync(gitattributesPath)) {
    content = fs.readFileSync(gitattributesPath, 'utf8');
  }
  
  if (!content.includes('*.pbxproj merge=union')) {
    content += '\n*.pbxproj merge=union\n';
    fs.writeFileSync(gitattributesPath, content);
    console.log('.gitattributes updated to include pbxproj merge=union');
  } else {
    console.log('.gitattributes already has pbxproj merge=union');
  }
}

// Check if pbxproj file exists and if it's valid
function checkPbxprojFile() {
  const pbxprojPath = path.join(__dirname, '../ios/LyoAILearningAssistant.xcodeproj/project.pbxproj');
  
  if (!fs.existsSync(pbxprojPath)) {
    console.log('project.pbxproj does not exist! Run npx expo prebuild --platform ios --clean to generate it');
    return false;
  }
  
  const content = fs.readFileSync(pbxprojPath, 'utf8');
  if (!content.trim()) {
    console.log('project.pbxproj is empty! Run npx expo prebuild --platform ios --clean to regenerate it');
    return false;
  }
  
  console.log('project.pbxproj exists and has content');
  
  // Check for IPHONEOS_DEPLOYMENT_TARGET and update if needed
  if (content.includes('IPHONEOS_DEPLOYMENT_TARGET')) {
    if (!content.includes('IPHONEOS_DEPLOYMENT_TARGET = 14.0')) {
      // We would need a more sophisticated parser to safely modify the Xcode project file
      // but that's beyond what we want to do here
      console.log('Found IPHONEOS_DEPLOYMENT_TARGET in project.pbxproj, but it may not be set to 14.0');
      console.log('The Podfile post_install hook should handle this for us');
    } else {
      console.log('Found IPHONEOS_DEPLOYMENT_TARGET = 14.0 in project.pbxproj');
    }
  } else {
    console.log('No IPHONEOS_DEPLOYMENT_TARGET found in project.pbxproj');
    console.log('The Podfile post_install hook should handle this for us');
  }
  
  return true;
}

// Main execution
console.log('Checking project files...');
ensureGitAttributesHasMergeUnion();
checkPbxprojFile();
console.log('Project check complete.');
