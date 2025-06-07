// Enhanced avatar service with emotion detection, lip sync, and improved voice interaction
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

import { avatarApiService } from './avatarApiService';
import { optimizedAvatarService } from './optimizedAvatarService';
import { ErrorHandler, ErrorType } from './errorHandler';
import { validateUserPreferences } from './validationUtils';
import { DevicePerformanceAdapter } from '../utils/devicePerformanceAdapter';
import { AvatarCacheManager, VoiceResponseCache } from '../utils/smartCache';
import { AvatarPerformanceMonitor } from '../utils/performanceMonitor';
import {
  UserPreferences,
  ApiUserPreferences,
  PerformanceMetrics,
  VoiceProcessingConfig,
  AvatarEmotion,
  VisemeData,
  EmotionIntensity,
  AvatarExpression,
} from '../types/avatar';

// Storage keys for enhanced avatar service
const STORAGE_KEYS = {
  PREFERENCES: 'lyo_enhanced_preferences',
  CHAT_HISTORY: 'lyo_chat_history',
  SESSION_ID: 'lyo_conversation_session',
  VOICE_PROFILE: 'lyo_voice_profile',
  EMOTION_SETTINGS: 'lyo_emotion_settings',
  PERFORMANCE_METRICS: 'lyo_performance_metrics',
  INTERACTION_HISTORY: 'lyo_interaction_history',
  LEARNING_PATTERNS: 'lyo_learning_patterns',
};

// Default viseme mappings for lip sync
const DEFAULT_VISEME_MAPPING = {
  'a': 'viseme_AA',
  'e': 'viseme_E',
  'i': 'viseme_I',
  'o': 'viseme_O',
  'u': 'viseme_U',
  'f': 'viseme_F',
  'v': 'viseme_V',
  's': 'viseme_S',
  'th': 'viseme_TH',
  'm': 'viseme_M',
  'n': 'viseme_N',
  'p': 'viseme_P',
  'b': 'viseme_B',
  'k': 'viseme_K',
  'g': 'viseme_G',
  'ch': 'viseme_CH',
  'j': 'viseme_J',
  'r': 'viseme_R',
  'l': 'viseme_L',
  'w': 'viseme_W',
  'y': 'viseme_Y',
  'silence': 'viseme_sil',
};

// Default emotion mappings
const DEFAULT_EMOTIONS: Record<AvatarEmotion, AvatarExpression> = {
  neutral: {
    name: 'neutral',
    intensity: 1,
    duration: 1000,
    transitionTime: 500,
    affectsVoice: false,
    dominance: 1,
  },
  happy: {
    name: 'happy',
    intensity: 1,
    duration: 1500,
    transitionTime: 300,
    affectsVoice: true,
    dominance: 1.2,
  },
  sad: {
    name: 'sad',
    intensity: 1,
    duration: 2000,
    transitionTime: 800,
    affectsVoice: true,
    dominance: 1.1,
  },
  surprised: {
    name: 'surprised',
    intensity: 1,
    duration: 1000,
    transitionTime: 200,
    affectsVoice: true,
    dominance: 1.3,
  },
  angry: {
    name: 'angry',
    intensity: 1,
    duration: 1500,
    transitionTime: 400,
    affectsVoice: true,
    dominance: 1.4,
  },
  confused: {
    name: 'confused',
    intensity: 1,
    duration: 1500,
    transitionTime: 500,
    affectsVoice: false,
    dominance: 0.9,
  },
  thinking: {
    name: 'thinking',
    intensity: 1,
    duration: 2500,
    transitionTime: 600,
    affectsVoice: false,
    dominance: 0.8,
  },
  excited: {
    name: 'excited',
    intensity: 1,
    duration: 1200,
    transitionTime: 300,
    affectsVoice: true,
    dominance: 1.5,
  },
};

// Learning pattern types
type LearningPattern = {
  subjectAffinity: Record<string, number>;
  learningSpeed: Record<string, number>;
  engagementTriggers: string[];
  frustrationTriggers: string[];
  lastActiveTimestamp: number;
  quizPerformance: Record<string, number>;
  sessionDurations: number[];
  preferredContentTypes: string[];
};

