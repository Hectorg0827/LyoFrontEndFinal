// Type definitions for the application's navigation
import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Main application screens
export interface RootStackParamList {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  // Avatar optimization screens
  AvatarPerformanceDashboard: undefined;
  AvatarOptimizationTest: undefined;
  // Add other modal screens or full-screen screens here
  [key: string]: any; // Index signature for ParamListBase compatibility
}

// Main tab navigation screens
export interface MainTabParamList {
  Home: undefined;
  Learn: undefined;
  AIClassroom: undefined;
  Community: undefined;
  Profile: undefined;
  // Add any additional main tabs here
  [key: string]: any; // Index signature for ParamListBase compatibility
}

// Home stack screens
export interface HomeStackParamList {
  HomeScreen: undefined;
  Notifications: undefined;
  Search: undefined;
  // Add other nested screens in the Home stack
  [key: string]: any; // Index signature for ParamListBase compatibility
}

// Learn stack screens
export interface LearnStackParamList {
  LearnScreen: undefined;
  Bookshelf: undefined;
  // Add other nested screens in the Learn stack
  [key: string]: any; // Index signature for ParamListBase compatibility
}

// Profile stack screens
export interface ProfileStackParamList {
  ProfileScreen: undefined;
  AvatarSettings: undefined;
  // Add other nested screens in the Profile stack
  [key: string]: any; // Index signature for ParamListBase compatibility
}

// Props for each screen to provide type safety
export interface AuthScreenProps
  extends NativeStackScreenProps<RootStackParamList, "Auth"> {}

export interface HomeScreenProps
  extends NativeStackScreenProps<HomeStackParamList, "HomeScreen"> {}

export interface LearnScreenProps
  extends NativeStackScreenProps<LearnStackParamList, "LearnScreen"> {}

export interface BookshelfScreenProps
  extends NativeStackScreenProps<LearnStackParamList, "Bookshelf"> {}

export interface AIClassroomScreenProps
  extends NativeStackScreenProps<MainTabParamList, "AIClassroom"> {}

export interface CommunityScreenProps
  extends NativeStackScreenProps<MainTabParamList, "Community"> {}

export interface ProfileScreenProps
  extends NativeStackScreenProps<ProfileStackParamList, "ProfileScreen"> {}

export interface AvatarSettingsScreenProps
  extends NativeStackScreenProps<ProfileStackParamList, "AvatarSettings"> {}

export interface NotificationsScreenProps
  extends NativeStackScreenProps<HomeStackParamList, "Notifications"> {}

export interface SearchScreenProps
  extends NativeStackScreenProps<HomeStackParamList, "Search"> {}

export interface AvatarPerformanceDashboardProps
  extends NativeStackScreenProps<RootStackParamList, "AvatarPerformanceDashboard"> {}

export interface AvatarOptimizationTestProps
  extends NativeStackScreenProps<RootStackParamList, "AvatarOptimizationTest"> {}
