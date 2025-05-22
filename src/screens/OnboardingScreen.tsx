import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useRef as _useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image as _Image,
  Dimensions,
  SafeAreaView as _SafeAreaView,
  Platform as _Platform,
} from "react-native";
import Onboarding from "react-native-onboarding-swiper";

import { useAppStore } from "../store/appStore";

const { width, height } = Dimensions.get("window");

// Custom components for the onboarding screen
const NextButton = ({ ...props }) => (
  <TouchableOpacity style={styles.nextButton} {...props}>
    <Text style={styles.nextButtonText}>Next</Text>
  </TouchableOpacity>
);

const DoneButton = ({ ...props }) => (
  <TouchableOpacity style={styles.doneButton} {...props}>
    <LinearGradient
      colors={["#4776E6", "#8E54E9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.doneButtonGradient}
    >
      <Text style={styles.doneButtonText}>Get Started</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const Dots = ({ selected }: { selected: boolean }) => (
  <View
    style={[styles.dot, selected ? styles.dotSelected : styles.dotUnselected]}
  />
);

const SkipButton = ({ ...props }) => (
  <TouchableOpacity style={styles.skipButton} {...props}>
    <Text style={styles.skipButtonText}>Skip</Text>
  </TouchableOpacity>
);

const OnboardingScreen: React.FC = () => {
  const _navigation = useNavigation();
  const setOnboardingCompleted = useAppStore(
    (state) => state.setOnboardingCompleted,
  );
  const [_imagesLoaded, setImagesLoaded] = useState({
    image1: false,
    image2: false,
    image3: false,
  });

  const _handleImageError = (imageKey: string) => {
    console.warn(`Failed to load onboarding image: ${imageKey}`);
    // Update state to indicate image failed to load
    setImagesLoaded((prev) => ({
      ...prev,
      [imageKey]: true, // We still mark as loaded to avoid blocking the UI
    }));
  };

  const handleDone = async () => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem("@onboarding_completed", "true");
      setOnboardingCompleted(true);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Onboarding
        containerStyles={styles.onboardingContainer}
        pages={[
          {
            backgroundColor: "#121212",
            image: (
              <View style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                  <LinearGradient
                    colors={["#4776E6", "#8E54E9"]}
                    style={styles.placeholderGradient}
                  >
                    <Ionicons name="book-outline" size={80} color="#fff" />
                  </LinearGradient>
                </View>
              </View>
            ),
            title: "AI-Powered Learning",
            subtitle:
              "Let Lyo generate personalized courses on any topic, tailored to your learning style and level.",
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: "#121212",
            image: (
              <View style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                  <LinearGradient
                    colors={["#4776E6", "#8E54E9"]}
                    style={styles.placeholderGradient}
                  >
                    <Ionicons name="person-outline" size={80} color="#fff" />
                  </LinearGradient>
                </View>
              </View>
            ),
            title: "Interactive Avatar",
            subtitle:
              "Talk to Lyo, your AI assistant that explains complex topics in a way you can understand.",
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: "#121212",
            image: (
              <View style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                  <LinearGradient
                    colors={["#4776E6", "#8E54E9"]}
                    style={styles.placeholderGradient}
                  >
                    <Ionicons name="people-outline" size={80} color="#fff" />
                  </LinearGradient>
                </View>
              </View>
            ),
            title: "Learn with Friends",
            subtitle:
              "Join courses with friends, attend events, and share your learning journey.",
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
        ]}
        NextButtonComponent={NextButton}
        DoneButtonComponent={DoneButton}
        DotComponent={Dots}
        SkipButtonComponent={SkipButton}
        onDone={handleDone}
        onSkip={handleDone}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  onboardingContainer: {
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    overflow: "hidden",
  },
  placeholderGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  dot: {
    width: 8,
    height: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  dotSelected: {
    backgroundColor: "#8E54E9",
  },
  dotUnselected: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  skipButton: {
    padding: 15,
  },
  skipButtonText: {
    color: "#8E54E9",
    fontSize: 16,
  },
  nextButton: {
    padding: 15,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#8E54E9",
    fontSize: 16,
    fontWeight: "500",
  },
  doneButton: {
    marginRight: 15,
  },
  doneButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OnboardingScreen;
