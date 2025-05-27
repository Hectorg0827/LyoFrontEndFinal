/**
 * Error types for the application
 */
export enum ErrorType {
  // Standard errors
  Network = "Network",
  Server = "Server",
  Validation = "Validation",
  Auth = "Auth",
  Unknown = "Unknown",
  ThirdParty = "ThirdParty",
  FileAccess = "FileAccess",
  Permissions = "Permissions",
  Timeout = "Timeout",
  Cancelled = "Cancelled",
  RateLimit = "RateLimit",
  NotFound = "NotFound",
  Conflict = "Conflict",
  Payment = "Payment",
  Database = "Database",
  Configuration = "Configuration",
  VoiceRecognition = "VoiceRecognition",
  VoiceSynthesis = "VoiceSynthesis",
  Storage = "Storage",
  AiService = "AiService",

  // Backwards compatibility with apiService
  NETWORK = "network_error",
  SERVER = "server_error",
  TIMEOUT = "timeout_error",
  AUTH = "authentication_error",
  VALIDATION = "validation_error",
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public type: ErrorType;
  public originalError?: any;
  public statusCode?: number;
  public details?: Record<string, any>;

  constructor(
    type: ErrorType,
    message: string,
    originalError?: any,
    statusCode?: number,
    details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name; // Use constructor.name for dynamic class name
    this.type = type;
    this.originalError = originalError;
    this.statusCode = statusCode;
    this.details = details;

    // This line is needed to restore the prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public logError(): void {
    console.error(`AppError: [${this.type}] ${this.message}`, {
      statusCode: this.statusCode,
      originalError: this.originalError,
      details: this.details,
      stack: this.stack,
    });
  }
  
  /**
   * Get a user-friendly error message
   */
  getUserFriendlyMessage(): string {
    switch (this.type) {
      case ErrorType.Network:
      case ErrorType.NETWORK:
        return "Network connection error. Please check your internet connection and try again.";
        
      case ErrorType.Server:
      case ErrorType.SERVER:
        return "The server encountered an error. Please try again later.";
        
      case ErrorType.Timeout:
      case ErrorType.TIMEOUT:
        return "The request timed out. Please try again.";
        
      case ErrorType.Auth:
      case ErrorType.AUTH:
        return "Authentication error. Please log in again.";
        
      case ErrorType.Permissions:
        return "You don't have permission to perform this action.";
        
      case ErrorType.NotFound:
        return "The requested resource was not found.";
        
      case ErrorType.RateLimit:
        return "You've made too many requests. Please try again later.";
        
      case ErrorType.Validation:
      case ErrorType.VALIDATION:
        return "Invalid input. Please check your information and try again.";
        
      case ErrorType.Storage:
        return "Error storing data. Please try again.";
        
      case ErrorType.AiService:
        return "The AI service is currently unavailable. Please try again later.";
        
      case ErrorType.VoiceRecognition:
        return "Voice recognition failed. Please try speaking again or use text input.";
        
      case ErrorType.VoiceSynthesis:
        return "Voice synthesis failed. Please try again or disable voice features.";
        
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }
}

/**
 * Error handler utility
 */
export const ErrorHandler = {
  /**
   * Create an AppError from any error
   */
  createError(type: ErrorType, message: string, originalError?: any, statusCode?: number, details?: Record<string, any>): AppError {
    return new AppError(type, message, originalError, statusCode, details);
  },
  
  /**
   * Get appropriate error type based on an HTTP status code
   */
  getErrorTypeFromStatus(status: number): ErrorType {
    if (status >= 500) return ErrorType.Server;
    if (status === 401) return ErrorType.Auth;
    if (status === 403) return ErrorType.Permissions;
    if (status === 404) return ErrorType.NotFound;
    if (status === 429) return ErrorType.RateLimit;
    if (status === 409) return ErrorType.Conflict;
    if (status >= 400) return ErrorType.Validation;
    return ErrorType.Unknown;
  },
  
  /**
   * Process an error and return an AppError
   */
  processError(error: any, source: string = "unknown"): AppError {
    console.error(`Error in ${source}:`, error);
    
    if (error instanceof AppError) {
      return error;
    }
    
    let errorType = ErrorType.Unknown;
    let errorMessage = "An unexpected error occurred";
    let statusCode: number | undefined = undefined;
    
    if (error?.response?.status) {
      // Handle axios-like errors
      statusCode = error.response.status;
      errorType = this.getErrorTypeFromStatus(statusCode);
      errorMessage = error.response.data?.message || error.message || errorMessage;
    } else if (error?.status) {
      // Handle fetch-like errors
      statusCode = error.status;
      errorType = this.getErrorTypeFromStatus(statusCode);
      errorMessage = error.data?.message || error.message || errorMessage;
    } else if (error instanceof Error) {
      // Handle standard JS errors
      errorMessage = error.message;
      
      // Try to determine error type from message
      if (error.message.includes("network") || error.message.includes("Network")) {
        errorType = ErrorType.Network;
      } else if (error.message.includes("timeout") || error.message.includes("Timeout")) {
        errorType = ErrorType.Timeout;
      }
    } else if (typeof error === "string") {
      // Handle string errors
      errorMessage = error;
    }
    
    return new AppError(errorType, errorMessage, error, statusCode);
  }
};