interface EmotionSettings {
  enabledEmotions: AvatarEmotion[];
  emotionSensitivity: number;
  defaultEmotion: AvatarEmotion;
  emotionIntensity: EmotionIntensity;
  transitionSpeed: number;
}

class EnhancedAvatarService {
  private voiceCache: VoiceResponseCache;
  private deviceCapabilities: any = null;
  private performanceMetrics: PerformanceMetrics = {
    renderTime: 0,
    animationFPS: 0,
    voiceLatency: 0,
    memoryUsage: 0,
    errorRate: 0,
    lastUpdated: Date.now(),
  };

  private visemeMapping: Record<string, string> = DEFAULT_VISEME_MAPPING;
  private currentEmotion: AvatarEmotion = 'neutral';
  private emotionSettings: EmotionSettings = {
    enabledEmotions: Object.keys(DEFAULT_EMOTIONS) as AvatarEmotion[],
    emotionSensitivity: 0.7,
    defaultEmotion: 'neutral',
    emotionIntensity: 'medium',
    transitionSpeed: 1.0,
  };
  
  private learningPattern: LearningPattern | null = null;
  private conversationContext: Map<string, any> = new Map();
  private interactionHistory: Array<{
    userInput: string;
    response: string;
    emotion: AvatarEmotion;
    timestamp: number;
    duration: number;
  }> = [];

