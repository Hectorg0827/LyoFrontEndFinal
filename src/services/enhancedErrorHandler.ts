// Enhanced error handling with automatic recovery and user feedback
import { AppError as AppErrorClass, ErrorType } from '../utils/AppError';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  autoRecover?: boolean;
  fallbackAction?: () => void;
  userMessage?: string;
}

interface ErrorMetrics {
  errorCount: number;
  lastErrorTime: number;
  errorTypes: Record<string, number>;
}

export class EnhancedErrorHandler {
  private static errorMetrics: ErrorMetrics = {
    errorCount: 0,
    lastErrorTime: 0,
    errorTypes: {},
  };

  private static config: {
    enableRecoveryStrategies?: boolean;
    enableUserNotifications?: boolean;
    maxRetryAttempts?: number;
  } = {};

  static initialize(config: {
    enableRecoveryStrategies?: boolean;
    enableUserNotifications?: boolean;
    maxRetryAttempts?: number;
  }): void {
    this.config = config;
    console.log('🛡️ Enhanced error handler initialized with config:', config);
  }

  private static recoveryStrategies = new Map<ErrorType, ErrorRecoveryOptions>([
    [ErrorType.Network, {
      maxRetries: 3,
      retryDelay: 2000,
      autoRecover: true,
      userMessage: 'Connection issue detected. Retrying...',
    }],
    [ErrorType.VoiceRecognition, {
      maxRetries: 2,
      retryDelay: 1000,
      autoRecover: true,
      userMessage: 'Voice recognition failed. Please try speaking again.',
    }],
    [ErrorType.VoiceSynthesis, {
      maxRetries: 1,
      retryDelay: 500,
      autoRecover: false,
      userMessage: 'Speech output unavailable. Text will be displayed instead.',
    }],
    [ErrorType.Storage, {
      maxRetries: 2,
      retryDelay: 1000,
      autoRecover: true,
      userMessage: 'Settings could not be saved. Retrying...',
    }],
    [ErrorType.Permissions, {
      maxRetries: 0,
      autoRecover: false,
      userMessage: 'Permission required to continue. Please check your settings.',
    }],
  ]);

  static createError(
    type: ErrorType,
    message: string,
    originalError?: any,
    statusCode?: number,
    details?: Record<string, any>,
  ): AppErrorClass {
    this.updateMetrics(type);
    return new AppErrorClass(type, message, originalError, statusCode, details);
  }

  static async handleErrorWithRecovery<T>(
    operation: () => Promise<T>,
    errorType: ErrorType,
    options?: Partial<ErrorRecoveryOptions>
  ): Promise<T> {
    const strategy = this.recoveryStrategies.get(errorType);
    const config = { ...strategy, ...options };
    
    let lastError: any;
    const maxAttempts = (config.maxRetries || 0) + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          // Final attempt failed
          const appError = this.createError(
            errorType,
            config.userMessage || 'Operation failed after multiple attempts',
            error
          );
          
          if (config.fallbackAction) {
            config.fallbackAction();
          }
          
          throw appError;
        }

