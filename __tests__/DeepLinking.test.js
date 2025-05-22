// Test file for deep linking functionality
import * as Linking from "expo-linking";
import { Platform } from "react-native";

/**
 * Tests for handling deep links in the Lyo app
 *
 * Run these tests in the app using:
 * npm test -- -t "Deep Linking"
 */

describe("Deep Linking", () => {
  const scheme = Platform.select({ web: "", default: "lyoapp://" });
  const baseUrl = "https://lyo.app";

  // Helper function to construct test URLs
  const makeUrl = (path, urlType = "app") => {
    switch (urlType) {
      case "app":
        return `${scheme}${path}`;
      case "web":
        return `${baseUrl}/${path}`;
      default:
        return path;
    }
  };

  test("parses app scheme URLs correctly", () => {
    // Test app URLs
    expect(Linking.parse(makeUrl("learn/courses"))).toEqual({
      hostname: "",
      path: "learn/courses",
      queryParams: {},
    });

    expect(Linking.parse(makeUrl("learn/course/123"))).toEqual({
      hostname: "",
      path: "learn/course/123",
      queryParams: {},
    });

    expect(Linking.parse(makeUrl("profile/settings"))).toEqual({
      hostname: "",
      path: "profile/settings",
      queryParams: {},
    });

    expect(Linking.parse(makeUrl("legal/privacy-policy"))).toEqual({
      hostname: "",
      path: "legal/privacy-policy",
      queryParams: {},
    });
  });

  test("parses web URLs correctly", () => {
    // Test web URLs
    expect(Linking.parse(makeUrl("learn/courses", "web"))).toEqual({
      hostname: "lyo.app",
      path: "learn/courses",
      queryParams: {},
    });

    expect(Linking.parse(makeUrl("learn/course/123", "web"))).toEqual({
      hostname: "lyo.app",
      path: "learn/course/123",
      queryParams: {},
    });

    expect(Linking.parse(makeUrl("profile/settings", "web"))).toEqual({
      hostname: "lyo.app",
      path: "profile/settings",
      queryParams: {},
    });

    expect(Linking.parse(makeUrl("legal/privacy-policy", "web"))).toEqual({
      hostname: "lyo.app",
      path: "legal/privacy-policy",
      queryParams: {},
    });
  });

  test("parses URLs with query parameters correctly", () => {
    const parsedUrl = Linking.parse(
      makeUrl("search/results?query=javascript&filter=beginner"),
    );

    expect(parsedUrl).toEqual({
      hostname: "",
      path: "search/results",
      queryParams: {
        query: "javascript",
        filter: "beginner",
      },
    });

    const webParsedUrl = Linking.parse(
      makeUrl("search/results?query=javascript&filter=beginner", "web"),
    );

    expect(webParsedUrl).toEqual({
      hostname: "lyo.app",
      path: "search/results",
      queryParams: {
        query: "javascript",
        filter: "beginner",
      },
    });
  });

  test("handles URLs with special characters", () => {
    const urlPath = "search/results?query=react%20native&filter=beginner";
    const parsedUrl = Linking.parse(makeUrl(urlPath));

    expect(parsedUrl).toEqual({
      hostname: "",
      path: "search/results",
      queryParams: {
        query: "react native",
        filter: "beginner",
      },
    });
  });

  test("handles notification URLs", () => {
    const notificationUrl = "notifications?type=course_update&id=123";
    const parsedUrl = Linking.parse(makeUrl(notificationUrl));

    expect(parsedUrl).toEqual({
      hostname: "",
      path: "notifications",
      queryParams: {
        type: "course_update",
        id: "123",
      },
    });
  });
});
