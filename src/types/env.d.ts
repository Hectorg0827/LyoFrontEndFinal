declare module "@env" {
  // export const OPENAI_API_KEY: string | undefined; // Removed
  export const API_URL: string; // Existing
  export const ENVIRONMENT: "development" | "staging" | "production"; // Existing
  export const STORAGE_PREFIX: string; // Existing
  // export const GEMMA_API_KEY: string; // Removed - Backend concern
  export const API_BASE_URL: string; // Existing - This might be the same as API_URL or a more general base
  export const ANALYTICS_KEY: string; // Existing
  export const APP_ENV: "development" | "staging" | "production"; // Existing
  export const FEATURE_FLAGS: string; // Existing
  export const DEBUG_MODE: string; // Existing
  export const USE_BACKEND_API: string; // Existing - Should be boolean in env.ts
  export const API_TIMEOUT: string; // Existing
  // export const GEMMA_API_ENDPOINT: string; // Removed - Backend concern
  export const ANOTHER_VARIABLE: string; // Existing

  // LLM provider variables should be backend concerns
  // export const LLM_API_KEY: string; // Removed
  // export const LLM_API_URL: string; // Removed
  // export const LLM_MODEL_ID: string; // Removed
  // Add other environment variables here
}
