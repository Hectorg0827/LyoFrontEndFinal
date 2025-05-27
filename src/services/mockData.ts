/**
 * Mock data for development without backend connection
 * This file provides mock data for API endpoints when working offline
 * or when the backend is not available.
 */

import { AuthResponse } from "./api";
import { Course, Lesson, LearningTool } from "./learnService";
import { FeedPost, Story } from "./feedService";
import { 
  UserProfile, 
  UserStats, 
  Achievement, 
  Notification, 
  BookshelfItem 
} from "./userService";
import { Event, Community, Post } from "./communityService";
import { NotificationCategory } from "./notificationService";

// Authentication mock responses
export const mockAuthResponses = {
  login: (email: string, password: string): AuthResponse => {
    return {
      token: "mock-auth-token-for-development-only",
      user: {
        id: "user-1",
        name: email.split("@")[0],
        email: email,
        avatar: "https://placekitten.com/300/300",
      },
    };
  },
  
  register: (name: string, email: string, password: string): AuthResponse => {
    return {
      token: "mock-auth-token-for-development-only",
      user: {
        id: "user-1",
        name: name,
        email: email,
        avatar: "https://placekitten.com/300/300",
      },
    };
  },
};

// Feed mock data
export const mockFeedData: FeedPost[] = [
  {
    id: "post-1",
    userId: "user-2",
    userName: "Jane Smith",
    userAvatar: "https://placekitten.com/300/301",
    content: "Just completed an amazing course on AI! #learning #technology",
    imageUrl: "https://placekitten.com/600/400",
    likes: 25,
    comments: 5,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    tags: ["learning", "technology"],
    liked: false,
    saved: false,
  },
  {
    id: "post-2",
    userId: "user-3",
    userName: "Michael Johnson",
    userAvatar: "https://placekitten.com/300/302",
    content: "Check out my notes from today's lecture! #learning #physics",
    imageUrl: "https://placekitten.com/600/401",
    likes: 42,
    comments: 8,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    tags: ["learning", "physics"],
    liked: true,
    saved: false,
  },
  {
    id: "post-3",
    userId: "user-4",
    userName: "Sarah Williams",
    userAvatar: "https://placekitten.com/300/303",
    content: "Started a new course on quantum computing! This is going to be challenging but exciting. #quantumcomputing #science",
    videoUrl: "https://example.com/video.mp4",
    likes: 67,
    comments: 13,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ["quantumcomputing", "science"],
    liked: false,
    saved: true,
  },
];

// Stories mock data
export const mockStoriesData: Story[] = [
  {
    id: "story-1",
    userId: "user-2",
    userName: "Jane Smith",
    userAvatar: "https://placekitten.com/300/301",
    imageUrl: "https://placekitten.com/500/800",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    viewed: false,
  },
  {
    id: "story-2",
    userId: "user-3",
    userName: "Michael Johnson",
    userAvatar: "https://placekitten.com/300/302",
    imageUrl: "https://placekitten.com/500/801",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    viewed: true,
  },
  {
    id: "story-3",
    userId: "user-4",
    userName: "Sarah Williams",
    userAvatar: "https://placekitten.com/300/303",
    imageUrl: "https://placekitten.com/500/802",
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    viewed: false,
  },
  {
    id: "story-4",
    userId: "user-5",
    userName: "David Brown",
    userAvatar: "https://placekitten.com/300/304",
    imageUrl: "https://placekitten.com/500/803",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    viewed: false,
  },
];

// Courses mock data
export const mockCoursesData: Course[] = [
  {
    id: "course-1",
    title: "Introduction to Artificial Intelligence",
    description: "Learn the fundamentals of AI, including search algorithms, knowledge representation, and machine learning.",
    coverImage: "https://placekitten.com/700/400",
    duration: "4h 30m",
    lessonsCount: 12,
    progress: 25,
    author: {
      id: "author-1",
      name: "Prof. Alex Johnson",
      avatar: "https://placekitten.com/300/305",
    },
    tags: ["ai", "beginner", "computer science"],
    level: "beginner",
  },
  {
    id: "course-2",
    title: "Advanced Data Structures",
    description: "Explore complex data structures like balanced trees, graphs, and hash tables for efficient algorithm design.",
    coverImage: "https://placekitten.com/700/401",
    duration: "6h 15m",
    lessonsCount: 15,
    progress: 80,
    author: {
      id: "author-2",
      name: "Dr. Maria Garcia",
      avatar: "https://placekitten.com/300/306",
    },
    tags: ["algorithms", "data structures", "computer science"],
    level: "intermediate",
  },
  {
    id: "course-3",
    title: "Quantum Computing Foundations",
    description: "Understand the principles of quantum mechanics that power quantum computing, including superposition and entanglement.",
    coverImage: "https://placekitten.com/700/402",
    duration: "8h 45m",
    lessonsCount: 20,
    progress: 0,
    author: {
      id: "author-3",
      name: "Dr. James Wilson",
      avatar: "https://placekitten.com/300/307",
    },
    tags: ["quantum", "physics", "computing"],
    level: "advanced",
  },
];

