// Type definitions for the application's navigation
import { NavigatorScreenParams } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";

// Main application screens
export interface RootStackParamList {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  // Add other modal screens or full-screen screens here
}

// Main tab navigation screens
export interface MainTabParamList {
  Home: undefined;
  Learn: undefined;
  AIClassroom: undefined;
  Community: undefined;
  Profile: undefined;
  // Add any additional main tabs here
}

// Home stack screens
export interface HomeStackParamList {
  HomeScreen: undefined;
  Notifications: undefined;
  Search: undefined;
  // Add other nested screens in the Home stack
}

// Learn stack screens
export interface LearnStackParamList {
  LearnScreen: undefined;
  Bookshelf: undefined;
  // Add other nested screens in the Learn stack
}

// Profile stack screens
export interface ProfileStackParamList {
  ProfileScreen: undefined;
  AvatarSettings: undefined;
  // Add other nested screens in the Profile stack
}

// Props for each screen to provide type safety
export interface AuthScreenProps
  extends StackScreenProps<RootStackParamList, "Auth"> {}

export interface HomeScreenProps
  extends StackScreenProps<HomeStackParamList, "HomeScreen"> {}

export interface LearnScreenProps
  extends StackScreenProps<LearnStackParamList, "LearnScreen"> {}

export interface BookshelfScreenProps
  extends StackScreenProps<LearnStackParamList, "Bookshelf"> {}

export interface AIClassroomScreenProps
  extends StackScreenProps<MainTabParamList, "AIClassroom"> {}

export interface CommunityScreenProps
  extends StackScreenProps<MainTabParamList, "Community"> {}

export interface ProfileScreenProps
  extends StackScreenProps<ProfileStackParamList, "ProfileScreen"> {}

export interface AvatarSettingsScreenProps
  extends StackScreenProps<ProfileStackParamList, "AvatarSettings"> {}

export interface NotificationsScreenProps
  extends StackScreenProps<HomeStackParamList, "Notifications"> {}

export interface SearchScreenProps
  extends StackScreenProps<HomeStackParamList, "Search"> {}
