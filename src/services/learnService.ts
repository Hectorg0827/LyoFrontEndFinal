import { AppError, ErrorType } from "../utils/AppError";
import apiService from "./apiService";
import { DifficultyLevel, LearningDomain } from "./adaptiveLearningService";

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
  level: "beginner" | "intermediate" | "advanced" | "expert";
  // New fields for enhanced learning
  domain?: LearningDomain;
  thumbnail?: string;
  featured?: boolean;
  enrollmentDate?: string;
  completed?: boolean;
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

export interface Category {
  id: string;
  name: string;
  courses: Course[];
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
// Additional cache keys for enhanced learning features
const ENHANCED_CACHE_KEYS = {
  FEATURED_COURSES: "lyo_cache_featured_courses",
  COURSE_CATEGORIES: "lyo_cache_course_categories",
  DOMAIN_COURSES: "lyo_cache_domain_courses_",
};

// Mock data for enhanced learning features
const mockFeaturedCourses: Course[] = [
  {
    id: "featured-1",
    title: "AI Fundamentals & Applications",
    description: "Learn the foundations of artificial intelligence and its real-world applications in various industries.",
    coverImage: "https://placekitten.com/700/403",
    thumbnail: "https://placekitten.com/700/403",
    duration: "6h 15m",
    lessonsCount: 18,
    progress: 0,
    author: {
      id: "author-1",
      name: "Prof. Alex Johnson",
      avatar: "https://placekitten.com/300/305",
    },
    tags: ["ai", "technology", "beginner"],
    level: "beginner",
    domain: "technology",
    featured: true,
  },
  {
    id: "featured-2",
    title: "Data Science Masterclass",
    description: "Comprehensive guide to data analysis, visualization, and machine learning with practical projects.",
    coverImage: "https://placekitten.com/700/404",
    thumbnail: "https://placekitten.com/700/404",
    duration: "8h 30m",
    lessonsCount: 22,
    progress: 0,
    author: {
      id: "author-2",
      name: "Dr. Maria Garcia",
      avatar: "https://placekitten.com/300/306",
    },
    tags: ["data science", "machine learning", "intermediate"],
    level: "intermediate",
    domain: "technology",
    featured: true,
  },
  {
    id: "featured-3",
    title: "Quantum Physics Explained",
    description: "Demystifying quantum mechanics concepts with intuitive explanations and visual demonstrations.",
    coverImage: "https://placekitten.com/700/405",
    thumbnail: "https://placekitten.com/700/405",
    duration: "5h 45m",
    lessonsCount: 15,
    progress: 0,
    author: {
      id: "author-3",
      name: "Dr. James Wilson",
      avatar: "https://placekitten.com/300/307",
    },
    tags: ["quantum", "physics", "science"],
    level: "intermediate",
    domain: "science",
    featured: true,
  }
];

// Mock categories data
const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Technology",
    courses: [
      {
        id: "tech-1",
        title: "Introduction to Programming",
        description: "Learn the basics of programming with Python in this beginner-friendly course.",
        coverImage: "https://placekitten.com/700/406",
        thumbnail: "https://placekitten.com/700/406",
        duration: "4h 20m",
        lessonsCount: 12,
        progress: 0,
        author: {
          id: "author-4",
          name: "Sarah Johnson",
          avatar: "https://placekitten.com/300/308",
        },
        tags: ["programming", "python", "beginner"],
        level: "beginner",
        domain: "technology",
      },
      {
        id: "tech-2",
        title: "Web Development Bootcamp",
        description: "Full-stack web development with HTML, CSS, JavaScript, and React.",
        coverImage: "https://placekitten.com/700/407",
        thumbnail: "https://placekitten.com/700/407",
        duration: "10h 15m",
        lessonsCount: 25,
        progress: 0,
        author: {
          id: "author-5",
          name: "Michael Chen",
          avatar: "https://placekitten.com/300/309",
        },
        tags: ["web development", "javascript", "react"],
        level: "intermediate",
        domain: "technology",
      },
    ],
  },
  {
    id: "cat-2",
    name: "Science",
    courses: [
      {
        id: "sci-1",
        title: "Introduction to Astronomy",
        description: "Explore the wonders of the universe, from planets to galaxies and beyond.",
        coverImage: "https://placekitten.com/700/408",
        thumbnail: "https://placekitten.com/700/408",
        duration: "5h 30m",
        lessonsCount: 14,
        progress: 0,
        author: {
          id: "author-6",
          name: "Dr. Emily Rodriguez",
          avatar: "https://placekitten.com/300/310",
        },
        tags: ["astronomy", "space", "science"],
        level: "beginner",
        domain: "science",
      },
      {
        id: "sci-2",
        title: "Molecular Biology Fundamentals",
        description: "Understanding the building blocks of life: DNA, RNA, and proteins.",
        coverImage: "https://placekitten.com/700/409",
        thumbnail: "https://placekitten.com/700/409",
        duration: "7h 45m",
        lessonsCount: 18,
        progress: 0,
        author: {
          id: "author-7",
          name: "Prof. David Kim",
          avatar: "https://placekitten.com/300/311",
        },
        tags: ["biology", "molecular", "science"],
        level: "intermediate",
        domain: "science",
      },
    ],
  },
  {
    id: "cat-3",
    name: "Mathematics",
    courses: [
      {
        id: "math-1",
        title: "Calculus Made Easy",
        description: "A visual and intuitive approach to differential and integral calculus.",
        coverImage: "https://placekitten.com/700/410",
        thumbnail: "https://placekitten.com/700/410",
        duration: "6h 15m",
        lessonsCount: 16,
        progress: 0,
        author: {
          id: "author-8",
          name: "Dr. Robert Taylor",
          avatar: "https://placekitten.com/300/312",
        },
        tags: ["calculus", "mathematics", "intermediate"],
        level: "intermediate",
        domain: "math",
      },
      {
        id: "math-2",
        title: "Statistics for Data Science",
        description: "Essential statistical concepts and methods for data analysis.",
        coverImage: "https://placekitten.com/700/411",
        thumbnail: "https://placekitten.com/700/411",
        duration: "5h 45m",
        lessonsCount: 14,
        progress: 0,
        author: {
          id: "author-9",
          name: "Prof. Lisa Wang",
          avatar: "https://placekitten.com/300/313",
        },
        tags: ["statistics", "data science", "mathematics"],
        level: "intermediate",
        domain: "math",
      },
    ],
  },
];

