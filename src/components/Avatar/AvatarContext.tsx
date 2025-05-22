import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { Animated, Easing, Platform as _Platform } from "react-native"; // Renamed Platform to _Platform

import { avatarService } from "../../services/avatarService";
import { ErrorHandler } from "../../services/errorHandler";
import { validateUserPreferences } from "../../services/validationUtils";
import {
  AvatarState,
  VoiceStatus,
  UserPreferences,
  AvatarContextType,
} from "../../types/avatar"; // Import types

// Define available avatar states
// export type AvatarState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'thinking'; // Moved to types/avatar.ts

interface AvatarPosition {
  x: number;
  y: number;
}

// Voice recognition status
// export type VoiceStatus = 'inactive' | 'listening' | 'processing' | 'error' | 'recording' | 'requesting' | 'speaking'; // Moved to types/avatar.ts

// User preferences interface - This should be the single source of truth for the shape of userPreferences
// interface UserPreferences { // Moved to types/avatar.ts
//   voiceEnabled: boolean;
//   animationsEnabled: boolean;
//   avatarColor: string;
//   voiceRate: number;
//   voicePitch: number;
//   learningInterests: string[];
//   courseHistory: string[];
//   accessibilityMode: boolean;
//   subtitlesEnabled: boolean;
//   avatarSize: 'small' | 'medium' | 'large';
//   avatarPersonality: 'friendly' | 'professional' | 'cheerful' | 'calm';
//   autoHideAvatar: boolean;
// }

// interface AvatarContextType { // Moved to types/avatar.ts
//   isVisible: boolean;
//   showAvatar: () => void;
//   hideAvatar: () => void;
//   toggleAvatar: () => void;
//   isChatOpen: boolean;
//   openChat: () => void;
//   closeChat: () => void;
//   avatarState: AvatarState;
//   setAvatarState: React.Dispatch<React.SetStateAction<AvatarState>>;
//   position: AvatarPosition; // Use AvatarPosition type
//   setPosition: React.Dispatch<React.SetStateAction<AvatarPosition>>; // Use AvatarPosition type
//   pulseAnimation: Animated.Value;
//   scaleAnimation: Animated.Value;
//   floatAnimation: Animated.Value;
//   startPulseAnimation: () => (() => void); // Matches existing return type
//   stopPulseAnimation: () => void;
//   startThinkingAnimation: () => void;
//   stopThinkingAnimation: () => void;
//   startSpeakingAnimation: () => void;
//   stopSpeakingAnimation: () => void;
//   startListeningAnimation: () => void;
//   stopListeningAnimation: () => void;
//   startErrorAnimation: () => void;
//   startScaleAnimation: (toValue: number, duration?: number) => void;
//   resetAnimations: () => void;
//   voiceStatus: VoiceStatus;
//   isListening: boolean;
//   recognizedText: string;
//   currentSubtitle: string;
//   userPreferences: UserPreferences;
//   setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
//   startVoiceRecognition: () => Promise<void>;
//   stopVoiceRecognition: () => Promise<void>;
//   speakResponse: (text: string, onDone?: () => void) => Promise<void>;
//   updateUserPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
// }

// Create context with default values
const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const useAvatar = () => {
  const context = useContext(AvatarContext); // Correctly use useContext
  if (context === undefined) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }
  return context;
};

interface AvatarProviderProps {
  children: React.ReactNode;
}