  private defaultPreferences: UserPreferences = Object.freeze({
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

  constructor() {
    this.voiceCache = AvatarCacheManager.getVoiceCache();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      // Initialize device performance adapter
      this.deviceCapabilities = await DevicePerformanceAdapter.initializeDeviceProfile();
      
      // Load performance metrics, emotion settings, and learning patterns
      await Promise.all([
        this.loadPerformanceMetrics(),
        this.loadEmotionSettings(),
        this.loadLearningPatterns(),
        this.loadInteractionHistory()
      ]);
      
      console.log('Enhanced Avatar service initialized with device tier:', this.deviceCapabilities.tier);
    } catch (error) {
      console.warn('Failed to initialize enhanced avatar service:', error);
    }
  }

  // ===== EMOTION & EXPRESSION HANDLING =====

  /**
   * Get the current emotion of the avatar
   */
  getCurrentEmotion(): AvatarEmotion {
    return this.currentEmotion;
  }

  /**
   * Get the expression configuration for a specific emotion
   */
  getExpressionForEmotion(emotion: AvatarEmotion): AvatarExpression {
    return { ...DEFAULT_EMOTIONS[emotion || 'neutral'] };
  }

  /**
   * Set the current emotion with a specific intensity
   */
  async setEmotion(emotion: AvatarEmotion, intensity: number = 1): Promise<AvatarExpression> {
    try {
      // Validate emotion
      if (!this.emotionSettings.enabledEmotions.includes(emotion)) {
        emotion = this.emotionSettings.defaultEmotion;
      }

      // Clamp intensity based on settings
      const intensityMap: Record<EmotionIntensity, number> = {
        low: 0.6,
        medium: 1.0,
        high: 1.4
      };
      const maxIntensity = intensityMap[this.emotionSettings.emotionIntensity];
      intensity = Math.min(Math.max(0.1, intensity), maxIntensity);

      // Get the base expression and adjust intensity
      const expression = { ...this.getExpressionForEmotion(emotion) };
      expression.intensity = intensity;
      
      // Adjust transition time based on settings
      expression.transitionTime = Math.round(
        expression.transitionTime * (1 / this.emotionSettings.transitionSpeed)
      );

      // Update current emotion
      this.currentEmotion = emotion;

      // Track in interaction history
      this.recordEmotionChange(emotion, intensity);
      
      return expression;
    } catch (error) {
      console.error('Error setting avatar emotion:', error);
      return this.getExpressionForEmotion('neutral');
    }
  }

  /**
   * Detect appropriate emotion from text content
   */
  async detectEmotionFromText(text: string): Promise<{emotion: AvatarEmotion, intensity: number}> {
    const startTime = performance.now();
    
    try {
      // Check cache first
      const cacheKey = `emotion_${text.substr(0, 100).toLowerCase().trim()}`;
      const cached = await this.voiceCache.getCachedResponse(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Simple keyword-based emotion detection
      // In a real implementation, this would use NLP or an emotion detection API
      const emotionKeywords: Record<AvatarEmotion, string[]> = {
        happy: ['happy', 'glad', 'joy', 'wonderful', 'exciting', 'excited', 'celebrate', 'great', 'excellent'],
        sad: ['sad', 'sorry', 'unhappy', 'unfortunate', 'disappointing', 'regret'],
        angry: ['angry', 'upset', 'frustrated', 'annoying', 'annoyed', 'terrible'],
        surprised: ['wow', 'amazing', 'surprising', 'surprised', 'incredible', 'unexpected'],
        confused: ['confused', 'unclear', 'strange', 'weird', 'not sure', 'difficult to understand'],
        thinking: ['let me think', 'thinking', 'consider', 'hmm', 'interesting question'],
        excited: ['fantastic', 'awesome', 'brilliant', 'can\'t wait', 'looking forward'],
        neutral: ['']
      };

      // Calculate emotion scores
      const scores: Record<AvatarEmotion, number> = Object.keys(emotionKeywords)
        .reduce((acc, emotion) => {
          acc[emotion as AvatarEmotion] = 0;
          return acc;
        }, {} as Record<AvatarEmotion, number>);
      
      // Check each emotion's keywords in the text
      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        keywords.forEach(keyword => {
          if (text.toLowerCase().includes(keyword.toLowerCase())) {
            scores[emotion as AvatarEmotion] += 1;
          }
        });
      });

      // Determine dominant emotion
      let dominantEmotion: AvatarEmotion = 'neutral';
      let highestScore = 0;
      
      Object.entries(scores).forEach(([emotion, score]) => {
        if (score > highestScore) {
          highestScore = score;
          dominantEmotion = emotion as AvatarEmotion;
        }
      });

      // Calculate intensity based on score and length of text
      const baseIntensity = highestScore > 0 ? Math.min(0.5 + (highestScore * 0.1), 1) : 0.5;
      
      // Adjust by sensitivity setting
      const intensity = baseIntensity * this.emotionSettings.emotionSensitivity;
      
      // Cache the result
      const result = { emotion: dominantEmotion, intensity };
      await this.voiceCache.cacheResponse(cacheKey, JSON.stringify(result), 2);
      
      AvatarPerformanceMonitor.measureApiResponseTime(startTime);
      return result;
    } catch (error) {
      console.warn('Emotion detection failed, using neutral:', error);
      return { emotion: 'neutral', intensity: 0.5 };
    }
  }

  /**
   * Record emotion change in interaction history
   */
  private recordEmotionChange(emotion: AvatarEmotion, intensity: number): void {
    const timestamp = Date.now();
    
    // Add to history if different from previous
    if (
      this.interactionHistory.length === 0 || 
      this.interactionHistory[this.interactionHistory.length - 1].emotion !== emotion
    ) {
      this.interactionHistory.push({
        userInput: '',
        response: '',
        emotion,
        timestamp,
        duration: 0
      });
      
      // Limit history size
      if (this.interactionHistory.length > 100) {
        this.interactionHistory.shift();
      }
      
      // Save history periodically
      if (this.interactionHistory.length % 10 === 0) {
        this.saveInteractionHistory();
      }
    }
  }

