// Set up environment variables
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Environment {
  // API configuration
  API_URL: string;
  API_TIMEOUT: number;
  USE_BACKEND_API: boolean;
  
  // Environment
  ENVIRONMENT: "development" | "staging" | "production";
  
  // Storage
  STORAGE_PREFIX: string;
  AUTH_STORAGE_KEY: string;
  
  // Feature flags
  ENABLE_ANALYTICS: boolean;
  ENABLE_CRASH_REPORTING: boolean;
  ENABLE_NOTIFICATIONS: boolean;
  ENABLE_OFFLINE_MODE: boolean;
  
  // App version
  VERSION: string;
  BUILD_NUMBER: string;
  
  // Avatar settings
  AVATAR_OPTIMIZATION: boolean;
  AVATAR_FRAME_RATE: number;
  
  // Map API keys
  GOOGLE_MAPS_API_KEY: string;

  // Deep linking
  APP_SCHEME: string;
  
  // Cache settings
  CACHE_EXPIRY: number; // in seconds
  
  // Debug
  DEBUG_MODE: boolean;
}

// Default development environment
const DEV_ENV: Environment = {
  // API configuration
  API_URL: "http://localhost:8000/api/v1", // Will be dynamically updated for mobile
  API_TIMEOUT: 30000,
  USE_BACKEND_API: true, // Connect to real backend API
  
  // Environment
  ENVIRONMENT: "development",
  
  // Storage
  STORAGE_PREFIX: "lyo_dev_",
  AUTH_STORAGE_KEY: "lyo_dev_auth_token",
  
  // Feature flags
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  
  // App version
  VERSION: "1.0.0",
  BUILD_NUMBER: "1",
  
  // Avatar settings
  AVATAR_OPTIMIZATION: true,
  AVATAR_FRAME_RATE: 30,
  
  // Map API keys
  GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_API_KEY_DEV",

  // Deep linking
  APP_SCHEME: "lyoapp-dev",
  
  // Cache settings
  CACHE_EXPIRY: 86400, // 24 hours in seconds
  
  // Debug
  DEBUG_MODE: true,
};

// Staging environment
const STAGING_ENV: Environment = {
  // API configuration
  API_URL: "https://api-staging.lyobackendnew.com/api/v1",
  API_TIMEOUT: 30000,
  USE_BACKEND_API: true,
  
  // Environment
  ENVIRONMENT: "staging",
  
  // Storage
  STORAGE_PREFIX: "lyo_staging_",
  AUTH_STORAGE_KEY: "lyo_staging_auth_token",
  
  // Feature flags
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  
  // App version
  VERSION: "1.0.0",
  BUILD_NUMBER: "1",
  
  // Avatar settings
  AVATAR_OPTIMIZATION: true,
  AVATAR_FRAME_RATE: 30,
  
  // Map API keys
  GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_API_KEY_STAGING",

  // Deep linking
  APP_SCHEME: "lyoapp-staging",
  
  // Cache settings
  CACHE_EXPIRY: 86400, // 24 hours in seconds
  
  // Debug
  DEBUG_MODE: false,
};

// Production environment
const PROD_ENV: Environment = {
  // API configuration
  API_URL: "https://api.lyobackendnew.com/api/v1",
  API_TIMEOUT: 30000,
  USE_BACKEND_API: true,
  
  // Environment
  ENVIRONMENT: "production",
  
  // Storage
  STORAGE_PREFIX: "lyo_",
  AUTH_STORAGE_KEY: "lyo_auth_token",
  
  // Feature flags
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  
  // App version
  VERSION: "1.0.0",
  BUILD_NUMBER: "1",
  
  // Avatar settings
  AVATAR_OPTIMIZATION: true,
  AVATAR_FRAME_RATE: 30,
  
  // Map API keys
  GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_API_KEY_PROD",

  // Deep linking
  APP_SCHEME: "lyoapp",
  
  // Cache settings
  CACHE_EXPIRY: 86400, // 24 hours in seconds
  
  // Debug
  DEBUG_MODE: false,
};

// Use environment specific configuration
let ENV: Environment;

// Set the environment based on the EXPO_ENV variable or default to development
const currentEnv = process.env.EXPO_ENV || "development";

switch (currentEnv) {
  case "production":
    ENV = PROD_ENV;
    break;
  case "staging":
    ENV = STAGING_ENV;
    break;
  default:
    ENV = DEV_ENV;
}

// Add platform-specific overrides for mobile development
if (Platform.OS === "android") {
  // Android emulator uses 10.0.2.2 to access localhost
  if (ENV.ENVIRONMENT === "development") {
    ENV.API_URL = ENV.API_URL.replace("localhost", "10.0.2.2");
  }
}

// For iOS simulator and physical devices, you might need to use your computer's IP
// Uncomment and set your computer's IP address for testing on physical devices
// if (ENV.ENVIRONMENT === "development" && Platform.OS === "ios") {
//   ENV.API_URL = ENV.API_URL.replace("localhost", "192.168.1.XXX"); // Replace with your IP
// }

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof Pick<Environment, 
  'ENABLE_ANALYTICS' | 
  'ENABLE_CRASH_REPORTING' | 
  'ENABLE_NOTIFICATIONS' | 
  'ENABLE_OFFLINE_MODE' | 
  'AVATAR_OPTIMIZATION'
>): boolean => {
  return ENV[feature];
};

// This could be extended to allow runtime configuration overrides
// by loading from AsyncStorage in development mode
if (__DEV__) {
  // Example: Allow developers to override API URL for testing
  AsyncStorage.getItem('dev_api_url').then(url => {
    if (url) {
      console.log(`Overriding API URL with: ${url}`);
      ENV.API_URL = url;
    }
  }).catch(() => {});
}

export { ENV };
export default ENV;
