import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Animated, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { avatarService } from '../../services/avatarService';

// Define available avatar states
export type AvatarState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'thinking';

interface AvatarPosition {
  x: number;
  y: number;
}

// Voice recognition status
export type VoiceStatus = 'inactive' | 'listening' | 'processing' | 'error';

interface AvatarContextType {
  isVisible: boolean;
  showAvatar: () => void;
  hideAvatar: () => void;
  toggleAvatar: () => void;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  avatarState: AvatarState;
  setAvatarState: (state: AvatarState) => void;
  position: AvatarPosition;
  setPosition: (position: AvatarPosition) => void;
  pulseAnimation: Animated.Value;
  scaleAnimation: Animated.Value;
  floatAnimation: Animated.Value;
  startPulseAnimation: () => void;
  startScaleAnimation: () => void;
  startFloatAnimation: () => void;
  // Voice recognition and speech
  voiceStatus: VoiceStatus;
  startVoiceRecognition: () => Promise<void>;
  stopVoiceRecognition: () => void;
  isListening: boolean;
  recognizedText: string;
  speakResponse: (text: string) => Promise<void>;
  // User preferences
  userPreferences: UserPreferences;
  updateUserPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

// User preferences interface
interface UserPreferences {
  voiceEnabled: boolean;
  animationsEnabled: boolean;
  avatarColor: string;
  voiceRate: number;
  voicePitch: number;
  learningInterests: string[];
  courseHistory: string[];
  // New preferences
  accessibilityMode: boolean;
  subtitlesEnabled: boolean;
  avatarSize: 'small' | 'medium' | 'large';
  avatarPersonality: 'friendly' | 'professional' | 'cheerful' | 'calm';
  autoHideAvatar: boolean;
}

// Create context with default values
const AvatarContext = createContext<AvatarContextType>({
  isVisible: true,
  showAvatar: () => {},
  hideAvatar: () => {},
  toggleAvatar: () => {},
  isChatOpen: false,
  openChat: () => {},
  closeChat: () => {},
  avatarState: 'idle',
  setAvatarState: () => {},
  position: { x: 0, y: 0 },
  setPosition: () => {},
  pulseAnimation: new Animated.Value(1),
  scaleAnimation: new Animated.Value(1),
  floatAnimation: new Animated.Value(0),
  startPulseAnimation: () => {},
  startScaleAnimation: () => {},
  startFloatAnimation: () => {},
  // Voice recognition and speech
  voiceStatus: 'inactive',
  startVoiceRecognition: async () => {},
  stopVoiceRecognition: () => {},
  isListening: false,
  recognizedText: '',
  speakResponse: async () => {},
  // User preferences
  userPreferences: {
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
  },
  updateUserPreference: () => {},
});

interface AvatarProviderProps {
  children: ReactNode;
}

export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [position, setPosition] = useState<AvatarPosition>({ x: 0, y: 0 });
  
