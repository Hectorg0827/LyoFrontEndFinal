import { AppError, ErrorType } from "../utils/AppError";
import apiService from "./apiService";

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  duration: string; // e.g. "4h 30m"
  lessonsCount: number;
  progress: number; // 0-100
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  tags: string[];
  level: "beginner" | "intermediate" | "advanced";
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  completed: boolean;
  order: number;
}

export interface LearningTool {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  url: string;
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import ENV from "../config/env";
import { mockCoursesData, mockLessonsData, mockLearningToolsData } from "./mockData";

// Cache keys
const CACHE_KEYS = {
  COURSES: "lyo_cache_courses",
  ENROLLED_COURSES: "lyo_cache_enrolled_courses",
  COURSE_DETAILS_PREFIX: "lyo_cache_course_details_",
  LEARNING_TOOLS: "lyo_cache_learning_tools",
};

// Cache expiry (24 hours in milliseconds)
const CACHE_EXPIRY = 86400000;

// Learn service for educational content
export const learnService = {
  // Get all available courses with filtering, offline support, and caching
  async getCourses(filters?: {
    category?: string;
    level?: string;
    query?: string;
  }): Promise<Course[]> {
    try {
      // Try to get data from API
      let courses: Course[] = [];
      
      if (ENV.USE_BACKEND_API) {
        try {
          courses = await apiService.getCourses(filters);
          
          // Cache the courses for offline use
          await AsyncStorage.setItem(
            CACHE_KEYS.COURSES,
            JSON.stringify({
              data: courses,
              timestamp: Date.now(),
            })
          );
        } catch (apiError) {
          console.warn("API fetch failed, trying cache:", apiError);
          
          // Try to get data from cache
          const cachedData = await AsyncStorage.getItem(CACHE_KEYS.COURSES);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            
            // Check if cache is still valid
            if (Date.now() - timestamp < CACHE_EXPIRY) {
              courses = data;
            } else {
              // Cache expired, throw original error
              throw apiError;
            }
          } else {
            // No cache available, throw original error
            throw apiError;
          }
        }
      } else {
        // Use mock data in offline/development mode
        courses = [...mockCoursesData];
        
        // Apply filters to mock data
        if (filters) {
          if (filters.level) {
            courses = courses.filter(course => course.level === filters.level);
          }
          
          if (filters.category) {
            courses = courses.filter(course => 
              course.tags.some(tag => tag.toLowerCase().includes(filters.category!.toLowerCase()))
            );
          }
          
          if (filters.query) {
            const query = filters.query.toLowerCase();
            courses = courses.filter(course => 
              course.title.toLowerCase().includes(query) ||
              course.description.toLowerCase().includes(query) ||
              course.tags.some(tag => tag.toLowerCase().includes(query))
            );
          }
        }
      }
      
      return courses;
    } catch (error: any) {
      throw new AppError(
        error.name === "SyntaxError" ? ErrorType.Data : ErrorType.Server,
        "Failed to get courses",
        error
      );
    }
  },

