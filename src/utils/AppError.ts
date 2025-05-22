export enum ErrorType {
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
  VoiceSynthesis = "VoiceSynthesis", // Added VoiceSynthesis
  Storage = "Storage",
  AiService = "AiService", // Added AiService
  // Add more specific error types as needed
}

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
}
