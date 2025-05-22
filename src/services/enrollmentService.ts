import { useAppStore } from "../store/appStore";

import { api } from "./api";
import { Course, avatarService } from "./avatarService";
import { ErrorHandler, ErrorType } from "./errorHandler";
import { networkService } from "./networkService";
import { storageService } from "./storageService";

/**
 * Service for handling course enrollments and learning paths
 */
class EnrollmentService {
  /**
   * Enroll a user in a course
   * @param course The course to enroll in
   * @returns A promise that resolves when enrollment is successful
   */
  async enrollInCourse(course: Course): Promise<void> {
    const isConnected = await networkService.isConnected();
    const { isAuthenticated } = useAppStore.getState();

    if (!isAuthenticated) {
      throw ErrorHandler.createError(
        ErrorType.AUTHENTICATION,
        "You must be logged in to enroll in courses",
        { requiresLogin: true },
      );
    }

    // Prepare the enrollment data
    const enrollmentData = {
      courseId: course.id,
      courseName: course.title,
      level: course.level,
      enrolledAt: new Date().toISOString(),
    };

    // If offline, queue the enrollment for later sync
    if (!isConnected) {
      try {
        await storageService.addToSyncQueue({
          id: `enroll_${course.id}_${Date.now()}`,
          type: "enrollment",
          data: enrollmentData,
        });

        // Cache the course locally
        await storageService.cacheCourse(course);

        // Add to enrollment history
        await this.addToEnrollmentHistory(course.title);

        // Track analytics
        this.trackEnrollmentEvent(course);

        return;
      } catch (error) {
        console.error("Error queuing enrollment:", error);
        throw ErrorHandler.handleStorageError(error);
      }
    }

    // If online, proceed with normal enrollment
    try {
      // Call the backend API to enroll the user
      await api.post("/user/enrollments", enrollmentData);

      // Also add to course history in user preferences
      await this.addToEnrollmentHistory(course.title);

      // Track analytics
      this.trackEnrollmentEvent(course);

      // Cache the course locally for offline access
      await storageService.cacheCourse(course);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw ErrorHandler.handleError({
        type: ErrorType.SERVER,
        message: "Failed to enroll in course",
        error: error as Error,
        context: { course },
      });
    }
  }

