import {
  USE_BACKEND_API as ENV_USE_BACKEND_API,
  API_TIMEOUT as ENV_API_TIMEOUT,
  STORAGE_PREFIX as ENV_STORAGE_PREFIX,
} from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
// Environment variables: USE_BACKEND_API, API_TIMEOUT, STORAGE_PREFIX. No LLM keys here.

import RNFS from "react-native-fs"; // Import react-native-fs

import { audioRecordingService } from "./audioRecordingService";
import {
  avatarApiService,
  Course as ApiCourse,
  CourseModule as ApiCourseModule,
  AvatarMessageResponse as ApiMessage,
  CourseGenerationRequest,
  RecommendationsRequestParams,
  UserPreferences as ApiUserPreferences,
  RecommendationsResponse,
} from "./avatarApiService";
import {
  ErrorHandler,
  ErrorType,
  AppError as AppErrorClass,
} from "./errorHandler";
// avatarApiService is the gateway to LyoBackendNew

const USE_BACKEND_API = ENV_USE_BACKEND_API === "true";
const API_TIMEOUT = parseInt(ENV_API_TIMEOUT || "15000", 10); // Default to 15 seconds
const STORAGE_PREFIX = ENV_STORAGE_PREFIX || "lyoApp_";

// Types for service responses (can alias from apiService or define if structure differs)
export interface CourseModule extends ApiCourseModule {}
export interface Course extends ApiCourse {}
export interface Message extends ApiMessage {
  sender: "user" | "lyo" | "assistant";
}

// User preferences interface - Extends ApiUserPreferences
export interface UserPreferences extends ApiUserPreferences {
  // Frontend specific or extended fields can be added here if necessary
}

// Storage keys
const STORAGE_KEYS = {
  PREFERENCES: `${STORAGE_PREFIX}user_preferences`,
  // courseHistory is part of UserPreferences, no separate key needed if managed within prefs object
  CHAT_HISTORY: `${STORAGE_PREFIX}chat_history`,
  SESSION_ID: `${STORAGE_PREFIX}conversation_session`,
};

class AvatarService {
  private defaultPreferences: UserPreferences = {
    voiceEnabled: true,
    animationsEnabled: true,
    avatarColor: "#8E54E9",
    voiceRate: 1.0,
    voicePitch: 1.0,
    learningInterests: [],
    courseHistory: [], // Part of ApiUserPreferences, so it's included
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
    // Any other fields from ApiUserPreferences should have defaults if not optional
  };

