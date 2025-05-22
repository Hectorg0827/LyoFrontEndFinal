import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";

import AIClassroomScreen from "../screens/AIClassroomScreen";
import AccessibilitySettingsScreen from "../screens/AccessibilitySettingsScreen";
import AuthScreen from "../screens/AuthScreen";
import AvatarSettingsScreen from "../screens/AvatarSettingsScreen";
import BookshelfScreen from "../screens/BookshelfScreen";
import CommunityScreen from "../screens/CommunityScreen";
import HomeScreen from "../screens/HomeScreen";
import LearnScreen from "../screens/LearnScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SearchScreen from "../screens/SearchScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import SettingsScreen from "../screens/SettingsScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import TermsOfServiceScreen from "../screens/TermsOfServiceScreen";
import NotificationPreferencesScreen from "../screens/NotificationPreferencesScreen";
import { useAppStore } from "../store/appStore";

import linking from "./linking";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom button for the Learn tab
const LearnButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.learnButtonContainer} onPress={onPress}>
      <LinearGradient
        colors={["#4776E6", "#8E54E9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.learnButton}
      >
        <Ionicons name="book" size={24} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={100} style={StyleSheet.absoluteFill} />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Search":
              iconName = focused ? "search" : "search-outline";
              break;
            case "Bookshelf":
              iconName = focused ? "book" : "book-outline";
              break;
            case "Community":
              iconName = focused ? "people" : "people-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#888",
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />

      {/* Custom Learn button in the middle */}
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <LearnButton onPress={() => navigation.navigate("Learn")} />
          ),
        })}
      />

      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isOnboardingCompleted = useAppStore(
    (state) => state.isOnboardingCompleted,
  );
  const [isAppReady, setIsAppReady] = useState(false);

  // Load app state on startup
  useEffect(() => {
    async function prepare() {
      try {
        // Keep splash screen visible while loading resources
        await SplashScreen.preventAutoHideAsync();

        // Check if onboarding is completed
        const onboardingCompleted = await AsyncStorage.getItem(
          "@onboarding_completed",
        );
        const appStore = useAppStore.getState();

        if (onboardingCompleted === "true") {
          appStore.setOnboardingCompleted(true);
        }

        // Initialize analytics, notifications, and performance monitoring
        // In a real implementation, these would be calls to the respective services

        // Wait a bit to ensure smooth transition
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn("Error preparing app:", e);
      } finally {
        setIsAppReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Until the app is ready, return null (splash screen will be visible)
  if (!isAppReady) {
    return null;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboardingCompleted ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ animationTypeForReplace: "pop" }}
          />
        ) : !isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ animation: "fade" }}
          />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />
            <Stack.Screen name="Bookshelf" component={BookshelfScreen} />
            <Stack.Screen name="AIClassroom" component={AIClassroomScreen} />
            <Stack.Screen
              name="AvatarSettings"
              component={AvatarSettingsScreen}
            />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="NotificationPreferences"
              component={NotificationPreferencesScreen}
            />
            <Stack.Screen
              name="AccessibilitySettings"
              component={AccessibilitySettingsScreen}
            />

            {/* Legal Documents */}
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
            />
            <Stack.Screen
              name="TermsOfService"
              component={TermsOfServiceScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 24 : 8,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderTopWidth: 0,
    elevation: 0,
  },
  learnButtonContainer: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  learnButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4776E6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AppNavigator;
