// Notification Preferences Screen for managing notification settings
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import * as Device from "expo-device";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";

import { analyticsService } from "../services/analyticsService";
import {
  notificationService,
  NotificationCategory,
  NotificationPreferences,
} from "../services/notificationService";
import { useAppStore } from "../store/appStore";

const NotificationPreferencesScreen: React.FC = () => {
  const navigation = useNavigation();
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [timePickerShown, setTimePickerShown] = useState<
    "start" | "end" | null
  >(null);

  // Load notification preferences
  useEffect(() => {
    loadPreferences();
    // Track screen view
    analyticsService.logScreenView("NotificationPreferences");
  }, []);

  const loadPreferences = () => {
    setIsLoading(true);
    try {
      const prefs = notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Error loading notification preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCategory = async (
    category: NotificationCategory,
    value: boolean,
  ) => {
    if (!preferences) return;

    try {
      const updatedPrefs = {
        ...preferences,
        [category]: value,
      };

      // Update preferences
      await notificationService.updatePreferences(updatedPrefs);
      setPreferences(updatedPrefs);

      // Track event
      analyticsService.logEvent("notification_category_changed", {
        category,
        enabled: value,
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      Alert.alert("Error", "Failed to update notification preferences");
    }
  };

  const handleTogglePushNotifications = async (value: boolean) => {
    if (!preferences) return;

    try {
      const updatedPrefs = {
        ...preferences,
        pushEnabled: value,
      };

      // Update preferences
      await notificationService.updatePreferences(updatedPrefs);
      setPreferences(updatedPrefs);

      // If enabling notifications, register for push notifications
      if (value) {
        await notificationService.registerForPushNotifications();
      }

      // Track event
      analyticsService.logEvent("push_notifications_changed", {
        enabled: value,
      });
    } catch (error) {
      console.error("Error updating push notification preferences:", error);
      Alert.alert("Error", "Failed to update push notification preferences");
    }
  };

  const handleToggleQuietHours = async (value: boolean) => {
    if (!preferences) return;

    try {
      const updatedPrefs = {
        ...preferences,
        quietHoursEnabled: value,
      };

      // Update preferences
      await notificationService.updatePreferences(updatedPrefs);
      setPreferences(updatedPrefs);

      // Track event
      analyticsService.logEvent("quiet_hours_changed", {
        enabled: value,
      });
    } catch (error) {
      console.error("Error updating quiet hours preferences:", error);
      Alert.alert("Error", "Failed to update quiet hours preferences");
    }
  };

  const showTimePicker = (type: "start" | "end") => {
    setTimePickerShown(type);
  };

  const handleTimeChange = async (
    event: any,
    selectedTime: Date | undefined,
  ) => {
    setTimePickerShown(null);

    if (!selectedTime || !preferences || !timePickerShown) return;

    try {
      // Format time as "HH:MM"
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}`;

      const updatedPrefs = {
        ...preferences,
      };

      if (timePickerShown === "start") {
        updatedPrefs.scheduledQuietHoursStart = timeString;
      } else {
        updatedPrefs.scheduledQuietHoursEnd = timeString;
      }

      // Update preferences
      await notificationService.updatePreferences(updatedPrefs);
      setPreferences(updatedPrefs);

      // Track event
      analyticsService.logEvent("quiet_hours_time_changed", {
        type: timePickerShown,
        time: timeString,
      });
    } catch (error) {
      console.error("Error updating quiet hours time:", error);
      Alert.alert("Error", "Failed to update quiet hours time");
    }
  };

  // Helper function to format time string for display
  const formatTimeForDisplay = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Get time picker date object from time string
  const getDateFromTimeString = (timeString: string) => {
    const date = new Date();
    const [hours, minutes] = timeString.split(":").map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  // If still loading or no preferences loaded, show loading state
  if (isLoading || !preferences) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          isDarkMode ? styles.darkContainer : styles.lightContainer,
        ]}
      >
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDarkMode ? "#fff" : "#000"}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Notification Preferences
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.loadingContainer}>
          <Text
            style={[
              styles.loadingText,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Loading preferences...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDarkMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            isDarkMode ? styles.lightText : styles.darkText,
          ]}
        >
          Notification Preferences
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Master toggle for push notifications */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Push Notifications
          </Text>

          <View style={styles.settingItem}>
            <Ionicons
              name={
                preferences.pushEnabled ? "notifications" : "notifications-off"
              }
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Allow Push Notifications
            </Text>
            <Switch
              value={preferences.pushEnabled}
              onValueChange={handleTogglePushNotifications}
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : preferences.pushEnabled
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>

          {!Device.isDevice && (
            <Text style={styles.simulatorNote}>
              Note: Push notifications are not available in the simulator.
            </Text>
          )}
        </View>

        {/* Notification Categories */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Notification Categories
          </Text>

          {/* General Notifications */}
          <View style={styles.settingItem}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              General Notifications
            </Text>
            <Switch
              value={preferences[NotificationCategory.GENERAL]}
              onValueChange={(value) =>
                handleToggleCategory(NotificationCategory.GENERAL, value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : preferences[NotificationCategory.GENERAL]
                    ? "#fff"
                    : "#f4f3f4"
              }
              disabled={!preferences.pushEnabled}
            />
          </View>

          {/* Learning Notifications */}
          <View style={styles.settingItem}>
            <Ionicons
              name="school-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Learning Updates
            </Text>
            <Switch
              value={preferences[NotificationCategory.LEARNING]}
              onValueChange={(value) =>
                handleToggleCategory(NotificationCategory.LEARNING, value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : preferences[NotificationCategory.LEARNING]
                    ? "#fff"
                    : "#f4f3f4"
              }
              disabled={!preferences.pushEnabled}
            />
          </View>

          {/* Social Notifications */}
          <View style={styles.settingItem}>
            <Ionicons
              name="people-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Social Updates
            </Text>
            <Switch
              value={preferences[NotificationCategory.SOCIAL]}
              onValueChange={(value) =>
                handleToggleCategory(NotificationCategory.SOCIAL, value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : preferences[NotificationCategory.SOCIAL]
                    ? "#fff"
                    : "#f4f3f4"
              }
              disabled={!preferences.pushEnabled}
            />
          </View>

          {/* Reminder Notifications */}
          <View style={styles.settingItem}>
            <Ionicons
              name="alarm-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Reminders
            </Text>
            <Switch
              value={preferences[NotificationCategory.REMINDER]}
              onValueChange={(value) =>
                handleToggleCategory(NotificationCategory.REMINDER, value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : preferences[NotificationCategory.REMINDER]
                    ? "#fff"
                    : "#f4f3f4"
              }
              disabled={!preferences.pushEnabled}
            />
          </View>

          {/* Achievement Notifications */}
          <View style={styles.settingItem}>
            <Ionicons
              name="trophy-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Achievements
            </Text>
            <Switch
              value={preferences[NotificationCategory.ACHIEVEMENT]}
              onValueChange={(value) =>
                handleToggleCategory(NotificationCategory.ACHIEVEMENT, value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : preferences[NotificationCategory.ACHIEVEMENT]
                    ? "#fff"
                    : "#f4f3f4"
              }
              disabled={!preferences.pushEnabled}
            />
          </View>

          {/* Marketing Notifications */}
          <View style={styles.settingItem}>
            <Ionicons
              name="megaphone-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Marketing & Promotions
            </Text>
            <Switch
              value={preferences[NotificationCategory.MARKETING]}
              onValueChange={(value) =>
                handleToggleCategory(NotificationCategory.MARKETING, value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : preferences[NotificationCategory.MARKETING]
                    ? "#fff"
                    : "#f4f3f4"
              }
              disabled={!preferences.pushEnabled}
            />
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Quiet Hours
          </Text>

          <View style={styles.settingItem}>
            <Ionicons
              name="moon-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Enable Quiet Hours
            </Text>
            <Switch
              value={preferences.quietHoursEnabled}
              onValueChange={handleToggleQuietHours}
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : preferences.quietHoursEnabled
                    ? "#fff"
                    : "#f4f3f4"
              }
              disabled={!preferences.pushEnabled}
            />
          </View>

          {preferences.quietHoursEnabled && (
            <>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => showTimePicker("start")}
                disabled={!preferences.pushEnabled}
              >
                <Ionicons
                  name="time-outline"
                  size={22}
                  color={isDarkMode ? "#ccc" : "#555"}
                />
                <Text
                  style={[
                    styles.settingText,
                    isDarkMode ? styles.lightText : styles.darkText,
                  ]}
                >
                  Start Time
                </Text>
                <Text
                  style={[
                    styles.valueText,
                    isDarkMode ? styles.lightText : styles.darkText,
                  ]}
                >
                  {formatTimeForDisplay(preferences.scheduledQuietHoursStart)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => showTimePicker("end")}
                disabled={!preferences.pushEnabled}
              >
                <Ionicons
                  name="time-outline"
                  size={22}
                  color={isDarkMode ? "#ccc" : "#555"}
                />
                <Text
                  style={[
                    styles.settingText,
                    isDarkMode ? styles.lightText : styles.darkText,
                  ]}
                >
                  End Time
                </Text>
                <Text
                  style={[
                    styles.valueText,
                    isDarkMode ? styles.lightText : styles.darkText,
                  ]}
                >
                  {formatTimeForDisplay(preferences.scheduledQuietHoursEnd)}
                </Text>
              </TouchableOpacity>

              <View style={styles.infoContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={isDarkMode ? "#ccc" : "#555"}
                />
                <Text
                  style={[
                    styles.infoText,
                    isDarkMode ? { color: "#ccc" } : { color: "#555" },
                  ]}
                >
                  During quiet hours, notifications will be delivered silently.
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Time Pickers */}
      {timePickerShown && (
        <DateTimePicker
          value={getDateFromTimeString(
            timePickerShown === "start"
              ? preferences.scheduledQuietHoursStart
              : preferences.scheduledQuietHoursEnd,
          )}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  lightContainer: {
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    paddingLeft: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  valueText: {
    fontSize: 14,
    opacity: 0.8,
  },
  infoContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    opacity: 0.8,
  },
  lightText: {
    color: "#fff",
  },
  darkText: {
    color: "#222",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  simulatorNote: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    fontStyle: "italic",
    color: "#E57373",
  },
});

export default NotificationPreferencesScreen;
