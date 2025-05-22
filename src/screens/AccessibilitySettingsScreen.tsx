// Accessibility Settings Screen
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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
  Slider,
} from "react-native";

import { analyticsService } from "../services/analyticsService";
import {
  settingsService,
  AccessibilitySettings,
} from "../services/settingsService";
import { useAppStore } from "../store/appStore";

const AccessibilitySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const setDarkMode = useAppStore((state) => state.setDarkMode);

  const [isLoading, setIsLoading] = useState(true);
  const [accessibilitySettings, setAccessibilitySettings] =
    useState<AccessibilitySettings | null>(null);

  // Load accessibility settings
  useEffect(() => {
    loadSettings();
    // Track screen view
    analyticsService.logScreenView("AccessibilitySettings");
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await settingsService.getAccessibilitySettings();
      setAccessibilitySettings(settings);
    } catch (error) {
      console.error("Error loading accessibility settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSetting = async (
    key: keyof AccessibilitySettings,
    value: boolean,
  ) => {
    if (!accessibilitySettings) return;

    try {
      const updatedSettings = {
        ...accessibilitySettings,
        [key]: value,
      };

      // Update settings
      await settingsService.updateAccessibilitySettings(updatedSettings);
      setAccessibilitySettings(updatedSettings);

      // If this is the dark mode setting, update app state
      if (key === "useDarkTheme") {
        setDarkMode(value);
      }

      // Track event
      analyticsService.logEvent("accessibility_setting_changed", {
        setting: key,
        value,
      });
    } catch (error) {
      console.error("Error updating accessibility setting:", error);
    }
  };

  const handleUpdateTextSize = async (value: number) => {
    if (!accessibilitySettings) return;

    try {
      const updatedSettings = {
        ...accessibilitySettings,
        textSize: value,
      };

      // Update settings
      await settingsService.updateAccessibilitySettings(updatedSettings);
      setAccessibilitySettings(updatedSettings);

      // Track event
      analyticsService.logEvent("accessibility_text_size_changed", {
        value,
      });
    } catch (error) {
      console.error("Error updating text size setting:", error);
    }
  };

  // If still loading or no settings loaded, show loading state
  if (isLoading || !accessibilitySettings) {
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
            Accessibility
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
            Loading settings...
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
          Accessibility
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Visual section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Visual Settings
          </Text>

          {/* Dark mode */}
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
              Dark Mode
            </Text>
            <Switch
              value={accessibilitySettings.useDarkTheme}
              onValueChange={(value) =>
                handleToggleSetting("useDarkTheme", value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : accessibilitySettings.useDarkTheme
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>

          {/* Reduce animations */}
          <View style={styles.settingItem}>
            <Ionicons
              name="film-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Reduce Animations
            </Text>
            <Switch
              value={accessibilitySettings.reduceAnimations}
              onValueChange={(value) =>
                handleToggleSetting("reduceAnimations", value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : accessibilitySettings.reduceAnimations
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>

          {/* Reduce motion */}
          <View style={styles.settingItem}>
            <Ionicons
              name="eye-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Reduce Motion Effects
            </Text>
            <Switch
              value={accessibilitySettings.reduceMotion}
              onValueChange={(value) =>
                handleToggleSetting("reduceMotion", value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : accessibilitySettings.reduceMotion
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>

          {/* High contrast */}
          <View style={styles.settingItem}>
            <Ionicons
              name="contrast-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              High Contrast Mode
            </Text>
            <Switch
              value={accessibilitySettings.highContrast}
              onValueChange={(value) =>
                handleToggleSetting("highContrast", value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : accessibilitySettings.highContrast
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>

          {/* Text Size */}
          <View style={styles.settingItem}>
            <Ionicons
              name="text-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Text Size
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <Text
              style={[
                styles.sliderLabel,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              A
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0.8}
              maximumValue={1.4}
              step={0.1}
              value={accessibilitySettings.textSize}
              onValueChange={handleUpdateTextSize}
              minimumTrackTintColor="#8E54E9"
              maximumTrackTintColor={isDarkMode ? "#555" : "#ccc"}
              thumbTintColor="#8E54E9"
            />
            <Text
              style={[
                styles.sliderLabelLarge,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              A
            </Text>
          </View>

          <View style={styles.textSizePreviewContainer}>
            <Text
              style={[
                styles.textSizePreview,
                isDarkMode ? styles.lightText : styles.darkText,
                { fontSize: 16 * accessibilitySettings.textSize },
              ]}
            >
              Sample Text
            </Text>
          </View>
        </View>

        {/* Audio & Video section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Audio & Video
          </Text>

          {/* Auto play videos */}
          <View style={styles.settingItem}>
            <Ionicons
              name="videocam-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Auto-play Videos
            </Text>
            <Switch
              value={accessibilitySettings.autoPlayVideos}
              onValueChange={(value) =>
                handleToggleSetting("autoPlayVideos", value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : accessibilitySettings.autoPlayVideos
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>

          {/* Closed captions */}
          <View style={styles.settingItem}>
            <Ionicons
              name="chatbox-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Always Show Captions
            </Text>
            <Switch
              value={accessibilitySettings.alwaysShowCaptions}
              onValueChange={(value) =>
                handleToggleSetting("alwaysShowCaptions", value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : accessibilitySettings.alwaysShowCaptions
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>
        </View>

        {/* Controls & Interactions section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Controls & Interactions
          </Text>

          {/* Increase touch target */}
          <View style={styles.settingItem}>
            <Ionicons
              name="finger-print-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Larger Touch Targets
            </Text>
            <Switch
              value={accessibilitySettings.largerTouchTargets}
              onValueChange={(value) =>
                handleToggleSetting("largerTouchTargets", value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : accessibilitySettings.largerTouchTargets
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>

          {/* Simplified UI */}
          <View style={styles.settingItem}>
            <Ionicons
              name="grid-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Simplified Interface
            </Text>
            <Switch
              value={accessibilitySettings.simplifiedUI}
              onValueChange={(value) =>
                handleToggleSetting("simplifiedUI", value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : accessibilitySettings.simplifiedUI
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>
        </View>

        {/* Content section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.lightText : styles.darkText,
            ]}
          >
            Content & Reading
          </Text>

          {/* Screen reader optimization */}
          <View style={styles.settingItem}>
            <Ionicons
              name="reader-outline"
              size={22}
              color={isDarkMode ? "#ccc" : "#555"}
            />
            <Text
              style={[
                styles.settingText,
                isDarkMode ? styles.lightText : styles.darkText,
              ]}
            >
              Screen Reader Optimization
            </Text>
            <Switch
              value={accessibilitySettings.screenReaderOptimized}
              onValueChange={(value) =>
                handleToggleSetting("screenReaderOptimized", value)
              }
              trackColor={{ false: "#767577", true: "#8E54E9" }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#fff"
                  : accessibilitySettings.screenReaderOptimized
                    ? "#fff"
                    : "#f4f3f4"
              }
            />
          </View>

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
              These settings help make Lyo more accessible. If you need
              additional accessibility features not listed here, please contact
              our support team.
            </Text>
          </View>
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
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  sliderLabel: {
    fontSize: 14,
  },
  sliderLabelLarge: {
    fontSize: 20,
  },
  textSizePreviewContainer: {
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 12,
    backgroundColor: "rgba(150, 150, 150, 0.1)",
    borderRadius: 8,
    alignItems: "center",
  },
  textSizePreview: {
    fontSize: 16,
    textAlign: "center",
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
});

export default AccessibilitySettingsScreen;