  /**
   * Get all courses the user is enrolled in
   * @returns A promise that resolves to an array of enrolled courses
   */
  async getEnrolledCourses(): Promise<Course[]> {
    const { isAuthenticated } = useAppStore.getState();

    if (!isAuthenticated) {
      return [];
    }

    const isConnected = await networkService.isConnected();

    // If offline, try to get courses from cache
    if (!isConnected) {
      try {
        const cachedCourses =
          await storageService.getEnrolledCoursesFromCache();
        return cachedCourses;
      } catch (error) {
        console.error("Error fetching cached enrolled courses:", error);
        throw ErrorHandler.handleStorageError(error);
      }
    }

    // If online, fetch from API and update cache
    try {
      // Get enrolled courses from the backend
      const courses = await api.get<Course[]>("/user/enrollments");

      // Cache the courses for offline access
      try {
        await storageService.cacheEnrolledCourses(courses);
      } catch (cacheError) {
        console.warn("Failed to cache enrolled courses:", cacheError);
      }

      return courses;
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);

      // Try to fall back to cached data if API request fails
      try {
        const cachedCourses =
          await storageService.getEnrolledCoursesFromCache();
        if (cachedCourses && cachedCourses.length > 0) {
          return cachedCourses;
        }
      } catch (cacheError) {
        console.warn("Cache fallback failed:", cacheError);
      }

      throw ErrorHandler.handleError({
        type: ErrorType.SERVER,
        message: "Failed to fetch enrolled courses",
        error: error as Error,
      });
    }
  }

  /**
   * Update course progress
   * @param courseId The ID of the course
   * @param progress The progress value (0-100)
   */
  async updateCourseProgress(
    courseId: string,
    progress: number,
  ): Promise<void> {
    const isConnected = await networkService.isConnected();
    const { isAuthenticated } = useAppStore.getState();

    if (!isAuthenticated) {
      throw ErrorHandler.createError(
        ErrorType.AUTHENTICATION,
        "You must be logged in to update course progress",
        { requiresLogin: true },
      );
    }

    // Update the cached course first (regardless of connectivity)
    try {
      await storageService.updateCachedCourse(courseId, (course) => {
        return {
          ...course,
          progress,
        };
      });
    } catch (cacheError) {
      console.warn("Failed to update cached course progress:", cacheError);
      // Continue with the operation even if caching fails
    }

    // If offline, queue the progress update for later sync
    if (!isConnected) {
      try {
        await storageService.addToSyncQueue({
          id: `progress_${courseId}_${Date.now()}`,
          type: "progress_update",
          data: { courseId, progress },
        });
        return;
      } catch (error) {
        console.error("Error queuing progress update:", error);
        throw ErrorHandler.handleStorageError(error);
      }
    }

    // If online, update on the server
    try {
      // Call the backend API to update progress
      await api.put(`/user/enrollments/${courseId}/progress`, { progress });
    } catch (error) {
      console.error("Error updating course progress:", error);
      throw ErrorHandler.handleError({
        type: ErrorType.SERVER,
        message: "Failed to update course progress",
        error: error as Error,
        context: { courseId, progress },
      });
    }
  }

  /**
   * Mark a module as completed
   * @param courseId The ID of the course
   * @param moduleId The ID of the module
   */
  async completeModule(courseId: string, moduleId: string): Promise<void> {
    const isConnected = await networkService.isConnected();
    const { isAuthenticated } = useAppStore.getState();

    if (!isAuthenticated) {
      throw ErrorHandler.createError(
        ErrorType.AUTHENTICATION,
        "You must be logged in to complete modules",
        { requiresLogin: true },
      );
    }

    // Update the cached course first (regardless of connectivity)
    try {
      await storageService.updateCachedCourse(courseId, (course) => {
        // Find and update the specific module
        const updatedModules = course.modules.map((module) => {
          if (module.id === moduleId) {
            return { ...module, completed: true };
          }
          return module;
        });

        // Calculate new progress based on completed modules
        const completedModules = updatedModules.filter(
          (m) => m.completed,
        ).length;
        const totalModules = updatedModules.length;
        const newProgress =
          totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : course.progress;

        return {
          ...course,
          modules: updatedModules,
          progress: newProgress,
        };
      });
    } catch (cacheError) {
      console.warn("Failed to update cached module completion:", cacheError);
      // Continue with the operation even if caching fails
    }

    // If offline, queue the module completion for later sync
    if (!isConnected) {
      try {
        await storageService.addToSyncQueue({
          id: `module_${courseId}_${moduleId}_${Date.now()}`,
          type: "module_completion",
          data: { courseId, moduleId },
        });
        return;
      } catch (error) {
        console.error("Error queuing module completion:", error);
        throw ErrorHandler.handleStorageError(error);
      }
    }

    // If online, update on the server
    try {
      // Call the backend API to mark the module as completed
      await api.put(
        `/user/enrollments/${courseId}/modules/${moduleId}/complete`,
      );
    } catch (error) {
      console.error("Error completing module:", error);
      throw ErrorHandler.handleError({
        type: ErrorType.SERVER,
        message: "Failed to mark module as completed",
        error: error as Error,
        context: { courseId, moduleId },
      });
    }
  }

  /**
   * Sync offline changes when the user comes back online
   * Processes the sync queue in order
   */
  async syncOfflineChanges(): Promise<void> {
    const isConnected = await networkService.isConnected();

    if (!isConnected) {
      return; // Can't sync if still offline
    }

    try {
      // Get all queued operations
      const queue = await storageService.getSyncQueue();

      if (!queue || queue.length === 0) {
        return; // Nothing to sync
      }

      console.log(`Processing ${queue.length} offline operations...`);

      // Sort by timestamp (oldest first)
      const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);

      for (const item of sortedQueue) {
        try {
          switch (item.type) {
            case "enrollment":
              await api.post("/user/enrollments", item.data);
              break;

            case "progress_update":
              const { courseId, progress } = item.data;
              await api.put(`/user/enrollments/${courseId}/progress`, {
                progress,
              });
              break;

            case "module_completion":
              const { courseId: cId, moduleId } = item.data;
              await api.put(
                `/user/enrollments/${cId}/modules/${moduleId}/complete`,
              );
              break;

            default:
              console.warn(`Unknown sync item type: ${item.type}`);
          }

          // Remove successfully processed item
          await storageService.removeFromSyncQueue(item.id);
          console.log(`Synced: ${item.type} operation`);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // Continue with next item even if this one fails
        }
      }

      // Update the last sync timestamp
      await storageService.updateLastSync();
    } catch (error) {
      console.error("Error syncing offline changes:", error);
      throw ErrorHandler.handleStorageError(error);
    }
  }

  /**
   * Setup the auto-sync listener to sync when connectivity is restored
   */
  setupAutoSync(): () => void {
    // Setup a listener for network changes
    return networkService.addNetworkListener(async (isConnected) => {
      if (isConnected) {
        console.log("Network connection restored, syncing offline changes...");
        try {
          await this.syncOfflineChanges();
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      }
    });
  }

  /**
   * Add a course to enrollment history
   * @param courseTitle The title of the course
   */
  private async addToEnrollmentHistory(courseTitle: string): Promise<void> {
    try {
      // Use the avatar service to update course history
      const userPrefs = await avatarService.getUserPreferences();

      if (!userPrefs) {
        return;
      }

      // Add to course history if not already present
      if (!userPrefs.courseHistory.includes(courseTitle)) {
        userPrefs.courseHistory.push(courseTitle);

        // Keep only the most recent 10 courses
        if (userPrefs.courseHistory.length > 10) {
          userPrefs.courseHistory = userPrefs.courseHistory.slice(-10);
        }

        await avatarService.saveUserPreferences(userPrefs);
      }
    } catch (error) {
      console.error("Error updating enrollment history:", error);
    }
  }

  /**
   * Track enrollment analytics event
   * @param course The course enrolled in
   */
  private trackEnrollmentEvent(course: Course): void {
    // In a real app, this would send analytics data
    // For now, just log the enrollment
    console.log("ANALYTICS: User enrolled in course", {
      courseId: course.id,
      courseTitle: course.title,
      courseLevel: course.level,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const enrollmentService = new EnrollmentService();
