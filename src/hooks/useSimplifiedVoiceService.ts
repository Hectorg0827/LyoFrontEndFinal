// Simplified voice service hook 
import { useState } from 'react';
import { UserPreferences } from '../types/avatar';

// VoiceStatus type
export type VoiceStatus = 'inactive' | 'listening' | 'processing' | 'speaking';

interface VoiceServiceReturn {
  voiceStatus: VoiceStatus;
  isListening: boolean;
  recognizedText: string;
  currentSubtitle: string;
  startVoiceRecognition: () => Promise<void>;
  stopVoiceRecognition: () => Promise<void>;
  speakResponse: (text: string, onDone?: () => void) => Promise<void>;
  stopSpeaking: () => void;
  resetVoiceState: () => void;
}

export const useSimplifiedVoiceService = (
  userPreferences: UserPreferences,
  onStateChange?: (state: string) => void
): VoiceServiceReturn => {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('inactive');
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [currentSubtitle, setCurrentSubtitle] = useState('');

  // Stub implementation - in real app these would be implemented
  const startVoiceRecognition = async () => {
    setVoiceStatus('listening');
    setIsListening(true);
    if (onStateChange) onStateChange('listening');
    console.log('Started voice recognition');
  };

  const stopVoiceRecognition = async () => {
    setVoiceStatus('inactive');
    setIsListening(false);
    if (onStateChange) onStateChange('inactive');
    console.log('Stopped voice recognition');
  };

  const speakResponse = async (text: string, onDone?: () => void) => {
    setVoiceStatus('speaking');
    setCurrentSubtitle(text);
    if (onStateChange) onStateChange('speaking');
    console.log('Speaking:', text);
    
    // Simulate speech completion
    setTimeout(() => {
      setVoiceStatus('inactive');
      if (onStateChange) onStateChange('inactive');
      if (onDone) onDone();
    }, 2000);
  };

  const stopSpeaking = () => {
    setVoiceStatus('inactive');
    setCurrentSubtitle('');
    if (onStateChange) onStateChange('inactive');
    console.log('Speech stopped');
  };

  const resetVoiceState = () => {
    setVoiceStatus('inactive');
    setIsListening(false);
    setRecognizedText('');
    setCurrentSubtitle('');
    if (onStateChange) onStateChange('inactive');
    console.log('Voice state reset');
  };

  return {
    voiceStatus,
    isListening,
    recognizedText,
    currentSubtitle,
    startVoiceRecognition,
    stopVoiceRecognition,
    speakResponse,
    stopSpeaking,
    resetVoiceState,
  };
};
