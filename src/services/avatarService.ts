import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { ENV } from "../config/env";
import { AppError, ErrorType } from "../utils/AppError";
import apiService from "./apiService";

// Types for avatar interactions
export interface AvatarMessage {
  text: string;
  timestamp: number;
  detected_topics?: string[];
  moderated?: boolean;
  include_reaction_buttons?: boolean;
  suggest_advanced_content?: boolean;
}

export interface AvatarContext {
  topics_covered: string[];
  learning_goals: string[];
  current_module?: string;
  engagement_level: number;
  last_interaction: number;
}

export interface UserPreferences {
  voiceEnabled: boolean;
  animationsEnabled: boolean;
  avatarColor: string;
  voiceRate: number;
  voicePitch: number;
  learningInterests: string[];
  courseHistory: string[];
  accessibilityMode: boolean;
  subtitlesEnabled: boolean;
  avatarSize: "small" | "medium" | "large";
  avatarPersonality: "friendly" | "professional" | "enthusiastic";
  autoHideAvatar: boolean;
  preferredLanguage: string;
  notificationSettings: {
    newCourseRecommendations: boolean;
    studyReminders: boolean;
    communityUpdates: boolean;
  };
  theme: "dark" | "light" | "system";
}

// Storage keys
const STORAGE_KEYS = {
  PREFERENCES: `${ENV.STORAGE_PREFIX}user_preferences`,
  CHAT_HISTORY: `${ENV.STORAGE_PREFIX}chat_history`,
  SESSION_ID: `${ENV.STORAGE_PREFIX}conversation_session`,
};

class AvatarService {
  private defaultPreferences: UserPreferences = {
    voiceEnabled: true,
    animationsEnabled: true,
    avatarColor: "#8E54E9",
    voiceRate: 1.0,
    voicePitch: 1.0,
    learningInterests: [],
    courseHistory: [],
    accessibilityMode: false,
    subtitlesEnabled: false,
    avatarSize: "medium",
    avatarPersonality: "friendly",
    autoHideAvatar: false,
    preferredLanguage: "en-US",
    notificationSettings: {
      newCourseRecommendations: true,
      studyReminders: false,
      communityUpdates: false,
    },
    theme: "system",
  };

  /**
   * Send a message to the AI avatar and get a response
   */
  async sendMessage(
    message: string,
    sessionId?: string
  ): Promise<AvatarMessage> {
    try {
      return await apiService.sendMessageToAvatar(message, sessionId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to communicate with Avatar AI",
        error
      );
    }
  }