// Domain-specific courses for adaptive learning
const mockDomainCourses: Record<LearningDomain, Record<DifficultyLevel, Course[]>> = {
  math: {
    beginner: [
      {
        id: "math-b-1",
        title: "Basic Algebra Concepts",
        description: "Learn foundational algebraic concepts through interactive lessons.",
        coverImage: "https://placekitten.com/700/412",
        thumbnail: "https://placekitten.com/700/412",
        duration: "3h 45m",
        lessonsCount: 10,
        progress: 0,
        author: {
          id: "author-10",
          name: "Dr. Sarah Johnson",
          avatar: "https://placekitten.com/300/314",
        },
        tags: ["algebra", "mathematics", "beginner"],
        level: "beginner",
        domain: "math",
      },
      {
        id: "math-b-2",
        title: "Geometry Fundamentals",
        description: "Explore shapes, angles, and spatial relationships with visual explanations.",
        coverImage: "https://placekitten.com/700/413",
        thumbnail: "https://placekitten.com/700/413",
        duration: "4h 15m",
        lessonsCount: 12,
        progress: 0,
        author: {
          id: "author-11",
          name: "Prof. Michael Chen",
          avatar: "https://placekitten.com/300/315",
        },
        tags: ["geometry", "mathematics", "beginner"],
        level: "beginner",
        domain: "math",
      },
    ],
    intermediate: [
      {
        id: "math-i-1",
        title: "Calculus I: Limits and Derivatives",
        description: "Understanding limits, continuity, and the power of derivatives.",
        coverImage: "https://placekitten.com/700/414",
        thumbnail: "https://placekitten.com/700/414",
        duration: "6h 30m",
        lessonsCount: 15,
        progress: 0,
        author: {
          id: "author-12",
          name: "Dr. Robert Taylor",
          avatar: "https://placekitten.com/300/316",
        },
        tags: ["calculus", "derivatives", "mathematics"],
        level: "intermediate",
        domain: "math",
      },
    ],
    advanced: [
      {
        id: "math-a-1",
        title: "Linear Algebra & Matrix Theory",
        description: "Advanced matrix operations, vector spaces, and linear transformations.",
        coverImage: "https://placekitten.com/700/415",
        thumbnail: "https://placekitten.com/700/415",
        duration: "7h 15m",
        lessonsCount: 18,
        progress: 0,
        author: {
          id: "author-13",
          name: "Prof. Emily Rodriguez",
          avatar: "https://placekitten.com/300/317",
        },
        tags: ["linear algebra", "matrices", "mathematics"],
        level: "advanced",
        domain: "math",
      },
    ],
    expert: [
      {
        id: "math-e-1",
        title: "Real Analysis & Measure Theory",
        description: "Rigorous treatment of limits, continuity, and integration theory.",
        coverImage: "https://placekitten.com/700/416",
        thumbnail: "https://placekitten.com/700/416",
        duration: "8h 45m",
        lessonsCount: 20,
        progress: 0,
        author: {
          id: "author-14",
          name: "Dr. David Kim",
          avatar: "https://placekitten.com/300/318",
        },
        tags: ["real analysis", "measure theory", "mathematics"],
        level: "expert",
        domain: "math",
      },
    ],
  },
  science: {
    beginner: [
      {
        id: "sci-b-1",
        title: "Introduction to Scientific Thinking",
        description: "Learn the principles of scientific inquiry and experimentation.",
        coverImage: "https://placekitten.com/700/417",
        thumbnail: "https://placekitten.com/700/417",
        duration: "3h 30m",
        lessonsCount: 8,
        progress: 0,
        author: {
          id: "author-15",
          name: "Dr. Lisa Wang",
          avatar: "https://placekitten.com/300/319",
        },
        tags: ["scientific method", "science", "beginner"],
        level: "beginner",
        domain: "science",
      },
    ],
    intermediate: [
      {
        id: "sci-i-1",
        title: "Molecular Biology & Genetics",
        description: "Understand DNA, RNA, proteins, and genetic inheritance mechanisms.",
        coverImage: "https://placekitten.com/700/418",
        thumbnail: "https://placekitten.com/700/418",
        duration: "6h 15m",
        lessonsCount: 15,
        progress: 0,
        author: {
          id: "author-16",
          name: "Prof. James Wilson",
          avatar: "https://placekitten.com/300/320",
        },
        tags: ["biology", "genetics", "science"],
        level: "intermediate",
        domain: "science",
      },
    ],
    advanced: [
      {
        id: "sci-a-1",
        title: "Quantum Mechanics Principles",
        description: "Wave-particle duality, Heisenberg uncertainty, and quantum states.",
        coverImage: "https://placekitten.com/700/419",
        thumbnail: "https://placekitten.com/700/419",
        duration: "7h 45m",
        lessonsCount: 16,
        progress: 0,
        author: {
          id: "author-17",
          name: "Dr. Maria Garcia",
          avatar: "https://placekitten.com/300/321",
        },
        tags: ["quantum", "physics", "science"],
        level: "advanced",
        domain: "science",
      },
    ],
    expert: [
      {
        id: "sci-e-1",
        title: "Astrophysics & Cosmology",
        description: "Exploring the structure and evolution of the universe.",
        coverImage: "https://placekitten.com/700/420",
        thumbnail: "https://placekitten.com/700/420",
        duration: "9h 30m",
        lessonsCount: 22,
        progress: 0,
        author: {
          id: "author-18",
          name: "Prof. Alex Johnson",
          avatar: "https://placekitten.com/300/322",
        },
        tags: ["astrophysics", "cosmology", "science"],
        level: "expert",
        domain: "science",
      },
    ],
  },
  technology: {
    beginner: [
      {
        id: "tech-b-1",
        title: "Introduction to Coding Concepts",
        description: "Learn fundamental programming concepts that apply to any language.",
        coverImage: "https://placekitten.com/700/421",
        thumbnail: "https://placekitten.com/700/421",
        duration: "4h 15m",
        lessonsCount: 10,
        progress: 0,
        author: {
          id: "author-19",
          name: "Sarah Johnson",
          avatar: "https://placekitten.com/300/323",
        },
        tags: ["programming", "coding", "technology"],
        level: "beginner",
        domain: "technology",
      },
    ],
    intermediate: [
      {
        id: "tech-i-1",
        title: "Full-Stack Web Development",
        description: "Build complete web applications with modern frameworks and tools.",
        coverImage: "https://placekitten.com/700/422",
        thumbnail: "https://placekitten.com/700/422",
        duration: "8h 45m",
        lessonsCount: 20,
        progress: 0,
        author: {
          id: "author-20",
          name: "Michael Chen",
          avatar: "https://placekitten.com/300/324",
        },
        tags: ["web development", "javascript", "technology"],
        level: "intermediate",
        domain: "technology",
      },
    ],
    advanced: [
      {
        id: "tech-a-1",
        title: "Machine Learning Algorithms",
        description: "Implement and understand key machine learning models and techniques.",
        coverImage: "https://placekitten.com/700/423",
        thumbnail: "https://placekitten.com/700/423",
        duration: "7h 30m",
        lessonsCount: 18,
        progress: 0,
        author: {
          id: "author-21",
          name: "Dr. Emily Rodriguez",
          avatar: "https://placekitten.com/300/325",
        },
        tags: ["machine learning", "ai", "technology"],
        level: "advanced",
        domain: "technology",
      },
    ],
    expert: [
      {
        id: "tech-e-1",
        title: "Deep Neural Network Architectures",
        description: "Advanced neural network design and optimization techniques.",
        coverImage: "https://placekitten.com/700/424",
        thumbnail: "https://placekitten.com/700/424",
        duration: "9h 15m",
        lessonsCount: 22,
        progress: 0,
        author: {
          id: "author-22",
          name: "Prof. David Kim",
          avatar: "https://placekitten.com/300/326",
        },
        tags: ["deep learning", "neural networks", "technology"],
        level: "expert",
        domain: "technology",
      },
    ],
  },
  language: {
    beginner: [
      {
        id: "lang-b-1",
        title: "Fundamentals of Language Learning",
        description: "Essential techniques and strategies for effective language acquisition.",
        coverImage: "https://placekitten.com/700/425",
        thumbnail: "https://placekitten.com/700/425",
        duration: "3h 30m",
        lessonsCount: 8,
        progress: 0,
        author: {
          id: "author-23",
          name: "Dr. Lisa Wang",
          avatar: "https://placekitten.com/300/327",
        },
        tags: ["language learning", "linguistics", "beginner"],
        level: "beginner",
        domain: "language",
      },
    ],
    intermediate: [
      {
        id: "lang-i-1",
        title: "Conversational Fluency",
        description: "Techniques to improve spoken language skills and practical communication.",
        coverImage: "https://placekitten.com/700/426",
        thumbnail: "https://placekitten.com/700/426",
        duration: "5h 45m",
        lessonsCount: 14,
        progress: 0,
        author: {
          id: "author-24",
          name: "Prof. James Wilson",
          avatar: "https://placekitten.com/300/328",
        },
        tags: ["conversation", "fluency", "language"],
        level: "intermediate",
        domain: "language",
      },
    ],
    advanced: [
      {
        id: "lang-a-1",
        title: "Advanced Grammar & Composition",
        description: "Master complex grammatical structures and improve writing skills.",
        coverImage: "https://placekitten.com/700/427",
        thumbnail: "https://placekitten.com/700/427",
        duration: "6h 15m",
        lessonsCount: 15,
        progress: 0,
        author: {
          id: "author-25",
          name: "Dr. Maria Garcia",
          avatar: "https://placekitten.com/300/329",
        },
        tags: ["grammar", "writing", "language"],
        level: "advanced",
        domain: "language",
      },
    ],
    expert: [
      {
        id: "lang-e-1",
        title: "Literary Analysis & Cultural Context",
        description: "Understanding literature within historical and cultural frameworks.",
        coverImage: "https://placekitten.com/700/428",
        thumbnail: "https://placekitten.com/700/428",
        duration: "8h 30m",
        lessonsCount: 18,
        progress: 0,
        author: {
          id: "author-26",
          name: "Prof. Alex Johnson",
          avatar: "https://placekitten.com/300/330",
        },
        tags: ["literature", "cultural studies", "language"],
        level: "expert",
        domain: "language",
      },
    ],
  },
  history: {
    beginner: [
      {
        id: "hist-b-1",
        title: "Introduction to World History",
        description: "Survey of major civilizations and historical developments.",
        coverImage: "https://placekitten.com/700/429",
        thumbnail: "https://placekitten.com/700/429",
        duration: "4h 45m",
        lessonsCount: 12,
        progress: 0,
        author: {
          id: "author-27",
          name: "Dr. Robert Taylor",
          avatar: "https://placekitten.com/300/331",
        },
        tags: ["world history", "civilizations", "beginner"],
        level: "beginner",
        domain: "history",
      },
    ],
    intermediate: [
      {
        id: "hist-i-1",
        title: "Medieval & Renaissance Europe",
        description: "Explore European history from the fall of Rome to the Renaissance.",
        coverImage: "https://placekitten.com/700/430",
        thumbnail: "https://placekitten.com/700/430",
        duration: "6h 30m",
        lessonsCount: 15,
        progress: 0,
        author: {
          id: "author-28",
          name: "Prof. Emily Rodriguez",
          avatar: "https://placekitten.com/300/332",
        },
        tags: ["medieval", "renaissance", "history"],
        level: "intermediate",
        domain: "history",
      },
    ],
    advanced: [
      {
        id: "hist-a-1",
        title: "Historical Research Methods",
        description: "Techniques for analyzing primary sources and historiography.",
        coverImage: "https://placekitten.com/700/431",
        thumbnail: "https://placekitten.com/700/431",
        duration: "5h 15m",
        lessonsCount: 14,
        progress: 0,
        author: {
          id: "author-29",
          name: "Dr. David Kim",
          avatar: "https://placekitten.com/300/333",
        },
        tags: ["historical methods", "research", "history"],
        level: "advanced",
        domain: "history",
      },
    ],
    expert: [
      {
        id: "hist-e-1",
        title: "Comparative Historical Analysis",
        description: "Advanced approaches to comparing historical developments across societies.",
        coverImage: "https://placekitten.com/700/432",
        thumbnail: "https://placekitten.com/700/432",
        duration: "7h 45m",
        lessonsCount: 16,
        progress: 0,
        author: {
          id: "author-30",
          name: "Prof. Lisa Wang",
          avatar: "https://placekitten.com/300/334",
        },
        tags: ["comparative history", "historiography", "history"],
        level: "expert",
        domain: "history",
      },
    ],
  },
  art: {
    beginner: [
      {
        id: "art-b-1",
        title: "Fundamentals of Drawing",
        description: "Learn basic drawing techniques and principles of visual art.",
        coverImage: "https://placekitten.com/700/433",
        thumbnail: "https://placekitten.com/700/433",
        duration: "5h 30m",
        lessonsCount: 12,
        progress: 0,
        author: {
          id: "author-31",
          name: "Sarah Johnson",
          avatar: "https://placekitten.com/300/335",
        },
        tags: ["drawing", "visual arts", "beginner"],
        level: "beginner",
        domain: "art",
      },
    ],
    intermediate: [
      {
        id: "art-i-1",
        title: "Color Theory & Composition",
        description: "Understanding color relationships and principles of visual composition.",
        coverImage: "https://placekitten.com/700/434",
        thumbnail: "https://placekitten.com/700/434",
        duration: "6h 15m",
        lessonsCount: 14,
        progress: 0,
        author: {
          id: "author-32",
          name: "Michael Chen",
          avatar: "https://placekitten.com/300/336",
        },
        tags: ["color theory", "composition", "art"],
        level: "intermediate",
        domain: "art",
      },
    ],
    advanced: [
      {
        id: "art-a-1",
        title: "Digital Painting Techniques",
        description: "Advanced approaches to creating digital artwork with professional tools.",
        coverImage: "https://placekitten.com/700/435",
        thumbnail: "https://placekitten.com/700/435",
        duration: "7h 45m",
        lessonsCount: 18,
        progress: 0,
        author: {
          id: "author-33",
          name: "Dr. Emily Rodriguez",
          avatar: "https://placekitten.com/300/337",
        },
        tags: ["digital painting", "digital art", "art"],
        level: "advanced",
        domain: "art",
      },
    ],
    expert: [
      {
        id: "art-e-1",
        title: "Contemporary Art Analysis",
        description: "Critical approaches to understanding and creating contemporary artwork.",
        coverImage: "https://placekitten.com/700/436",
        thumbnail: "https://placekitten.com/700/436",
        duration: "8h 30m",
        lessonsCount: 20,
        progress: 0,
        author: {
          id: "author-34",
          name: "Prof. James Wilson",
          avatar: "https://placekitten.com/300/338",
        },
        tags: ["contemporary art", "art theory", "art"],
        level: "expert",
        domain: "art",
      },
    ],
  },
  general: {
    beginner: [
      {
        id: "gen-b-1",
        title: "Effective Learning Strategies",
        description: "Scientifically-proven techniques to improve learning and retention.",
        coverImage: "https://placekitten.com/700/437",
        thumbnail: "https://placekitten.com/700/437",
        duration: "3h 15m",
        lessonsCount: 8,
        progress: 0,
        author: {
          id: "author-35",
          name: "Dr. Maria Garcia",
          avatar: "https://placekitten.com/300/339",
        },
        tags: ["learning", "study skills", "education"],
        level: "beginner",
        domain: "general",
      },
    ],
    intermediate: [
      {
        id: "gen-i-1",
        title: "Critical Thinking & Logic",
        description: "Improve reasoning skills and identify logical fallacies.",
        coverImage: "https://placekitten.com/700/438",
        thumbnail: "https://placekitten.com/700/438",
        duration: "5h 45m",
        lessonsCount: 12,
        progress: 0,
        author: {
          id: "author-36",
          name: "Prof. Robert Taylor",
          avatar: "https://placekitten.com/300/340",
        },
        tags: ["critical thinking", "logic", "reasoning"],
        level: "intermediate",
        domain: "general",
      },
    ],
    advanced: [
      {
        id: "gen-a-1",
        title: "Creative Problem Solving",
        description: "Advanced techniques for tackling complex problems across disciplines.",
        coverImage: "https://placekitten.com/700/439",
        thumbnail: "https://placekitten.com/700/439",
        duration: "6h 30m",
        lessonsCount: 15,
        progress: 0,
        author: {
          id: "author-37",
          name: "Dr. David Kim",
          avatar: "https://placekitten.com/300/341",
        },
        tags: ["problem solving", "creativity", "innovation"],
        level: "advanced",
        domain: "general",
      },
    ],
    expert: [
      {
        id: "gen-e-1",
        title: "Interdisciplinary Research Methods",
        description: "Approaches to combining knowledge across different fields of study.",
        coverImage: "https://placekitten.com/700/440",
        thumbnail: "https://placekitten.com/700/440",
        duration: "8h 15m",
        lessonsCount: 18,
        progress: 0,
        author: {
          id: "author-38",
          name: "Prof. Lisa Wang",
          avatar: "https://placekitten.com/300/342",
        },
        tags: ["interdisciplinary", "research", "methodology"],
        level: "expert",
        domain: "general",
      },
    ],
  },
};

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
        const mockEnrolled = mockCoursesData.slice(0, 2).map(course => ({
          ...course,
          progress: Math.floor(Math.random() * 80) + 20, // Random progress between 20-100
          enrollmentDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(), // Random date in last 30 days
          thumbnail: course.coverImage // Use coverImage as thumbnail
        }));
        
        enrolledCourses = mockEnrolled;
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
  
  // Get featured courses for the enhanced learn screen
  async getFeaturedCourses(): Promise<Course[]> {
    try {
      let featuredCourses: Course[] = [];
      
      if (ENV.USE_BACKEND_API) {
        try {
          // TODO: Replace with real API call when available
          featuredCourses = await apiService.getFeaturedCourses();
          
          await AsyncStorage.setItem(
            ENHANCED_CACHE_KEYS.FEATURED_COURSES,
            JSON.stringify({
              data: featuredCourses,
              timestamp: Date.now(),
            })
          );
        } catch (apiError) {
          console.warn("API fetch failed, trying cache:", apiError);
          
          const cachedData = await AsyncStorage.getItem(ENHANCED_CACHE_KEYS.FEATURED_COURSES);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            
            if (Date.now() - timestamp < CACHE_EXPIRY) {
              featuredCourses = data;
            } else {
              throw apiError;
            }
          } else {
            throw apiError;
          }
        }
      } else {
        // Use mock data
        featuredCourses = mockFeaturedCourses;
      }
      
      return featuredCourses;
    } catch (error: any) {
      console.warn("Error fetching featured courses, using fallback data:", error);
      // Return mock data as fallback
      return mockFeaturedCourses;
    }
  },
  
  // Get course categories for the enhanced learn screen
  async getCourseCategories(): Promise<Category[]> {
    try {
      let categories: Category[] = [];
      
      if (ENV.USE_BACKEND_API) {
        try {
          // TODO: Replace with real API call when available
          categories = await apiService.getCourseCategories();
          
          await AsyncStorage.setItem(
            ENHANCED_CACHE_KEYS.COURSE_CATEGORIES,
            JSON.stringify({
              data: categories,
              timestamp: Date.now(),
            })
          );
        } catch (apiError) {
          console.warn("API fetch failed, trying cache:", apiError);
          
          const cachedData = await AsyncStorage.getItem(ENHANCED_CACHE_KEYS.COURSE_CATEGORIES);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            
            if (Date.now() - timestamp < CACHE_EXPIRY) {
              categories = data;
            } else {
              throw apiError;
            }
          } else {
            throw apiError;
          }
        }
      } else {
        // Use mock data
        categories = mockCategories;
      }
      
      return categories;
    } catch (error: any) {
      console.warn("Error fetching course categories, using fallback data:", error);
      // Return mock data as fallback
      return mockCategories;
    }
  },
  
  // Get courses by domain and difficulty level for adaptive learning
  async getCoursesByDomainAndLevel(domain: LearningDomain, level: DifficultyLevel): Promise<Course[]> {
    try {
      let courses: Course[] = [];
      
      if (ENV.USE_BACKEND_API) {
        try {
          // TODO: Replace with real API call when available
          courses = await apiService.getCoursesByDomainAndLevel(domain, level);
          
          await AsyncStorage.setItem(
            `${ENHANCED_CACHE_KEYS.DOMAIN_COURSES}${domain}_${level}`,
            JSON.stringify({
              data: courses,
              timestamp: Date.now(),
            })
          );
        } catch (apiError) {
          console.warn("API fetch failed, trying cache:", apiError);
          
          const cachedData = await AsyncStorage.getItem(`${ENHANCED_CACHE_KEYS.DOMAIN_COURSES}${domain}_${level}`);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            
            if (Date.now() - timestamp < CACHE_EXPIRY) {
              courses = data;
            } else {
              throw apiError;
            }
          } else {
            throw apiError;
          }
        }
      } else {
        // Use mock data
        courses = mockDomainCourses[domain][level] || [];
      }
      
      return courses;
    } catch (error: any) {
      console.warn(`Error fetching courses for domain ${domain} at level ${level}, using fallback data:`, error);
      // Return mock data as fallback
      return mockDomainCourses[domain][level] || [];
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