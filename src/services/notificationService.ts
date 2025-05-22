// Notification service for handling push notifications
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { analyticsService, AnalyticsEvent } from "./analyticsService";

// Define notification categories
export enum NotificationCategory {
  GENERAL = "general",
  LEARNING = "learning",
  SOCIAL = "social",
  REMINDER = "reminder",
  ACHIEVEMENT = "achievement",
  MARKETING = "marketing",
}

// Define notification preferences by category
export interface NotificationPreferences {
  [NotificationCategory.GENERAL]: boolean;
  [NotificationCategory.LEARNING]: boolean;
  [NotificationCategory.SOCIAL]: boolean;
  [NotificationCategory.REMINDER]: boolean;
  [NotificationCategory.ACHIEVEMENT]: boolean;
  [NotificationCategory.MARKETING]: boolean;
  pushEnabled: boolean;
  scheduledQuietHoursStart: string; // Format: "HH:MM"
  scheduledQuietHoursEnd: string; // Format: "HH:MM"
  quietHoursEnabled: boolean;
}

// Default notification preferences
export const defaultNotificationPreferences: NotificationPreferences = {
  [NotificationCategory.GENERAL]: true,
  [NotificationCategory.LEARNING]: true,
  [NotificationCategory.SOCIAL]: true,
  [NotificationCategory.REMINDER]: true,
  [NotificationCategory.ACHIEVEMENT]: true,
  [NotificationCategory.MARKETING]: false,
  pushEnabled: true,
  scheduledQuietHoursStart: "22:00",
  scheduledQuietHoursEnd: "08:00",
  quietHoursEnabled: false,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  preferences: NotificationPreferences = defaultNotificationPreferences;
  expoPushToken: string | null = null;
  configured = false;

  constructor() {
    // Initialize preferences from storage when service is created
    this.loadPreferencesFromStorage();
  }

  private async loadPreferencesFromStorage() {
    try {
      const storedPrefs = await AsyncStorage.getItem(
        "@notification_preferences",
      );
      if (storedPrefs) {
        this.preferences = {
          ...defaultNotificationPreferences,
          ...JSON.parse(storedPrefs),
        };
      }
    } catch (error) {
      console.error("Error loading notification preferences:", error);
      this.preferences = defaultNotificationPreferences;
    }
  }

  async configure() {
    // Don't reconfigure if already set up
    if (this.configured) return;

    // Configure how notifications appear when the app is in the foreground
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        // Track notification received
        analyticsService.logEvent(AnalyticsEvent.NOTIFICATION_RECEIVED, {
          notification_id: notification.request.identifier,
          title: notification.request.content.title,
          category:
            notification.request.content.categoryIdentifier || "general",
        });

        // Check if it's quiet hours
        if (this.isQuietHours() && this.preferences.quietHoursEnabled) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: true,
          };
        }

        // Check notification category against preferences
        const category =
          (notification.request.content
            .categoryIdentifier as NotificationCategory) ||
          NotificationCategory.GENERAL;
        const shouldShow =
          this.preferences[category] && this.preferences.pushEnabled;

        return {
          shouldShowAlert: shouldShow,
          shouldPlaySound: shouldShow,
          shouldSetBadge: true,
        };
      },
    });

    // Add notification listener for when the app is in the foreground
    Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived,
    );

    // Add notification response listener for when a notification is tapped
    Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse,
    );

    this.configured = true;
  }

  async registerForPushNotifications() {
    if (!Device.isDevice) {
      console.log("Push notifications not available on simulator");
      return false;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // If we don't have permission, ask for it
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token: permission denied");
        return false;
      }

      // Get the Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      this.expoPushToken = tokenData.data;

      // On Android, we need to set the notification channel
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#8E54E9",
        });
      }

      return true;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return false;
    }
  }

  // Check if current time is within quiet hours
  private isQuietHours(): boolean {
    if (!this.preferences.quietHoursEnabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = this.preferences.scheduledQuietHoursStart
      .split(":")
      .map(Number);
    const [endHour, endMinute] = this.preferences.scheduledQuietHoursEnd
      .split(":")
      .map(Number);

    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    // If start time is before end time, it's a simple range check
    if (startTimeMinutes < endTimeMinutes) {
      return (
        currentTimeMinutes >= startTimeMinutes &&
        currentTimeMinutes <= endTimeMinutes
      );
    }
    // If start time is after end time (e.g. 22:00 to 06:00), it spans midnight
    else {
      return (
        currentTimeMinutes >= startTimeMinutes ||
        currentTimeMinutes <= endTimeMinutes
      );
    }
  }

  private handleNotificationReceived = (
    notification: Notifications.Notification,
  ) => {
    const data = notification.request.content.data;

    // Log the notification receipt
    analyticsService.logEvent(AnalyticsEvent.NOTIFICATION_RECEIVED, {
      id: notification.request.identifier,
      title: notification.request.content.title,
      body: notification.request.content.body,
      data,
    });
  };

  private handleNotificationResponse = (
    response: Notifications.NotificationResponse,
  ) => {
    const data = response.notification.request.content.data;

    // Log the notification open
    analyticsService.logEvent(AnalyticsEvent.NOTIFICATION_OPEN, {
      id: response.notification.request.identifier,
      title: response.notification.request.content.title,
      actionIdentifier: response.actionIdentifier,
      data,
    });

    // Process the notification based on its data
    this.processNotificationData(data);
  };

  private processNotificationData(data: any) {
    // Process different notification types based on the data
    if (data?.screen) {
      // Navigate to the specified screen
      // Note: In a real app, you'd use a navigation service here
      // navigation.navigate(data.screen, data.params);
      console.log("Navigate to:", data.screen, data.params);
    }

    if (data?.type === "new_course") {
      // Handle new course notification
      console.log("New course notification:", data.courseId);
    }

    if (data?.type === "achievement") {
      // Handle achievement notification
      console.log("Achievement notification:", data.achievementId);
    }
  }

  // Schedule a local notification
  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput = null,
    data: any = {},
    category: NotificationCategory = NotificationCategory.GENERAL,
  ) {
    if (!this.preferences[category] || !this.preferences.pushEnabled) {
      console.log(`Skipping notification - category ${category} is disabled`);
      return null;
    }

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          categoryIdentifier: category,
          sound: "default",
        },
        trigger,
      });

      return identifier;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  }

  // Send a notification immediately
  async sendImmediateNotification(
    title: string,
    body: string,
    data: any = {},
    category: NotificationCategory = NotificationCategory.GENERAL,
  ) {
    return this.scheduleLocalNotification(title, body, null, data, category);
  }

  // Schedule a notification for a specific time
  async scheduleNotificationForTime(
    title: string,
    body: string,
    date: Date,
    data: any = {},
    category: NotificationCategory = NotificationCategory.GENERAL,
  ) {
    return this.scheduleLocalNotification(
      title,
      body,
      {
        date,
      },
      data,
      category,
    );
  }

  // Schedule a recurring daily notification
  async scheduleDailyNotification(
    title: string,
    body: string,
    hour: number,
    minute: number,
    data: any = {},
    category: NotificationCategory = NotificationCategory.REMINDER,
  ) {
    return this.scheduleLocalNotification(
      title,
      body,
      {
        hour,
        minute,
        repeats: true,
      },
      data,
      category,
    );
  }

  // Cancel a specific notification
  async cancelNotification(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get all scheduled notifications
  async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Update notification preferences
  async updatePreferences(newPreferences: Partial<NotificationPreferences>) {
    this.preferences = {
      ...this.preferences,
      ...newPreferences,
    };

    // Save to AsyncStorage
    await AsyncStorage.setItem(
      "@notification_preferences",
      JSON.stringify(this.preferences),
    );

    return this.preferences;
  }

  // Get current notification preferences
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Send the push token to your backend
  async sendPushTokenToServer(userId: string) {
    if (!this.expoPushToken) {
      console.log("No push token available");
      return false;
    }

    try {
      // In a real app, send the token to your backend
      // const response = await api.post('/users/push-token', {
      //   userId,
      //   token: this.expoPushToken,
      //   device: Platform.OS,
      // });

      console.log("Push token registered for user:", userId);
      return true;
    } catch (error) {
      console.error("Failed to register push token on server:", error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
