// Settings service for managing app settings and user preferences
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAppStore } from "../store/appStore";

import {
  NotificationPreferences,
  defaultNotificationPreferences,
} from "./notificationService";

// App settings interface
export interface AppSettings {
  theme: "dark" | "light" | "system";
  language: string;
  fontScale: number;
  autoPlayVideos: boolean;
  dataUsage: "low" | "medium" | "high";
  notifications: NotificationPreferences;
  aiAssistant: {
    voiceEnabled: boolean;
    voiceVolume: number;
    voiceSpeed: number;
    autoSuggest: boolean;
  };
  privacySettings: {
    shareUsageData: boolean;
    crashReporting: boolean;
    locationTracking: boolean;
    personalization: boolean;
  };
  accessibility: {
    reduceMotion: boolean;
    increaseContrast: boolean;
    screenReader: boolean;
  };
}

// Default app settings
export const defaultAppSettings: AppSettings = {
  theme: "dark",
  language: "en",
  fontScale: 1.0,
  autoPlayVideos: true,
  dataUsage: "medium",
  notifications: defaultNotificationPreferences,
  aiAssistant: {
    voiceEnabled: true,
    voiceVolume: 0.8,
    voiceSpeed: 1.0,
    autoSuggest: true,
  },
  privacySettings: {
    shareUsageData: true,
    crashReporting: true,
    locationTracking: false,
    personalization: true,
  },
  accessibility: {
    reduceMotion: false,
    increaseContrast: false,
    screenReader: false,
  },
};

class SettingsService {
  private settings: AppSettings = defaultAppSettings;

  constructor() {
    // Load stored settings when service is created
    this.loadStoredSettings();
  }

  // Load settings from AsyncStorage
  private async loadStoredSettings() {
    try {
      const storedSettings = await AsyncStorage.getItem("@app_settings");
      if (storedSettings) {
        // Merge stored settings with defaults (to handle missing properties in stored settings)
        const parsedSettings = JSON.parse(storedSettings);
        this.settings = {
          ...defaultAppSettings,
          ...parsedSettings,
        };

        // Update app store with current theme and language
        const appStore = useAppStore.getState();
        appStore.setCurrentLanguage(this.settings.language);

        if (this.settings.theme === "dark") {
          !appStore.isDarkMode && appStore.toggleDarkMode();
        } else if (this.settings.theme === "light") {
          appStore.isDarkMode && appStore.toggleDarkMode();
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  // Save all settings to AsyncStorage
  private async saveSettings() {
    try {
      await AsyncStorage.setItem(
        "@app_settings",
        JSON.stringify(this.settings),
      );
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  // Get all settings
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  // Update settings
  async updateSettings(
    newSettings: Partial<AppSettings>,
  ): Promise<AppSettings> {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };

    await this.saveSettings();

    // Update app store if theme or language changed
    const appStore = useAppStore.getState();

    if (
      newSettings.language &&
      newSettings.language !== appStore.currentLanguage
    ) {
      appStore.setCurrentLanguage(newSettings.language);
    }

    if (newSettings.theme) {
      if (newSettings.theme === "dark" && !appStore.isDarkMode) {
        appStore.toggleDarkMode();
      } else if (newSettings.theme === "light" && appStore.isDarkMode) {
        appStore.toggleDarkMode();
      }
    }

    return this.getSettings();
  }

  // Reset settings to defaults
  async resetToDefaults(): Promise<AppSettings> {
    this.settings = { ...defaultAppSettings };
    await this.saveSettings();
    return this.getSettings();
  }

  // Get specific setting value
  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  // Update specific setting
  async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void> {
    this.settings[key] = value;
    await this.saveSettings();

    // Update app store if needed
    const appStore = useAppStore.getState();

    if (key === "language") {
      appStore.setCurrentLanguage(value as string);
    }

    if (key === "theme") {
      const newTheme = value as "dark" | "light" | "system";
      if (newTheme === "dark" && !appStore.isDarkMode) {
        appStore.toggleDarkMode();
      } else if (newTheme === "light" && appStore.isDarkMode) {
        appStore.toggleDarkMode();
      }
    }
  }
}

export const settingsService = new SettingsService();
