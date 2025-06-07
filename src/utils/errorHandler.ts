/**
 * Unified error handling utility for Lyo AI Learning Assistant
 */

/**
 * Error types for the application
 */
export enum ErrorType {
  // Network/API errors
  Network = "Network",
  Server = "Server",
  Validation = "Validation",
  Auth = "Auth",
  Timeout = "Timeout",
  RateLimit = "RateLimit",
  NotFound = "NotFound",
  Conflict = "Conflict",
  
  // Permissions & security
  Permissions = "Permissions",
  FileAccess = "FileAccess",
  
  // Operation errors
  Cancelled = "Cancelled",
  Payment = "Payment",
  Database = "Database",
  Configuration = "Configuration",
  Storage = "Storage",
  
  // Feature-specific errors
  VoiceRecognition = "VoiceRecognition",
  VoiceSynthesis = "VoiceSynthesis",
  AiService = "AiService",
  ThirdParty = "ThirdParty",
  
  // Fallback
  Unknown = "Unknown"
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public type: ErrorType;
  public originalError?: any;
  public statusCode?: number;
  public context?: string;
  public details?: Record<string, any>;

  constructor(
    type: ErrorType,
    message: string,
    originalError?: any,
    statusCode?: number,
    context?: string,
    details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.originalError = originalError;
    this.statusCode = statusCode;
    this.context = context;
    this.details = details;

    // Restore prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public logError(reportToSentry: boolean = true): void {
    console.error(`[${this.type}] ${this.message}`, {
      context: this.context,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
    });
    
    // Would integrate with Sentry in a production version
    if (reportToSentry) {
      try {
        // captureException(this);
        console.info('Would report to Sentry in production');
      } catch (e) {
        console.warn('Failed to report error to Sentry:', e);
      }
    }
  }
  
  /**
   * Get a user-friendly error message
   */
  getUserFriendlyMessage(): string {
    switch (this.type) {
      case ErrorType.Network:
        return "Network connection error. Please check your internet connection and try again.";
        
      case ErrorType.Server:
        return "The server encountered an error. Please try again later.";
        
      case ErrorType.Timeout:
        return "The request timed out. Please try again.";
        
      case ErrorType.Auth:
        return "Authentication error. Please log in again.";
        
      case ErrorType.Permissions:
        return "You don't have permission to perform this action.";
        
      case ErrorType.NotFound:
        return "The requested resource was not found.";
        
      case ErrorType.RateLimit:
        return "You've made too many requests. Please try again later.";
        
      case ErrorType.Validation:
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
export class ErrorHandler {
  /**
   * Create an AppError from any error
   */
  static createError(
    type: ErrorType, 
    message: string, 
    originalError?: any, 
    statusCode?: number, 
    context?: string,
    details?: Record<string, any>
  ): AppError {
    return new AppError(type, message, originalError, statusCode, context, details);
  }
  
  /**
   * Get appropriate error type based on an HTTP status code
   */
  static getErrorTypeFromStatus(status: number): ErrorType {
    if (status >= 500) {
      return ErrorType.Server;
    }
    if (status === 401) {
      return ErrorType.Auth;
    }
    if (status === 403) {
      return ErrorType.Permissions;
    }
    if (status === 404) {
      return ErrorType.NotFound;
    }
    if (status === 429) {
      return ErrorType.RateLimit;
    }
    if (status === 409) {
      return ErrorType.Conflict;
    }
    if (status >= 400) {
      return ErrorType.Validation;
    }
    return ErrorType.Unknown;
  }
  
  /**
   * Process an error and return an AppError
   */
  static processError(error: any, context: string = "unknown"): AppError {
    // If already an AppError, just add context if missing
    if (error instanceof AppError) {
      if (!error.context) {
        error.context = context;
      }
      return error;
    }
    
    let errorType = ErrorType.Unknown;
    let errorMessage = "An unexpected error occurred";
    let statusCode: number | undefined = undefined;
    
    // Handle API/Axios errors
    if (error?.response?.status) {
      statusCode = error.response.status;
      errorType = this.getErrorTypeFromStatus(statusCode);
      errorMessage = error.response.data?.message || error.message || errorMessage;
    } 
    // Handle fetch response errors
    else if (error?.status) {
      statusCode = error.status;
      if (typeof statusCode === 'number') {
        errorType = this.getErrorTypeFromStatus(statusCode);
      }
      errorMessage = error.data?.message || error.message || errorMessage;
    } 
    // Handle standard JS errors
    else if (error instanceof Error) {
      errorMessage = error.message;
      
      // Try to determine error type from message
      if (error.message.toLowerCase().includes("network") || 
          error.message.toLowerCase().includes("internet") ||
          error.message.toLowerCase().includes("offline")) {
        errorType = ErrorType.Network;
      } else if (error.message.toLowerCase().includes("timeout")) {
        errorType = ErrorType.Timeout;
      }
    } 
    // Handle string errors
    else if (typeof error === "string") {
      errorMessage = error;
    }
    
    const appError = new AppError(errorType, errorMessage, error, statusCode, context);
    appError.logError();
    return appError;
  }
  
  /**
   * Handle an error - process, log, and optionally display to user
   */
  static handleError(errorInfo: {
    error: any;
    context?: string;
    action?: string;
    userMessage?: string;
    showToUser?: boolean;
  }): AppError {
    const context = errorInfo.context || "unknown";
    const processedError = this.processError(errorInfo.error, context);
    
    // Log the error with additional context
    console.error(`[ErrorHandler] Error in ${context} - ${errorInfo.action || "Action"}:`, {
      error: processedError,
      userMessage: errorInfo.userMessage,
    });
    
    // TODO: Display error to user if showToUser is true
    // This would integrate with your app's toast/alert system
    
    return processedError;
  }
  
  /**
   * Check if an error is of a specific type
   */
  static isErrorType(error: any, errorType: ErrorType): boolean {
    if (error instanceof AppError) {
      return error.type === errorType;
    }
    
    // Handle legacy error type checking
    if (error?.type === errorType) {
      return true;
    }
    
    return false;
  }
}