// Lessons mock data
export const mockLessonsData: Record<string, Lesson[]> = {
  "course-1": [
    {
      id: "lesson-1-1",
      courseId: "course-1",
      title: "Introduction to AI Concepts",
      description: "Overview of AI history, applications, and fundamental concepts.",
      duration: "20m",
      videoUrl: "https://example.com/videos/intro-ai.mp4",
      completed: true,
      order: 1,
    },
    {
      id: "lesson-1-2",
      courseId: "course-1",
      title: "Search Algorithms",
      description: "Exploring breadth-first, depth-first, and heuristic search strategies.",
      duration: "35m",
      videoUrl: "https://example.com/videos/search-algorithms.mp4",
      completed: true,
      order: 2,
    },
    {
      id: "lesson-1-3",
      courseId: "course-1",
      title: "Knowledge Representation",
      description: "Methods for representing knowledge in AI systems.",
      duration: "25m",
      videoUrl: "https://example.com/videos/knowledge-representation.mp4",
      completed: false,
      order: 3,
    },
  ],
  "course-2": [
    {
      id: "lesson-2-1",
      courseId: "course-2",
      title: "Review of Basic Data Structures",
      description: "Quick review of arrays, linked lists, stacks, and queues.",
      duration: "30m",
      videoUrl: "https://example.com/videos/basic-data-structures.mp4",
      completed: true,
      order: 1,
    },
    {
      id: "lesson-2-2",
      courseId: "course-2",
      title: "Trees and Binary Search Trees",
      description: "Understanding tree structures and their applications.",
      duration: "45m",
      videoUrl: "https://example.com/videos/trees.mp4",
      completed: true,
      order: 2,
    },
    {
      id: "lesson-2-3",
      courseId: "course-2",
      title: "Balanced Trees: AVL and Red-Black Trees",
      description: "Self-balancing tree structures for optimized operations.",
      duration: "50m",
      videoUrl: "https://example.com/videos/balanced-trees.mp4",
      completed: true,
      order: 3,
    },
  ],
};

// Learning tools mock data
export const mockLearningToolsData: LearningTool[] = [
  {
    id: "tool-1",
    name: "AI Code Assistant",
    description: "Get help with coding problems using AI-powered suggestions.",
    iconUrl: "https://placekitten.com/100/100",
    url: "https://example.com/tools/code-assistant",
  },
  {
    id: "tool-2",
    name: "Math Solver",
    description: "Step-by-step solutions for complex mathematical problems.",
    iconUrl: "https://placekitten.com/100/101",
    url: "https://example.com/tools/math-solver",
  },
  {
    id: "tool-3",
    name: "Study Planner",
    description: "Create personalized study schedules based on your learning goals.",
    iconUrl: "https://placekitten.com/100/102",
    url: "https://example.com/tools/study-planner",
  },
];

// Avatar AI mock responses
export const mockAvatarResponses = {
  chat: (message: string) => {
    const greetings = ["hello", "hi", "hey", "greetings"];
    const questions = ["how", "what", "why", "when", "where", "which", "who"];
    
    const lowerMessage = message.toLowerCase();
    
    // Check for greeting
    if (greetings.some(greeting => lowerMessage.includes(greeting))) {
      return {
        text: "Hello! I'm your AI learning assistant. How can I help you today?",
        timestamp: Date.now() / 1000,
        detected_topics: [],
        moderated: false,
      };
    }
    
    // Check for question
    if (questions.some(q => lowerMessage.includes(q))) {
      if (lowerMessage.includes("course") || lowerMessage.includes("learn")) {
        return {
          text: "I can help you find courses on any topic you're interested in. We have courses ranging from beginner to advanced levels in subjects like AI, programming, data science, and more.",
          timestamp: Date.now() / 1000,
          detected_topics: ["courses", "learning"],
          suggest_advanced_content: true,
        };
      }
      
      if (lowerMessage.includes("ai") || lowerMessage.includes("artificial intelligence")) {
        return {
          text: "Artificial Intelligence is a field of computer science focused on creating systems that can perform tasks requiring human intelligence. It includes machine learning, neural networks, natural language processing, and more. Would you like me to recommend some AI courses?",
          timestamp: Date.now() / 1000,
          detected_topics: ["ai", "machine learning"],
          suggest_advanced_content: true,
        };
      }
    }
    
    // Default response
    return {
      text: "I'm here to help with your learning journey. You can ask me questions about courses, get explanations on topics, or request learning resources.",
      timestamp: Date.now() / 1000,
      detected_topics: [],
      moderated: false,
    };
  }
};

