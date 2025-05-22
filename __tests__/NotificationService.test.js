// Test file for notification functionality
import {
  notificationService,
  NotificationCategory,
} from "../src/services/notificationService";

/**
 * Tests for handling notifications in the Lyo app
 *
 * Run these tests in the app using:
 * npm test -- -t "Notification Service"
 */

describe("Notification Service", () => {
  beforeEach(() => {
    // Reset mocks and storage before each test
    jest.clearAllMocks();

    // Mock AsyncStorage
    jest.mock("@react-native-async-storage/async-storage", () => ({
      getItem: jest.fn(),
      setItem: jest.fn(),
    }));

    // Mock Expo Notifications
    jest.mock("expo-notifications", () => ({
      getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
      requestPermissionsAsync: jest
        .fn()
        .mockResolvedValue({ status: "granted" }),
      getDevicePushTokenAsync: jest
        .fn()
        .mockResolvedValue({ data: "mock-token" }),
      setNotificationHandler: jest.fn(),
      scheduleNotificationAsync: jest.fn(),
      cancelScheduledNotificationAsync: jest.fn(),
    }));
  });

  test("should initialize with default preferences", () => {
    const preferences = notificationService.getPreferences();

    expect(preferences).toBeDefined();
    expect(preferences.pushEnabled).toBe(true);
    expect(preferences[NotificationCategory.GENERAL]).toBe(true);
    expect(preferences[NotificationCategory.LEARNING]).toBe(true);
    expect(preferences[NotificationCategory.SOCIAL]).toBe(true);
    expect(preferences[NotificationCategory.REMINDER]).toBe(true);
    expect(preferences[NotificationCategory.ACHIEVEMENT]).toBe(true);
    expect(preferences[NotificationCategory.MARKETING]).toBe(true);
    expect(preferences.quietHoursEnabled).toBe(false);
    expect(preferences.scheduledQuietHoursStart).toBe("22:00");
    expect(preferences.scheduledQuietHoursEnd).toBe("07:00");
  });

  test("should update notification preferences", async () => {
    const newPreferences = {
      pushEnabled: true,
      [NotificationCategory.GENERAL]: false,
      [NotificationCategory.LEARNING]: true,
      [NotificationCategory.SOCIAL]: false,
      [NotificationCategory.REMINDER]: true,
      [NotificationCategory.ACHIEVEMENT]: true,
      [NotificationCategory.MARKETING]: false,
      quietHoursEnabled: true,
      scheduledQuietHoursStart: "23:00",
      scheduledQuietHoursEnd: "08:00",
    };

    await notificationService.updatePreferences(newPreferences);
    const preferences = notificationService.getPreferences();

    expect(preferences).toEqual(newPreferences);
  });

  test("should check if push notifications are enabled", () => {
    // Default is enabled
    expect(notificationService.isPushEnabled()).toBe(true);

    // Update to disabled
    notificationService.updatePreferences({
      pushEnabled: false,
    });

    expect(notificationService.isPushEnabled()).toBe(false);
  });

  test("should check if category is enabled", () => {
    // By default all categories are enabled
    expect(
      notificationService.isCategoryEnabled(NotificationCategory.LEARNING),
    ).toBe(true);

    // Update to disable a specific category
    notificationService.updatePreferences({
      [NotificationCategory.LEARNING]: false,
    });

    expect(
      notificationService.isCategoryEnabled(NotificationCategory.LEARNING),
    ).toBe(false);
    // Other categories should remain enabled
    expect(
      notificationService.isCategoryEnabled(NotificationCategory.SOCIAL),
    ).toBe(true);
  });

  test("should check if notification should be shown during quiet hours", () => {
    // Set up quiet hours from 22:00 to 07:00
    notificationService.updatePreferences({
      quietHoursEnabled: true,
      scheduledQuietHoursStart: "22:00",
      scheduledQuietHoursEnd: "07:00",
    });

    // Mock the current time to be during quiet hours
    jest.spyOn(Date.prototype, "getHours").mockImplementation(() => 23);
    jest.spyOn(Date.prototype, "getMinutes").mockImplementation(() => 30);

    expect(notificationService.isQuietHoursActive()).toBe(true);

    // Mock the current time to be outside quiet hours
    Date.prototype.getHours.mockImplementation(() => 12);
    Date.prototype.getMinutes.mockImplementation(() => 0);

    expect(notificationService.isQuietHoursActive()).toBe(false);
  });

  test("should handle notification scheduling", async () => {
    const notification = {
      title: "Test Notification",
      body: "This is a test notification",
      data: { type: "test", id: "123" },
      category: NotificationCategory.LEARNING,
    };

    // Should be able to schedule a notification
    await notificationService.scheduleNotification(notification);

    // Should not schedule if push notifications are disabled
    notificationService.updatePreferences({ pushEnabled: false });
    await notificationService.scheduleNotification(notification);

    // Should not schedule if category is disabled
    notificationService.updatePreferences({
      pushEnabled: true,
      [NotificationCategory.LEARNING]: false,
    });
    await notificationService.scheduleNotification(notification);
  });

  test("should handle push token registration", async () => {
    const mockToken = "mock-expo-token";

    // Mock the token acquisition
    const Notifications = require("expo-notifications");
    Notifications.getDevicePushTokenAsync.mockResolvedValue({
      data: mockToken,
    });

    await notificationService.registerForPushNotifications();

    expect(Notifications.getDevicePushTokenAsync).toHaveBeenCalled();
  });
});
