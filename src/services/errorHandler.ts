/**
 * Central error handling utility for the application
 * Used to standardize error handling across different services
 */

import { AxiosError } from "axios";

import { AppError as AppErrorClass, ErrorType } from "../utils/AppError";

export class ErrorHandler {
  static createError(
    type: ErrorType,
    message: string,
    originalError?: any,
    statusCode?: number,
    details?: Record<string, any>,
  ): AppErrorClass {
    return new AppErrorClass(type, message, originalError, statusCode, details);
  }

  static handleNetworkError(error: any): AppErrorClass {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return new AppErrorClass(
        ErrorType.Network,
        "No internet connection. Please check your network and try again.",
        error,
      );
    }
    return new AppErrorClass(
      ErrorType.Network,
      "Network request failed. Please check your connection and try again.",
      error,
    );
  }

  static handleApiError(error: any): AppErrorClass {
    if (!error.response) {
      return this.handleNetworkError(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 400: {
        const message =
          data?.message ||
          "Invalid request. Please check your input and try again.";
        return new AppErrorClass(
          ErrorType.Validation,
          message,
          error,
          status,
          data,
        );
      }
      case 401: {
        const message = "Your session has expired. Please log in again.";
        return new AppErrorClass(ErrorType.Auth, message, error, status, data);
      }
      case 403: {
        const message = "You do not have permission to perform this action.";
        return new AppErrorClass(
          ErrorType.Permissions,
          message,
          error,
          status,
          data,
        );
      }
      case 404: {
        const message = "The requested resource was not found.";
        return new AppErrorClass(
          ErrorType.NotFound,
          message,
          error,
          status,
          data,
        );
      }
      case 429: {
        const message =
          data?.message || "Too many requests. Please try again later.";
        return new AppErrorClass(
          ErrorType.RateLimit,
          message,
          error,
          status,
          data,
        );
      }
      case 500:
      case 502:
      case 503:
      case 504: {
        const message =
          "Server error. Our team has been notified and is working on the issue.";
        return new AppErrorClass(
          ErrorType.Server,
          message,
          error,
          status,
          data,
        );
      }
      default: {
        const message =
          data?.message ||
          "An unexpected error occurred. Please try again later.";
        return new AppErrorClass(
          ErrorType.Unknown,
          message,
          error,
          status,
          data,
        );
      }
    }
  }

  static handleVoiceRecognitionError(error: any): AppErrorClass {
    return new AppErrorClass(
      ErrorType.VoiceRecognition,
      "Voice recognition failed. Please try speaking again clearly or switch to text input.",
      error,
    );
  }

  static handleAIServiceError(error: any): AppErrorClass {
    const errorMessage = error.message?.toLowerCase() || "";
    if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      return new AppErrorClass(
        ErrorType.RateLimit,
        "AI service usage limit reached. Please try again later.",
        error,
      );
    }
    if (error.originalError?.error?.type === "insufficient_quota") {
      return new AppErrorClass(
        ErrorType.RateLimit,
        error.originalError?.error?.message ||
          "OpenAI API quota exceeded. Please check your plan and billing details.",
        error,
      );
    }
    return new AppErrorClass(
      ErrorType.ThirdParty,
      "AI service is currently unavailable or encountered an error.",
      error,
    );
  }

  static handleStorageError(error: any): AppErrorClass {
    const errorMessage = error?.message?.toLowerCase() || "";
    if (
      errorMessage.includes("quotaexceedederror") ||
      errorMessage.includes("storage full")
    ) {
      return new AppErrorClass(
        ErrorType.Storage,
        "Storage space exceeded. Please free up space on your device.",
        error,
      );
    }
    if (errorMessage.includes("permission")) {
      return new AppErrorClass(
        ErrorType.Storage,
        "Storage access denied. Please check app permissions.",
        error,
      );
    }
    return new AppErrorClass(
      ErrorType.Storage,
      "Failed to access local storage. Some offline features may not work properly.",
      error,
    );
  }

  static processError(error: any, context?: string): AppErrorClass {
    let finalError: AppErrorClass;
    if (error instanceof AppErrorClass) {
      finalError = error;
    } else if (error.isAxiosError) {
      finalError = this.handleApiError(error as AxiosError);
    } else if (
      error.message &&
      (error.message.toLowerCase().includes("network") ||
        error.message.toLowerCase().includes("failed to fetch"))
    ) {
      finalError = this.handleNetworkError(error);
    } else {
      finalError = new AppErrorClass(
        ErrorType.Unknown,
        context
          ? `An unknown error occurred in ${context}`
          : "An unknown error occurred",
        error,
      );
    }
    console.error(
      `[ErrorHandler] Processed error in ${context || "Unknown context"}:`,
      finalError,
    );
    finalError.logError();
    return finalError;
  }

  static getErrorMessage(errorType: ErrorType): string {
    switch (errorType) {
      case ErrorType.Network:
        return "A network error occurred. Please check your connection and try again.";
      case ErrorType.Server:
        return "Our servers are experiencing issues. Please try again later.";
      case ErrorType.Validation:
        return "Invalid data provided. Please check your input.";
      case ErrorType.Auth:
        return "Authentication failed. Please log in again.";
      case ErrorType.ThirdParty:
        return "An error occurred with a third-party service.";
      case ErrorType.FileAccess:
        return "Error accessing a file. Please check permissions.";
      case ErrorType.Permissions:
        return "You do not have the necessary permissions.";
      case ErrorType.Timeout:
        return "The operation timed out. Please try again.";
      case ErrorType.Cancelled:
        return "The operation was cancelled.";
      case ErrorType.RateLimit:
        return "Too many requests. Please try again later.";
      case ErrorType.NotFound:
        return "The requested resource was not found.";
      case ErrorType.Conflict:
        return "There was a conflict with the current state of the resource.";
      case ErrorType.Payment:
        return "There was an issue with your payment. Please try again or contact support.";
      case ErrorType.Database:
        return "A database error occurred. Please try again later.";
      case ErrorType.Configuration:
        return "There is a configuration error. Please contact support.";
      case ErrorType.VoiceRecognition:
        return "Error with voice recognition. Please try again.";
      case ErrorType.Storage:
        return "Error with storage. Please check your storage and try again.";
      case ErrorType.Unknown:
        return "An unexpected error occurred. Please try again.";
      default: {
        const _exhaustiveCheck: never = errorType;
        console.warn(
          `Unhandled error type in getErrorMessage: ${_exhaustiveCheck}`,
        );
        return "An unexpected error occurred. Please try again.";
      }
    }
  }
}

export { ErrorType, AppErrorClass as AppError };