// Mock user profile data
export const mockUserProfileData: UserProfile = {
  id: "user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  bio: "Learning enthusiast and tech lover",
  avatar: "https://placekitten.com/300/300",
  location: "San Francisco, CA",
  website: "https://johndoe.dev",
  joinDate: "2023-01-15T00:00:00Z",
  followers: 128,
  following: 85,
  achievements: [
    {
      id: "achievement-1",
      title: "Early Adopter",
      description: "One of the first 1,000 users to join the platform",
      iconUrl: "https://placekitten.com/50/50",
      unlockedAt: "2023-01-16T00:00:00Z",
    },
    {
      id: "achievement-2",
      title: "Course Completer",
      description: "Completed your first course",
      iconUrl: "https://placekitten.com/50/51",
      unlockedAt: "2023-02-05T00:00:00Z",
    },
    {
      id: "achievement-3",
      title: "Social Butterfly",
      description: "Connected with 10 other learners",
      iconUrl: "https://placekitten.com/50/52",
      unlockedAt: "2023-02-28T00:00:00Z",
    },
    {
      id: "achievement-4",
      title: "Streak Master",
      description: "Maintained a 7-day learning streak",
      iconUrl: "https://placekitten.com/50/53",
      progress: 85,
    },
  ],
  stats: {
    coursesCompleted: 2,
    lessonsCompleted: 28,
    eventsAttended: 3,
    postsCreated: 12,
    daysStreak: 6,
    minutesLearned: 1840,
    xpLevel: 4,
    currentXp: 2750,
    nextLevelXp: 3000,
  }
};

// Mock notifications data
export const mockNotificationsData: Notification[] = [
  {
    id: "notif-1",
    type: "like",
    message: "Jane Smith liked your post about quantum computing",
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    data: { postId: "post-3", userId: "user-2" },
  },
  {
    id: "notif-2",
    type: "comment",
    message: "Michael Johnson commented on your post",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    data: { postId: "post-1", userId: "user-3", commentId: "comment-1" },
  },
  {
    id: "notif-3",
    type: "follow",
    message: "Sarah Williams started following you",
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    data: { userId: "user-4" },
  },
  {
    id: "notif-4",
    type: "achievement",
    message: "You unlocked the 'Course Completer' achievement!",
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    data: { achievementId: "achievement-2" },
  },
  {
    id: "notif-5",
    type: "course",
    message: "New course available: 'Quantum Computing Foundations'",
    read: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    data: { courseId: "course-3" },
  },
];

// Mock bookshelf data
export const mockBookshelfData: BookshelfItem[] = [
  {
    id: "bookmark-1",
    title: "Advanced Data Structures",
    type: "course",
    imageUrl: "https://placekitten.com/700/401",
    createdAt: "2023-05-15T00:00:00Z",
    savedAt: new Date(Date.now() - 604800000).toISOString(),
    data: { courseId: "course-2" },
  },
  {
    id: "bookmark-2",
    title: "Started a new course on quantum computing!",
    type: "post",
    imageUrl: "https://placekitten.com/600/401",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    savedAt: new Date(Date.now() - 82800000).toISOString(),
    data: { postId: "post-3" },
  },
  {
    id: "bookmark-3",
    title: "AI Meetup - Summer Edition",
    type: "event",
    imageUrl: "https://placekitten.com/800/500",
    createdAt: "2023-06-10T00:00:00Z",
    savedAt: new Date(Date.now() - 259200000).toISOString(),
    data: { eventId: "event-1" },
  },
];

