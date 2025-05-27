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
import { useVoiceService } from '../../hooks/useVoiceService';

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
});

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
  } = useVoiceService(userPreferences, handleStateChange);

  // Memoized visibility controls
  const showAvatar = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideAvatar = useCallback(() => {
    setIsVisible(false);
    stopSpeaking();
    resetVoiceState();
  }, [stopSpeaking, resetVoiceState]);

  const toggleAvatar = useCallback(() => {
    setIsVisible(prev => {
      if (prev) {
        stopSpeaking();
        resetVoiceState();
      }
      return !prev;
    });
  }, [stopSpeaking, resetVoiceState]);

  // Memoized chat controls
  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  // Optimized preference update function
  const updateUserPreference = useCallback(
    async <K extends keyof UserPreferences>(
      key: K,
      value: UserPreferences[K]
    ) => {
      try {
        const newPreferences = { ...userPreferences, [key]: value };
        
        // Validate preferences
        const validation = validateUserPreferences(newPreferences);
        if (!validation.valid) {
          throw new Error(`Invalid preference value: ${validation.error}`);
        }

        // Update state
        setUserPreferences(newPreferences);

        // Persist to storage
        await avatarService.saveUserPreferences(newPreferences);
      } catch (error) {
        console.error('Failed to update user preference:', error);
        ErrorHandler.handleApiError({
          type: ErrorType.Storage,
          message: `Failed to update ${key} preference`,
          originalError: error,
        });
      }
    },
    [userPreferences]
  );

  // Enhanced animation controls with memoization
  const startPulseAnimation = useCallback(() => {
    startAnimation('listening');
    return stopAnimation;
  }, [startAnimation, stopAnimation]);

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
      if (!userPreferences.animationsEnabled) return;
      // Implementation would use the animation hook
    },
    [userPreferences.animationsEnabled]
  );

  // Auto-animation based on avatar state
  useEffect(() => {
    startAnimation(avatarState);
  }, [avatarState, startAnimation]);

  // Load preferences on mount with error handling
  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      try {
        const savedPrefs = await avatarService.getUserPreferences();
        
        if (!isMounted) return;
        
        if (savedPrefs) {
          // Merge with defaults and validate
          const mergedPrefs = { ...DEFAULT_PREFERENCES, ...savedPrefs };
          const validation = validateUserPreferences(mergedPrefs);
          
          if (validation.valid) {
            setUserPreferences(mergedPrefs);
          } else {
            console.warn('Invalid saved preferences, using defaults:', validation.error);
            await avatarService.saveUserPreferences(DEFAULT_PREFERENCES);
          }
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
        if (isMounted) {
          ErrorHandler.handleApiError({
            type: ErrorType.Storage,
            message: 'Failed to load user preferences',
            originalError: error,
          });
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-hide avatar functionality
  useEffect(() => {
    if (!userPreferences.autoHideAvatar || avatarState !== 'idle') {
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [avatarState, userPreferences.autoHideAvatar]);

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
