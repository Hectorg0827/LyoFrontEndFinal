import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Define all your screen names and their parameters here
export interface RootStackParamList {
  AuthLoading: undefined; // Or any params it might take
  Login: undefined;
  SignUp: undefined;
  MainApp: undefined; // This could be a navigator itself
  Onboarding: undefined;
  Home: undefined;
  Feed: undefined;
  StoryDetail: { storyId: string };
  Profile: { userId?: string }; // Optional userId
  Settings: undefined;
  CourseDiscovery: undefined;
  CourseDetails: { courseId: string };
  LearningPath: { pathId: string };
  Chat: { sessionId?: string; initialMessage?: string }; // Optional params
  AvatarCustomization: undefined;
  Notifications: undefined;
  Search: { query?: string };
  // Add other screens here as your app grows
  // Example: PostCreation: { draftId?: string };
  // Example: UserList: { type: 'followers' | 'following', userId: string };
}

// Generic Navigation Prop type for use in components
export type AppNavigationProp<
  RouteName extends keyof RootStackParamList = keyof RootStackParamList,
> = NativeStackNavigationProp<RootStackParamList, RouteName>;

// Generic Route Prop type for use in components
export type AppRouteProp<RouteName extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, RouteName>;

// Example of how to type a screen component's props:
//
// import { AppNavigationProp, AppRouteProp } from './navigation';
//
// type HomeScreenNavigationProp = AppNavigationProp<'Home'>;
// type HomeScreenRouteProp = AppRouteProp<'Home'>;
//
// type Props = {
//   navigation: HomeScreenNavigationProp;
//   route: HomeScreenRouteProp;
// };
//
// const HomeScreen: React.FC<Props> = ({ navigation, route }) => {
//   // ...
// };