// Mock community data
export const mockEventsData: Event[] = [
  {
    id: "event-1",
    title: "AI Meetup - Summer Edition",
    description: "Join us for an exciting discussion about the latest developments in AI technology, with guest speakers from leading tech companies.",
    imageUrl: "https://placekitten.com/800/500",
    location: {
      name: "Tech Hub",
      address: "123 Innovation Street, San Francisco, CA",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    startDate: new Date(Date.now() + 604800000).toISOString(), // One week from now
    endDate: new Date(Date.now() + 615600000).toISOString(), // One week + 3 hours from now
    attendees: 42,
    isAttending: false,
  },
  {
    id: "event-2",
    title: "Data Science Workshop",
    description: "Hands-on workshop covering data visualization, machine learning basics, and practical applications.",
    imageUrl: "https://placekitten.com/800/501",
    location: {
      name: "Community College",
      address: "456 Learning Avenue, San Francisco, CA",
      latitude: 37.7833,
      longitude: -122.4167,
    },
    startDate: new Date(Date.now() + 1209600000).toISOString(), // Two weeks from now
    endDate: new Date(Date.now() + 1224000000).toISOString(), // Two weeks + 4 hours from now
    attendees: 28,
    isAttending: true,
  },
  {
    id: "event-3",
    title: "Virtual Reality in Education",
    description: "Explore how VR is transforming education and learn about the latest tools and platforms.",
    imageUrl: "https://placekitten.com/800/502",
    location: {
      name: "Digital Learning Center",
      address: "789 Technology Boulevard, San Francisco, CA",
      latitude: 37.7691,
      longitude: -122.4449,
    },
    startDate: new Date(Date.now() + 1814400000).toISOString(), // Three weeks from now
    endDate: new Date(Date.now() + 1828800000).toISOString(), // Three weeks + 4 hours from now
    attendees: 35,
    isAttending: false,
  },
];

export const mockCommunitiesData: Community[] = [
  {
    id: "community-1",
    name: "AI Enthusiasts",
    description: "A community for anyone interested in artificial intelligence, machine learning, and neural networks.",
    memberCount: 1250,
    imageUrl: "https://placekitten.com/400/400",
    isJoined: true,
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },
  {
    id: "community-2",
    name: "Data Science Hub",
    description: "Connect with data scientists, analysts, and enthusiasts to discuss techniques, tools, and job opportunities.",
    memberCount: 875,
    imageUrl: "https://placekitten.com/400/401",
    isJoined: false,
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
    },
  },
  {
    id: "community-3",
    name: "Quantum Computing Research",
    description: "Exploring the fascinating world of quantum computing, from theoretical foundations to practical applications.",
    memberCount: 430,
    imageUrl: "https://placekitten.com/400/402",
    isJoined: true,
    location: {
      latitude: 37.7691,
      longitude: -122.4449,
    },
  },
];

export const mockCommunityPostsData: Record<string, Post[]> = {
  "community-1": [
    {
      id: "comm-post-1-1",
      communityId: "community-1",
      userId: "user-2",
      userName: "Jane Smith",
      userAvatar: "https://placekitten.com/300/301",
      content: "Has anyone tried the new GPT-4 API? The improvements in understanding context are impressive!",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      likes: 15,
      comments: 7,
    },
    {
      id: "comm-post-1-2",
      communityId: "community-1",
      userId: "user-3",
      userName: "Michael Johnson",
      userAvatar: "https://placekitten.com/300/302",
      content: "I'm organizing a study group for the 'Advanced AI Techniques' course. Anyone interested in joining?",
      imageUrl: "https://placekitten.com/600/402",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      likes: 8,
      comments: 12,
    },
  ],
  "community-2": [
    {
      id: "comm-post-2-1",
      communityId: "community-2",
      userId: "user-4",
      userName: "Sarah Williams",
      userAvatar: "https://placekitten.com/300/303",
      content: "Just published a new Jupyter notebook demonstrating PCA for dimensionality reduction. Check it out!",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      likes: 23,
      comments: 5,
    },
  ],
  "community-3": [
    {
      id: "comm-post-3-1",
      communityId: "community-3",
      userId: "user-5",
      userName: "David Brown",
      userAvatar: "https://placekitten.com/300/304",
      content: "IBM just announced their new 1000-qubit quantum processor. This is a significant milestone!",
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      likes: 42,
      comments: 16,
    },
    {
      id: "comm-post-3-2",
      communityId: "community-3",
      userId: "user-2",
      userName: "Jane Smith",
      userAvatar: "https://placekitten.com/300/301",
      content: "I'm struggling with understanding the quantum entanglement concept. Any recommended resources?",
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      likes: 7,
      comments: 9,
    },
  ],
};