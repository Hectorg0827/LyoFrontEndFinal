// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enhanced server configuration to handle all bundle routing scenarios
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, metroServer) => {
    return (req, res, next) => {
      const originalUrl = req.url;
      
      // Log all bundle requests for debugging
      if (originalUrl.includes('.bundle')) {
        console.log(`📦 Bundle request: ${originalUrl}`);
      }
      
      // Handle iOS app requests for expo AppEntry bundle
      if (originalUrl.includes('/node_modules/expo/AppEntry.bundle')) {
        const correctedUrl = originalUrl.replace('/node_modules/expo/AppEntry.bundle', '/index.bundle');
        req.url = correctedUrl;
        console.log(`🔀 Redirected: ${originalUrl} -> ${correctedUrl}`);
      }
      
      // Handle virtual metro entry requests
      if (originalUrl.includes('/.expo/.virtual-metro-entry.bundle')) {
        const correctedUrl = originalUrl.replace('/.expo/.virtual-metro-entry.bundle', '/index.bundle');
        req.url = correctedUrl;
        console.log(`🔀 Redirected virtual entry: ${originalUrl} -> ${correctedUrl}`);
      }
      
      return middleware(req, res, next);
    };
  },
};

// Ensure the resolver can find all necessary modules
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'native', 'web'],
};

module.exports = config;