  // Voice recognition states
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('inactive');
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  
  // User preferences with default values
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    voiceEnabled: true,
    animationsEnabled: true,
    avatarColor: '#8E54E9',
    voiceRate: 1.0,
    voicePitch: 1.0,
    learningInterests: [],
    courseHistory: [],
    // New preferences with defaults
    accessibilityMode: false,
    subtitlesEnabled: false,
    avatarSize: 'medium',
    avatarPersonality: 'friendly',
    autoHideAvatar: false,
  });
  
  // Initialize animations
  const pulseAnimation = new Animated.Value(1);
  const scaleAnimation = new Animated.Value(1);
  const floatAnimation = new Animated.Value(0);

  // Load user preferences from storage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPrefs = await avatarService.getUserPreferences();
        if (savedPrefs) {
          setUserPreferences(savedPrefs);
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  // Auto-hide avatar based on user preference
  useEffect(() => {
    if (userPreferences.autoHideAvatar && avatarState === 'idle') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // Auto-hide after 10 seconds of idle state
      
      return () => clearTimeout(timer);
    }
  }, [avatarState, userPreferences.autoHideAvatar]);

  // Start gentle floating animation when component mounts
  useEffect(() => {
    if (userPreferences.animationsEnabled) {
      startFloatAnimation();
    }
  }, [userPreferences.animationsEnabled]);

  // Change animation based on avatar state
  useEffect(() => {
    // Don't run animations if animations are disabled
    if (!userPreferences.animationsEnabled) {
      return;
    }
    
    switch (avatarState) {
      case 'idle':
        startFloatAnimation();
        break;
      case 'listening':
        startPulseAnimation();
        break;
      case 'processing':
        // A subtle pulsing effect when processing
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 0.9,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case 'speaking':
        // A more pronounced pulsing effect when speaking
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 0.9,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case 'error':
        // A quick side-to-side shake animation for errors
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        break;
      case 'thinking':
        // A subtle, slow pulsing to indicate thinking/processing
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 0.95,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
    }
  }, [avatarState, userPreferences.animationsEnabled]);

  const showAvatar = () => setIsVisible(true);
  const hideAvatar = () => setIsVisible(false);
  const toggleAvatar = () => setIsVisible(!isVisible);
  
  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  // Update a specific user preference
  const updateUserPreference = async <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    const updatedPreferences = {
      ...userPreferences,
      [key]: value,
    };
    
    setUserPreferences(updatedPreferences);
    
    // Save to persistent storage
    try {
      await avatarService.saveUserPreferences(updatedPreferences);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  };

  // Voice recognition implementation
  const startVoiceRecognition = async () => {
    if (!userPreferences.voiceEnabled) {
      return;
    }
    
    try {
      setVoiceStatus('listening');
      setIsListening(true);
      setAvatarState('listening');
      
      // In a real app, this would activate the device's microphone
      // Here we're simulating with our avatarService
      const result = await avatarService.startVoiceRecognition();
      
      if (!result || result.trim() === '') {
        // Handle empty responses
        setVoiceStatus('error');
        setAvatarState('error');
        setTimeout(() => {
          setVoiceStatus('inactive');
          setAvatarState('idle');
        }, 2000);
        return;
      }
      
      setRecognizedText(result);
      setVoiceStatus('processing');
      setAvatarState('thinking'); // Use our new thinking state
      
      // Now process the recognized text with AI service
      const response = await avatarService.generateResponse(result);
      
      // Speak the response if voice is enabled
      if (userPreferences.voiceEnabled) {
        await speakResponse(response);
      }
      
      setVoiceStatus('inactive');
      setIsListening(false);
      setAvatarState('idle');
      
      return result;
    } catch (error) {
      console.error('Voice recognition error:', error);
      setVoiceStatus('error');
      setIsListening(false);
      setAvatarState('error');
      
      // Return to idle after showing error state
      setTimeout(() => {
        setAvatarState('idle');
      }, 2000);
    }
  };

  const stopVoiceRecognition = () => {
    if (isListening) {
      // In a real app, this would stop the microphone recording
      avatarService.stopVoiceRecognition();
      setIsListening(false);
      setVoiceStatus('inactive');
      setAvatarState('idle');
    }
  };

  // Text-to-speech implementation
  const speakResponse = async (text: string) => {
    if (!userPreferences.voiceEnabled) {
      return;
    }
    
    try {
      setAvatarState('speaking');
      
      // Configure speech options based on user preferences
      const options = {
        rate: userPreferences.voiceRate,
        pitch: userPreferences.voicePitch,
        language: 'en-US',
        onStart: () => {
          // Animation starts when speech starts
          setAvatarState('speaking');
        },
        onDone: () => {
          // Animation stops when speech is done
          setAvatarState('idle');
        },
        onStopped: () => {
          setAvatarState('idle');
        },
        onError: () => {
          setAvatarState('error');
          setTimeout(() => setAvatarState('idle'), 2000);
        }
      };
      
      // Use Speech API to speak the response
      await Speech.speak(text, options);
      
      // This will run if onDone is not supported or doesn't fire
      setAvatarState('idle');
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setAvatarState('idle');
    }
  };

  const startPulseAnimation = () => {
    if (!userPreferences.animationsEnabled) {
      return;
    }
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startScaleAnimation = () => {
    if (!userPreferences.animationsEnabled) {
      return;
    }
    
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startFloatAnimation = () => {
    if (!userPreferences.animationsEnabled) {
      return;
    }
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const value = {
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
    pulseAnimation,
    scaleAnimation,
    floatAnimation,
    startPulseAnimation,
    startScaleAnimation,
    startFloatAnimation,
    // Voice recognition and speech
    voiceStatus,
    startVoiceRecognition,
    stopVoiceRecognition,
    isListening,
    recognizedText,
    speakResponse,
    // User preferences
    userPreferences,
    updateUserPreference,
  };

  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
};

// Custom hook to use the avatar context
export const useAvatar = () => useContext(AvatarContext);

export default AvatarContext;
