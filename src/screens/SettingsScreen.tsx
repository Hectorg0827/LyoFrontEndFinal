// Settings screen for managing app settings and user preferences
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Application from "expo-application";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { analyticsService } from "../services/analyticsService";
import { appPackagingService } from "../services/appPackagingService";
import {
  localizationService,
  LanguageNames,
  Language,
} from "../services/localizationService";
import {
  notificationService,
} from "../services/notificationService";
import { useAppStore } from "../store/appStore";

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode, toggleDarkMode, setAuthenticated, setUser } =
    useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(
    localizationService.getLanguage(),
  );
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    loadSettings();

    // Get app version
    setAppVersion(Application.nativeApplicationVersion || "1.0.0");

    // Track screen view
    analyticsService.logScreenView("Settings");
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load notification preferences
      const notifPrefs = notificationService.getPreferences();
      setNotificationEnabled(notifPrefs.pushEnabled);

      // Load analytics preferences
      const analyticsEnabledValue =
        await AsyncStorage.getItem("@analytics_enabled");
      setAnalyticsEnabled(analyticsEnabledValue !== "false");
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            setIsLoading(true);
            try {
              // Clear user data
              await AsyncStorage.removeItem("@auth_token");

              // Reset state
              setAuthenticated(false);
              setUser(null);

              // Track logout event
              analyticsService.logEvent("user_logout");
            } catch (error) {
              console.error("Logout error:", error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationEnabled(value);

    try {
      await notificationService.updatePreferences({ pushEnabled: value });

      // Track event
      analyticsService.logEvent("notification_preference_changed", {
        enabled: value,
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      setNotificationEnabled(!value); // Revert on error
    }
  };

  const handleToggleAnalytics = async (value: boolean) => {
    setAnalyticsEnabled(value);

    try {
      // Update storage
      await AsyncStorage.setItem("@analytics_enabled", value.toString());

      // Update app store
      useAppStore.getState().setAnalyticsEnabled(value);

      if (!value) {
        // If analytics are disabled, log one last event
        analyticsService.logEvent("analytics_disabled");
        // In a real implementation, you would disable analytics tracking here
      } else {
        // Analytics were enabled
        analyticsService.logEvent("analytics_enabled");
      }
    } catch (error) {
      console.error("Error updating analytics preferences:", error);
      setAnalyticsEnabled(!value); // Revert on error
    }
  };

  const openLanguageSelector = () => {
    const languages = Object.values(Language);

    Alert.alert(
      "Select Language",
      "Choose your preferred language",
      languages.map((lang) => ({
        text: LanguageNames[lang],
        onPress: () => handleLanguageChange(lang),
      })),
      { cancelable: true },
    );
  };

  const handleLanguageChange = async (language: Language) => {
    setCurrentLanguage(language);

    try {
      // Update localization service
      localizationService.setLanguage(language);

      // Update app store
      useAppStore.getState().setCurrentLanguage(language);

      // Track event
      analyticsService.logEvent("language_changed", {
        language,
      });
    } catch (error) {
      console.error("Error updating language:", error);
    }
  };

  const checkForUpdates = async () => {
    setIsLoading(true);

    try {
      const updateAvailable = await appPackagingService.checkForUpdates(false);

      if (updateAvailable) {
        await appPackagingService.promptForUpdate();
      } else {
        Alert.alert("No Updates", "Your app is up to date!");
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      Alert.alert(
        "Error",
        "Failed to check for updates. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          isDarkMode ? styles.darkContainer : styles.lightContainer,
        ]}
      >
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8E54E9" />
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
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Account
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("ProfileEdit")}
          >
            <Ionicons
              name="person-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Edit Profile
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Change Password
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("PrivacySettings")}
          >
            <Ionicons
              name="shield-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Privacy Settings
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Appearance
          </Text>

          <View style={styles.settingItem}>
            <Ionicons
              name={isDarkMode ? "moon-outline" : "sunny-outline"}
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Dark Mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios" ? "#fff" : isDarkMode ? "#fff" : "#f4f3f4"
              }
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={openLanguageSelector}
          >
            <Ionicons
              name="language-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Language
            </Text>
            <View style={styles.valueContainer}>
              <Text
                style={[
                  styles.valueText,
                  isDarkMode ? styles.lightText : styles.darkText,
                ]}
              >
                {LanguageNames[currentLanguage as Language]}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={isDarkMode ? "#ccc" : "#555"}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("AccessibilitySettings")}
          >
            <Ionicons
              name="accessibility-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Accessibility
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            AI Assistant
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("AvatarSettings")}
          >
            <Ionicons
              name="person-circle-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Avatar Settings
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("VoiceSettings")}
          >
            <Ionicons
              name="mic-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Voice Settings
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("AIPreferences")}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              AI Preferences
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Notifications
          </Text>

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
              Push Notifications
            </Text>
            <Switch
              value={notificationEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : notificationEnabled
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("NotificationPreferences")}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Notification Preferences
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Data & Privacy
          </Text>

          <View style={styles.settingItem}>
            <Ionicons
              name="analytics-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Allow Analytics
            </Text>
            <Switch
              value={analyticsEnabled}
              onValueChange={handleToggleAnalytics}
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : analyticsEnabled
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate("DataManagement")}
          >
            <Ionicons
              name="cloud-download-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Data Management
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            About
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => openUrl("https://lyo.app/help")}
          >
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Help & Support
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() =>
              navigation.navigate("LegalDocuments", { screen: "PrivacyPolicy" })
            }
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Privacy Policy
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() =>
              navigation.navigate("LegalDocuments", {
                screen: "TermsOfService",
              })
            }
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Terms of Service
            </Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={checkForUpdates}
          >
            <Ionicons
              name="refresh-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Check for Updates
            </Text>
            <View style={styles.valueContainer}>
              <Text
                style={[
                  styles.valueText,
                  isDarkMode ? styles.lightText : styles.darkText,
                ]}
              >
                v{appVersion}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={isDarkMode ? "#ccc" : "#555"}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              isDarkMode ? styles.darkLogoutButton : styles.lightLogoutButton,
            ]}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={isDarkMode ? "#f25555" : "#d32f2f"}
            />
            <Text
              style={[
                styles.logoutText,
                isDarkMode ? styles.darkLogoutText : styles.lightLogoutText,
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  darkLogoutButton: {
    backgroundColor: "rgba(242, 85, 85, 0.15)",
  },
  lightLogoutButton: {
    backgroundColor: "rgba(211, 47, 47, 0.1)",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  darkLogoutText: {
    color: "#f25555",
  },
  lightLogoutText: {
    color: "#d32f2f",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lightText: {
    color: "#fff",
  },
  darkText: {
    color: "#222",
  },
});

export default SettingsScreen;
