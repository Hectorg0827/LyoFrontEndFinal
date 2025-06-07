// Adaptive Learning Service
// This service provides personalized content difficulty adjustment based on user interactions and performance

import AsyncStorage from '@react-native-async-storage/async-storage';
import { enhancedAvatarService } from './enhancedAvatarService';
import { ErrorHandler, ErrorType } from './errorHandler';
import { AvatarEmotion } from '../types/avatar';

// Define the levels of difficulty
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Define learning domains/subjects
export type LearningDomain = 
  | 'math' 
  | 'science' 
  | 'language' 
  | 'history' 
  | 'art' 
  | 'technology'
  | 'general';

// Student performance record
export interface PerformanceRecord {
  domain: LearningDomain;
  level: DifficultyLevel;
  score: number; // 0-100
  timestamp: number;
  completionTime: number; // in seconds
  emotionalResponses: Array<{
    emotion: AvatarEmotion;
    count: number;
  }>;
}

// Adaptive settings for a domain
export interface AdaptiveSettings {
  domain: LearningDomain;
  currentLevel: DifficultyLevel;
  adaptiveFactors: {
    performanceWeight: number; // How much test scores affect difficulty (0-1)
    emotionWeight: number; // How much emotional responses affect difficulty (0-1)
    timeWeight: number; // How much completion time affects difficulty (0-1)
    adaptationSpeed: number; // How quickly difficulty changes (0-1)
  };
  history: PerformanceRecord[];
}

// User adaptive learning profile
export interface AdaptiveLearningProfile {
  userId: string;
  domains: Record<LearningDomain, AdaptiveSettings>;
  globalSettings: {
    adaptationEnabled: boolean;
    emotionDetectionEnabled: boolean;
    difficultyRange: {
      min: DifficultyLevel;
      max: DifficultyLevel;
    };
    adaptationSpeed: number; // 0-1, how quickly to adapt
  };
  lastUpdated: number;
}

// Storage keys
const STORAGE_KEYS = {
  ADAPTIVE_PROFILE: 'lyo_adaptive_learning_profile',
  PERFORMANCE_HISTORY: 'lyo_learning_performance_history',
};

// Define values for difficulty levels for calculations
const DIFFICULTY_VALUES: Record<DifficultyLevel, number> = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4,
};

// Default adaptive settings for new domains
const DEFAULT_ADAPTIVE_SETTINGS: Omit<AdaptiveSettings, 'domain'> = {
  currentLevel: 'beginner',
  adaptiveFactors: {
    performanceWeight: 0.6,
    emotionWeight: 0.2,
    timeWeight: 0.2,
    adaptationSpeed: 0.5,
  },
  history: [],
};

// Default profile for new users
const DEFAULT_PROFILE: Omit<AdaptiveLearningProfile, 'userId'> = {
  domains: {
    math: { ...DEFAULT_ADAPTIVE_SETTINGS, domain: 'math' },
    science: { ...DEFAULT_ADAPTIVE_SETTINGS, domain: 'science' },
    language: { ...DEFAULT_ADAPTIVE_SETTINGS, domain: 'language' },
    history: { ...DEFAULT_ADAPTIVE_SETTINGS, domain: 'history' },
    art: { ...DEFAULT_ADAPTIVE_SETTINGS, domain: 'art' },
    technology: { ...DEFAULT_ADAPTIVE_SETTINGS, domain: 'technology' },
    general: { ...DEFAULT_ADAPTIVE_SETTINGS, domain: 'general' },
  },
  globalSettings: {
    adaptationEnabled: true,
    emotionDetectionEnabled: true,
    difficultyRange: {
      min: 'beginner',
      max: 'expert',
    },
    adaptationSpeed: 0.5,
  },
  lastUpdated: Date.now(),
};

// Emotional impact scores: how each emotion affects difficulty adjustment
const EMOTION_IMPACT: Record<AvatarEmotion, number> = {
  'happy': 0.1, // Slight increase in difficulty
  'excited': 0.2, // Moderate increase in difficulty
  'neutral': 0, // No change
  'thinking': 0, // No change
  'confused': -0.15, // Moderate decrease in difficulty
  'sad': -0.2, // Significant decrease in difficulty
  'angry': -0.1, // Slight decrease in difficulty
  'surprised': 0.05, // Very slight increase in difficulty
};

