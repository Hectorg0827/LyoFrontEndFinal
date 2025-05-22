import AsyncStorage from "@react-native-async-storage/async-storage";

import { ENV } from "../config/env";

import { Course } from "./avatarService";
import { ErrorHandler, ErrorType } from "./errorHandler";

// Storage keys with environment prefix to avoid conflicts
const STORAGE_KEYS = {
  ENROLLED_COURSES: `${ENV.STORAGE_PREFIX}enrolled_courses`,
  COURSE_CONTENT: (courseId: string) =>
    `${ENV.STORAGE_PREFIX}course_${courseId}`,
  SYNC_QUEUE: `${ENV.STORAGE_PREFIX}sync_queue`,
  LAST_SYNC: `${ENV.STORAGE_PREFIX}last_sync`,
};

// Types for sync queue items
interface SyncQueueItem {
  id: string;
  type: "module_completion" | "progress_update" | "enrollment";
  data: any;
  timestamp: number;
}

/**
 * Service for handling local storage and offline caching
 */
class StorageService {
  /**
   * Save enrolled courses to local storage
   * @param courses The list of courses to cache
   */
  async cacheEnrolledCourses(courses: Course[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ENROLLED_COURSES,
        JSON.stringify(courses),
      );

      // Also cache each course individually for faster access
      for (const course of courses) {
        await this.cacheCourse(course);
      }

      // Update last sync time
      await this.updateLastSync();
    } catch (error) {
      console.error("Error caching enrolled courses:", error);
      throw ErrorHandler.createError(
        ErrorType.STORAGE,
        "Failed to cache enrolled courses",
        { error },
      );
    }
  }

  /**
   * Get enrolled courses from local storage
   * @returns The list of cached enrolled courses or empty array if none
   */
  async getEnrolledCoursesFromCache(): Promise<Course[]> {
    try {
      const coursesJson = await AsyncStorage.getItem(
        STORAGE_KEYS.ENROLLED_COURSES,
      );
      return coursesJson ? JSON.parse(coursesJson) : [];
    } catch (error) {
      console.error("Error retrieving cached courses:", error);
      return [];
    }
  }

  /**
   * Cache a single course
   * @param course The course to cache
   */
  async cacheCourse(course: Course): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.COURSE_CONTENT(course.id),
        JSON.stringify(course),
      );
    } catch (error) {
      console.error(`Error caching course ${course.id}:`, error);
      throw ErrorHandler.createError(
        ErrorType.STORAGE,
        "Failed to cache course",
        { courseId: course.id, error },
      );
    }
  }

  /**
   * Get a single course from cache
   * @param courseId The ID of the course to retrieve
   * @returns The cached course or null if not found
   */
  async getCourseFromCache(courseId: string): Promise<Course | null> {
    try {
      const courseJson = await AsyncStorage.getItem(
        STORAGE_KEYS.COURSE_CONTENT(courseId),
      );
      return courseJson ? JSON.parse(courseJson) : null;
    } catch (error) {
      console.error(`Error retrieving cached course ${courseId}:`, error);
      return null;
    }
  }

  /**
   * Update a cached course with new data
   * @param courseId The ID of the course to update
   * @param updateFn Function that takes the current course and returns the updated course
   * @returns The updated course or null if course not found in cache
   */
  async updateCachedCourse(
    courseId: string,
    updateFn: (course: Course) => Course,
  ): Promise<Course | null> {
    try {
      const currentCourse = await this.getCourseFromCache(courseId);

      if (!currentCourse) {
        return null;
      }

      const updatedCourse = updateFn(currentCourse);
      await this.cacheCourse(updatedCourse);

      // Also update the course in the enrolled courses list
      const enrolledCourses = await this.getEnrolledCoursesFromCache();
      const updatedEnrolledCourses = enrolledCourses.map((course) =>
        course.id === courseId ? updatedCourse : course,
      );

      await this.cacheEnrolledCourses(updatedEnrolledCourses);

      return updatedCourse;
    } catch (error) {
      console.error(`Error updating cached course ${courseId}:`, error);
      return null;
    }
  }

  /**
   * Add an operation to the sync queue for later processing when online
   * @param item The sync queue item to add
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, "timestamp">): Promise<void> {
    try {
      const queueJson = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      const queue: SyncQueueItem[] = queueJson ? JSON.parse(queueJson) : [];

      // Add timestamp to the item
      const queueItem: SyncQueueItem = {
        ...item,
        timestamp: Date.now(),
      };

      queue.push(queueItem);

      await AsyncStorage.setItem(
        STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(queue),
      );
    } catch (error) {
      console.error("Error adding to sync queue:", error);
      throw ErrorHandler.createError(
        ErrorType.STORAGE,
        "Failed to add operation to sync queue",
        { item, error },
      );
    }
  }

  /**
   * Get all items in the sync queue
   * @returns The list of sync queue items
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const queueJson = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error("Error retrieving sync queue:", error);
      return [];
    }
  }

  /**
   * Remove an item from the sync queue
   * @param id The ID of the item to remove
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const updatedQueue = queue.filter((item) => item.id !== id);

      await AsyncStorage.setItem(
        STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(updatedQueue),
      );
    } catch (error) {
      console.error(`Error removing item ${id} from sync queue:`, error);
      throw ErrorHandler.createError(
        ErrorType.STORAGE,
        "Failed to remove item from sync queue",
        { id, error },
      );
    }
  }

  /**
   * Clear the sync queue (typically called after successful sync)
   */
  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    } catch (error) {
      console.error("Error clearing sync queue:", error);
      throw ErrorHandler.createError(
        ErrorType.STORAGE,
        "Failed to clear sync queue",
        { error },
      );
    }
  }

  /**
   * Update the last sync timestamp
   */
  async updateLastSync(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        JSON.stringify({ timestamp: Date.now() }),
      );
    } catch (error) {
      console.error("Error updating last sync time:", error);
    }
  }

  /**
   * Get the last sync timestamp
   * @returns The timestamp of the last sync or null if never synced
   */
  async getLastSync(): Promise<number | null> {
    try {
      const syncJson = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (!syncJson) return null;

      const { timestamp } = JSON.parse(syncJson);
      return timestamp;
    } catch (error) {
      console.error("Error getting last sync time:", error);
      return null;
    }
  }

  /**
   * Clear all cached data (for logout or testing)
   */
  async clearAll(): Promise<void> {
    try {
      // Get all keys with our prefix
      const allKeys = await AsyncStorage.getAllKeys();
      const ourKeys = allKeys.filter((key) =>
        key.startsWith(ENV.STORAGE_PREFIX),
      );

      // Remove all our keys
      await AsyncStorage.multiRemove(ourKeys);
    } catch (error) {
      console.error("Error clearing all cached data:", error);
      throw ErrorHandler.createError(
        ErrorType.STORAGE,
        "Failed to clear cached data",
        { error },
      );
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
