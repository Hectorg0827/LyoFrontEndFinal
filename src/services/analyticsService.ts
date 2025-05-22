// Analytics service for tracking user behavior and app usage
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { useAppStore } from "../store/appStore";

// Event categories
export enum AnalyticsEventCategory {
  NAVIGATION = "navigation",
  USER = "user",
  CONTENT = "content",
  LEARNING = "learning",
  AVATAR = "avatar",
  ERROR = "error",
  PERFORMANCE = "performance",
  ENGAGEMENT = "engagement",
}

// Standard event names to ensure consistency
export enum AnalyticsEvent {
  // Navigation events
  SCREEN_VIEW = "screen_view",
  TAB_CHANGE = "tab_change",
  DEEP_LINK_OPENED = "deep_link_opened",

  // User events
  USER_SIGNUP = "user_signup",
  USER_LOGIN = "user_login",
  USER_LOGOUT = "user_logout",
  PROFILE_UPDATE = "profile_update",
  SETTINGS_CHANGE = "settings_change",

  // Content events
  CONTENT_VIEW = "content_view",
  CONTENT_SHARE = "content_share",
  CONTENT_SAVE = "content_save",
  CONTENT_LIKE = "content_like",
  CONTENT_COMMENT = "content_comment",
  FEED_REFRESH = "feed_refresh",

  // Learning events
  COURSE_GENERATE = "course_generate",
  COURSE_START = "course_start",
  COURSE_COMPLETE = "course_complete",
  MODULE_COMPLETE = "module_complete",
  QUIZ_COMPLETE = "quiz_complete",
  LEARNING_MILESTONE = "learning_milestone",

  // Avatar events
  AVATAR_INTERACTION = "avatar_interaction",
  AVATAR_CUSTOMIZE = "avatar_customize",
  AVATAR_RESPONSE = "avatar_response",
  SPEECH_RECOGNITION = "speech_recognition",

  // Error events
  APP_ERROR = "app_error",
  API_ERROR = "api_error",
  NETWORK_ERROR = "network_error",

  // Performance events
  APP_START = "app_start",
  COLD_START = "cold_start",
  APP_BACKGROUND = "app_background",
  APP_FOREGROUND = "app_foreground",
  API_RESPONSE_TIME = "api_response_time",
  RENDER_TIME = "render_time",

  // Engagement events
  SESSION_START = "session_start",
  SESSION_END = "session_end",
  FEATURE_DISCOVERY = "feature_discovery",
  USER_ENGAGEMENT = "user_engagement",
  NOTIFICATION_RECEIVED = "notification_received",
  NOTIFICATION_OPEN = "notification_open",
}

class AnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private sessionStartTime = 0;
  private lastEventTime = 0;
  private eventQueue: { name: string; params: any }[] = [];
  private device: {
    brand?: string;
    modelName?: string;
    osName?: string;
    osVersion?: string;
    appVersion: string;
    deviceId?: string;
  };

  constructor() {
    this.device = {
      appVersion: Application.nativeApplicationVersion || "1.0.0",
    };
  }

  async init() {
    try {
      if (this.isInitialized) return;

      // Get device info
      if (Device.brand) this.device.brand = Device.brand;
      if (Device.modelName) this.device.modelName = Device.modelName;
      if (Device.osName) this.device.osName = Device.osName;
      if (Device.osVersion) this.device.osVersion = Device.osVersion;

      // Generate a device ID if there isn't one
      const deviceId = await AsyncStorage.getItem("@device_id");
      if (deviceId) {
        this.device.deviceId = deviceId;
      } else {
        this.device.deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        await AsyncStorage.setItem("@device_id", this.device.deviceId);
      }

      // Start session tracking
      this.startSession();

      // Process any queued events
      this.processQueue();

      this.isInitialized = true;
      console.log("Analytics initialized");
    } catch (error) {
      console.error("Failed to initialize analytics:", error);
    }
  }

  private startSession() {
    this.sessionStartTime = Date.now();
    this.sessionId = `session-${this.sessionStartTime}-${Math.random().toString(36).substring(2, 10)}`;
    this.logEvent(AnalyticsEvent.SESSION_START, {
      sessionId: this.sessionId,
      timestamp: this.sessionStartTime,
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    // In a real implementation, you would update the user ID in your analytics provider
  }

  resetUserId() {
    this.userId = null;
    // In a real implementation, you would reset the user ID in your analytics provider
  }

  logEvent(eventName: string, eventParams?: any) {
    const timestamp = Date.now();
    const timeSpent = this.lastEventTime ? timestamp - this.lastEventTime : 0;
    this.lastEventTime = timestamp;

    const params = {
      ...eventParams,
      // Add standard parameters
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp,
      timeSpentSinceLastEvent: timeSpent,
      device: this.device,
    };

    if (!this.isInitialized) {
      // Queue event for later processing
      this.eventQueue.push({ name: eventName, params });
      return;
    }

    try {
      // Here you would integrate with your chosen analytics provider
      // For example, using Firebase Analytics:
      // firebase.analytics().logEvent(eventName, params);

      // For now, just log to console in development
      if (__DEV__) {
        console.log(`[Analytics] ${eventName}`, params);
      }
    } catch (error) {
      console.error(`Error logging event ${eventName}:`, error);
    }
  }

  logScreenView(screenName: string, screenClass?: string) {
    this.logEvent(AnalyticsEvent.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  logError(error: Error, additionalInfo?: any) {
    this.logEvent(AnalyticsEvent.APP_ERROR, {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...additionalInfo,
    });
  }

  private processQueue() {
    if (this.eventQueue.length === 0) return;

    this.eventQueue.forEach((event) => {
      try {
        // Here you would log the event with your analytics provider
        if (__DEV__) {
          console.log(`[Analytics Queue] ${event.name}`, event.params);
        }
      } catch (error) {
        console.error(`Error processing queued event ${event.name}:`, error);
      }
    });

    this.eventQueue = [];
  }

  // Record app state changes
  recordAppBackground() {
    this.logEvent(AnalyticsEvent.APP_BACKGROUND);
  }

  recordAppForeground() {
    this.logEvent(AnalyticsEvent.APP_FOREGROUND);
  }

  // Record performance metrics
  recordApiResponseTime(endpoint: string, responseTime: number) {
    this.logEvent(AnalyticsEvent.API_RESPONSE_TIME, {
      endpoint,
      response_time_ms: responseTime,
    });
  }

  // End the current session
  endSession() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    this.logEvent(AnalyticsEvent.SESSION_END, {
      sessionId: this.sessionId,
      duration: sessionDuration,
    });
  }
}

export const analyticsService = new AnalyticsService();

// Create a hook to easily log analytics events from components
export const useAnalytics = () => {
  const analyticsEnabled = useAppStore((state) => state.analyticsEnabled);

  return {
    logEvent: (eventName: string, params?: any) => {
      if (analyticsEnabled) {
        analyticsService.logEvent(eventName, params);
      }
    },
    logScreenView: (screenName: string) => {
      if (analyticsEnabled) {
        analyticsService.logScreenView(screenName);
      }
    },
  };
};
