import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import AvatarChat from "./src/components/Avatar/AvatarChat";
import { AvatarProvider } from "./src/components/Avatar/AvatarContext";
import LyoAvatar from "./src/components/Avatar/LyoAvatar";
import AppNavigator from "./src/navigation/AppNavigator";
import linking from "./src/navigation/linking";
import { analyticsService } from "./src/services/analyticsService";
import { initializeApi } from "./src/services/apiMiddleware";
import { appPackagingService } from "./src/services/appPackagingService";
import { localizationService } from "./src/services/localizationService";
import { notificationService } from "./src/services/notificationService";
import { performanceMonitoringService } from "./src/services/performanceMonitoringService";

// Keep splash screen visible while the app initializes
SplashScreen.preventAutoHideAsync().catch((error) =>
  console.warn("Error preventing splash screen auto hide:", error),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  // Initialize services and resources
  useEffect(() => {
    const setupApp = async () => {
      try {
        // Initialize analytics early to capture startup metrics
        await analyticsService.init();

        // Initialize performance monitoring
        await performanceMonitoringService.init();
        performanceMonitoringService.recordAppStart();

        // Initialize localization
        await localizationService.init();

        // Initialize notification service
        await notificationService.configure();
        await notificationService.registerForPushNotifications();

        // Initialize API with stored auth token
        await initializeApi();

        // Check for app updates (in production)
        if (!__DEV__) {
          appPackagingService
            .checkForUpdates(true)
            .then(async (updateAvailable) => {
              if (updateAvailable) {
                console.log("Update available, will apply on next app restart");
              }
            });
        }

        // Mark app as ready
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setIsReady(true); // Still mark as ready to avoid getting stuck
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    };

    setupApp();
  }, []);

  // App state change listener for tracking app foreground/background
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Track when app goes to background or comes to foreground
    if (appState.match(/inactive|background/) && nextAppState === "active") {
      // App came to foreground
      analyticsService.logEvent("app_foreground");
      performanceMonitoringService.recordAppForeground();

      // Check for updates when app comes to foreground
      if (!__DEV__) {
        appPackagingService.checkForUpdates(false);
      }
    } else if (
      appState === "active" &&
      nextAppState.match(/inactive|background/)
    ) {
      // App went to background
      analyticsService.logEvent("app_background");
      performanceMonitoringService.recordAppBackground();
    }

    setAppState(nextAppState);
  };

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#121212",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#8E54E9" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AvatarProvider>
          <StatusBar style="light" />
          <AppNavigator linking={linking} />
          <LyoAvatar />
          <AvatarChat />
        </AvatarProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
