// Test file for analytics functionality
import { analyticsService } from "../src/services/analyticsService";

/**
 * Tests for the analytics service in the Lyo app
 *
 * Run these tests in the app using:
 * npm test -- -t "Analytics Service"
 */

describe("Analytics Service", () => {
  beforeEach(() => {
    // Reset mocks and tracking data before each test
    jest.clearAllMocks();
    analyticsService.resetForTesting();
  });

  test("should track screen views", () => {
    analyticsService.logScreenView("HomeScreen");
    analyticsService.logScreenView("LearnScreen");

    const trackedEvents = analyticsService.getTrackedEventsForTesting();
    const screenViews = trackedEvents.filter(
      (event) => event.type === "screen_view",
    );

    expect(screenViews.length).toBe(2);
    expect(screenViews[0].properties.screen_name).toBe("HomeScreen");
    expect(screenViews[1].properties.screen_name).toBe("LearnScreen");
  });

  test("should track custom events", () => {
    analyticsService.logEvent("button_click", {
      button_id: "enroll_button",
      course_id: "123",
    });

    analyticsService.logEvent("course_completed", {
      course_id: "123",
      completion_time: 3600,
      score: 95,
    });

    const trackedEvents = analyticsService.getTrackedEventsForTesting();

    expect(trackedEvents.length).toBe(2);
    expect(trackedEvents[0].type).toBe("button_click");
    expect(trackedEvents[0].properties.button_id).toBe("enroll_button");
    expect(trackedEvents[1].type).toBe("course_completed");
    expect(trackedEvents[1].properties.score).toBe(95);
  });

  test("should track user properties", () => {
    analyticsService.setUserProperty("user_level", 5);
    analyticsService.setUserProperty("has_premium", true);
    analyticsService.setUserProperty("favorite_category", "programming");

    const userProperties = analyticsService.getUserPropertiesForTesting();

    expect(userProperties.user_level).toBe(5);
    expect(userProperties.has_premium).toBe(true);
    expect(userProperties.favorite_category).toBe("programming");
  });

  test("should track session information", () => {
    analyticsService.startSession("user_123");

    // Simulate some events in the session
    analyticsService.logEvent("search", { query: "javascript" });
    analyticsService.logScreenView("SearchResults");
    analyticsService.logEvent("course_view", { course_id: "456" });

    analyticsService.endSession();

    const sessionData = analyticsService.getSessionDataForTesting();

    expect(sessionData.user_id).toBe("user_123");
    expect(sessionData.events.length).toBe(3);
    expect(sessionData.start_time).toBeDefined();
    expect(sessionData.end_time).toBeDefined();
    expect(sessionData.duration).toBeGreaterThanOrEqual(0);
  });

  test("should respect analytics opt-out", () => {
    // Opt out from analytics
    analyticsService.setEnabled(false);

    // Attempt to track events
    analyticsService.logScreenView("HomeScreen");
    analyticsService.logEvent("button_click", { button_id: "test" });

    // No events should be tracked when opted out
    const trackedEvents = analyticsService.getTrackedEventsForTesting();
    expect(trackedEvents.length).toBe(0);

    // Opt back in
    analyticsService.setEnabled(true);

    // Track an event
    analyticsService.logEvent("test_event");

    // Now the event should be tracked
    const updatedTrackedEvents = analyticsService.getTrackedEventsForTesting();
    expect(updatedTrackedEvents.length).toBe(1);
  });

  test("should properly handle user identity", () => {
    // Anonymous tracking
    analyticsService.logEvent("app_open");

    // Identify user
    analyticsService.identifyUser("user_456", {
      name: "Test User",
      email: "test@example.com",
      account_type: "premium",
    });

    // Events after identifying should have user data
    analyticsService.logEvent("purchase", { product_id: "789" });

    const trackedEvents = analyticsService.getTrackedEventsForTesting();

    expect(trackedEvents[0].user_id).toBeUndefined();
    expect(trackedEvents[1].user_id).toBe("user_456");
  });

  test("should flush events when buffer is full", () => {
    // Mock the flush method
    const flushSpy = jest.spyOn(analyticsService, "flushEvents");

    // Set a low buffer limit for testing
    analyticsService.setBufferLimitForTesting(3);

    // Track multiple events
    analyticsService.logEvent("event_1");
    analyticsService.logEvent("event_2");
    analyticsService.logEvent("event_3");

    // Should auto-flush after the third event
    expect(flushSpy).toHaveBeenCalledTimes(1);

    // Track more events
    analyticsService.logEvent("event_4");
    analyticsService.logEvent("event_5");
    analyticsService.logEvent("event_6");

    // Should flush again
    expect(flushSpy).toHaveBeenCalledTimes(2);
  });
});
