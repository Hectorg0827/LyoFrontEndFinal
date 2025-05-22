// Performance monitoring service
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { analyticsService, AnalyticsEvent } from "./analyticsService";

// Define performance metrics to track
export enum PerformanceMetric {
  APP_START_TIME = "app_start_time",
  SCREEN_RENDER_TIME = "screen_render_time",
  API_RESPONSE_TIME = "api_response_time",
  ANIMATION_FRAME_RATE = "animation_frame_rate",
  MEMORY_USAGE = "memory_usage",
  INTERACTION_TO_NEXT_PAINT = "interaction_to_next_paint",
  TIME_TO_INTERACTIVE = "time_to_interactive",
  IMAGE_LOAD_TIME = "image_load_time",
  NETWORK_REQUEST_TIME = "network_request_time",
  JS_THREAD_UTILIZATION = "js_thread_utilization",
}

class PerformanceMonitoringService {
  private appStartTimestamp = 0;
  private screenRenderTimestamps: Record<string, number> = {};
  private apiCallStartTimes: Record<string, number> = {};
  private memoryWarningCount = 0;
  private isInitialized = false;
  private perfMetrics: Record<string, any> = {};

  constructor() {
    this.appStartTimestamp = Date.now();
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Record app start time
      this.recordAppStart();

      // Set up memory warning listener if available
      if (Platform.OS === "ios") {
        // In a real implementation, you'd use a native module
        // to listen for memory warnings
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing performance monitoring:", error);
    }
  }

  // Record when the app starts
  recordAppStart() {
    const launchTime = Date.now() - this.appStartTimestamp;
    this.perfMetrics[PerformanceMetric.APP_START_TIME] = launchTime;

    analyticsService.logEvent(AnalyticsEvent.APP_START, {
      launch_time: launchTime,
      platform: Platform.OS,
      device_model: Device.modelName || "unknown",
      app_version: Application.nativeApplicationVersion || "1.0.0",
      os_version: Device.osVersion || "unknown",
    });
  }

  // Record when a screen starts rendering
  recordScreenRenderStart(screenName: string) {
    this.screenRenderTimestamps[screenName] = Date.now();
  }

  // Record when a screen completes rendering
  recordScreenRenderComplete(screenName: string) {
    if (!this.screenRenderTimestamps[screenName]) return;

    const renderTime = Date.now() - this.screenRenderTimestamps[screenName];

    // Store the metric
    if (!this.perfMetrics[PerformanceMetric.SCREEN_RENDER_TIME]) {
      this.perfMetrics[PerformanceMetric.SCREEN_RENDER_TIME] = {};
    }
    this.perfMetrics[PerformanceMetric.SCREEN_RENDER_TIME][screenName] =
      renderTime;

    analyticsService.logEvent(AnalyticsEvent.RENDER_TIME, {
      screen: screenName,
      render_time: renderTime,
    });

    // Clean up
    delete this.screenRenderTimestamps[screenName];
  }

  // Record start of an API call
  recordApiCallStart(endpoint: string) {
    this.apiCallStartTimes[endpoint] = Date.now();
  }

  // Record completion of an API call
  recordApiCallComplete(
    endpoint: string,
    success: boolean,
    statusCode?: number,
  ) {
    if (!this.apiCallStartTimes[endpoint]) return;

    const responseTime = Date.now() - this.apiCallStartTimes[endpoint];

    // Store the metric
    if (!this.perfMetrics[PerformanceMetric.API_RESPONSE_TIME]) {
      this.perfMetrics[PerformanceMetric.API_RESPONSE_TIME] = {};
    }
    this.perfMetrics[PerformanceMetric.API_RESPONSE_TIME][endpoint] =
      responseTime;

    analyticsService.logEvent(AnalyticsEvent.API_RESPONSE_TIME, {
      endpoint,
      response_time: responseTime,
      success,
      status_code: statusCode,
    });

    // Clean up
    delete this.apiCallStartTimes[endpoint];
  }

  // Record image loading time
  recordImageLoadTime(imageUrl: string, loadTimeMs: number) {
    // Store the metric
    if (!this.perfMetrics[PerformanceMetric.IMAGE_LOAD_TIME]) {
      this.perfMetrics[PerformanceMetric.IMAGE_LOAD_TIME] = {};
    }
    this.perfMetrics[PerformanceMetric.IMAGE_LOAD_TIME][imageUrl] = loadTimeMs;

    analyticsService.logEvent("image_load_performance", {
      url: imageUrl,
      load_time: loadTimeMs,
    });
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return { ...this.perfMetrics };
  }

  // Report a performance issue
  reportPerformanceIssue(
    metric: PerformanceMetric,
    value: number,
    threshold: number,
    context: any = {},
  ) {
    if (value > threshold) {
      analyticsService.logEvent("performance_issue", {
        metric,
        value,
        threshold,
        context,
      });

      console.warn(
        `Performance issue detected: ${metric} (${value}) exceeded threshold (${threshold})`,
      );
    }
  }

  // Track memory warnings
  handleMemoryWarning() {
    this.memoryWarningCount++;

    analyticsService.logEvent("memory_warning", {
      count: this.memoryWarningCount,
      timestamp: Date.now(),
    });
  }

  // Track frame drops in animations
  recordFrameDrop(droppedFrames: number, totalFrames: number) {
    const frameDropPercentage = (droppedFrames / totalFrames) * 100;

    // Store the metric
    if (!this.perfMetrics[PerformanceMetric.ANIMATION_FRAME_RATE]) {
      this.perfMetrics[PerformanceMetric.ANIMATION_FRAME_RATE] = [];
    }
    this.perfMetrics[PerformanceMetric.ANIMATION_FRAME_RATE].push({
      dropped: droppedFrames,
      total: totalFrames,
      percentage: frameDropPercentage,
      timestamp: Date.now(),
    });

    // Report significant frame drops (over 10%)
    if (frameDropPercentage > 10) {
      analyticsService.logEvent("frame_drop", {
        dropped_frames: droppedFrames,
        total_frames: totalFrames,
        percentage: frameDropPercentage,
      });
    }
  }

  // React profiler integration for component render time
  measureComponentRender(
    id: string,
    phase: "mount" | "update",
    actualDuration: number,
  ) {
    // Log slow renders (> 16ms which is about 60fps)
    if (actualDuration > 16) {
      analyticsService.logEvent("slow_render", {
        component: id,
        phase,
        duration: actualDuration,
      });
    }
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();

// React hook for tracking component render times
export function usePerformanceMonitoring(componentName: string) {
  return {
    onRenderStart: () =>
      performanceMonitoringService.recordScreenRenderStart(componentName),
    onRenderComplete: () =>
      performanceMonitoringService.recordScreenRenderComplete(componentName),
    measureRender: (
      id: string,
      phase: "mount" | "update",
      actualDuration: number,
    ) => {
      performanceMonitoringService.measureComponentRender(
        id,
        phase,
        actualDuration,
      );
    },
  };
}
