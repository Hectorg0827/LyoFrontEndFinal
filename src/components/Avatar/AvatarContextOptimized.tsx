// Optimized Avatar Context with performance improvements and memory management
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  memo,
} from 'react';
import { avatarService } from '../../services/avatarService';
import { ErrorHandler, ErrorType } from '../../services/errorHandler';
import { validateUserPreferences } from '../../services/validationUtils';
import {
  AvatarState,
  UserPreferences,
  AvatarContextType,
} from '../../types/avatar';
import { useAvatarAnimations } from '../../hooks/useAvatarAnimations';
import { useSimplifiedVoiceService } from '../../hooks/useSimplifiedVoiceService';

interface AvatarPosition {
  x: number;
  y: number;
}

// Create context with proper typing
const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

// Custom hook with error boundary
export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};

interface AvatarProviderProps {
  children: React.ReactNode;
}

// Memoized default preferences to prevent recreation
const DEFAULT_PREFERENCES: UserPreferences = Object.freeze({
  voiceEnabled: true,
  animationsEnabled: true,
  avatarColor: '#8E54E9',
  voiceRate: 1.0,
  voicePitch: 1.0,
  learningInterests: [],
  courseHistory: [],
  accessibilityMode: false,
  subtitlesEnabled: false,
  avatarSize: 'medium',
  avatarPersonality: 'friendly',
  autoHideAvatar: false,
  // Add these fields to match the UserPreferences interface
  preferredLanguage: 'en-US',
  notificationSettings: {
    newCourseRecommendations: true,
    studyReminders: false,
    communityUpdates: false,
  },
  theme: 'system',
});

// Type assertion to help TypeScript recognize compatible personality types 
const adjustPersonality = (
  personalityType: "friendly" | "professional" | "cheerful" | "calm" | "enthusiastic"
): "friendly" | "professional" | "enthusiastic" => {
  if (personalityType === "cheerful" || personalityType === "calm") {
    return "friendly"; // Map to a compatible default
  }
  return personalityType as "friendly" | "professional" | "enthusiastic";
};

// Helper function to ensure compatibility between different UserPreferences types
const adaptPreferencesForService = (prefs: UserPreferences): any => {
  return {
    ...prefs,
    avatarPersonality: adjustPersonality(prefs.avatarPersonality)
  };
};