export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    voiceEnabled: true,
    animationsEnabled: true,
    avatarColor: "default",
    voiceRate: 1.0,
    voicePitch: 1.0,
    learningInterests: [],
    courseHistory: [],
    accessibilityMode: false,
    subtitlesEnabled: false,
    avatarSize: "medium",
    avatarPersonality: "friendly",
    autoHideAvatar: false,
  });
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("inactive");
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [position, setPosition] = useState<AvatarPosition>({ x: 0, y: 0 }); // Use AvatarPosition type
  const recordingRef = useRef<Audio.Recording | undefined>();
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const stopCurrentAnimationRef = useRef<(() => void) | null>(null);
  const accessibilityAnimationControlRef =
    useRef<Animated.CompositeAnimation | null>(null);
  const cleanupAccessibilityAnimationRef = useRef<(() => void) | null>(null);

  // Define speakResponse first
  const speakResponse = useCallback(
    async (text: string, onDone?: () => void) => {
      if (!userPreferences.voiceEnabled) {
        if (onDone) {
          onDone();
        }
        return;
      }
      setAvatarState("speaking");
      setVoiceStatus("speaking");
      setCurrentSubtitle(text); // Show subtitles while speaking

      try {
        // Configure speech options based on user preferences
        const options: Speech.SpeechOptions = {
          rate: userPreferences.voiceRate,
          pitch: userPreferences.voicePitch,
          onDone: () => {
            setAvatarState("idle");
            setVoiceStatus("inactive");
            setCurrentSubtitle(""); // Clear subtitles after speaking
            if (onDone) {
              onDone();
            }
          },
          onStopped: () => {
            // Handle cases where speech might be stopped prematurely
            setAvatarState("idle");
            setVoiceStatus("inactive");
            setCurrentSubtitle("");
          },
          onError: (error) => {
            console.error("Speech error:", error);
            ErrorHandler.handleApiError({
              // Ensure this matches the actual signature if it's a direct call
              type: ErrorType.VoiceSynthesis, // Changed from ErrorType.Speech
              message: "Error during speech synthesis.",
              originalError: error,
            });
            setAvatarState("error");
            setVoiceStatus("error");
            setCurrentSubtitle("");
            if (onDone) {
              // Still call onDone if provided
              onDone();
            }
          },
        };
        Speech.speak(text, options);
      } catch (error) {
        console.error("Failed to speak:", error);
        ErrorHandler.handleApiError({
          // Ensure this matches the actual signature
          type: ErrorType.VoiceSynthesis, // Changed from ErrorType.Speech
          message: "Speech synthesis failed to start.",
          originalError: error,
        });
        setAvatarState("error");
        setVoiceStatus("error");
        setCurrentSubtitle("");
        if (onDone) {
          onDone();
        }
      }
    },
    [
      userPreferences.voiceEnabled,
      userPreferences.voiceRate,
      userPreferences.voicePitch,
      setAvatarState,
      setVoiceStatus,
      setCurrentSubtitle,
    ],
  ); // Removed ErrorHandler, ErrorType from deps as they are static/enum

  const startVoiceRecognition = useCallback(async () => {
    // Reset states
    setRecognizedText("");
    setVoiceStatus("requesting");
    setAvatarState("listening");
    setIsListening(true); // Explicitly set isListening

    try {
      console.log("Requesting audio permissions...");
      const permissionsResponseResult: Audio.PermissionResponse =
        await Audio.requestPermissionsAsync();
      console.log("Permissions response:", permissionsResponseResult);

      if (permissionsResponseResult.status !== Audio.PermissionStatus.GRANTED) {
        ErrorHandler.handleApiError({
          type: ErrorType.Permissions,
          message: "Audio recording permission not granted.",
        });
        setVoiceStatus("error");
        setAvatarState("error");
        setIsListening(false);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log("Audio mode set.");

      if (recordingRef.current) {
        console.log("Stopping existing recording (if any)...");
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = undefined;
      }

      console.log("Starting new recording...");
      const newRecordingInstance = new Audio.Recording();
      await newRecordingInstance.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await newRecordingInstance.startAsync();
      recordingRef.current = newRecordingInstance;
      setVoiceStatus("recording");
      console.log("Recording started.");
    } catch (error) {
      console.error("Error during voice recognition setup:", error);
      const specificErrorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start voice recognition during setup.";
      ErrorHandler.handleApiError({
        type: ErrorType.VoiceRecognition,
        message: specificErrorMessage,
        originalError: error,
      });
      setVoiceStatus("error");
      setAvatarState("error");
      setIsListening(false);
      if (recordingRef.current) {
        // Removed nested try-catch, error during unload will be caught by the outer try-catch
        // console.error("Error stopping/unloading recording on error:", unloadError); // This specific log would be lost
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = undefined;
      }
    }
  }, [
    userPreferences.voiceEnabled,
    recordingRef,
    setIsListening,
    setVoiceStatus,
    setAvatarState,
    setRecognizedText,
    speakResponse,
  ]); // Removed avatarService, ErrorHandler, ErrorType from deps

  const stopVoiceRecognition = useCallback(async () => {
    if (!recordingRef.current) {
      return;
    }

    setIsListening(false);
    setVoiceStatus("processing");
    setAvatarState("thinking");

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = undefined;

      if (!uri) {
        ErrorHandler.handleApiError({
          // Ensure this matches the actual signature
          type: ErrorType.VoiceRecognition,
          message: "Failed to get recording URI.",
        });
        setVoiceStatus("error");
        setAvatarState("error");
        setTimeout(() => {
          setVoiceStatus("inactive");
          setAvatarState("idle");
        }, 3000);
        return;
      }

      const result = await avatarService.startVoiceRecognition(uri);

      if (!result || result.trim() === "") {
        ErrorHandler.handleApiError({
          // Ensure this matches the actual signature
          type: ErrorType.VoiceRecognition,
          message: "Transcription returned empty or failed.",
        });
        setRecognizedText("");
        setVoiceStatus("error");
        setAvatarState("error");
        setTimeout(() => {
          setVoiceStatus("inactive");
          setAvatarState("idle");
        }, 3000);
        return;
      }

      setRecognizedText(result);
      setAvatarState("processing");

      const response = await avatarService.generateResponse(result);

      if (userPreferences.voiceEnabled) {
        await speakResponse(response);
      } else {
        setAvatarState("idle");
        setVoiceStatus("inactive");
      }
    } catch (error) {
      ErrorHandler.handleApiError({
        // Ensure this matches the actual signature
        type: ErrorType.AiService, // This seems correct
        message: "Error processing voice or generating AI response.",
        // error: error as Error, // originalError is usually the property name
        originalError: error as Error,
      });
      setVoiceStatus("error");
      setAvatarState("error");
      setTimeout(() => {
        setVoiceStatus("inactive");
        setAvatarState("idle");
      }, 3000);
    }
  }, [
    userPreferences.voiceEnabled,
    speakResponse,
    avatarService,
    recordingRef,
    setIsListening,
    setVoiceStatus,
    setAvatarState,
    setRecognizedText,
  ]); // Removed ErrorHandler from deps

  // Animation functions
  const startScaleAnimation = useCallback(
    (toValue: number, duration = 300) => {
      if (!userPreferences.animationsEnabled) {
        return;
      }
      Animated.timing(scaleAnim, {
        toValue,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    },
    [userPreferences.animationsEnabled, scaleAnim],
  );

  // Idle floating animation
  const startFloatAnimation = useCallback(() => {
    const floatAnimSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 5,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    floatAnimSequence.start();
    return () => floatAnimSequence.stop();
  }, [floatAnim]);

  // Listening pulse animation
  const startPulseAnimation = useCallback(() => {
    const pulseAnimLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimLoop.start();
    return () => pulseAnimLoop.stop();
  }, [pulseAnim]);

  // Effect to manage animations based on avatarState
  useEffect(() => {
    const currentAnimationStopper = stopCurrentAnimationRef.current;
    if (currentAnimationStopper) {
      currentAnimationStopper();
      stopCurrentAnimationRef.current = null;
    }

    // Reset animations to base state before starting a new one
    floatAnim.stopAnimation();
    floatAnim.setValue(0);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);

    if (!userPreferences.animationsEnabled) {
      return; // Do nothing if animations are disabled
    }

    let newAnimationStopper: (() => void) | null = null;

    switch (avatarState) {
      case "idle": {
        newAnimationStopper = startFloatAnimation();
        break;
      }
      case "listening": {
        newAnimationStopper = startPulseAnimation();
        break;
      }
      case "processing": {
        const processing = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.9,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        );
        processing.start();
        newAnimationStopper = () => {
          processing.stop();
          pulseAnim.setValue(1); // Reset value
        };
        break;
      }
      case "speaking": {
        const speaking = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.9,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        );
        speaking.start();
        newAnimationStopper = () => {
          speaking.stop();
          pulseAnim.setValue(1); // Reset value
        };
        break;
      }
      case "error": {
        const error = Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]);
        error.start();
        newAnimationStopper = () => {
          error.stop();
          scaleAnim.setValue(1); // Reset value
        };
        break;
      }
      case "thinking": {
        const thinking = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.95,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        );
        thinking.start();
        newAnimationStopper = () => {
          thinking.stop();
          pulseAnim.setValue(1); // Reset value
        };
        break;
      }
      default: {
        // It's good practice to have a default case, even if empty.
        break;
      }
    }
    if (newAnimationStopper) {
      stopCurrentAnimationRef.current = newAnimationStopper;
    }

    return () => {
      const currentStopper = stopCurrentAnimationRef.current;
      if (currentStopper) {
        currentStopper();
        stopCurrentAnimationRef.current = null;
      }
    };
  }, [
    avatarState,
    userPreferences.animationsEnabled,
    startFloatAnimation,
    startPulseAnimation,
    floatAnim,
    pulseAnim,
    scaleAnim,
  ]);

  // Load user preferences from storage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPrefs = await avatarService.getUserPreferences();
        if (savedPrefs) {
          // Ensure the loaded preferences conform to the UserPreferences interface
          const validPrefs: UserPreferences = {
            ...userPreferences, // Start with defaults
            ...savedPrefs, // Override with saved values
            // Ensure all keys are present and correctly typed, falling back to default if necessary
            voiceEnabled:
              typeof savedPrefs.voiceEnabled === "boolean"
                ? savedPrefs.voiceEnabled
                : userPreferences.voiceEnabled,
            animationsEnabled:
              typeof savedPrefs.animationsEnabled === "boolean"
                ? savedPrefs.animationsEnabled
                : userPreferences.animationsEnabled,
            avatarColor:
              typeof savedPrefs.avatarColor === "string"
                ? savedPrefs.avatarColor
                : userPreferences.avatarColor,
            voiceRate:
              typeof savedPrefs.voiceRate === "number"
                ? savedPrefs.voiceRate
                : userPreferences.voiceRate,
            voicePitch:
              typeof savedPrefs.voicePitch === "number"
                ? savedPrefs.voicePitch
                : userPreferences.voicePitch,
            learningInterests: Array.isArray(savedPrefs.learningInterests)
              ? savedPrefs.learningInterests
              : userPreferences.learningInterests,
            courseHistory: Array.isArray(savedPrefs.courseHistory)
              ? savedPrefs.courseHistory
              : userPreferences.courseHistory,
            accessibilityMode:
              typeof savedPrefs.accessibilityMode === "boolean"
                ? savedPrefs.accessibilityMode
                : userPreferences.accessibilityMode,
            subtitlesEnabled:
              typeof savedPrefs.subtitlesEnabled === "boolean"
                ? savedPrefs.subtitlesEnabled
                : userPreferences.subtitlesEnabled,
            avatarSize:
              typeof savedPrefs.avatarSize === "string" &&
              ["small", "medium", "large"].includes(savedPrefs.avatarSize)
                ? savedPrefs.avatarSize
                : userPreferences.avatarSize,
            avatarPersonality:
              typeof savedPrefs.avatarPersonality === "string" &&
              ["friendly", "professional", "cheerful", "calm"].includes(
                savedPrefs.avatarPersonality,
              )
                ? savedPrefs.avatarPersonality
                : userPreferences.avatarPersonality,
            autoHideAvatar:
              typeof savedPrefs.autoHideAvatar === "boolean"
                ? savedPrefs.autoHideAvatar
                : userPreferences.autoHideAvatar,
          };
          setUserPreferences(validPrefs);
        }
      } catch (error) {
        ErrorHandler.handleApiError({
          // Ensure this matches the actual signature
          type: ErrorType.Storage, // This seems correct
          message: "Failed to load user preferences",
          // error: error as Error // originalError is usually the property name
          originalError: error as Error,
        });
      }
    };

    loadPreferences();
  }, []); // Removed userPreferences from dependency array to avoid loop with setUserPreferences

  // Auto-hide avatar based on user preference
  useEffect(() => {
    if (userPreferences.autoHideAvatar && avatarState === "idle") {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // Auto-hide after 10 seconds of idle state

      return () => clearTimeout(timer);
    }
  }, [avatarState, userPreferences.autoHideAvatar]);

  // Change animation based on avatar state
  useEffect(() => {
    // Don't run animations if animations are disabled
    if (!userPreferences.animationsEnabled) {
      // If animations are disabled, ensure all are stopped and reset.
      // The cleanup function from the PREVIOUS render of this effect will also run.
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
      floatAnim.stopAnimation();
      floatAnim.setValue(0); // Assuming 0 is base for float
      return;
    }

    let stopAnimationFunction: (() => void) | undefined; // Renamed

    // Stop any existing animations on these values before starting new ones.
    // This provides an extra layer of safety and resets values.
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);
    // floatAnimation is managed by its own useEffect primarily for initial mount,
    // but if avatarState === 'idle' calls startFloatAnimation, it will be handled.
    // Explicitly stop and reset floatAnimation here as well before the switch.
    floatAnim.stopAnimation();
    floatAnim.setValue(0);

    switch (avatarState) {
      case "idle": {
        // Assuming startFloatAnimation is defined, returns a cleanup, and handles reset.
        stopAnimationFunction = startFloatAnimation();
        break;
      }
      case "listening": {
        // Assuming startPulseAnimation is defined, returns a cleanup, and handles reset.
        stopAnimationFunction = startPulseAnimation();
        break;
      }
      case "processing": {
        const processingAnim = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.9,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        );
        processingAnim.start();
        stopAnimationFunction = () => {
          processingAnim.stop();
          pulseAnim.setValue(1); // Reset value
        };
        break;
      }
      case "speaking": {
        const speakingAnim = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.9,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        );
        speakingAnim.start();
        stopAnimationFunction = () => {
          speakingAnim.stop();
          pulseAnim.setValue(1); // Reset value
        };
        break;
      }
      case "error": {
        const errorAnim = Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]);
        errorAnim.start();
        stopAnimationFunction = () => {
          errorAnim.stop();
          scaleAnim.setValue(1); // Reset value
        };
        break;
      }
      case "thinking": {
        const thinkingAnim = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.95,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        );
        thinkingAnim.start();
        stopAnimationFunction = () => {
          thinkingAnim.stop();
          pulseAnim.setValue(1); // Reset value
        };
        break;
      }
      default: {
        // Ensure animations are stopped for any other state
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
        scaleAnim.stopAnimation();
        scaleAnim.setValue(1);
        floatAnim.stopAnimation();
        floatAnim.setValue(0);
        break;
      }
    }

    return () => {
      if (stopAnimationFunction) {
        stopAnimationFunction();
      }
    };
  }, [
    avatarState,
    userPreferences.animationsEnabled,
    pulseAnim,
    scaleAnim,
    floatAnim,
    startFloatAnimation,
    startPulseAnimation,
    startScaleAnimation,
  ]); // Added startScaleAnimation

  const showAvatar = useCallback(() => setIsVisible(true), []);
  const hideAvatar = useCallback(() => setIsVisible(false), []);
  const toggleAvatar = useCallback(() => setIsVisible(!isVisible), [isVisible]);

  const openChat = useCallback(() => setIsChatOpen(true), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);

  // Animation control functions (stubs for those not fully implemented or tied to useEffect)
  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1); // Reset to base value
    console.log("Pulse animation stopped via context");
  }, [pulseAnim]);

  const startThinkingAnimation = useCallback(() => {
    // This might trigger a specific animation or rely on the 'thinking' avatarState effect
    console.log("Thinking animation started via context");
    // Example: Reuse pulse or a new dedicated animation
    // For now, let avatarState 'thinking' in useEffect handle it.
    // If direct control is needed, implement animation logic here.
  }, []);

  const stopThinkingAnimation = useCallback(() => {
    console.log("Thinking animation stopped via context");
    // Example: Stop specific thinking animation and reset values
  }, []);

  const startSpeakingAnimation = useCallback(() => {
    console.log("Speaking animation started via context");
    // Let avatarState 'speaking' in useEffect handle it.
  }, []);

  const stopSpeakingAnimation = useCallback(() => {
    console.log("Speaking animation stopped via context");
  }, []);

  const startListeningAnimation = useCallback(() => {
    console.log("Listening animation started via context");
    // Let avatarState 'listening' in useEffect handle it.
  }, []);

  const stopListeningAnimation = useCallback(() => {
    console.log("Listening animation stopped via context");
  }, []);

  const startErrorAnimation = useCallback(() => {
    console.log("Error animation started via context");
    // Let avatarState 'error' in useEffect handle it.
  }, []);

  const resetAnimations = useCallback(() => {
    const currentStopper = stopCurrentAnimationRef.current;
    if (currentStopper) {
      currentStopper();
      stopCurrentAnimationRef.current = null;
    }
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);
    floatAnim.stopAnimation();
    floatAnim.setValue(0);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    console.log("All animations reset via context");
  }, [scaleAnim, floatAnim, pulseAnim]);

  // Update a specific user preference
  const updateUserPreference = useCallback(
    async <K extends keyof UserPreferences>(
      key: K,
      value: UserPreferences[K],
    ) => {
      // Validate the preference update
      const validation = validateUserPreferences({ [key]: value });

      if (!validation.valid) {
        // Use the ErrorHandler to properly handle and log validation errors
        ErrorHandler.handleApiError({
          type: ErrorType.Validation,
          message: `Invalid preference value for ${key}: ${validation.errors[key as string]}`, // Added more detail
          // details: validation.errors[key as string], // Redundant if in message
          context: { preference: key, attemptedValue: value },
        });
        return;
      }

      const updatedPreferences = {
        ...userPreferences,
        [key]: value,
      };

      setUserPreferences(updatedPreferences);

      // Save to persistent storage
      try {
        await avatarService.saveUserPreferences(updatedPreferences); // Removed cast to AvatarServiceUserPreferences
      } catch (error) {
        ErrorHandler.handleApiError({
          type: ErrorType.Storage,
          message: "Failed to save user preferences",
          originalError: error as Error, // Ensure originalError is passed
          context: { preference: key, value },
        });
      }
    },
    [userPreferences, avatarService, validateUserPreferences],
  ); // Removed ErrorHandler from deps as it's a constant now

  // Apply accessibility settings when they change
  useEffect(() => {
    const currentAccessibilityControl =
      accessibilityAnimationControlRef.current;
    const currentCleanupAccessibility =
      cleanupAccessibilityAnimationRef.current;

    // Stop and clear existing accessibility-specific animations first
    if (currentAccessibilityControl) {
      currentAccessibilityControl.stop();
      accessibilityAnimationControlRef.current = null;
    }
    if (currentCleanupAccessibility) {
      currentCleanupAccessibility();
      cleanupAccessibilityAnimationRef.current = null;
    }

    if (userPreferences.accessibilityMode) {
      // Example: Start a high-contrast, reduced-motion animation
      // This is a placeholder for actual accessibility animation logic
      const accessibilityAnimInstance = Animated.timing(scaleAnim, {
        toValue: 1.1, // Slightly larger for visibility
        duration: 1000,
        easing: Easing.linear, // Simple easing
        useNativeDriver: true,
      });
      accessibilityAnimInstance.start(() => {
        // Optionally loop or reverse, or just stay scaled
      });

      if (accessibilityAnimInstance) {
        // Check if instance is created
        accessibilityAnimationControlRef.current = accessibilityAnimInstance;
      }

      // Define a cleanup function for this specific accessibility animation
      const cleanupAccessibility = () => {
        const currentControl = accessibilityAnimationControlRef.current;
        if (currentControl) {
          currentControl.stop();
          scaleAnim.setValue(1); // Reset scale
          accessibilityAnimationControlRef.current = null;
        }
      };
      // No direct assignment to ref here, it's part of the effect's cleanup
      cleanupAccessibilityAnimationRef.current = cleanupAccessibility;
    } else {
      // If accessibility mode is turned off, ensure any specific animations are stopped and reset
      const currentControl = accessibilityAnimationControlRef.current;
      if (currentControl) {
        currentControl.stop();
        scaleAnim.setValue(1); // Reset scale
        accessibilityAnimationControlRef.current = null;
      }
      // Also clear the cleanup function if it exists
      const currentCleanup = cleanupAccessibilityAnimationRef.current;
      if (currentCleanup) {
        currentCleanup(); // This might be redundant if the above already cleans up
        cleanupAccessibilityAnimationRef.current = null;
      }
    }

    // General cleanup for the effect itself (not tied to accessibility mode on/off)
    return () => {
      const currentControl = accessibilityAnimationControlRef.current;
      if (currentControl) {
        currentControl.stop();
        // Reset any visual changes made by accessibility animations
        scaleAnim.setValue(1);
        accessibilityAnimationControlRef.current = null;
      }
      const currentCleanup = cleanupAccessibilityAnimationRef.current;
      if (currentCleanup) {
        currentCleanup(); // Ensure specific cleanup logic is run
        cleanupAccessibilityAnimationRef.current = null;
      }
    };
  }, [userPreferences.accessibilityMode, scaleAnim]); // Dependency on accessibilityMode and scaleAnim

  // Context value
  const contextValue: AvatarContextType = {
    isVisible,
    showAvatar,
    hideAvatar,
    toggleAvatar,
    isChatOpen,
    openChat,
    closeChat,
    avatarState,
    setAvatarState,
    position,
    setPosition,
    pulseAnimation: pulseAnim,
    scaleAnimation: scaleAnim,
    floatAnimation: floatAnim,
    startPulseAnimation, // This is the one from useCallback, returning a cleanup
    stopPulseAnimation, // New
    startThinkingAnimation, // New
    stopThinkingAnimation, // New
    startSpeakingAnimation, // New
    stopSpeakingAnimation, // New
    startListeningAnimation, // New
    stopListeningAnimation, // New
    startErrorAnimation, // New
    startScaleAnimation,
    resetAnimations, // New
    voiceStatus,
    isListening,
    recognizedText,
    currentSubtitle,
    userPreferences,
    setUserPreferences,
    startVoiceRecognition,
    stopVoiceRecognition,
    speakResponse,
    updateUserPreference,
  };

  return (
    <AvatarContext.Provider value={contextValue}>
      {children}
    </AvatarContext.Provider>
  );
};
