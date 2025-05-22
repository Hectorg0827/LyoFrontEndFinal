// Deep linking configuration for the app
import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { RootStackParamList } from "./types";

// Scheme for your app (should match what's in app.json)
const scheme = "lyoapp";

// Define your URL mapping structure
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    /* Prefix for app links/universal links */
    Linking.createURL("/"),
    "https://lyo.app",
    "https://www.lyo.app",
    `${scheme}://`,
  ],

  config: {
    // Root navigator configuration - typically points to the main stack
    screens: {
      Auth: {
        path: "auth",
        screens: {
          Login: "login",
          Register: "register",
          ForgotPassword: "forgot-password",
        },
      },

      Main: {
        path: "",
        screens: {
          // Tab navigator screens
          Home: {
            path: "home",
            screens: {
              Feed: "feed",
              StoryDetail: "story/:storyId",
              PostDetail: "post/:postId",
            },
          },

          Search: {
            path: "search",
            screens: {
              SearchResults: "results/:query",
              Trending: "trending",
              CategorySearch: "category/:categoryId",
            },
          },

          Learn: {
            path: "learn",
            screens: {
              CourseList: "courses",
              CourseDetail: "course/:courseId",
              Module: "course/:courseId/module/:moduleId",
              AIClassroom: "ai-classroom",
            },
          },

          Community: {
            path: "community",
            screens: {
              Map: "map",
              EventList: "events",
              EventDetail: "event/:eventId",
              GroupDetail: "group/:groupId",
            },
          },

          Profile: {
            path: "profile",
            screens: {
              MyProfile: "",
              UserProfile: ":userId",
              EditProfile: "edit",
              Settings: "settings",
              AvatarSettings: "avatar-settings",
              Preferences: "preferences",
            },
          },

          Settings: {
            path: "settings",
            screens: {
              Main: "",
              NotificationPreferences: "notifications",
              AccessibilitySettings: "accessibility",
              DataManagement: "data",
              AIPreferences: "ai-preferences",
            },
          },

          Legal: {
            path: "legal",
            screens: {
              PrivacyPolicy: "privacy-policy",
              TermsOfService: "terms-of-service",
              EULA: "eula",
              AccessibilityStatement: "accessibility-statement",
            },
          },
        },
      },

      // Modal screens that sit outside the tab navigator
      Notifications: "notifications",
      Bookshelf: "bookshelf",
      AIClassroom: "ai-classroom",
      AvatarSettings: "avatar-settings",
      Onboarding: "onboarding",

      // Special screens
      NotFound: "*",
    },
  },

  // Function to handle URLs that don't match any of the routes above
  async getInitialURL() {
    // First, check if the app was opened via a deep link
    const url = await Linking.getInitialURL();

    // Get the URL that opened the app
    if (url !== null) {
      return url;
    }

    // Return null if the app wasn't opened from a deep link
    return null;
  },

  // Function to subscribe to incoming links
  subscribe(listener) {
    // Listen to incoming links when the app is open
    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      listener(url);
    });

    return () => {
      // Clean up the event listener when the component unmounts
      linkingSubscription.remove();
    };
  },
};

export default linking;