export const AvatarProvider: React.FC<AvatarProviderProps> = memo(({ children }) => {
  // Core state
  const [isVisible, setIsVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [position, setPosition] = useState<AvatarPosition>({ x: 0, y: 0 });
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  // Animation hook with optimized memory management
  const {
    pulse: pulseAnimation,
    scale: scaleAnimation,
    float: floatAnimation,
    startAnimation,
    stopAnimation,
    resetAnimations,
  } = useAvatarAnimations(userPreferences.animationsEnabled);

  // Voice service hook with state change handler
  const handleStateChange = useCallback((newState: string) => {
    setAvatarState(newState as AvatarState);
  }, []);

  const {
    voiceStatus,
    isListening,
    recognizedText,
    currentSubtitle,
    startVoiceRecognition,
    stopVoiceRecognition,
    speakResponse,
    stopSpeaking,
    resetVoiceState,
  } = useSimplifiedVoiceService(userPreferences, handleStateChange);

  // Memoized visibility controls
  const showAvatar = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideAvatar = useCallback(() => {
    setIsVisible(false);
    stopSpeaking();
  }, [stopSpeaking]);

  const toggleAvatar = useCallback(() => {
    setIsVisible(prev => {
      if (prev) {
        stopSpeaking();
      }
      return !prev;
    });
  }, [stopSpeaking]);

  // Memoized chat controls
  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  // Animation callbacks
  const startPulseAnimation = useCallback(() => {
    if (!userPreferences.animationsEnabled) {
      return;
    }
    return startAnimation('idle');
  }, [userPreferences.animationsEnabled, startAnimation]);

  const stopPulseAnimation = useCallback(() => {
    stopAnimation();
  }, [stopAnimation]);

  const startThinkingAnimation = useCallback(() => {
    startAnimation('thinking');
  }, [startAnimation]);

  const stopThinkingAnimation = useCallback(() => {
    stopAnimation();
  }, [stopAnimation]);

  const startSpeakingAnimation = useCallback(() => {
    startAnimation('speaking');
  }, [startAnimation]);

  const stopSpeakingAnimation = useCallback(() => {
    stopAnimation();
  }, [stopAnimation]);

  const startListeningAnimation = useCallback(() => {
    startAnimation('listening');
  }, [startAnimation]);

  const stopListeningAnimation = useCallback(() => {
    stopAnimation();
  }, [stopAnimation]);

  const startErrorAnimation = useCallback(() => {
    startAnimation('error');
  }, [startAnimation]);

  const startScaleAnimation = useCallback(
    (toValue: number, duration = 300) => {
      if (!userPreferences.animationsEnabled) {
        return;
      }
      // Implementation would use the animation hook
    },
    [userPreferences.animationsEnabled]
  );

  // Auto-animation based on avatar state
  useEffect(() => {
    startAnimation(avatarState);
  }, [avatarState, startAnimation]);

  // Load user preferences on initial mount
  useEffect(() => {
    let isMounted = true;
    
    const loadUserPreferences = async () => {
      try {
        const savedPrefs = await avatarService.getUserPreferences();
        if (savedPrefs && isMounted) {
          // Use type casting to avoid compatibility issues with avatarPersonality
          const validation = validateUserPreferences({
            ...savedPrefs,
            avatarPersonality: savedPrefs.avatarPersonality as any
          });
          
          if (validation.valid) {
            setUserPreferences(savedPrefs as UserPreferences);
          } else {
            console.warn('Invalid saved preferences, using defaults:', validation.errors);
            await avatarService.saveUserPreferences(adaptPreferencesForService(DEFAULT_PREFERENCES));
            setUserPreferences(DEFAULT_PREFERENCES);
          }
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    };
    
    loadUserPreferences();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Method to update a single preference
  const updateUserPreference = useCallback(
    async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      try {
        const newPreferences = {
          ...userPreferences,
          [key]: value,
        };
        
        const validation = validateUserPreferences(newPreferences);
        if (!validation.valid) {
          throw new Error(`Invalid preference value: ${JSON.stringify(validation.errors)}`);
        }
        
        setUserPreferences(newPreferences);
        await avatarService.saveUserPreferences(adaptPreferencesForService(newPreferences));
        
        // Special handling for specific preference changes
        if (key === 'animationsEnabled' || key === 'avatarSize') {
          resetAnimations();
        }
      } catch (error) {
        console.error(`Failed to update preference ${String(key)}:`, error);
      }
    },
    [userPreferences, resetAnimations]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
      resetVoiceState();
    };
  }, [stopAnimation, resetVoiceState]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<AvatarContextType>(() => ({
    // Visibility
    isVisible,
    showAvatar,
    hideAvatar,
    toggleAvatar,
    
    // Chat
    isChatOpen,
    openChat,
    closeChat,
    
    // State
    avatarState,
    setAvatarState,
    position,
    setPosition,
    
    // Animations
    pulseAnimation,
    scaleAnimation,
    floatAnimation,
    // Fix return type of animation functions to match AvatarContextType
    startPulseAnimation: startPulseAnimation as unknown as () => () => void,
    stopPulseAnimation,
    startThinkingAnimation: startThinkingAnimation as unknown as () => void,
    stopThinkingAnimation,
    startSpeakingAnimation: startSpeakingAnimation as unknown as () => void,
    stopSpeakingAnimation,
    startListeningAnimation: startListeningAnimation as unknown as () => void,
    stopListeningAnimation,
    startErrorAnimation: startErrorAnimation as unknown as () => void,
    startScaleAnimation,
    resetAnimations,
    
    // Voice
    voiceStatus,
    isListening,
    recognizedText,
    currentSubtitle,
    startVoiceRecognition,
    stopVoiceRecognition,
    speakResponse,
    
    // Preferences
    userPreferences,
    setUserPreferences,
    updateUserPreference,
  }), [
    isVisible,
    showAvatar,
    hideAvatar,
    toggleAvatar,
    isChatOpen,
    openChat,
    closeChat,
    avatarState,
    position,
    pulseAnimation,
    scaleAnimation,
    floatAnimation,
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
    startVoiceRecognition,
    stopVoiceRecognition,
    speakResponse,
    userPreferences,
    updateUserPreference,
  ]);

  return (
    <AvatarContext.Provider value={contextValue}>
      {children}
    </AvatarContext.Provider>
  );
});

AvatarProvider.displayName = 'AvatarProvider';

// Export optimized hook with different name for compatibility
export const useAvatarOptimized = useAvatar;

// Export optimized provider with different name for compatibility  
export const AvatarContextOptimized = AvatarProvider;
