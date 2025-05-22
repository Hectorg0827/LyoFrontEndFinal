// Terms of Service Screen
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Markdown from "react-native-markdown-display";

import { analyticsService } from "../services/analyticsService";
import {
  legalDocuments,
  LegalDocumentTypes,
} from "../services/legalDocumentsService";
import { useAppStore } from "../store/appStore";

const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation();
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  useEffect(() => {
    // Track screen view
    analyticsService.logScreenView("TermsOfService");
  }, []);

  // Get terms of service content
  const termsOfService = legalDocuments[LegalDocumentTypes.TERMS_OF_SERVICE];

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDarkMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            isDarkMode ? styles.lightText : styles.darkText,
          ]}
        >
          Terms of Service
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.versionContainer}>
        <Text
          style={[
            styles.versionText,
            isDarkMode ? styles.lightText : styles.darkText,
          ]}
        >
          Last Updated: {termsOfService.lastUpdated} • Version{" "}
          {termsOfService.version}
        </Text>
      </View>

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Markdown
          style={{
            body: {
              color: isDarkMode ? "#fff" : "#000",
              fontSize: 16,
              lineHeight: 24,
            },
            heading1: {
              color: isDarkMode ? "#fff" : "#000",
              fontSize: 24,
              fontWeight: "bold",
              marginVertical: 16,
            },
            heading2: {
              color: isDarkMode ? "#fff" : "#000",
              fontSize: 20,
              fontWeight: "bold",
              marginVertical: 16,
            },
            paragraph: {
              color: isDarkMode ? "#ddd" : "#333",
              marginVertical: 8,
            },
            list_item: {
              color: isDarkMode ? "#ddd" : "#333",
              marginVertical: 4,
            },
          }}
        >
          {termsOfService.content}
        </Markdown>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  lightContainer: {
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  versionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.7,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  lightText: {
    color: "#fff",
  },
  darkText: {
    color: "#222",
  },
  spacer: {
    height: 40,
  },
});

export default TermsOfServiceScreen;
