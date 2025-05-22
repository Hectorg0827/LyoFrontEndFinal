import { api } from "./api";
import { ErrorHandler, ErrorType } from "./errorHandler";

// API endpoints for avatar-related operations
const ENDPOINTS = {
  // Avatar chat and conversation
  CHAT: "/avatar/message",
  CONTEXT: "/avatar/context",
  VOICE_TRANSCRIPTION: "/avatar/transcribe",
  TEXT_TO_SPEECH: "/avatar/speak", // Added for TTS
  // Course and learning content
  GENERATE_COURSE: "/avatar/generate-course",
  GET_RECOMMENDATIONS: "/avatar/recommendations",
  GET_LEARNING_PATH: "/avatar/learning-path",
  // User preferences and settings
  USER_PREFERENCES: "/avatar/preferences",
};

// Request and response types
export interface AvatarMessageRequest {
  message: string;
  session_id?: string;
  media_url?: string;
}

export interface AvatarMessageResponse {
  text: string;
  timestamp: number;
  detected_topics?: string[];
  moderated?: boolean;
  include_reaction_buttons?: boolean;
  suggest_advanced_content?: boolean;
  audio_url?: string; // If backend can return a URL to an audio file for speech
}

export interface AvatarContextRequest {
  topics?: string[];
  learning_goals?: string[];
  current_module?: string;
  persona?: string;
  learning_style?: string;
}

export interface CourseGenerationRequest {
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  format?: string;
  duration?: string;
  preferred_resources?: string[];
  learning_style?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  progress: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  resources: string[];
  completed: boolean;
}

// Define UserPreferences directly in this file
export interface UserPreferences {
  voiceEnabled?: boolean;
  animationsEnabled?: boolean;
  avatarColor?: string;
  voiceRate?: number;
  voicePitch?: number;
  learningInterests?: string[];
  courseHistory?: string[]; // Changed from Array<{ courseId: string; ... }> to string[]
  accessibilityMode?: boolean;
  subtitlesEnabled?: boolean;
  avatarSize?: "small" | "medium" | "large";
  avatarPersonality?: string; // Could be an enum if specific personalities are defined
  autoHideAvatar?: boolean;
  preferredLanguage?: string; // e.g., 'en-US', 'es-ES'
  notificationSettings?: {
    newCourseRecommendations?: boolean; // Renamed from newContent and aligned
    studyReminders?: boolean;
    communityUpdates?: boolean; // Added to align
  };
  theme?: "light" | "dark" | "system";
  // Add any other preferences that are managed by the backend
}

// Define request parameters type for getRecommendations
export interface RecommendationsRequestParams {
  interests?: string[];
  history?: string[];
  // Add other potential parameters if the API supports them
}

// Define a more specific response type for getRecommendations
export interface RecommendationsResponse {
  topics?: string[];
  courses?: {
    id?: string; // Assuming courses might have an ID
    title?: string;
    name?: string; // Keep both if API might return either
    description?: string;
    // Add other relevant course properties
  }[];
  // Add other potential response fields
}

/**
 * Service for handling API connections to the avatar backend services
 */
class AvatarApiService {
  /**
   * Send a message to the AI avatar and get a response
   * @param message The user's message
   * @param sessionId Optional session ID for continuing conversations
   * @returns Promise with the avatar's response
   */
  async sendMessage(
    message: string,
    sessionId?: string,
  ): Promise<AvatarMessageResponse> {
    try {
      const request: AvatarMessageRequest = {
        message,
        session_id: sessionId,
      };

      return await api.post<AvatarMessageResponse>(ENDPOINTS.CHAT, request);
    } catch (error) {
      // Transform generic API errors into avatar-specific errors
      throw ErrorHandler.createError(
        ErrorType.AiService,
        "Failed to get response from Lyo Avatar",
        error,
      );
    }
  }

  /**
   * Update the avatar's context with user-specific information
   * @param context Avatar context information
   * @returns Promise with success status
   */
  async updateContext(
    context: AvatarContextRequest,
  ): Promise<{ success: boolean }> {
    try {
      return await api.post<{ success: boolean }>(ENDPOINTS.CONTEXT, context);
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.AiService,
        "Failed to update avatar context",
        error,
      );
    }
  }

  /**
   * Transcribe voice to text using the backend service
   * @param audioBase64 Base64 encoded audio data
   * @returns Promise with transcribed text
   */
  async transcribeVoice(audioBase64: string): Promise<{ text: string }> {
    try {
      return await api.post<{ text: string }>(ENDPOINTS.VOICE_TRANSCRIPTION, {
        audio_data: audioBase64, // This assumes backend expects base64. If it expects a file upload or URI, this needs to change.
      });
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.VoiceRecognition,
        "Failed to transcribe voice input",
        error,
      );
    }
  }

  /**
   * Converts text to speech using the backend service.
   * @param text The text to synthesize.
   * @param voiceOptions Optional voice parameters.
   * @returns Promise that resolves when speech is ready or an audio URL.
   */
  async speakText(
    text: string,
    voiceOptions?: any,
  ): Promise<{ audioUrl?: string; message?: string }> {
    try {
      // Assuming the backend returns a URL to the generated audio or a success message
      return await api.post<{ audioUrl?: string; message?: string }>(
        ENDPOINTS.TEXT_TO_SPEECH,
        {
          text,
          options: voiceOptions,
        },
      );
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.VoiceSynthesis, // Corrected ErrorType
        "Failed to synthesize speech from text",
        error,
      );
    }
  }

  /**
   * Generate a personalized course on a specific topic
   * @param request Details about the desired course
   * @returns Promise with the generated course
   */
  async generateCourse(request: CourseGenerationRequest): Promise<Course> {
    try {
      return await api.post<Course>(ENDPOINTS.GENERATE_COURSE, request);
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.AiService,
        "Failed to generate course content",
        error,
      );
    }
  }

  /**
   * Get content recommendations based on user's preferences and history
   * @param topics Optional topics to focus recommendations on
   * @returns Promise with recommended content
   */
  async getRecommendations(
    params: RecommendationsRequestParams,
  ): Promise<RecommendationsResponse> {
    try {
      const queryParams: Record<string, string> = {};
      if (params.interests && params.interests.length > 0) {
        queryParams.interests = params.interests.join(",");
      }
      if (params.history && params.history.length > 0) {
        queryParams.history = params.history.join(",");
      }
      // If API expects 'topics' as a specific parameter name for interests:
      // if (params.interests && params.interests.length > 0) {
      //   queryParams.topics = params.interests.join(',');
      // }

      return await api.get<RecommendationsResponse>(
        ENDPOINTS.GET_RECOMMENDATIONS,
        queryParams,
      );
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.Server,
        "Failed to get learning recommendations",
        error,
      );
    }
  }

  /**
   * Save user preferences to the backend
   * @param preferences User preferences to save
   * @returns Promise with saved preferences
   */
  async saveUserPreferences(
    preferences: UserPreferences,
  ): Promise<UserPreferences> {
    try {
      return await api.put<UserPreferences>(
        ENDPOINTS.USER_PREFERENCES,
        preferences,
      );
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.Storage,
        "Failed to save user preferences to server",
        error,
      );
    }
  }

  /**
   * Retrieve user preferences from the backend
   * @returns Promise with user preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      return await api.get<UserPreferences>(ENDPOINTS.USER_PREFERENCES);
    } catch (error) {
      throw ErrorHandler.createError(
        ErrorType.Storage,
        "Failed to load user preferences from server",
        error,
      );
    }
  }
}

// Export a singleton instance of the service
export const avatarApiService = new AvatarApiService();
