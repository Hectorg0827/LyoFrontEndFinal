#!/usr/bin/env node

const https = require('https');

const checkPackageCompatibility = (packageName) => {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const packageInfo = JSON.parse(data);
          const versions = Object.keys(packageInfo.versions);
          
          console.log(`\nAvailable versions for ${packageName}:`);
          console.log('------------------------------------------------');
          
          // Display the 10 most recent versions
          const recentVersions = versions.slice(-15);
          for (const version of recentVersions) {
            const packageJson = packageInfo.versions[version].dependencies || {};
            const peerDependencies = packageInfo.versions[version].peerDependencies || {};
            
            console.log(`Version: ${version}`);
            if (peerDependencies['react-native']) {
              console.log(`Compatible with React Native: ${peerDependencies['react-native']}`);
            }
            console.log('------------------------------------------------');
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Check react-native-safe-area-context compatibility
console.log('Checking compatibility for react-native-safe-area-context...');
checkPackageCompatibility('react-native-safe-area-context')
  .then(() => {
    console.log('Compatibility check complete.');
  })
  .catch((error) => {
    console.error('Error checking compatibility:', error);
  });
