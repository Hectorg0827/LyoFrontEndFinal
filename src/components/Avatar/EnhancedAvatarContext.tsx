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
import { Animated, Easing, Platform } from "react-native";

import { avatarService } from "../../services/avatarService";
import { enhancedAvatarService } from "../../services/enhancedAvatarService";
import { ErrorHandler, ErrorType } from "../../services/errorHandler";
import { DevicePerformanceAdapter } from "../../utils/devicePerformanceAdapter";
import {
  AvatarState,
  VoiceStatus,
  UserPreferences,
  AvatarContextType,
  EnhancedAvatarContextType,
  AvatarPosition,
  AvatarEmotion,
  AvatarExpression,
  VisemeData,
} from "../../types/avatar";

// Create context with default values
const EnhancedAvatarContext = createContext<EnhancedAvatarContextType | undefined>(undefined);

export const useEnhancedAvatar = () => {
  const context = useContext(EnhancedAvatarContext);
  if (context === undefined) {
    throw new Error("useEnhancedAvatar must be used within an EnhancedAvatarProvider");
  }
  return context;
};

interface EnhancedAvatarProviderProps {
  children: React.ReactNode;
}

export const EnhancedAvatarProvider: React.FC<EnhancedAvatarProviderProps> = ({ children }) => {
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
  const [position, setPosition] = useState<AvatarPosition>({ x: 0, y: 0 });
  const recordingRef = useRef<Audio.Recording | undefined>();
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [currentEmotion, setCurrentEmotion] = useState<AvatarEmotion>("neutral");
  const [currentViseme, setCurrentViseme] = useState<string>("viseme_sil");

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation control refs
  const stopCurrentAnimationRef = useRef<(() => void) | null>(null);
  const accessibilityAnimationControlRef = useRef<Animated.CompositeAnimation | null>(null);
  const cleanupAccessibilityAnimationRef = useRef<(() => void) | null>(null);
  const visemeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Device capabilities
  const [deviceCapabilities, setDeviceCapabilities] = useState<any>(null);

  // Initialize device capabilities
  useEffect(() => {
    const initDeviceCapabilities = async () => {
      try {
        const capabilities = await DevicePerformanceAdapter.initializeDeviceProfile();
        setDeviceCapabilities(capabilities);
      } catch (error) {
        console.error("Failed to initialize device capabilities:", error);
      }
    };

    initDeviceCapabilities();
  }, []);

  // Set emotion with proper expression
  const setEmotion = useCallback(async (
    emotion: AvatarEmotion, 
    intensity?: number
  ): Promise<void> => {
    try {
      const expression = await enhancedAvatarService.setEmotion(emotion, intensity);
      setCurrentEmotion(emotion);
      
      // Add any visual effects for the emotion here
      // For example, adjust animation speed or scale based on the emotion
      switch (emotion) {
        case 'happy':
        case 'excited':
          startScaleAnimation(1.05, expression.transitionTime);
          break;
        case 'sad':
          startScaleAnimation(0.95, expression.transitionTime);
          break;
        case 'angry':
          startPulseAnimation();
          break;
        case 'surprised':
          startScaleAnimation(1.1, 200);
          setTimeout(() => startScaleAnimation(1, 300), 200);
          break;
        default:
          startScaleAnimation(1, expression.transitionTime);
          break;
      }
    } catch (error) {
      console.error("Error setting emotion:", error);
    }
  }, []);

  // Get expression configuration for a specific emotion
  const getEmotionExpression = useCallback((emotion: AvatarEmotion): AvatarExpression => {
    return enhancedAvatarService.getExpressionForEmotion(emotion);
  }, []);

  // Enhanced TTS with viseme support for lip sync
  const speakWithVisemes = useCallback(async (
    text: string,
    options: {
      onStart?: () => void,
      onViseme?: (viseme: string, time: number) => void,
      onEmotion?: (emotion: AvatarEmotion, intensity: number) => void,
      onProgress?: (progress: number) => void,
      onDone?: () => void
    } = {}
  ): Promise<void> => {
    setAvatarState("speaking");
    setVoiceStatus("speaking");
    setCurrentSubtitle(text);
    
    const handleViseme = (viseme: string, time: number) => {
      setCurrentViseme(viseme);
      if (options.onViseme) {
        options.onViseme(viseme, time);
      }
    };
    
    try {
      // Detect emotion from text
      const { emotion, intensity } = await enhancedAvatarService.detectEmotionFromText(text);
      await setEmotion(emotion, intensity);
      
      if (options.onEmotion) {
        options.onEmotion(emotion, intensity);
      }
      
      // Speak with viseme tracking
      await enhancedAvatarService.speakResponse(text, {
        onStart: options.onStart,
        onViseme: handleViseme,
        onProgress: options.onProgress,
        onDone: () => {
          setAvatarState("idle");
          setVoiceStatus("inactive");
          setCurrentSubtitle("");
          setCurrentViseme("viseme_sil");
          if (options.onDone) {
            options.onDone();
          }
        }
      });
    } catch (error) {
      console.error("Error in enhanced speech:", error);
      setAvatarState("error");
      setVoiceStatus("error");
      setTimeout(() => {
        setAvatarState("idle");
        setVoiceStatus("inactive");
      }, 3000);
      
      if (options.onDone) {
        options.onDone();
      }
    }
  }, [setEmotion]);

  // Enhanced speech recognition with emotion detection
  const enhancedVoiceRecognition = useCallback(async () => {
    if (!recordingRef.current) {
      throw new Error("No active recording found");
    }
    
    try {
      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = undefined;
      
      if (!uri) {
        throw new Error("Failed to get recording URI");
      }
      
      // Process voice input with enhanced processing
      const result = await enhancedAvatarService.processVoiceInput(uri);
      
      // Update state with recognition results
      setRecognizedText(result.transcription);
      
      // Set emotion based on detected emotions in voice
      if (result.emotions.length > 0) {
        const topEmotion = result.emotions[0];
        await setEmotion(topEmotion.emotion, topEmotion.score);
      }
      
      return result;
    } catch (error) {
      console.error("Enhanced voice recognition error:", error);
      throw error;
    }
  }, [recordingRef, setEmotion]);

  // Get personalized learning recommendations
  const getLearningRecommendations = useCallback(async () => {
    try {
      return await enhancedAvatarService.getLearningRecommendations();
    } catch (error) {
      console.error("Error getting learning recommendations:", error);
      return [];
    }
  }, []);

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    return enhancedAvatarService.getPerformanceReport();
  }, []);

  // Standard functions from AvatarContext
  // Define speakResponse
  const speakResponse = useCallback(
    async (text: string, onDone?: () => void) => {
      if (!userPreferences.voiceEnabled) {
        if (onDone) {
          onDone();
        }
        return;
      }

      // Use the enhanced speak with visemes instead
      await speakWithVisemes(text, { onDone });
    },
    [userPreferences.voiceEnabled, speakWithVisemes]
  );

  const startVoiceRecognition = useCallback(async () => {
    // Reset states
    setRecognizedText("");
    setVoiceStatus("requesting");
    setAvatarState("listening");
    setIsListening(true);

    try {
      console.log("Requesting audio permissions...");
      const permissionsResponseResult = await Audio.requestPermissionsAsync();
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
      
      // Set emotion to listening
      await setEmotion("thinking", 0.7);
      
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
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = undefined;
      }
    }
  }, [setEmotion]);

  const stopVoiceRecognition = useCallback(async () => {
    if (!recordingRef.current) {
      return;
    }

    setIsListening(false);
    setVoiceStatus("processing");
    setAvatarState("thinking");

    try {
      // Use enhanced voice recognition
      setEmotion("thinking", 0.8);
      const result = await enhancedVoiceRecognition();
      
      if (!result.transcription || result.transcription.trim() === "") {
        ErrorHandler.handleApiError({
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

      setAvatarState("processing");

      // Use enhanced response generation
      const response = await enhancedAvatarService.generateResponse(result.transcription, {
        includeEmotion: true,
        includeVisemes: true
      });

      if (userPreferences.voiceEnabled) {
        // Use the enhanced speak with visemes
        await speakWithVisemes(response.text, {
          onEmotion: response.emotion && response.emotionIntensity 
            ? (_, __) => setEmotion(response.emotion!, response.emotionIntensity) 
            : undefined,
        });
      } else {
        setAvatarState("idle");
        setVoiceStatus("inactive");
      }
    } catch (error) {
      ErrorHandler.handleApiError({
        type: ErrorType.AiService,
        message: "Error processing voice or generating AI response.",
        originalError: error as Error,
      });
      setVoiceStatus("error");
      setAvatarState("error");
      setTimeout(() => {
        setVoiceStatus("inactive");
        setAvatarState("idle");
      }, 3000);
    }
  }, [userPreferences.voiceEnabled, enhancedVoiceRecognition, speakWithVisemes, setEmotion]);

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
        const savedPrefs = await enhancedAvatarService.getUserPreferences();
        if (savedPrefs) {
          setUserPreferences(savedPrefs);
        }
      } catch (error) {
        ErrorHandler.handleApiError({
          type: ErrorType.Storage,
          message: "Failed to load user preferences",
          originalError: error as Error,
        });
      }
    };

    loadPreferences();
  }, []);

  // Auto-hide avatar based on user preference
  useEffect(() => {
    if (userPreferences.autoHideAvatar && avatarState === "idle") {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // Auto-hide after 10 seconds of idle state

      return () => clearTimeout(timer);
    }
  }, [avatarState, userPreferences.autoHideAvatar]);

  // Visibility control functions
  const showAvatar = useCallback(() => setIsVisible(true), []);
  const hideAvatar = useCallback(() => setIsVisible(false), []);
  const toggleAvatar = useCallback(() => setIsVisible(!isVisible), [isVisible]);

  // Chat control functions
  const openChat = useCallback(() => setIsChatOpen(true), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);

  // Animation control functions
  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1); // Reset to base value
  }, [pulseAnim]);

  const startThinkingAnimation = useCallback(() => {
    setAvatarState("thinking");
  }, []);

  const stopThinkingAnimation = useCallback(() => {
    setAvatarState("idle");
  }, []);

  const startSpeakingAnimation = useCallback(() => {
    setAvatarState("speaking");
  }, []);

  const stopSpeakingAnimation = useCallback(() => {
    setAvatarState("idle");
  }, []);

  const startListeningAnimation = useCallback(() => {
    setAvatarState("listening");
  }, []);

  const stopListeningAnimation = useCallback(() => {
    setAvatarState("idle");
  }, []);

  const startErrorAnimation = useCallback(() => {
    setAvatarState("error");
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
  }, [scaleAnim, floatAnim, pulseAnim]);

  // Update a specific user preference
  const updateUserPreference = useCallback(
    async <K extends keyof UserPreferences>(
      key: K,
      value: UserPreferences[K],
    ): Promise<void> => {
      try {
        const updatedPreferences = {
          ...userPreferences,
          [key]: value,
        };

        setUserPreferences(updatedPreferences);

        // Save to persistent storage
        await enhancedAvatarService.saveUserPreferences(updatedPreferences);
      } catch (error) {
        ErrorHandler.handleApiError({
          type: ErrorType.Storage,
          message: "Failed to save user preferences",
          originalError: error as Error,
          context: { preference: key, value },
        });
      }
    },
    [userPreferences]
  );

  // Context value
  const contextValue: EnhancedAvatarContextType = {
    // Standard avatar context values
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
    startPulseAnimation,
    stopPulseAnimation,
    startThinkingAnimation,
    stopThinkingAnimation,
    startSpeakingAnimation,
    stopSpeakingAnimation,
    startListeningAnimation,
    stopListeningAnimation,
    startErrorAnimation,
    startScaleAnimation,
    resetAnimations,
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
    
    // Enhanced avatar context values
    currentEmotion,
    setEmotion,
    getEmotionExpression,
    speakWithVisemes,
    getLearningRecommendations,
    getPerformanceReport,
    enhancedVoiceRecognition,
  };

  return (
    <EnhancedAvatarContext.Provider value={contextValue}>
      {children}
    </EnhancedAvatarContext.Provider>
  );
};