  // Get course details with lessons, including offline support
  async getCourseDetails(
    courseId: string,
  ): Promise<{ course: Course; lessons: Lesson[] }> {
    if (!courseId) {
      throw new AppError(
        ErrorType.Validation,
        "Course ID is required to get course details"
      );
    }
    
    try {
      // Try to get data from API
      let courseDetails: { course: Course; lessons: Lesson[] };
      
      if (ENV.USE_BACKEND_API) {
        try {
          courseDetails = await apiService.getCourseDetails(courseId);
          
          // Cache the course details for offline use
          await AsyncStorage.setItem(
            `${CACHE_KEYS.COURSE_DETAILS_PREFIX}${courseId}`,
            JSON.stringify({
              data: courseDetails,
              timestamp: Date.now(),
            })
          );
        } catch (apiError) {
          console.warn("API fetch failed, trying cache:", apiError);
          
          // Try to get data from cache
          const cachedData = await AsyncStorage.getItem(`${CACHE_KEYS.COURSE_DETAILS_PREFIX}${courseId}`);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            
            // Check if cache is still valid
            if (Date.now() - timestamp < CACHE_EXPIRY) {
              courseDetails = data;
            } else {
              // Cache expired, throw original error
              throw apiError;
            }
          } else {
            // No cache available, throw original error
            throw apiError;
          }
        }
      } else {
        // Use mock data in offline/development mode
        const course = mockCoursesData.find(c => c.id === courseId);
        if (!course) {
          throw new AppError(
            ErrorType.NotFound,
            `Course with ID ${courseId} not found`
          );
        }
        
        const lessons = mockLessonsData[courseId] || [];
        courseDetails = { course, lessons };
      }
      
      return courseDetails;
    } catch (error: any) {
      throw new AppError(
        error.name === "SyntaxError" ? ErrorType.Data : 
        error.type === ErrorType.NotFound ? ErrorType.NotFound : ErrorType.Server,
        `Failed to get course details for ${courseId}`,
        error
      );
    }
  },

  // Get user's enrolled courses with offline support
  async getEnrolledCourses(): Promise<Course[]> {
    try {
      // Try to get data from API
      let enrolledCourses: Course[] = [];
      
      if (ENV.USE_BACKEND_API) {
        try {
          enrolledCourses = await apiService.getEnrolledCourses();
          
          // Cache the enrolled courses for offline use
          await AsyncStorage.setItem(
            CACHE_KEYS.ENROLLED_COURSES,
            JSON.stringify({
              data: enrolledCourses,
              timestamp: Date.now(),
            })
          );
        } catch (apiError) {
          console.warn("API fetch failed, trying cache:", apiError);
          
          // Try to get data from cache
          const cachedData = await AsyncStorage.getItem(CACHE_KEYS.ENROLLED_COURSES);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            
            // Check if cache is still valid
            if (Date.now() - timestamp < CACHE_EXPIRY) {
              enrolledCourses = data;
            } else {
              // Cache expired, throw original error
              throw apiError;
            }
          } else {
            // No cache available, throw original error
            throw apiError;
          }
        }
      } else {
        // Use mock data in offline/development mode
        // For mock data, assume the first two courses are enrolled
        enrolledCourses = mockCoursesData.slice(0, 2);
      }
      
      return enrolledCourses;
    } catch (error: any) {
      throw new AppError(
        error.name === "SyntaxError" ? ErrorType.Data : ErrorType.Server,
        "Failed to get enrolled courses",
        error
      );
    }
  },

  // Enroll in a course with offline support
  async enrollCourse(courseId: string): Promise<void> {
    if (!courseId) {
      throw new AppError(
        ErrorType.Validation,
        "Course ID is required for enrollment"
      );
    }
    
    try {
      if (ENV.USE_BACKEND_API) {
        await apiService.enrollCourse(courseId);
        
        // Update local cache to reflect enrollment
        const cachedData = await AsyncStorage.getItem(CACHE_KEYS.ENROLLED_COURSES);
        if (cachedData) {
          const { data: enrolledCourses, timestamp } = JSON.parse(cachedData);
          
          // Add the course to enrolled courses if not already present
          if (!enrolledCourses.some((course: Course) => course.id === courseId)) {
            // Get the course details to add to enrolled courses
            const allCoursesCacheData = await AsyncStorage.getItem(CACHE_KEYS.COURSES);
            if (allCoursesCacheData) {
              const { data: allCourses } = JSON.parse(allCoursesCacheData);
              const courseToEnroll = allCourses.find((course: Course) => course.id === courseId);
              
              if (courseToEnroll) {
                enrolledCourses.push(courseToEnroll);
                
                await AsyncStorage.setItem(
                  CACHE_KEYS.ENROLLED_COURSES,
                  JSON.stringify({
                    data: enrolledCourses,
                    timestamp,
                  })
                );
              }
            }
          }
        }
      } else {
        // In mock mode, simulate enrollment by updating cache
        const cachedData = await AsyncStorage.getItem(CACHE_KEYS.ENROLLED_COURSES);
        let enrolledCourses: Course[] = [];
        
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          enrolledCourses = data;
        }
        
        // Add the course to enrolled courses if not already present
        if (!enrolledCourses.some(course => course.id === courseId)) {
          const courseToEnroll = mockCoursesData.find(course => course.id === courseId);
          
          if (courseToEnroll) {
            enrolledCourses.push(courseToEnroll);
            
            await AsyncStorage.setItem(
              CACHE_KEYS.ENROLLED_COURSES,
              JSON.stringify({
                data: enrolledCourses,
                timestamp: Date.now(),
              })
            );
          } else {
            throw new AppError(
              ErrorType.NotFound,
              `Course with ID ${courseId} not found`
            );
          }
        }
      }
    } catch (error: any) {
      throw new AppError(
        error.type === ErrorType.NotFound ? ErrorType.NotFound : ErrorType.Server,
        `Failed to enroll in course ${courseId}`,
        error
      );
    }
  },

  // Mark a lesson as completed with offline support
  async completeLesson(courseId: string, lessonId: string): Promise<void> {
    if (!courseId || !lessonId) {
      throw new AppError(
        ErrorType.Validation,
        "Course ID and Lesson ID are required to mark completion"
      );
    }
    
    try {
      if (ENV.USE_BACKEND_API) {
        await apiService.completeLesson(courseId, lessonId);
        
        // Update local cache to reflect lesson completion
        const cachedData = await AsyncStorage.getItem(`${CACHE_KEYS.COURSE_DETAILS_PREFIX}${courseId}`);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          
          // Update the lesson completion status
          const updatedLessons = data.lessons.map((lesson: Lesson) => {
            if (lesson.id === lessonId) {
              return { ...lesson, completed: true };
            }
            return lesson;
          });
          
          await AsyncStorage.setItem(
            `${CACHE_KEYS.COURSE_DETAILS_PREFIX}${courseId}`,
            JSON.stringify({
              data: { ...data, lessons: updatedLessons },
              timestamp,
            })
          );
        }
      } else {
        // In mock mode, simulate lesson completion
        if (!mockLessonsData[courseId]) {
          throw new AppError(
            ErrorType.NotFound,
            `Course with ID ${courseId} not found`
          );
        }
        
        const lessonIndex = mockLessonsData[courseId].findIndex(lesson => lesson.id === lessonId);
        if (lessonIndex === -1) {
          throw new AppError(
            ErrorType.NotFound,
            `Lesson with ID ${lessonId} not found in course ${courseId}`
          );
        }
        
        // Update the mock data
        mockLessonsData[courseId][lessonIndex].completed = true;
        
        // Also update the cached data if it exists
        const cachedData = await AsyncStorage.getItem(`${CACHE_KEYS.COURSE_DETAILS_PREFIX}${courseId}`);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          
          // Update the lesson completion status
          const updatedLessons = data.lessons.map((lesson: Lesson) => {
            if (lesson.id === lessonId) {
              return { ...lesson, completed: true };
            }
            return lesson;
          });
          
          await AsyncStorage.setItem(
            `${CACHE_KEYS.COURSE_DETAILS_PREFIX}${courseId}`,
            JSON.stringify({
              data: { ...data, lessons: updatedLessons },
              timestamp,
            })
          );
        }
      }
    } catch (error: any) {
      throw new AppError(
        error.type === ErrorType.NotFound ? ErrorType.NotFound : ErrorType.Server,
        `Failed to mark lesson ${lessonId} as completed`,
        error
      );
    }
  },

  // Get learning tools with offline support
  async getLearningTools(): Promise<LearningTool[]> {
    try {
      // Try to get data from API
      let learningTools: LearningTool[] = [];
      
      if (ENV.USE_BACKEND_API) {
        try {
          learningTools = await apiService.getLearningTools();
          
          // Cache the learning tools for offline use
          await AsyncStorage.setItem(
            CACHE_KEYS.LEARNING_TOOLS,
            JSON.stringify({
              data: learningTools,
              timestamp: Date.now(),
            })
          );
        } catch (apiError) {
          console.warn("API fetch failed, trying cache:", apiError);
          
          // Try to get data from cache
          const cachedData = await AsyncStorage.getItem(CACHE_KEYS.LEARNING_TOOLS);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            
            // Check if cache is still valid
            if (Date.now() - timestamp < CACHE_EXPIRY) {
              learningTools = data;
            } else {
              // Cache expired, throw original error
              throw apiError;
            }
          } else {
            // No cache available, throw original error
            throw apiError;
          }
        }
      } else {
        // Use mock data in offline/development mode
        learningTools = [...mockLearningToolsData];
      }
      
      return learningTools;
    } catch (error: any) {
      throw new AppError(
        error.name === "SyntaxError" ? ErrorType.Data : ErrorType.Server,
        "Failed to get learning tools",
        error
      );
    }
  },
  
  // Clear cache for testing or troubleshooting
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('lyo_cache_'));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error: any) {
      console.error("Failed to clear learn service cache:", error);
    }
  },
};