  /**
   * Generate viseme data for lip sync animation from text
   */
  generateVisemeDataForText(text: string): VisemeData[] {
    try {
      const words = text.toLowerCase().split(/\s+/);
      const visemeData: VisemeData[] = [];
      
      let currentTime = 0;
      const avgPhonemeTime = 80; // milliseconds per phoneme
      
      words.forEach(word => {
        // Basic phoneme approximation
        // In a real implementation, this would use a proper text-to-phoneme converter
        const phonemes = this.textToPhonemes(word);
        
        phonemes.forEach(phoneme => {
          const visemeName = this.visemeMapping[phoneme] || this.visemeMapping['silence'];
          
          // Add viseme with timing
          visemeData.push({
            viseme: visemeName,
            startTime: currentTime,
            endTime: currentTime + avgPhonemeTime,
            weight: 1.0
          });
          
          currentTime += avgPhonemeTime;
        });
        
        // Add small pause between words
        visemeData.push({
          viseme: this.visemeMapping['silence'],
          startTime: currentTime,
          endTime: currentTime + 50, // 50ms pause
          weight: 1.0
        });
        
        currentTime += 50;
      });
      
      return visemeData;
    } catch (error) {
      console.error('Error generating viseme data:', error);
      return [];
    }
  }

  /**
   * Very basic text to phoneme conversion (simplified)
   * In a real implementation, this would be much more sophisticated
   */
  private textToPhonemes(word: string): string[] {
    const phonemes: string[] = [];
    
    // Simple rule-based approach, just for demonstration
    const letters = word.split('');
    
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      const nextLetter = letters[i + 1] || '';
      
      // Check for phoneme combinations
      if (letter === 't' && nextLetter === 'h') {
        phonemes.push('th');
        i++; // Skip next letter
      }
      else if (letter === 'c' && nextLetter === 'h') {
        phonemes.push('ch');
        i++; // Skip next letter
      }
      else if (['a', 'e', 'i', 'o', 'u'].includes(letter)) {
        phonemes.push(letter); // Vowels
      }
      else {
        // Consonants
        const consonantMap: Record<string, string> = {
          'b': 'b', 'p': 'p', 'm': 'm', 'f': 'f', 'v': 'v',
          's': 's', 'z': 's', 'n': 'n', 'l': 'l', 'r': 'r',
          'g': 'g', 'k': 'k', 'c': 'k', 'j': 'j', 'w': 'w',
          'y': 'y', 'd': 'd', 't': 't'
        };
        
        phonemes.push(consonantMap[letter] || 'silence');
      }
    }
    