  // Method to generate a response from the avatar (via backend)
  async generateResponse(
    message: string,
    conversationHistory?: Message[],
  ): Promise<string> {
    try {
      if (!message || message.trim() === "") {
        throw new AppErrorClass(
          ErrorType.Validation,
          "Message cannot be empty.",
        );
      }

      if (USE_BACKEND_API) {
        try {
          const sessionId = await this.getOrCreateSessionId();
          console.log(
            `Sending message to backend with session ID: ${sessionId}, message: "${message}"`,
          );
          const response = await avatarApiService.sendMessage(
            message,
            sessionId,
          );
          console.log("Received response from backend:", response);
          return response.text;
        } catch (backendError: any) {
          ErrorHandler.processError(
            backendError,
            "generateResponse - backend_error",
          );
          const errorMessage =
            backendError instanceof Error
              ? backendError.message
              : String(backendError);
          console.warn(
            `Backend API failed for generateResponse. Falling back to mock response. Error: ${errorMessage}`,
          );
          await this.simulateNetworkDelay();
          return this.mockResponseGeneration(message); // Fallback to mock
        }
      } else {
        console.log(
          "USE_BACKEND_API is false. Using mock response for generateResponse.",
        );
        await this.simulateNetworkDelay();
        return this.mockResponseGeneration(message);
      }
    } catch (error: any) {
      if (error instanceof AppErrorClass) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error in generateResponse: ${errorMessage}`, error);
      throw ErrorHandler.processError(error, "generateResponse - main");
    }
  }

  private async getOrCreateSessionId(): Promise<string> {
    try {
      const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (sessionId) {
        return sessionId;
      }
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
      console.log(`New session ID created: ${newSessionId}`);
      return newSessionId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error managing session ID: ${errorMessage}`, error);
      ErrorHandler.processError(error, "getOrCreateSessionId");
      return `temp_session_${Date.now()}`; // Fallback temporary ID
    }
  }

  async generateCourse(
    topic: string,
    userInterests?: string[],
    difficultyLevel?: "beginner" | "intermediate" | "advanced",
  ): Promise<Course> {
    try {
      if (USE_BACKEND_API) {
        const request: CourseGenerationRequest = {
          topic,
          difficulty: difficultyLevel || "beginner",
        };
        if (userInterests && userInterests.length > 0) {
          request.preferred_resources = [...userInterests]; // Create a copy of the array
        }
        console.log(
          "Attempting to generate course via backend with request:",
          JSON.stringify(request),
        );
        const course = await avatarApiService.generateCourse(request);
        console.log("Successfully generated course via backend:", course);
        return course;
      } else {
        console.log(
          "USE_BACKEND_API is false. Using mock response for generateCourse.",
        );
        await this.simulateNetworkDelay();
        return this.mockCourseGeneration(topic);
      }
    } catch (error: any) {
      console.error(
        `Error in generateCourse (topic: \"${topic}\", USE_BACKEND_API: ${USE_BACKEND_API}):`,
        error,
      );
      ErrorHandler.processError(error, "generateCourse");
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn(
        `Falling back to mock course generation for topic: \"${topic}\". Error details: ${errorMessage}`,
      );
      return this.mockCourseGeneration(topic);
    }
  }

  async getLearningRecommendations(
    interests: string[],
    currentProgress?: any,
  ): Promise<string[]> {
    try {
      if (USE_BACKEND_API) {
        const params: RecommendationsRequestParams = { interests };
        // if (currentProgress) { params.current_progress = currentProgress; } // Example if API supports
        console.log(
          "Attempting to get recommendations via backend with params:",
          JSON.stringify(params),
        );
        const response: RecommendationsResponse =
          await avatarApiService.getRecommendations(params);
        console.log(
          "Successfully received recommendations from backend:",
          response,
        );

        if (response.topics && response.topics.length > 0) {
          return response.topics;
        }
        if (response.courses && response.courses.length > 0) {
          return response.courses
            .map((c) => c.title || c.name || "Unknown Recommendation")
            .filter((t) => t !== "Unknown Recommendation");
        }
        return [];
      } else {
        console.log(
          "USE_BACKEND_API is false. Using mock response for getLearningRecommendations.",
        );
        await this.simulateNetworkDelay();
        return [
          "Mock: Quantum Computing",
          "Mock: Stoic Philosophy",
          "Mock: Advanced JavaScript",
        ];
      }
    } catch (error: any) {
      ErrorHandler.processError(error, "getLearningRecommendations");
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn(
        `Error in getLearningRecommendations, falling back to mock. Error: ${errorMessage}`,
        error,
      );
      return ["Mock Error: Topic 1", "Mock Error: Topic 2"];
    }
  }

  async startVoiceRecognition(audioUri?: string): Promise<string> {
    try {
      if (USE_BACKEND_API) {
        if (audioUri) {
          console.log(
            `Attempting to transcribe audio via backend from URI: ${audioUri}`,
          );
          const audioBase64 = await RNFS.readFile(audioUri, "base64");
          const { text } = await avatarApiService.transcribeVoice(audioBase64);
          console.log(
            "Successfully transcribed audio via backend. Text:",
            text,
          );
          return text;
        } else {
          console.warn(
            "startVoiceRecognition (backend) called without audioUri. Falling back to mock.",
          );
          await this.simulateNetworkDelay();
          return this.mockTranscribeSpeech();
        }
      }
      console.log(
        "USE_BACKEND_API is false. Using mock response for startVoiceRecognition.",
      );
      await this.simulateNetworkDelay();
      return this.mockTranscribeSpeech(audioUri);
    } catch (error: any) {
      ErrorHandler.processError(error, "startVoiceRecognition");
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn(
        `Error in startVoiceRecognition, falling back to mock. Error: ${errorMessage}`,
        error,
      );
      await this.simulateNetworkDelay();
      return this.mockTranscribeSpeech(audioUri);
    }
  }

  async speakText(text: string, voiceOptions?: any): Promise<void> {
    try {
      if (USE_BACKEND_API) {
        console.log(
          `Attempting to synthesize speech via backend for text: \"${text}\"`,
        );
        await avatarApiService.speakText(text, voiceOptions);
        console.log(
          "Successfully synthesized speech via backend (or request sent).",
        );
        return;
      }
      console.log(
        "USE_BACKEND_API is false. Using mock response for speakText.",
      );
      this.mockSpeakText(text, voiceOptions);
    } catch (error: any) {
      ErrorHandler.processError(error, "speakText");
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn(
        `Error in speakText, falling back to mock. Error: ${errorMessage}`,
        error,
      );
      this.mockSpeakText(text, voiceOptions);
    }
  }

  async getUserPreferences(): Promise<UserPreferences> {
    try {
      if (USE_BACKEND_API) {
        try {
          console.log("Attempting to fetch user preferences from backend.");
          const prefsFromApi = await avatarApiService.getUserPreferences();
          console.log(
            "Successfully fetched user preferences from backend:",
            prefsFromApi,
          );
          const prefsToStore: UserPreferences = {
            ...this.defaultPreferences,
            ...prefsFromApi,
          };
          await AsyncStorage.setItem(
            STORAGE_KEYS.PREFERENCES,
            JSON.stringify(prefsToStore),
          );
          return prefsToStore;
        } catch (backendError: any) {
          ErrorHandler.processError(
            backendError,
            "getUserPreferences - backend_error",
          );
          const errorMessage =
            backendError instanceof Error
              ? backendError.message
              : String(backendError);
          console.warn(
            `Failed to fetch preferences from backend. Trying local cache. Error: ${errorMessage}`,
          );
        }
      }
      console.log("Loading user preferences from local storage.");
      const prefsString = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (prefsString) {
        console.log("Found preferences in local storage.");
        const localPrefs = JSON.parse(prefsString) as Partial<UserPreferences>;
        return { ...this.defaultPreferences, ...localPrefs };
      } else {
        console.log(
          "No preferences found in local storage, returning default preferences.",
        );
        return { ...this.defaultPreferences };
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `Error retrieving user preferences: ${errorMessage}`,
        error,
      );
      ErrorHandler.processError(
        new AppErrorClass(
          ErrorType.Storage,
          "Error retrieving user preferences",
          error,
        ),
        "getUserPreferences - main",
      );
      return { ...this.defaultPreferences };
    }
  }

  async saveUserPreferences(prefs: UserPreferences): Promise<void> {
    try {
      if (
        typeof prefs.voiceEnabled !== "boolean" ||
        typeof prefs.animationsEnabled !== "boolean"
      ) {
        throw new AppErrorClass(
          ErrorType.Validation,
          "Invalid preference types.",
        );
      }

      const prefsForApi: ApiUserPreferences = prefs;

      if (USE_BACKEND_API) {
        try {
          console.log(
            "Attempting to save user preferences to backend:",
            prefsForApi,
          );
          await avatarApiService.saveUserPreferences(prefsForApi);
          console.log("Successfully saved user preferences to backend.");
          await AsyncStorage.setItem(
            STORAGE_KEYS.PREFERENCES,
            JSON.stringify(prefs),
          );
          console.log(
            "Saved user preferences to local storage after backend success.",
          );
          return;
        } catch (backendError: any) {
          ErrorHandler.processError(
            backendError,
            "saveUserPreferences - backend_error",
          );
          const errorMessage =
            backendError instanceof Error
              ? backendError.message
              : String(backendError);
          console.warn(
            `Failed to save preferences to backend. Saving locally only. Error: ${errorMessage}`,
          );
        }
      }
      console.log("Saving user preferences to local storage.");
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(prefs),
      );
    } catch (error: any) {
      if (error instanceof AppErrorClass) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error saving user preferences: ${errorMessage}`, error);
      throw ErrorHandler.processError(
        new AppErrorClass(
          ErrorType.Storage,
          "Error saving user preferences",
          error,
        ),
        "saveUserPreferences - main",
      );
    }
  }

  async addToCourseHistory(courseTitleOrId: string): Promise<void> {
    try {
      const currentPrefs = await this.getUserPreferences();
      const courseHistory = currentPrefs.courseHistory || []; // Provide default empty array
      if (!courseHistory.includes(courseTitleOrId)) {
        const newCourseHistory = [...courseHistory, courseTitleOrId].slice(-10);
        const updatedPrefs: UserPreferences = {
          ...currentPrefs,
          courseHistory: newCourseHistory,
        };
        await this.saveUserPreferences(updatedPrefs);
        console.log(`Added \"${courseTitleOrId}\" to course history.`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error adding to course history: ${errorMessage}`, error);
      ErrorHandler.processError(error, "addToCourseHistory");
    }
  }

  async addLearningInterest(interest: string): Promise<void> {
    try {
      const currentPrefs = await this.getUserPreferences();
      const learningInterests = currentPrefs.learningInterests || []; // Provide default empty array
      if (!learningInterests.includes(interest)) {
        const newLearningInterests = [...learningInterests, interest];
        const updatedPrefs: UserPreferences = {
          ...currentPrefs,
          learningInterests: newLearningInterests,
        };
        await this.saveUserPreferences(updatedPrefs);
        console.log(`Added \"${interest}\" to learning interests.`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error adding learning interest: ${errorMessage}`, error);
      ErrorHandler.processError(error, "addLearningInterest");
    }
  }

  async removeLearningInterest(interest: string): Promise<void> {
    try {
      const currentPrefs = await this.getUserPreferences();
      const learningInterests = currentPrefs.learningInterests || []; // Provide default empty array
      const newLearningInterests = learningInterests.filter(
        (i) => i !== interest,
      );
      if (newLearningInterests.length !== learningInterests.length) {
        const updatedPrefs: UserPreferences = {
          ...currentPrefs,
          learningInterests: newLearningInterests,
        };
        await this.saveUserPreferences(updatedPrefs);
        console.log(`Removed \"${interest}\" from learning interests.`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error removing learning interest: ${errorMessage}`, error);
      ErrorHandler.processError(error, "removeLearningInterest");
    }
  }

  private mockCourseGeneration(topic: string): Course {
    console.log(`Mock generating course for: ${topic}`);
    return {
      id: `mock_course_${Date.now()}`,
      title: `Mock Course: Introduction to ${topic}`,
      description: `This is a mock course designed to introduce basic concepts of ${topic}.`,
      modules: [
        {
          id: "m1",
          title: "Module 1: Basics",
          description: "Fundamental concepts",
          duration: "1 hour",
          resources: ["Resource A", "Resource B"],
          completed: false,
        },
        {
          id: "m2",
          title: "Module 2: Core Principles",
          description: "Understanding core ideas",
          duration: "1.5 hours",
          resources: ["Resource C"],
          completed: false,
        },
        {
          id: "m3",
          title: "Module 3: Advanced Topics (Mock)",
          description: "Exploring further",
          duration: "2 hours",
          resources: [],
          completed: false,
        },
      ],
      level: "beginner",
      duration: "4.5 hours",
      progress: 0,
    };
  }

  private async mockTranscribeSpeech(audioUri?: string): Promise<string> {
    console.log(`Mock STT called. Audio URI: ${audioUri || "not provided"}`);
    await this.simulateNetworkDelay(1000);
    if (audioUri) {
      return "This is a mock transcription of your recorded audio.";
    }
    return "Hello, this is a mock recognized speech.";
  }

  private mockSpeakText(text: string, voiceOptions?: any): void {
    console.log(`Mock TTS: Speaking \"${text}\" with options:`, voiceOptions);
  }

  private async simulateNetworkDelay(ms = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private mockResponseGeneration(message: string): string {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello there! How can I help you learn today? (Mock)";
    } else if (lowerMessage.includes("course on javascript")) {
      return "Sure, I can help you find a course on JavaScript. Are you looking for beginner, intermediate, or advanced level? (Mock)";
    } else if (lowerMessage.includes("recommend something")) {
      return "I recommend exploring topics like 'Quantum Computing Basics' or 'The History of Ancient Rome'. (Mock)";
    }
    return "I'm not sure how to respond to that yet, but I'm learning! (Mock)";
  }
}

export const avatarService = new AvatarService();