  /**
   * Get the user's current avatar context
   */
  async getContext(): Promise<AvatarContext> {
    try {
      const response = await apiService.get("/ai/avatar/context");
      return response;
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to retrieve Avatar context",
        error
      );
    }
  }

  /**
   * Update the user's avatar context with new information
   */
  async updateContext(contextData: Partial<AvatarContext>): Promise<AvatarContext> {
    try {
      const response = await apiService.post("/ai/avatar/context", contextData);
      return response;
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to update Avatar context",
        error
      );
    }
  }

  /**
   * Generate a lesson on a specific topic
   */
  async generateLesson(
    subject: string,
    topic: string,
    difficulty: "beginner" | "intermediate" | "advanced" = "beginner",
    duration: number = 30
  ): Promise<any> {
    try {
      const response = await apiService.post("/ai/classroom/lesson", {
        subject,
        topic,
        difficulty,
        duration
      });
      return response;
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to generate lesson",
        error
      );
    }
  }

  /**
   * Generate a quiz on a specific topic
   */
  async generateQuiz(
    subject: string,
    topic: string,
    difficulty: "beginner" | "intermediate" | "advanced" = "beginner",
    numQuestions: number = 5
  ): Promise<any> {
    try {
      const response = await apiService.post("/ai/classroom/quiz", {
        subject,
        topic,
        difficulty,
        num_questions: numQuestions
      });
      return response;
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to generate quiz",
        error
      );
    }
  }

  /**
   * Search for external educational content
   */
  async searchContent(
    query: string,
    contentTypes: string[] = ["video", "book", "course", "podcast"],
    maxResultsPerType: number = 5
  ): Promise<any> {
    try {
      const response = await apiService.post("/ai/content/search", {
        query,
        content_types: contentTypes,
        max_results_per_type: maxResultsPerType,
        safe_search: true
      });
      return response;
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to search for content",
        error
      );
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      // First try to load from API
      try {
        const response = await apiService.get("/user/preferences");
        const prefsToStore: UserPreferences = {
          ...this.defaultPreferences,
          ...response,
        };
        
        // Cache the preferences locally
        await AsyncStorage.setItem(
          STORAGE_KEYS.PREFERENCES,
          JSON.stringify(prefsToStore)
        );
        
        return prefsToStore;
      } catch (error) {
        // If API fails, try to load from local storage
        console.warn("Failed to load preferences from API, falling back to local storage");
      }
      
      // Try to load from local storage
      const prefsString = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (prefsString) {
        const localPrefs = JSON.parse(prefsString) as Partial<UserPreferences>;
        return { ...this.defaultPreferences, ...localPrefs };
      }
      
      // If no preferences found, return defaults
      return { ...this.defaultPreferences };
    } catch (error: any) {
      console.error("Error retrieving user preferences:", error);
      return { ...this.defaultPreferences };
    }
  }

  /**
   * Save user preferences
   */
  async saveUserPreferences(prefs: UserPreferences): Promise<void> {
    try {
      // First save to API
      try {
        await apiService.post("/user/preferences", prefs);
      } catch (error) {
        // If API save fails, just log it but continue to save locally
        console.warn("Failed to save preferences to API, saving locally only");
      }
      
      // Always save to local storage
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(prefs)
      );
    } catch (error: any) {
      throw new AppError(
        ErrorType.Storage,
        "Failed to save user preferences",
        error
      );
    }
  }

  /**
   * Add a course to user's history
   */
  async addToCourseHistory(courseTitleOrId: string): Promise<void> {
    try {
      const currentPrefs = await this.getUserPreferences();
      const courseHistory = currentPrefs.courseHistory || [];
      
      if (!courseHistory.includes(courseTitleOrId)) {
        // Keep only the last 10 courses
        const newCourseHistory = [...courseHistory, courseTitleOrId].slice(-10);
        
        const updatedPrefs: UserPreferences = {
          ...currentPrefs,
          courseHistory: newCourseHistory,
        };
        
        await this.saveUserPreferences(updatedPrefs);
      }
    } catch (error: any) {
      console.error("Error adding to course history:", error);
    }
  }

  /**
   * Add a learning interest
   */
  async addLearningInterest(interest: string): Promise<void> {
    try {
      const currentPrefs = await this.getUserPreferences();
      const learningInterests = currentPrefs.learningInterests || [];
      
      if (!learningInterests.includes(interest)) {
        const updatedPrefs: UserPreferences = {
          ...currentPrefs,
          learningInterests: [...learningInterests, interest],
        };
        
        await this.saveUserPreferences(updatedPrefs);
      }
    } catch (error: any) {
      console.error("Error adding learning interest:", error);
    }
  }

  /**
   * Remove a learning interest
   */
  async removeLearningInterest(interest: string): Promise<void> {
    try {
      const currentPrefs = await this.getUserPreferences();
      const learningInterests = currentPrefs.learningInterests || [];
      
      const newLearningInterests = learningInterests.filter(i => i !== interest);
      
      if (newLearningInterests.length !== learningInterests.length) {
        const updatedPrefs: UserPreferences = {
          ...currentPrefs,
          learningInterests: newLearningInterests,
        };
        
        await this.saveUserPreferences(updatedPrefs);
      }
    } catch (error: any) {
      console.error("Error removing learning interest:", error);
    }
  }

  /**
   * Get or create a session ID for avatar conversations
   */
  async getOrCreateSessionId(): Promise<string> {
    try {
      const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (sessionId) {
        return sessionId;
      }
      
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
      
      return newSessionId;
    } catch (error: any) {
      console.error("Error managing session ID:", error);
      return `temp_session_${Date.now()}`;
    }
  }

  /**
   * Speak a response using text-to-speech (voice synthesis)
   */
  async speakResponse(text: string): Promise<void> {
    try {
      const prefs = await this.getUserPreferences();
      
      if (!prefs.voiceEnabled) {
        console.log("Voice synthesis disabled in user preferences");
        return;
      }

      // Use Expo Speech API for text-to-speech
      const Speech = require('expo-speech');
      
      const options = {
        language: prefs.preferredLanguage || 'en-US',
        pitch: prefs.voicePitch || 1.0,
        rate: prefs.voiceRate || 1.0,
      };

      await Speech.speak(text, options);
      
    } catch (error: any) {
      console.error("Error in voice synthesis:", error);
      // Gracefully fail - don't throw error for non-critical feature
    }
  }

  /**
   * Generate a course using AI
   */
  async generateCourse(
    topic: string,
    difficulty: "beginner" | "intermediate" | "advanced" = "beginner"
  ): Promise<any> {
    try {
      const response = await apiService.post("/ai/course/generate", {
        topic,
        difficulty,
        includeQuizzes: true,
        includePracticeExercises: true,
        duration: 60, // 1 hour default
      });
      
      return response;
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to generate course",
        error
      );
    }
  }
}

export const avatarService = new AvatarService();