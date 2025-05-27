import { create } from "zustand";
import { Course, Lesson, LearningTool, learnService } from "../services/learnService";
import { AppError, ErrorType } from "../utils/AppError";

interface LearnStore {
  // Courses data
  courses: Course[];
  enrolledCourses: Course[];
  activeCourse: Course | null;
  activeLessons: Lesson[];
  learningTools: LearningTool[];
  
  // Filter and search state
  courseFilters: {
    category?: string;
    level?: string;
    query?: string;
  };
  
  // Loading and error states
  isLoadingCourses: boolean;
  isLoadingEnrolledCourses: boolean;
  isLoadingCourseDetails: boolean;
  isLoadingLearningTools: boolean;
  error: string | null;
  
  // Action states
  isEnrolling: boolean;
  isCompletingLesson: boolean;
  
  // Actions
  fetchCourses: (filters?: { category?: string; level?: string; query?: string }) => Promise<Course[]>;
  fetchEnrolledCourses: () => Promise<Course[]>;
  fetchCourseDetails: (courseId: string) => Promise<{ course: Course; lessons: Lesson[] }>;
  fetchLearningTools: () => Promise<LearningTool[]>;
  enrollInCourse: (courseId: string) => Promise<boolean>;
  completeLesson: (courseId: string, lessonId: string) => Promise<boolean>;
  setCourseFilters: (filters: { category?: string; level?: string; query?: string }) => void;
  clearError: () => void;
  clearCache: () => Promise<void>;
}

export const useLearnStore = create<LearnStore>((set, get) => ({
  // Initial state
  courses: [],
  enrolledCourses: [],
  activeCourse: null,
  activeLessons: [],
  learningTools: [],
  
  courseFilters: {},
  
  isLoadingCourses: false,
  isLoadingEnrolledCourses: false,
  isLoadingCourseDetails: false,
  isLoadingLearningTools: false,
  error: null,
  
  isEnrolling: false,
  isCompletingLesson: false,
  
  // Fetch all available courses
  fetchCourses: async (filters) => {
    set({ 
      isLoadingCourses: true, 
      error: null,
      courseFilters: filters || get().courseFilters 
    });
    
    try {
      const courses = await learnService.getCourses(filters || get().courseFilters);
      set({ courses, isLoadingCourses: false });
      return courses;
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : "Failed to fetch courses";
      set({ isLoadingCourses: false, error: errorMessage });
      return [];
    }
  },
  
  // Fetch enrolled courses
  fetchEnrolledCourses: async () => {
    set({ isLoadingEnrolledCourses: true, error: null });
    
    try {
      const enrolledCourses = await learnService.getEnrolledCourses();
      set({ enrolledCourses, isLoadingEnrolledCourses: false });
      return enrolledCourses;
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : "Failed to fetch enrolled courses";
      set({ isLoadingEnrolledCourses: false, error: errorMessage });
      return [];
    }
  },
  
  // Fetch course details
  fetchCourseDetails: async (courseId) => {
    set({ isLoadingCourseDetails: true, error: null });
    
    try {
      const { course, lessons } = await learnService.getCourseDetails(courseId);
      set({ 
        activeCourse: course, 
        activeLessons: lessons, 
        isLoadingCourseDetails: false 
      });
      return { course, lessons };
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : `Failed to fetch course details for ${courseId}`;
      set({ isLoadingCourseDetails: false, error: errorMessage });
      throw error;
    }
  },
  
  // Fetch learning tools
  fetchLearningTools: async () => {
    set({ isLoadingLearningTools: true, error: null });
    
    try {
      const learningTools = await learnService.getLearningTools();
      set({ learningTools, isLoadingLearningTools: false });
      return learningTools;
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : "Failed to fetch learning tools";
      set({ isLoadingLearningTools: false, error: errorMessage });
      return [];
    }
  },
  
  // Enroll in a course
  enrollInCourse: async (courseId) => {
    set({ isEnrolling: true, error: null });
    
    try {
      await learnService.enrollCourse(courseId);
      
      // Update the enrolledCourses list
      const enrolledCourses = await learnService.getEnrolledCourses();
      set({ enrolledCourses, isEnrolling: false });
      return true;
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : `Failed to enroll in course ${courseId}`;
      set({ isEnrolling: false, error: errorMessage });
      return false;
    }
  },
  
  // Complete a lesson
  completeLesson: async (courseId, lessonId) => {
    set({ isCompletingLesson: true, error: null });
    
    try {
      await learnService.completeLesson(courseId, lessonId);
      
      // Update the active lessons list to reflect completion
      set(state => ({
        activeLessons: state.activeLessons.map(lesson => {
          if (lesson.id === lessonId) {
            return { ...lesson, completed: true };
          }
          return lesson;
        }),
        isCompletingLesson: false
      }));
      
      return true;
    } catch (error: any) {
      const errorMessage = error instanceof AppError ? error.message : `Failed to mark lesson ${lessonId} as completed`;
      set({ isCompletingLesson: false, error: errorMessage });
      return false;
    }
  },
  
  // Set course filters
  setCourseFilters: (filters) => {
    set({ courseFilters: filters });
  },
  
  // Clear error
  clearError: () => set({ error: null }),
  
  // Clear cache (for testing or troubleshooting)
  clearCache: async () => {
    try {
      await learnService.clearCache();
      
      // Reset state
      set({
        courses: [],
        enrolledCourses: [],
        activeCourse: null,
        activeLessons: [],
        learningTools: [],
      });
      
    } catch (error) {
      console.error("Failed to clear learn store cache:", error);
    }
  },
}));

export default useLearnStore;