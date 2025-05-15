import { api } from './api';

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
  level: 'beginner' | 'intermediate' | 'advanced';
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

// Learn service for educational content
export const learnService = {
  // Get all available courses
  async getCourses(filters?: {
    category?: string;
    level?: string;
    query?: string;
  }): Promise<Course[]> {
    return api.get<Course[]>('/courses', filters);
  },
  
  // Get course details with lessons
  async getCourseDetails(courseId: string): Promise<{course: Course, lessons: Lesson[]}> {
    return api.get<{course: Course, lessons: Lesson[]}>(`/courses/${courseId}`);
  },
  
  // Get user's enrolled courses
  async getEnrolledCourses(): Promise<Course[]> {
    return api.get<Course[]>('/user/courses');
  },
  
  // Enroll in a course
  async enrollCourse(courseId: string): Promise<void> {
    return api.post(`/courses/${courseId}/enroll`);
  },
  
  // Mark a lesson as completed
  async completeLesson(courseId: string, lessonId: string): Promise<void> {
    return api.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
  },
  
  // Get learning tools
  async getLearningTools(): Promise<LearningTool[]> {
    return api.get<LearningTool[]>('/learning-tools');
  }
};
