// /Users/republicalatuya/Desktop/LyoFrontEndFinal/src/types/avatar.ts
import React from "react"; // Added React import for Dispatch and SetStateAction
import { Animated } from "react-native";

// Define available avatar states
export type AvatarState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error"
  | "thinking";

// Voice recognition status
export type VoiceStatus =
  | "inactive"
  | "listening"
  | "processing"
  | "error"
  | "recording"
  | "requesting"
  | "speaking";

// User preferences interface - Comprehensive type with all possible fields
export interface UserPreferences {
  // Voice & Avatar Settings
  voiceEnabled: boolean;
  animationsEnabled: boolean;
  avatarColor: string;
  voiceRate: number;
  voicePitch: number;
  
  // Learning Preferences
  learningInterests: string[];
  courseHistory: string[];
  
  // Accessibility Settings
  accessibilityMode: boolean;
  subtitlesEnabled: boolean;
  
  // Appearance Settings
  avatarSize: "small" | "medium" | "large";
  avatarPersonality: "friendly" | "professional" | "cheerful" | "calm";
  autoHideAvatar: boolean;
  
  // Extended Settings (backend integration)
  preferredLanguage?: string;
  notificationSettings?: {
    newCourseRecommendations?: boolean;
    studyReminders?: boolean;
    communityUpdates?: boolean;
  };
  theme?: "light" | "dark" | "system";
}

// API version of UserPreferences for backend communication (all optional)
export interface ApiUserPreferences {
  voiceEnabled?: boolean;
  animationsEnabled?: boolean;
  avatarColor?: string;
  voiceRate?: number;
  voicePitch?: number;
  learningInterests?: string[];
  courseHistory?: string[];
  accessibilityMode?: boolean;
  subtitlesEnabled?: boolean;
  avatarSize?: "small" | "medium" | "large";
  avatarPersonality?: "friendly" | "professional" | "cheerful" | "calm";
  autoHideAvatar?: boolean;
  preferredLanguage?: string;
  notificationSettings?: {
    newCourseRecommendations?: boolean;
    studyReminders?: boolean;
    communityUpdates?: boolean;
  };
  theme?: "light" | "dark" | "system";
}

export interface AvatarPosition {
  // Exporting AvatarPosition as it's used in AvatarContextType
  x: number;
  y: number;
}

export interface AvatarContextType {
  isVisible: boolean;
  showAvatar: () => void;
  hideAvatar: () => void;
  toggleAvatar: () => void;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  avatarState: AvatarState;
  setAvatarState: React.Dispatch<React.SetStateAction<AvatarState>>;
  position: AvatarPosition;
  setPosition: React.Dispatch<React.SetStateAction<AvatarPosition>>;
  pulseAnimation: Animated.Value;
  scaleAnimation: Animated.Value;
  floatAnimation: Animated.Value;
  startPulseAnimation: () => () => void;
  stopPulseAnimation: () => void;
  startThinkingAnimation: () => void;
  stopThinkingAnimation: () => void;
  startSpeakingAnimation: () => void;
  stopSpeakingAnimation: () => void;
  startListeningAnimation: () => void;
  stopListeningAnimation: () => void;
  startErrorAnimation: () => void;
  startScaleAnimation: (toValue: number, duration?: number) => void;
  resetAnimations: () => void;
  voiceStatus: VoiceStatus;
  isListening: boolean;
  recognizedText: string;
  currentSubtitle: string;
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  startVoiceRecognition: () => Promise<void>;
  stopVoiceRecognition: () => Promise<void>;
  speakResponse: (text: string, onDone?: () => void) => Promise<void>;
  updateUserPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => Promise<void>;
}

// Performance and optimization types
export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  useNativeDriver: boolean;
  delay?: number;
}

export interface VoiceProcessingConfig {
  sampleRate: number;
  bitRate: number;
  channels: number;
  format: 'mp3' | 'wav' | 'm4a' | 'webm';
  maxDuration: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  animationFPS: number;
  voiceLatency: number;
  memoryUsage: number;
  errorRate: number;
  lastUpdated: number;
}

export interface AvatarOptimizationSettings {
  enablePerformanceMonitoring: boolean;
  reduceAnimationsOnLowEnd: boolean;
  adaptiveQuality: boolean;
  preloadAssets: boolean;
  cacheVoiceResponses: boolean;
  maxCacheSize: number;
}

// Enhanced error handling types
export interface ErrorRecoveryStrategy {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  fallbackAction?: () => void;
  userNotification: boolean;
}

export interface AvatarError {
  id: string;
  type: 'voice' | 'animation' | 'network' | 'permission' | 'storage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  recoveryStrategy: ErrorRecoveryStrategy;
  metadata?: Record<string, any>;
}

// Accessibility enhancements
export interface AccessibilityConfig {
  screenReaderEnabled: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  increasedTouchTargets: boolean;
  voiceGuidance: boolean;
  customTTSSettings?: {
    speed: number;
    pitch: number;
    volume: number;
  };
}

// Advanced user preferences with validation
export interface ValidatedUserPreferences extends UserPreferences {
  readonly isValid: boolean;
  readonly validationErrors: string[];
  readonly lastValidated: number;
}

// Context optimization types
export interface AvatarContextState {
  ui: {
    isVisible: boolean;
    isChatOpen: boolean;
    position: AvatarPosition;
  };
  behavior: {
    avatarState: AvatarState;
    voiceStatus: VoiceStatus;
    isListening: boolean;
  };
  content: {
    recognizedText: string;
    currentSubtitle: string;
  };
  preferences: UserPreferences;
  performance: PerformanceMetrics;
}

// Animation state management
export interface AnimationState {
  current: AvatarState;
  previous: AvatarState;
  isTransitioning: boolean;
  transitionStartTime: number;
  activeAnimations: Set<string>;
}

// Voice service state
export interface VoiceServiceState {
  status: VoiceStatus;
  isRecording: boolean;
  recordingStartTime?: number;
  lastTranscription?: string;
  speechQueue: Array<{
    id: string;
    text: string;
    priority: number;
    onComplete?: () => void;
  }>;
}

// Memory management
export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  animationInstances: number;
  listenerCount: number;
  cacheSize: number;
}
