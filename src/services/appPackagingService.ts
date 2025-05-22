// App packaging utility for managing app updates and versioning
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as Updates from "expo-updates";
import { Platform, Alert } from "react-native";

import { analyticsService, AnalyticsEvent } from "./analyticsService";

export interface VersionInfo {
  bundleVersion: string; // Native app version (CFBundleShortVersionString on iOS, versionName on Android)
  bundleBuildNumber: string; // Build number (CFBundleVersion on iOS, versionCode on Android)
  updateId: string | null; // Expo Updates id if an update is running
  channel: string | null; // Expo Updates channel
  isEmulator: boolean; // Whether the app is running on an emulator
  platform: string; // iOS or Android
}

class AppPackagingService {
  // Get current version info
  getVersionInfo(): VersionInfo {
    return {
      bundleVersion: Application.nativeApplicationVersion || "1.0.0",
      bundleBuildNumber: Application.nativeBuildVersion || "1",
      updateId: Updates.updateId,
      channel: Updates.channel,
      isEmulator: !Updates.isEmbeddedLaunch,
      platform: Platform.OS,
    };
  }

  // Check for updates from Expo
  async checkForUpdates(autoDownload = true): Promise<boolean> {
    try {
      // Don't check for updates in development
      if (__DEV__) {
        console.log("Skipping update check in development mode");
        return false;
      }

      // Check for updates
      const update = await Updates.checkForUpdateAsync();

      // Log the check
      analyticsService.logEvent(AnalyticsEvent.APP_UPDATE_CHECK, {
        has_update: update.isAvailable,
        current_version: this.getVersionInfo().bundleVersion,
      });

      // If an update is available and autoDownload is true, download it
      if (update.isAvailable && autoDownload) {
        return this.downloadUpdate();
      }

      return update.isAvailable;
    } catch (error) {
      console.error("Error checking for updates:", error);
      return false;
    }
  }

  // Download update
  async downloadUpdate(): Promise<boolean> {
    try {
      // Fetch the update
      const { isNew } = await Updates.fetchUpdateAsync();

      if (isNew) {
        // Log the download
        analyticsService.logEvent(AnalyticsEvent.APP_UPDATE_DOWNLOADED, {
          version: this.getVersionInfo().bundleVersion,
          update_id: Updates.updateId,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error downloading update:", error);
      return false;
    }
  }

  // Apply downloaded update (will restart the app)
  async applyUpdate(): Promise<void> {
    try {
      // Log the update application
      analyticsService.logEvent(AnalyticsEvent.APP_UPDATE_APPLIED, {
        version: this.getVersionInfo().bundleVersion,
        update_id: Updates.updateId,
      });

      // Restart the app to apply the update
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Error applying update:", error);
    }
  }

  // Show update prompt to the user
  async promptForUpdate(
    title = "Update Available",
    message = "A new version of the app is available. Would you like to update now?",
    applyImmediately = true,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          {
            text: "Later",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Update",
            onPress: async () => {
              const downloaded = await this.downloadUpdate();
              if (downloaded && applyImmediately) {
                await this.applyUpdate();
              }
              resolve(downloaded);
            },
          },
        ],
        { cancelable: false },
      );
    });
  }

  // Force update if the app version is too old
  async checkForForcedUpdate(minimumVersion: string): Promise<boolean> {
    const currentVersion = this.getVersionInfo().bundleVersion;

    // Compare versions
    if (this.compareVersions(currentVersion, minimumVersion) < 0) {
      // Log the forced update
      analyticsService.logEvent(AnalyticsEvent.APP_FORCED_UPDATE, {
        current_version: currentVersion,
        minimum_version: minimumVersion,
      });

      // Store that we need a forced update
      await AsyncStorage.setItem("@needs_forced_update", "true");
      return true;
    }

    return false;
  }

  // Compare two version strings (returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2)
  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0; // versions are equal
  }
}

export const appPackagingService = new AppPackagingService();
