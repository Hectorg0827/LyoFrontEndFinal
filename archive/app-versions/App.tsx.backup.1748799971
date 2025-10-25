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
import { registerRootComponent } from "expo";

import AvatarChat from "@components/Avatar/AvatarChat";
import { AvatarProvider } from "@components/Avatar/AvatarContext";
import LyoAvatar from "@components/Avatar/LyoAvatar";
import AppNavigator from "@navigation/AppNavigator";
import linking from "@navigation/linking";
import { analyticsService } from "@services/analyticsService";
import { initializeApi } from "@services/apiMiddleware";
import { appPackagingService } from "@services/appPackagingService";
import { initializeAvatarSystem } from "@services/avatarSystemInit";
import { localizationService } from "@services/localizationService";
import { notificationService } from "@services/notificationService";
import { performanceMonitoringService } from "@services/performanceMonitoringService";
import { ErrorHandler, ErrorType } from "@utils/errorHandler";

// Keep splash screen visible while the app initializes
SplashScreen.preventAutoHideAsync().catch((error) => {
  const appError = ErrorHandler.processError(error, "App.preventAutoHideAsync");
  console.warn("Error preventing splash screen auto hide:", appError.message);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (replaces cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
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
        // TODO: Implement proper localization

        // Initialize notification service
        await notificationService.configure();
        await notificationService.registerForPushNotifications();

        // Initialize API with stored auth token
        await initializeApi();

        // Initialize Avatar System Optimizations
        await initializeAvatarSystem({
          enablePerformanceMonitoring: true,
          enableAdaptiveQuality: true,
          enableSmartCaching: true,
          enableEnhancedErrorHandling: true,
        });

        // Check for app updates (in production)
        if (!__DEV__) {
          try {
            const updateAvailable = await appPackagingService.checkForUpdates(true);
            if (updateAvailable) {
              console.log("Update available, will apply on next app restart");
            }
          } catch (updateError) {
            const appError = ErrorHandler.processError(updateError, "App.checkForUpdates");
            console.warn("Update check failed:", appError.message);
          }
        }

        // Mark app as ready
        setIsReady(true);
      } catch (error) {
        const appError = ErrorHandler.processError(error, "App.setupApp");
        console.error("Failed to initialize app:", appError);
        setIsReady(true); // Still mark as ready to avoid getting stuck
      } finally {
        try {
          // Hide splash screen
          await SplashScreen.hideAsync();
        } catch (splashError) {
          const appError = ErrorHandler.processError(splashError, "App.hideAsync");
          console.warn("Error hiding splash screen:", appError.message);
        }
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
    try {
      // Track when app goes to background or comes to foreground
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        // App came to foreground
        analyticsService.logEvent("app_foreground");
        performanceMonitoringService.recordAppForeground();

        // Check for updates when app comes to foreground
        if (!__DEV__) {
          appPackagingService.checkForUpdates(false)
            .catch(error => {
              const appError = ErrorHandler.processError(error, "App.foregroundUpdateCheck");
              console.warn("Update check failed:", appError.message);
            });
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
    } catch (error) {
      const appError = ErrorHandler.processError(error, "App.handleAppStateChange");
      console.error("Error handling app state change:", appError);
    }
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
          <AppNavigator />
          <LyoAvatar />
          <AvatarChat />
        </AvatarProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
