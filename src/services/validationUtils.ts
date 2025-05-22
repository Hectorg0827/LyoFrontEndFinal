/**
 * Validation utilities for user input
 */

import { UserPreferences } from "./avatarService";

export const validateUserPreferences = (
  preferences: Partial<UserPreferences>,
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validate voice rate (should be between 0.5 and 2.0)
  if (preferences.voiceRate !== undefined) {
    if (typeof preferences.voiceRate !== "number") {
      errors.voiceRate = "Voice rate must be a number";
    } else if (preferences.voiceRate < 0.5 || preferences.voiceRate > 2.0) {
      errors.voiceRate = "Voice rate must be between 0.5 and 2.0";
    }
  }

  // Validate voice pitch (should be between 0.5 and 2.0)
  if (preferences.voicePitch !== undefined) {
    if (typeof preferences.voicePitch !== "number") {
      errors.voicePitch = "Voice pitch must be a number";
    } else if (preferences.voicePitch < 0.5 || preferences.voicePitch > 2.0) {
      errors.voicePitch = "Voice pitch must be between 0.5 and 2.0";
    }
  }

  // Validate avatar color (should be a valid hex color)
  if (preferences.avatarColor !== undefined) {
    if (typeof preferences.avatarColor !== "string") {
      errors.avatarColor = "Avatar color must be a string";
    } else if (!/^#[0-9A-F]{6}$/i.test(preferences.avatarColor)) {
      errors.avatarColor =
        "Avatar color must be a valid hex color (e.g. #FF5500)";
    }
  }

  // Validate avatar size
  if (preferences.avatarSize !== undefined) {
    if (!["small", "medium", "large"].includes(preferences.avatarSize)) {
      errors.avatarSize = "Avatar size must be one of: small, medium, large";
    }
  }

  // Validate avatar personality
  if (preferences.avatarPersonality !== undefined) {
    if (
      !["friendly", "professional", "cheerful", "calm"].includes(
        preferences.avatarPersonality,
      )
    ) {
      errors.avatarPersonality =
        "Avatar personality must be one of: friendly, professional, cheerful, calm";
    }
  }

  // Validate learning interests (should be an array of strings)
  if (preferences.learningInterests !== undefined) {
    if (!Array.isArray(preferences.learningInterests)) {
      errors.learningInterests = "Learning interests must be an array";
    } else {
      for (const interest of preferences.learningInterests) {
        if (typeof interest !== "string") {
          errors.learningInterests = "Learning interests must be strings";
          break;
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateInput = (
  input: string,
  options?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
  },
): { valid: boolean; error: string | null } => {
  const {
    required = false,
    minLength,
    maxLength,
    pattern,
    customValidator,
  } = options || {};

  // Check if required
  if (required && (!input || input.trim() === "")) {
    return { valid: false, error: "This field is required" };
  }

  // Check min length
  if (minLength !== undefined && input.length < minLength) {
    return { valid: false, error: `Must be at least ${minLength} characters` };
  }

  // Check max length
  if (maxLength !== undefined && input.length > maxLength) {
    return {
      valid: false,
      error: `Must be no more than ${maxLength} characters`,
    };
  }

  // Check pattern
  if (pattern && !pattern.test(input)) {
    return { valid: false, error: "Invalid format" };
  }

  // Run custom validator if provided
  if (customValidator) {
    const customError = customValidator(input);
    if (customError) {
      return { valid: false, error: customError };
    }
  }

  return { valid: true, error: null };
};