class AdaptiveLearningService {
  /**
   * Get user's adaptive learning profile
   */
  async getUserProfile(userId: string): Promise<AdaptiveLearningProfile> {
    try {
      const profileStr = await AsyncStorage.getItem(`${STORAGE_KEYS.ADAPTIVE_PROFILE}_${userId}`);
      
      if (!profileStr) {
        // Create new profile if none exists
        const newProfile: AdaptiveLearningProfile = {
          userId,
          ...DEFAULT_PROFILE,
        };
        
        await this.saveUserProfile(newProfile);
        return newProfile;
      }
      
      return JSON.parse(profileStr);
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.Storage,
        'Failed to load adaptive learning profile',
        error
      );
    }
  }
  
  /**
   * Save user's adaptive learning profile
   */
  async saveUserProfile(profile: AdaptiveLearningProfile): Promise<void> {
    try {
      // Update timestamp
      profile.lastUpdated = Date.now();
      
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.ADAPTIVE_PROFILE}_${profile.userId}`,
        JSON.stringify(profile)
      );
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.Storage,
        'Failed to save adaptive learning profile',
        error
      );
    }
  }
  
  /**
   * Record a performance result and recalculate difficulty
   */
  async recordPerformance(
    userId: string,
    performance: Omit<PerformanceRecord, 'timestamp' | 'emotionalResponses'>
  ): Promise<DifficultyLevel> {
    try {
      const profile = await this.getUserProfile(userId);
      
      if (!profile.globalSettings.adaptationEnabled) {
        // If adaptation is disabled, just return current level without adjusting
        return profile.domains[performance.domain].currentLevel;
      }
      
      // Get emotional responses from the avatar service
      const emotionalResponses = await this.getEmotionalResponses();
      
      // Create complete performance record
      const record: PerformanceRecord = {
        ...performance,
        timestamp: Date.now(),
        emotionalResponses,
      };
      
      // Add to domain history
      profile.domains[performance.domain].history.push(record);
      
      // Keep only last 10 performances for the domain
      if (profile.domains[performance.domain].history.length > 10) {
        profile.domains[performance.domain].history = 
          profile.domains[performance.domain].history.slice(-10);
      }
      
      // Calculate new difficulty level
      const newLevel = this.calculateNewDifficultyLevel(
        profile.domains[performance.domain],
        record,
        profile.globalSettings
      );
      
      // Update domain's current level
      profile.domains[performance.domain].currentLevel = newLevel;
      
      // Save updated profile
      await this.saveUserProfile(profile);
      
      return newLevel;
    } catch (error) {
      console.error('Failed to record performance:', error);
      // If error occurs, use the current difficulty level as fallback
      const profile = await this.getUserProfile(userId);
      return profile.domains[performance.domain].currentLevel;
    }
  }
  
  /**
   * Calculate a new difficulty level based on performance and emotional responses
   */
  private calculateNewDifficultyLevel(
    domainSettings: AdaptiveSettings,
    newPerformance: PerformanceRecord,
    globalSettings: AdaptiveLearningProfile['globalSettings']
  ): DifficultyLevel {
    // Get current level as a numeric value
    const currentLevelValue = DIFFICULTY_VALUES[domainSettings.currentLevel];
    
    // Calculate performance factor (-1 to +1)
    // Higher scores push difficulty up, lower scores push it down
    const performanceFactor = this.calculatePerformanceFactor(newPerformance.score);
    
    // Calculate emotion factor (-1 to +1)
    const emotionFactor = globalSettings.emotionDetectionEnabled 
      ? this.calculateEmotionFactor(newPerformance.emotionalResponses)
      : 0;
    
    // Calculate time factor (-1 to +1)
    const timeFactor = this.calculateTimeFactor(
      newPerformance.completionTime, 
      domainSettings.history
    );
    
    // Combine factors based on weights
    const { performanceWeight, emotionWeight, timeWeight, adaptationSpeed } = 
      domainSettings.adaptiveFactors;
    
    const totalAdjustment = (
      (performanceFactor * performanceWeight) +
      (emotionFactor * emotionWeight) +
      (timeFactor * timeWeight)
    ) * adaptationSpeed * globalSettings.adaptationSpeed;
    
    // Calculate new level value with adjustment
    // This creates a floating point value we'll round to get the final level
    let newLevelValue = currentLevelValue + totalAdjustment;
    
    // Ensure the level stays within global min/max range
    const minValue = DIFFICULTY_VALUES[globalSettings.difficultyRange.min];
    const maxValue = DIFFICULTY_VALUES[globalSettings.difficultyRange.max];
    newLevelValue = Math.max(minValue, Math.min(maxValue, newLevelValue));
    
    // Round to nearest level
    const difficultyLevels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const roundedLevelIndex = Math.round(newLevelValue) - 1;
    
    // Ensure index is valid
    if (roundedLevelIndex < 0) return 'beginner';
    if (roundedLevelIndex >= difficultyLevels.length) return 'expert';
    
    return difficultyLevels[roundedLevelIndex];
  }
  
  /**
   * Calculate a performance factor between -1 and 1
   * Positive values indicate the difficulty should increase
   * Negative values indicate the difficulty should decrease
   */
  private calculatePerformanceFactor(score: number): number {
    // Map score from 0-100 to -1 to 1 range
    // 50 is neutral (0), below 50 is negative, above 50 is positive
    return (score - 50) / 50;
  }
  
  /**
   * Calculate an emotion factor between -1 and 1
   * How emotional responses affect difficulty
   */
  private calculateEmotionFactor(
    emotionalResponses: PerformanceRecord['emotionalResponses']
  ): number {
    if (!emotionalResponses || emotionalResponses.length === 0) {
      return 0;
    }
    
    // Calculate weighted impact of all emotions
    let totalImpact = 0;
    let totalCount = 0;
    
    emotionalResponses.forEach(({ emotion, count }) => {
      totalImpact += EMOTION_IMPACT[emotion] * count;
      totalCount += count;
    });
    
    // Normalize by total count
    return totalCount > 0 ? totalImpact / totalCount : 0;
  }
  
  /**
   * Calculate a time factor between -1 and 1
   * How completion time affects difficulty
   */
  private calculateTimeFactor(
    completionTime: number,
    history: PerformanceRecord[]
  ): number {
    if (history.length < 2) {
      return 0; // Not enough history to calculate time factor
    }
    
    // Get average completion time from history (excluding current performance)
    const avgCompletionTime = history
      .slice(0, -1)
      .reduce((sum, record) => sum + record.completionTime, 0) / (history.length - 1);
    
    // Compare current time to average
    // Faster completion times suggest the difficulty could increase
    // Slower completion times suggest the difficulty should decrease
    const timeDifference = avgCompletionTime - completionTime;
    
    // Normalize to -1 to 1 scale
    // If the difference is within ±30% of average, scale to full -1 to 1 range
    return Math.max(-1, Math.min(1, timeDifference / (avgCompletionTime * 0.3)));
  }
  
  /**
   * Get recommended difficulty for a domain
   */
  async getRecommendedDifficulty(
    userId: string,
    domain: LearningDomain
  ): Promise<DifficultyLevel> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile.domains[domain].currentLevel;
    } catch (error) {
      console.error('Failed to get recommended difficulty:', error);
      return 'beginner'; // Default to beginner level on error
    }
  }
  
  /**
   * Update adaptive learning settings for a specific domain
   */
  async updateDomainSettings(
    userId: string,
    domain: LearningDomain,
    settings: Partial<AdaptiveSettings>
  ): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      
      profile.domains[domain] = {
        ...profile.domains[domain],
        ...settings,
        domain, // Ensure domain field can't be changed
      };
      
      await this.saveUserProfile(profile);
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.Storage,
        'Failed to update domain settings',
        error
      );
    }
  }
  
  /**
   * Update global adaptive learning settings
   */
  async updateGlobalSettings(
    userId: string,
    settings: Partial<AdaptiveLearningProfile['globalSettings']>
  ): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      
      profile.globalSettings = {
        ...profile.globalSettings,
        ...settings,
      };
      
      await this.saveUserProfile(profile);
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.Storage,
        'Failed to update global settings',
        error
      );
    }
  }
  
  /**
   * Get recent performance history for a domain
   */
  async getDomainPerformanceHistory(
    userId: string,
    domain: LearningDomain
  ): Promise<PerformanceRecord[]> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile.domains[domain].history;
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.Storage,
        'Failed to get domain performance history',
        error
      );
    }
  }
  
  /**
   * Get overall progress report for all domains
   */
  async getProgressReport(userId: string): Promise<{
    domains: Record<LearningDomain, {
      level: DifficultyLevel;
      averageScore: number;
      progress: number; // 0-100%
      trend: 'improving' | 'steady' | 'declining';
    }>;
    overallProgress: number; // 0-100%
    recommendedFocus: LearningDomain[];
  }> {
    try {
      const profile = await this.getUserProfile(userId);
      const domainReports: Record<LearningDomain, any> = {} as any;
      
      // Calculate domain-specific stats
      Object.entries(profile.domains).forEach(([domain, settings]) => {
        const typedDomain = domain as LearningDomain;
        const history = settings.history;
        
        if (history.length === 0) {
          domainReports[typedDomain] = {
            level: settings.currentLevel,
            averageScore: 0,
            progress: 0,
            trend: 'steady',
          };
          return;
        }
        
        // Calculate average score
        const averageScore = history.reduce((sum, record) => sum + record.score, 0) / history.length;
        
        // Calculate progress based on difficulty level and average score
        const maxDifficultyValue = DIFFICULTY_VALUES['expert'];
        const currentDifficultyValue = DIFFICULTY_VALUES[settings.currentLevel];
        const progress = (currentDifficultyValue / maxDifficultyValue) * 100 * (averageScore / 100);
        
        // Calculate trend
        let trend: 'improving' | 'steady' | 'declining' = 'steady';
        if (history.length >= 3) {
          const recentScores = history.slice(-3).map(h => h.score);
          const oldAvg = (recentScores[0] + recentScores[1]) / 2;
          const newAvg = recentScores[2];
          
          if (newAvg > oldAvg + 5) {
            trend = 'improving';
          } else if (newAvg < oldAvg - 5) {
            trend = 'declining';
          }
        }
        
        domainReports[typedDomain] = {
          level: settings.currentLevel,
          averageScore,
          progress,
          trend,
        };
      });
      
      // Calculate overall progress (average of domain progress)
      const domains = Object.keys(domainReports) as LearningDomain[];
      const overallProgress = domains.reduce(
        (sum, domain) => sum + domainReports[domain].progress, 
        0
      ) / domains.length;
      
      // Determine recommended focus areas (lowest progress domains)
      const recommendedFocus = [...domains]
        .sort((a, b) => domainReports[a].progress - domainReports[b].progress)
        .slice(0, 2);
      
      return {
        domains: domainReports,
        overallProgress,
        recommendedFocus,
      };
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.Storage,
        'Failed to generate progress report',
        error
      );
    }
  }
  
  /**
   * Get emotional responses from avatar service
   * This is a mock implementation since we don't have real emotion data
   */
  private async getEmotionalResponses(): Promise<PerformanceRecord['emotionalResponses']> {
    try {
      // In a real implementation, this would get data from the avatar service
      // For now, we'll generate mock data
      const emotions: AvatarEmotion[] = ['happy', 'confused', 'thinking', 'neutral'];
      const selectedEmotions = emotions
        .filter(() => Math.random() > 0.5)
        .map(emotion => ({
          emotion,
          count: Math.floor(Math.random() * 5) + 1
        }));
      
      // Ensure at least one emotion
      if (selectedEmotions.length === 0) {
        selectedEmotions.push({
          emotion: 'neutral',
          count: 1
        });
      }
      
      return selectedEmotions;
    } catch (error) {
      console.error('Failed to get emotional responses:', error);
      return [{
        emotion: 'neutral',
        count: 1
      }];
    }
  }
  
  /**
   * Reset user's adaptive learning profile
   */
  async resetUserProfile(userId: string): Promise<void> {
    try {
      const newProfile: AdaptiveLearningProfile = {
        userId,
        ...DEFAULT_PROFILE,
      };
      
      await this.saveUserProfile(newProfile);
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.Storage,
        'Failed to reset adaptive learning profile',
        error
      );
    }
  }
}

export const adaptiveLearningService = new AdaptiveLearningService();