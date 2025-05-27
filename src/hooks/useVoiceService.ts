// Optimized voice service hook with better error handling and performance
import { useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { avatarService } from '../services/avatarService';
import { ErrorHandler, ErrorType } from '../services/errorHandler';
import { VoiceStatus, UserPreferences } from '../types/avatar';

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

export const useVoiceService = (
  userPreferences: UserPreferences,
  onStateChange?: (state: string) => void
): VoiceServiceReturn => {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('inactive');
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  const recordingRef = useRef<Audio.Recording | undefined>();
  const speechInstanceRef = useRef<number | null>(null);

  // Optimized audio setup with caching
  const setupAudioMode = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.warn('Audio mode setup failed:', error);
    }
  }, []);

  // Enhanced speech synthesis with better error handling
  const speakResponse = useCallback(
    async (text: string, onDone?: () => void) => {
      if (!userPreferences.voiceEnabled || !text.trim()) {
        onDone?.();
        return;
      }

      // Stop any existing speech
      if (speechInstanceRef.current) {
        Speech.stop();
        speechInstanceRef.current = null;
      }

      setVoiceStatus('speaking');
      setCurrentSubtitle(text);
      onStateChange?.('speaking');

      try {
        const options: Speech.SpeechOptions = {
          rate: Math.max(0.1, Math.min(2.0, userPreferences.voiceRate)),
          pitch: Math.max(0.5, Math.min(2.0, userPreferences.voicePitch)),
          language: userPreferences.preferredLanguage || 'en-US',
          onDone: () => {
            setVoiceStatus('inactive');
            setCurrentSubtitle('');
            speechInstanceRef.current = null;
            onStateChange?.('idle');
            onDone?.();
          },
          onStopped: () => {
            setVoiceStatus('inactive');
            setCurrentSubtitle('');
            speechInstanceRef.current = null;
            onStateChange?.('idle');
          },
          onError: (error) => {
            console.error('Speech synthesis error:', error);
            ErrorHandler.handleApiError({
              type: ErrorType.VoiceSynthesis,
              message: 'Speech synthesis failed',
              originalError: error,
            });
            setVoiceStatus('error');
            setCurrentSubtitle('');
            speechInstanceRef.current = null;
            onStateChange?.('error');
            onDone?.();
          },
        };

        Speech.speak(text, options);
      } catch (error) {
        console.error('Speech synthesis setup failed:', error);
        ErrorHandler.handleApiError({
          type: ErrorType.VoiceSynthesis,
          message: 'Failed to initialize speech synthesis',
          originalError: error,
        });
        setVoiceStatus('error');
        setCurrentSubtitle('');
        onStateChange?.('error');
        onDone?.();
      }
    },
    [userPreferences.voiceEnabled, userPreferences.voiceRate, userPreferences.voicePitch, userPreferences.preferredLanguage, onStateChange]
  );

  // Enhanced voice recognition with better error recovery
  const startVoiceRecognition = useCallback(async () => {
    if (!userPreferences.voiceEnabled) {
      return;
    }

    // Reset state
    setRecognizedText('');
    setVoiceStatus('requesting');
    setIsListening(true);
    onStateChange?.('listening');

    try {
      // Request permissions
      const permissionResult = await Audio.requestPermissionsAsync();
      if (permissionResult.status !== Audio.PermissionStatus.GRANTED) {
        throw new Error('Audio recording permission denied');
      }

      // Setup audio mode
      await setupAudioMode();

      // Stop existing recording if any
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = undefined;
      }

      // Start new recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setVoiceStatus('recording');

    } catch (error) {
      console.error('Voice recognition setup failed:', error);
      ErrorHandler.handleApiError({
        type: ErrorType.VoiceRecognition,
        message: 'Failed to start voice recognition',
        originalError: error,
      });
      setVoiceStatus('error');
      setIsListening(false);
      onStateChange?.('error');
      
      // Cleanup on error
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (cleanupError) {
          console.warn('Failed to cleanup recording on error:', cleanupError);
        }
        recordingRef.current = undefined;
      }
    }
  }, [userPreferences.voiceEnabled, setupAudioMode, onStateChange]);

  // Enhanced voice recognition stop with processing
  const stopVoiceRecognition = useCallback(async () => {
    if (!recordingRef.current) {
      return;
    }

    setIsListening(false);
    setVoiceStatus('processing');
    onStateChange?.('processing');

    try {
      // Stop recording and get URI
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = undefined;

      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      // Process with avatar service
      const transcription = await avatarService.startVoiceRecognition(uri);
      
      if (!transcription?.trim()) {
        throw new Error('Empty transcription result');
      }

      setRecognizedText(transcription);
      onStateChange?.('thinking');

      // Generate AI response
      const response = await avatarService.generateResponse(transcription);
      
      if (userPreferences.voiceEnabled && response?.trim()) {
        await speakResponse(response);
      } else {
        setVoiceStatus('inactive');
        onStateChange?.('idle');
      }

    } catch (error) {
      console.error('Voice processing failed:', error);
      ErrorHandler.handleApiError({
        type: ErrorType.VoiceRecognition,
        message: 'Failed to process voice input',
        originalError: error,
      });
      setVoiceStatus('error');
      onStateChange?.('error');
      
      // Auto-recover from error state
      setTimeout(() => {
        setVoiceStatus('inactive');
        onStateChange?.('idle');
      }, 3000);
    }
  }, [userPreferences.voiceEnabled, speakResponse, onStateChange]);

  // Stop speaking functionality
  const stopSpeaking = useCallback(() => {
    if (speechInstanceRef.current) {
      Speech.stop();
      speechInstanceRef.current = null;
    }
    setVoiceStatus('inactive');
    setCurrentSubtitle('');
    onStateChange?.('idle');
  }, [onStateChange]);

  // Reset all voice state
  const resetVoiceState = useCallback(() => {
    stopSpeaking();
    setIsListening(false);
    setRecognizedText('');
    setVoiceStatus('inactive');
    
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(console.warn);
      recordingRef.current = undefined;
    }
  }, [stopSpeaking]);

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
