// Set up environment variables
import { Platform } from "react-native";

export interface Environment {
  API_URL: string;
  API_TIMEOUT: number;
  ENVIRONMENT: "development" | "staging" | "production";
  STORAGE_PREFIX: string;
  USE_BACKEND_API: boolean;
  ENABLE_TELEMETRY: boolean;
  AUTH_STORAGE_KEY: string;
  DEBUG_MODE: boolean;
}

// Default development environment
const DEV_ENV: Environment = {
  API_URL: "http://localhost:3000/api", // Changed to a typical local backend URL
  API_TIMEOUT: 30000,
  ENVIRONMENT: "development",
  STORAGE_PREFIX: "lyo_dev_",
  USE_BACKEND_API: true, // Default to true for development with a local backend
  ENABLE_TELEMETRY: process.env.ENABLE_TELEMETRY === "true",
  AUTH_STORAGE_KEY: "lyo_dev_auth_token",
  DEBUG_MODE: process.env.DEBUG_MODE === "true",
};

// Staging environment
const STAGING_ENV: Environment = {
  API_URL: "https://api-staging.lyobackendnew.com/api",
  API_TIMEOUT: 30000,
  ENVIRONMENT: "staging",
  STORAGE_PREFIX: "lyo_staging_",
  USE_BACKEND_API: true,
  ENABLE_TELEMETRY: true,
  AUTH_STORAGE_KEY: "lyo_staging_auth_token",
  DEBUG_MODE: false,
};

// Production environment
const PROD_ENV: Environment = {
  API_URL: "https://api.lyobackendnew.com/api",
  API_TIMEOUT: 30000,
  ENVIRONMENT: "production",
  STORAGE_PREFIX: "lyo_",
  USE_BACKEND_API: true,
  ENABLE_TELEMETRY: true,
  AUTH_STORAGE_KEY: "lyo_auth_token",
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

// Add platform-specific overrides if needed
if (Platform.OS === "android") {
  // Android-specific overrides
}

export default ENV;
