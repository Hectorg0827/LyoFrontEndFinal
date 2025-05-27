// Enhanced testing utilities for avatar system
import { render, act, fireEvent, waitFor } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import React from 'react';

// Mock providers for testing
export const createMockAvatarContext = (overrides = {}) => ({
  isVisible: true,
  showAvatar: jest.fn(),
  hideAvatar: jest.fn(),
  toggleAvatar: jest.fn(),
  isChatOpen: false,
  openChat: jest.fn(),
  closeChat: jest.fn(),
  avatarState: 'idle',
  setAvatarState: jest.fn(),
  position: { x: 0, y: 0 },
  setPosition: jest.fn(),
  pulseAnimation: { _value: 1 },
  scaleAnimation: { _value: 1 },
  floatAnimation: { _value: 0 },
  startPulseAnimation: jest.fn(),
  stopPulseAnimation: jest.fn(),
  startThinkingAnimation: jest.fn(),
  stopThinkingAnimation: jest.fn(),
  startSpeakingAnimation: jest.fn(),
  stopSpeakingAnimation: jest.fn(),
  startListeningAnimation: jest.fn(),
  stopListeningAnimation: jest.fn(),
  startErrorAnimation: jest.fn(),
  startScaleAnimation: jest.fn(),
  resetAnimations: jest.fn(),
  voiceStatus: 'inactive',
  isListening: false,
  recognizedText: '',
  currentSubtitle: '',
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
  setUserPreferences: jest.fn(),
  startVoiceRecognition: jest.fn(),
  stopVoiceRecognition: jest.fn(),
  speakResponse: jest.fn(),
  updateUserPreference: jest.fn(),
  ...overrides,
});

// Animation testing utilities
export const mockAnimatedValue = (initialValue = 0) => ({
  _value: initialValue,
  setValue: jest.fn(),
  stopAnimation: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
});

export const mockAnimatedTiming = () => ({
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
});

// Voice testing utilities
export const createVoiceTestScenarios = () => ({
  successful: {
    startVoiceRecognition: jest.fn().mockResolvedValue(undefined),
    stopVoiceRecognition: jest.fn().mockResolvedValue('Hello world'),
    speakResponse: jest.fn().mockResolvedValue(undefined),
  },
  withErrors: {
    startVoiceRecognition: jest.fn().mockRejectedValue(new Error('Permission denied')),
    stopVoiceRecognition: jest.fn().mockRejectedValue(new Error('Recognition failed')),
    speakResponse: jest.fn().mockRejectedValue(new Error('Speech synthesis failed')),
  },
  withLatency: {
    startVoiceRecognition: jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 500))
    ),
    stopVoiceRecognition: jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('Delayed response'), 1000))
    ),
    speakResponse: jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 2000))
    ),
  },
});

// Performance testing utilities
export const measureRenderPerformance = async (component: React.ReactElement) => {
  const startTime = performance.now();
  const result = render(component);
  const renderTime = performance.now() - startTime;
  
  return {
    renderTime,
    result,
  };
};

export const measureAnimationPerformance = async (animationFn: () => void) => {
  const frameCount = 60; // 1 second at 60fps
  const frameTimes: number[] = [];
  
  for (let i = 0; i < frameCount; i++) {
    const frameStart = performance.now();
    await act(async () => {
      animationFn();
      await new Promise(resolve => requestAnimationFrame(resolve));
    });
    frameTimes.push(performance.now() - frameStart);
  }
  
  const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  const fps = 1000 / averageFrameTime;
  
  return {
    averageFrameTime,
    fps,
    frameTimes,
  };
};

// Accessibility testing utilities
export const testAccessibilityFeatures = (component: any) => {
  const accessibilityTests = {
    hasAccessibilityLabel: () => {
      expect(component.props.accessibilityLabel).toBeDefined();
    },
    hasAccessibilityRole: () => {
      expect(component.props.accessibilityRole).toBeDefined();
    },
    hasAccessibilityState: () => {
      expect(component.props.accessibilityState).toBeDefined();
    },
    isAccessible: () => {
      expect(component.props.accessible).toBe(true);
    },
  };
  
  return accessibilityTests;
};

// Integration testing helpers
export const createIntegrationTestSuite = (componentName: string) => {
  return {
    async testStateTransitions(component: any, states: string[]) {
      for (const state of states) {
        await act(async () => {
          component.setAvatarState(state);
        });
        
        expect(component.avatarState).toBe(state);
        await waitFor(() => {
          // Verify animations started for the state
          expect(component.startAnimation).toHaveBeenCalledWith(state);
        });
      }
    },
    
    async testVoiceWorkflow(component: any) {
      // Test complete voice workflow
      await act(async () => {
        await component.startVoiceRecognition();
      });
      expect(component.voiceStatus).toBe('recording');
      
      await act(async () => {
        await component.stopVoiceRecognition();
      });
      expect(component.voiceStatus).toBe('processing');
      
      // Wait for AI response and speech
      await waitFor(() => {
        expect(component.voiceStatus).toBe('speaking');
      });
      
      await waitFor(() => {
        expect(component.voiceStatus).toBe('inactive');
      });
    },
    
    async testErrorRecovery(component: any, errorType: string) {
      // Simulate error
      await act(async () => {
        component.simulateError(errorType);
      });
      expect(component.avatarState).toBe('error');
      
      // Test auto-recovery
      await waitFor(() => {
        expect(component.avatarState).toBe('idle');
      }, { timeout: 5000 });
    },
  };
};

// Memory leak detection
export const detectMemoryLeaks = () => {
  const initialMemory = performance.memory?.usedJSHeapSize || 0;
  
  return {
    check: () => {
      const currentMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = currentMemory - initialMemory;
      
      if (memoryIncrease > 10 * 1024 * 1024) { // 10MB threshold
        console.warn(`Potential memory leak detected: ${memoryIncrease / 1024 / 1024}MB increase`);
      }
      
      return memoryIncrease;
    },
  };
};
