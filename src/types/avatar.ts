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

// User preferences interface
export interface UserPreferences {
  voiceEnabled: boolean;
  animationsEnabled: boolean;
  avatarColor: string;
  voiceRate: number;
  voicePitch: number;
  learningInterests: string[];
  courseHistory: string[];
  accessibilityMode: boolean;
  subtitlesEnabled: boolean;
  avatarSize: "small" | "medium" | "large";
  avatarPersonality: "friendly" | "professional" | "cheerful" | "calm";
  autoHideAvatar: boolean;
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