        // Wait before retry
        if (config.retryDelay && attempt < maxAttempts) {
          await this.delay(config.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  static handleNetworkError(error: any): AppErrorClass {
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    
    if (isOffline) {
      return this.createError(
        ErrorType.Network,
        'No internet connection. Please check your network and try again.',
        error
      );
    }

    // Check for specific network error types
    if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
      return this.createError(
        ErrorType.Network,
        'Network connection failed. Please try again.',
        error
      );
    }

    if (error.code === 'TIMEOUT_ERROR') {
      return this.createError(
        ErrorType.Network,
        'Request timed out. Please check your connection and try again.',
        error
      );
    }

    return this.createError(
      ErrorType.Network,
      'Network request failed. Please check your connection and try again.',
      error
    );
  }

  static handleApiError(error: any): AppErrorClass {
    // Handle cases where error is already structured
    if (error.type && error.message) {
      return this.createError(error.type, error.message, error.originalError);
    }

    if (!error.response) {
      return this.handleNetworkError(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 400: {
        const message = data?.message || 'Invalid request. Please check your input and try again.';
        return this.createError(ErrorType.Validation, message, error, status, data);
      }
      case 401: {
        const message = 'Your session has expired. Please log in again.';
        return this.createError(ErrorType.Auth, message, error, status, data);
      }
      case 403: {
        const message = 'You do not have permission to perform this action.';
        return this.createError(ErrorType.Permissions, message, error, status, data);
      }
      case 404: {
        const message = 'The requested resource was not found.';
        return this.createError(ErrorType.NotFound, message, error, status, data);
      }
      case 429: {
        const message = data?.message || 'Too many requests. Please try again later.';
        return this.createError(ErrorType.RateLimit, message, error, status, data);
      }
      case 500:
      case 502:
      case 503:
      case 504: {
        const message = 'Server error. Our team has been notified and is working on the issue.';
        return this.createError(ErrorType.Server, message, error, status, data);
      }
      default: {
        const message = data?.message || `Unexpected error occurred (${status})`;
        return this.createError(ErrorType.Unknown, message, error, status, data);
      }
    }
  }

  static handleVoiceError(error: any, context: 'recognition' | 'synthesis'): AppErrorClass {
    const errorType = context === 'recognition' ? ErrorType.VoiceRecognition : ErrorType.VoiceSynthesis;
    
    // Common voice error patterns
    if (error.message?.includes('permission')) {
      return this.createError(
        ErrorType.Permissions,
        `Microphone permission is required for ${context}`,
        error
      );
    }

    if (error.message?.includes('not supported')) {
      return this.createError(
        errorType,
        `Voice ${context} is not supported on this device`,
        error
      );
    }

    if (error.message?.includes('network') || error.message?.includes('connection')) {
      return this.createError(
        ErrorType.Network,
        `Network connection required for voice ${context}`,
        error
      );
    }

    const defaultMessages = {
      recognition: 'Voice recognition failed. Please try again.',
      synthesis: 'Text-to-speech failed. Text will be displayed instead.',
    };

    return this.createError(
      errorType,
      defaultMessages[context],
      error
    );
  }

  static async handleStorageError(operation: () => Promise<any>, fallback?: any): Promise<any> {
    try {
      return await operation();
    } catch (error) {
      console.warn('Storage operation failed:', error);
      
      // Try to determine the specific storage issue
      if (error.message?.includes('quota')) {
        throw this.createError(
          ErrorType.Storage,
          'Storage quota exceeded. Please free up space and try again.',
          error
        );
      }

      if (error.message?.includes('private')) {
        throw this.createError(
          ErrorType.Storage,
          'Storage access denied. Please check your browser settings.',
          error
        );
      }

      // Return fallback value if provided
      if (fallback !== undefined) {
        console.log('Using fallback value for storage operation');
        return fallback;
      }

      throw this.createError(
        ErrorType.Storage,
        'Storage operation failed. Using default settings.',
        error
      );
    }
  }

  static getErrorMetrics(): ErrorMetrics {
    return { ...this.errorMetrics };
  }

  static resetMetrics(): void {
    this.errorMetrics = {
      errorCount: 0,
      lastErrorTime: 0,
      errorTypes: {},
    };
  }

  private static updateMetrics(errorType: ErrorType): void {
    this.errorMetrics.errorCount++;
    this.errorMetrics.lastErrorTime = Date.now();
    this.errorMetrics.errorTypes[errorType] = (this.errorMetrics.errorTypes[errorType] || 0) + 1;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility method for graceful degradation
  static withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => T | Promise<T>,
    errorMessage?: string
  ): Promise<T> {
    return primary().catch(async (error) => {
      console.warn(errorMessage || 'Primary operation failed, using fallback:', error);
      return await fallback();
    });
  }
}

// Re-export for backward compatibility
export const ErrorHandler = EnhancedErrorHandler;
export { ErrorType } from '../utils/AppError';