    return phonemes;
  }

  // ===== VOICE INTERACTION =====

  /**
   * Enhanced voice recognition with noise reduction and caching
   */
  async processVoiceInput(audioUri: string): Promise<{
    transcription: string,
    confidence: number,
    emotions: { emotion: AvatarEmotion, score: number }[]
  }> {
    const startTime = performance.now();
    
    try {
      // Check device capabilities first
      if (!DevicePerformanceAdapter.shouldUseFeature('realtime-voice')) {
        throw ErrorHandler.createError(
          ErrorType.VoiceRecognition,
          'Voice recognition not supported on this device',
        );
      }

      // Generate cache key from audio file hash
      const audioHash = await this.getAudioFileHash(audioUri);
      const cached = await this.voiceCache.getCachedResponse(`voice_input_${audioHash}`);
      
      if (cached) {
        AvatarPerformanceMonitor.measureVoiceLatency(startTime);
        return JSON.parse(cached);
      }

      // Process with optimized configuration
      const voiceConfig = this.getOptimizedVoiceConfig();
      
      // Mock implementation for voice processing
      // In a real implementation, this would call a voice recognition API
      const mockTranscription = `Transcription for ${audioUri}`;
      const mockConfidence = 0.85;
      const mockEmotions = [
        { emotion: 'neutral' as AvatarEmotion, score: 0.7 },
        { emotion: 'happy' as AvatarEmotion, score: 0.2 },
        { emotion: 'confused' as AvatarEmotion, score: 0.1 }
      ];
      
      const result = {
        transcription: mockTranscription,
        confidence: mockConfidence,
        emotions: mockEmotions
      };

      // Cache successful transcription
      if (result.transcription?.trim() && result.confidence > 0.6) {
        await this.voiceCache.cacheResponse(`voice_input_${audioHash}`, JSON.stringify(result), 3);
      }

      AvatarPerformanceMonitor.measureVoiceLatency(startTime);
      return result;
    } catch (error) {
      throw ErrorHandler.handleApiError(error);
    }
  }

  /**
   * Enhanced response generation with contextual understanding and emotional context
   */
  async generateResponse(input: string, options: {
    includeEmotion?: boolean;
    includeVisemes?: boolean;
    sessionId?: string;
  } = {}): Promise<{
    text: string;
    emotion?: AvatarEmotion;
    emotionIntensity?: number;
    visemeData?: VisemeData[];
  }> {
    const startTime = performance.now();
    const { includeEmotion = true, includeVisemes = true, sessionId } = options;
    
    try {
      // Get normalized input for caching
      const normalizedInput = this.normalizeInput(input);
      
      // Create cache key based on options
      const cacheOptions = `${includeEmotion ? 'e' : ''}${includeVisemes ? 'v' : ''}`;
      const cacheKey = `response_${cacheOptions}_${normalizedInput}`;
      
      // Check cache first
      const cached = await this.voiceCache.getCachedResponse(cacheKey);
      if (cached) {
        AvatarPerformanceMonitor.measureApiResponseTime(startTime);
        return JSON.parse(cached);
      }

      // Build context for response generation
      const context = await this.buildConversationContext(sessionId);
      
      // Mock implementation for response generation
      // In a real implementation, this would call an AI response generation API
      const mockResponse = `AI response to: ${input}`;
      
      // Prepare result object
      const result: any = { text: mockResponse };
      
      // Add emotion if requested
      if (includeEmotion) {
        const emotionData = await this.detectEmotionFromText(mockResponse);
        result.emotion = emotionData.emotion;
        result.emotionIntensity = emotionData.intensity;
      }
      
      // Add viseme data if requested
      if (includeVisemes) {
        result.visemeData = this.generateVisemeDataForText(mockResponse);
      }
      
      // Update interaction history
      this.recordInteraction(input, mockResponse, result.emotion || 'neutral');

      // Cache result with priority based on complexity
      const priority = this.calculateResponsePriority(input, mockResponse);
      await this.voiceCache.cacheResponse(cacheKey, JSON.stringify(result), priority);

      AvatarPerformanceMonitor.measureApiResponseTime(startTime);
      return result;
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Return fallback response
      const fallback = this.getFallbackResponse(input);
      return {
        text: fallback,
        emotion: 'confused',
        emotionIntensity: 0.7
      };
    }
  }

  /**
   * Speak a response with enhanced TTS and lip-sync support
   */
  async speakResponse(
    text: string, 
    options: {
      onStart?: () => void,
      onViseme?: (viseme: string, time: number) => void,
      onEmotion?: (emotion: AvatarEmotion, intensity: number) => void,
      onProgress?: (progress: number) => void,
      onDone?: () => void
    } = {}
  ): Promise<void> {
    const { onStart, onViseme, onEmotion, onProgress, onDone } = options;
    
    try {
      // Get user preferences
      const prefs = await this.getUserPreferences();
      
      if (!prefs?.voiceEnabled) {
        console.log("Voice synthesis disabled in user preferences");
        if (onDone) onDone();
        return;
      }

      // Detect emotion for speech
      const emotionData = await this.detectEmotionFromText(text);
      if (onEmotion) {
        onEmotion(emotionData.emotion, emotionData.intensity);
      }

      // Generate viseme data for lip sync
      const visemeData = this.generateVisemeDataForText(text);
      
      // Prepare voice options based on emotion and user preferences
      const speechOptions: Speech.SpeechOptions = {
        language: prefs.preferredLanguage || 'en-US',
        pitch: this.adjustPitchForEmotion(prefs.voicePitch || 1.0, emotionData.emotion),
        rate: this.adjustRateForEmotion(prefs.voiceRate || 1.0, emotionData.emotion),
        onStart: () => {
          if (onStart) onStart();
          
          // Start viseme playback
          if (onViseme && visemeData.length > 0) {
            this.playVisemeSequence(visemeData, onViseme);
          }
        },
        onDone: () => {
          if (onDone) onDone();
        },
        onStopped: () => {
          if (onDone) onDone();
        },
        onError: (error) => {
          console.error("Speech error:", error);
          if (onDone) onDone();
        }
      };

      // Start speech
      Speech.speak(text, speechOptions);
      
    } catch (error) {
      console.error("Error in voice synthesis:", error);
      if (options.onDone) options.onDone();
    }
  }

  /**
   * Play viseme sequence for lip sync
   */
  private playVisemeSequence(
    visemeData: VisemeData[], 
    onViseme: (viseme: string, time: number) => void
  ): void {
    const startTime = Date.now();
    
    // Process each viseme with timing
    visemeData.forEach(viseme => {
      setTimeout(() => {
        onViseme(viseme.viseme, Date.now() - startTime);
      }, viseme.startTime);
    });
  }

  /**
   * Adjust speech pitch based on emotion
   */
  private adjustPitchForEmotion(basePitch: number, emotion: AvatarEmotion): number {
    const emotionPitchAdjustments: Record<AvatarEmotion, number> = {
      happy: 0.1,
      sad: -0.15,
      angry: 0.05,
      surprised: 0.2,
      confused: -0.05,
      thinking: -0.1,
      excited: 0.25,
      neutral: 0
    };
    
    return Math.max(0.5, Math.min(2.0, basePitch + (emotionPitchAdjustments[emotion] || 0)));
  }

  /**
   * Adjust speech rate based on emotion
   */
  private adjustRateForEmotion(baseRate: number, emotion: AvatarEmotion): number {
    const emotionRateAdjustments: Record<AvatarEmotion, number> = {
      happy: 0.1,
      sad: -0.2,
      angry: 0.15,
      surprised: 0.1,
      confused: -0.1,
      thinking: -0.15,
      excited: 0.25,
      neutral: 0
    };
    
    return Math.max(0.5, Math.min(2.0, baseRate + (emotionRateAdjustments[emotion] || 0)));
  }

  // ===== LEARNING PATTERNS & INTERACTION HISTORY =====

  /**
   * Record user interaction in history
   */
  private recordInteraction(
    userInput: string, 
    response: string, 
    emotion: AvatarEmotion
  ): void {
    const timestamp = Date.now();
    
    // Add to interaction history
    this.interactionHistory.push({
      userInput,
      response,
      emotion,
      timestamp,
      duration: 0
    });
    
    // Limit history size
    if (this.interactionHistory.length > 100) {
      this.interactionHistory.shift();
    }
    
    // Update learning patterns based on interaction
    this.updateLearningPatterns(userInput, response);
    
    // Save periodically
    if (this.interactionHistory.length % 10 === 0) {
      this.saveInteractionHistory();
    }
  }

  /**
   * Update learning patterns based on user interaction
   */
  private updateLearningPatterns(userInput: string, response: string): void {
    if (!this.learningPattern) {
      this.createNewLearningPattern();
    }
    
    if (this.learningPattern) {
      // Update last active timestamp
      this.learningPattern.lastActiveTimestamp = Date.now();
      
      // Detect subjects in the interaction
      const subjects = this.detectSubjects(userInput + ' ' + response);
      
      // Update subject affinity
      subjects.forEach(subject => {
        if (!this.learningPattern!.subjectAffinity[subject]) {
          this.learningPattern!.subjectAffinity[subject] = 0;
        }
        this.learningPattern!.subjectAffinity[subject] += 0.1;
      });
      
      // Check for engagement triggers
      const engagementKeywords = ['interesting', 'tell me more', 'awesome', 'cool', 'wow'];
      engagementKeywords.forEach(keyword => {
        if (userInput.toLowerCase().includes(keyword.toLowerCase())) {
          if (!this.learningPattern!.engagementTriggers.includes(keyword)) {
            this.learningPattern!.engagementTriggers.push(keyword);
          }
        }
      });
      
      // Check for frustration triggers
      const frustrationKeywords = ['don\'t understand', 'confused', 'not helpful', 'try again'];
      frustrationKeywords.forEach(keyword => {
        if (userInput.toLowerCase().includes(keyword.toLowerCase())) {
          if (!this.learningPattern!.frustrationTriggers.includes(keyword)) {
            this.learningPattern!.frustrationTriggers.push(keyword);
          }
        }
      });
      
      // Save learning patterns periodically
      this.saveLearningPatterns();
    }
  }

  /**
   * Detect subjects in text
   */
  private detectSubjects(text: string): string[] {
    // Simple keyword-based subject detection
    // In a real implementation, this would use NLP or a subject detection API
    const subjectKeywords: Record<string, string[]> = {
      'math': ['math', 'algebra', 'geometry', 'calculus', 'equation'],
      'science': ['science', 'physics', 'chemistry', 'biology', 'experiment'],
      'history': ['history', 'past', 'ancient', 'civilization', 'war'],
      'language': ['language', 'grammar', 'vocabulary', 'writing', 'reading'],
      'art': ['art', 'drawing', 'painting', 'creativity', 'design'],
      'technology': ['technology', 'computer', 'programming', 'code', 'software'],
    };
    
    const detectedSubjects: string[] = [];
    
    Object.entries(subjectKeywords).forEach(([subject, keywords]) => {
      keywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword.toLowerCase()) && !detectedSubjects.includes(subject)) {
          detectedSubjects.push(subject);
        }
      });
    });
    
    return detectedSubjects;
  }

  /**
   * Create a new learning pattern record
   */
  private createNewLearningPattern(): void {
    this.learningPattern = {
      subjectAffinity: {},
      learningSpeed: {},
      engagementTriggers: [],
      frustrationTriggers: [],
      lastActiveTimestamp: Date.now(),
      quizPerformance: {},
      sessionDurations: [],
      preferredContentTypes: []
    };
  }

  /**
   * Get personalized learning recommendations based on patterns
   */
  async getLearningRecommendations(): Promise<{
    subject: string,
    level: string,
    reason: string
  }[]> {
    if (!this.learningPattern) {
      return [];
    }
    
    // Get top subjects by affinity
    const subjects = Object.entries(this.learningPattern.subjectAffinity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([subject]) => subject);
    
    // Build recommendations
    return subjects.map(subject => {
      // Determine level based on performance or default to beginner
      const performance = this.learningPattern!.quizPerformance[subject] || 0;
      let level = 'beginner';
      
      if (performance > 0.8) {
        level = 'advanced';
      } else if (performance > 0.5) {
        level = 'intermediate';
      }
      
      return {
        subject,
        level,
        reason: `Based on your learning patterns and interests in ${subject}`
      };
    });
  }

  /**
   * Save interaction history to storage
   */
  private async saveInteractionHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.INTERACTION_HISTORY,
        JSON.stringify(this.interactionHistory.slice(-50)) // Save last 50 interactions
      );
    } catch (error) {
      console.warn('Failed to save interaction history:', error);
    }
  }

  /**
   * Load interaction history from storage
   */
  private async loadInteractionHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.INTERACTION_HISTORY);
      if (stored) {
        this.interactionHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load interaction history:', error);
    }
  }

  /**
   * Save learning patterns to storage
   */
  private async saveLearningPatterns(): Promise<void> {
    try {
      if (this.learningPattern) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.LEARNING_PATTERNS,
          JSON.stringify(this.learningPattern)
        );
      }
    } catch (error) {
      console.warn('Failed to save learning patterns:', error);
    }
  }

  /**
   * Load learning patterns from storage
   */
  private async loadLearningPatterns(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LEARNING_PATTERNS);
      if (stored) {
        this.learningPattern = JSON.parse(stored);
      } else {
        this.createNewLearningPattern();
      }
    } catch (error) {
      console.warn('Failed to load learning patterns:', error);
      this.createNewLearningPattern();
    }
  }

  /**
   * Load emotion settings from storage
   */
  private async loadEmotionSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.EMOTION_SETTINGS);
      if (stored) {
        this.emotionSettings = {
          ...this.emotionSettings,
          ...JSON.parse(stored)
        };
      }
    } catch (error) {
      console.warn('Failed to load emotion settings:', error);
    }
  }

  /**
   * Save emotion settings to storage
   */
  async saveEmotionSettings(settings: Partial<EmotionSettings>): Promise<void> {
    try {
      this.emotionSettings = {
        ...this.emotionSettings,
        ...settings
      };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.EMOTION_SETTINGS,
        JSON.stringify(this.emotionSettings)
      );
    } catch (error) {
      console.warn('Failed to save emotion settings:', error);
    }
  }

  // ===== USER PREFERENCES =====

  /**
   * Enhanced user preferences management with validation and caching
   */
  async getUserPreferences(): Promise<UserPreferences | null> {
    const startTime = performance.now();
    
    try {
      // Try cache first
      const cached = await AvatarCacheManager.getUserDataCache().getCachedUserPreferences('current');
      if (cached) {
        AvatarPerformanceMonitor.measureApiResponseTime(startTime);
        return cached;
      }

      // Fallback to optimizedAvatarService implementation
      return await optimizedAvatarService.getUserPreferences();
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      // Fallback to default preferences
      return this.defaultPreferences;
    }
  }

  /**
   * Save user preferences with validation
   */
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    // Delegate to optimizedAvatarService implementation
    return optimizedAvatarService.saveUserPreferences(preferences);
  }

  // ===== UTILITY METHODS =====

  private async getAudioFileHash(audioUri: string): Promise<string> {
    try {
      const fileInfo = await RNFS.stat(audioUri);
      return `${fileInfo.size}_${fileInfo.mtime}`;
    } catch {
      // Fallback to URI-based hash
      return audioUri.split('/').pop() || audioUri;
    }
  }

  private getOptimizedVoiceConfig(): VoiceProcessingConfig {
    return optimizedAvatarService.getOptimizedVoiceConfig();
  }

  private normalizeInput(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  private async buildConversationContext(sessionId?: string): Promise<any> {
    try {
      const activeSessionId = sessionId || await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (!activeSessionId) {
        return {};
      }

      // Get recent conversation history
      const history = await AvatarCacheManager.getUserDataCache()
        .getCachedConversationHistory(activeSessionId);
      
      // Add learning patterns if available
      const learningContext = this.learningPattern ? {
        topSubjects: Object.entries(this.learningPattern.subjectAffinity)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([subject]) => subject),
        frustrationTriggers: this.learningPattern.frustrationTriggers,
        engagementTriggers: this.learningPattern.engagementTriggers
      } : {};
      
      return {
        sessionId: activeSessionId,
        recentHistory: history?.slice(-5) || [], // Last 5 exchanges
        learningContext,
        timestamp: Date.now(),
      };
    } catch {
      return {};
    }
  }

  private calculateResponsePriority(input: string, response: string): number {
    return optimizedAvatarService.calculateResponsePriority(input, response);
  }

  private getFallbackResponse(input: string): string {
    const fallbacks = [
      "I'm having trouble processing that right now. Could you try rephrasing your question?",
      "Let me think about that differently. Can you give me a bit more context?",
      "I'm experiencing some technical difficulties. Please try again in a moment.",
      "That's an interesting question. While I work on a better response, is there anything else I can help with?",
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // ===== PERFORMANCE MONITORING =====

  /**
   * Update performance metrics
   */
  async updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): Promise<void> {
    return optimizedAvatarService.updatePerformanceMetrics(metrics);
  }

  /**
   * Load performance metrics from storage
   */
  private async loadPerformanceMetrics(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PERFORMANCE_METRICS);
      if (stored) {
        this.performanceMetrics = { ...this.performanceMetrics, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load performance metrics:', error);
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): string {
    return optimizedAvatarService.getPerformanceReport();
  }

  /**
   * Optimize storage usage
   */
  async optimizeStorage(): Promise<void> {
    return optimizedAvatarService.optimizeStorage();
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    optimizedAvatarService.destroy();
  }
}

// Export singleton instance
export const enhancedAvatarService = new EnhancedAvatarService();