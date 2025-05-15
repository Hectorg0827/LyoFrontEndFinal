import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPENAI_API_KEY } from '@env';

// Types for service responses
export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  resources: string[];
  completed: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  progress: number;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lyo';
  timestamp: Date;
}

// User preferences interface
export interface UserPreferences {
  voiceEnabled: boolean;
  animationsEnabled: boolean;
  avatarColor: string;
  voiceRate: number;
  voicePitch: number;
  learningInterests: string[];
  courseHistory: string[];
}

// Storage keys
const STORAGE_KEYS = {
  PREFERENCES: 'lyo_user_preferences',
  COURSE_HISTORY: 'lyo_course_history',
  CHAT_HISTORY: 'lyo_chat_history',
};

// Mock API endpoints - in a real app, these would connect to a backend
const API_ENDPOINTS = {
  generateResponse: '/api/avatar/chat',
  generateCourse: '/api/avatar/course',
  getSuggestions: '/api/avatar/suggestions',
  transcribeAudio: '/api/avatar/transcribe',
};

// OpenAI API configuration
const AI_CONFIG = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o',
  systemPrompt: 'You are Lyo, an AI learning assistant designed to help users discover educational content and create personalized learning paths. Be concise, helpful, and educational in your responses.',
};

/**
 * Service for handling avatar-related AI operations
 */
class AvatarService {
  // Default user preferences
  private defaultPreferences: UserPreferences = {
    voiceEnabled: true,
    animationsEnabled: true,
    avatarColor: '#8E54E9',
    voiceRate: 1.0,
    voicePitch: 1.0,
    learningInterests: [],
    courseHistory: [],
  };

  /**
   * Generate a response from the AI avatar using OpenAI API
   * @param message The user's message
   * @returns A promise that resolves to the AI's response
   */
  async generateResponse(message: string): Promise<string> {
    try {
      // First try to use real OpenAI API if key is available
      if (OPENAI_API_KEY) {
        return await this.callOpenAI(message);
      }
      
      // Fall back to mock response if no API key
      await this.simulateNetworkDelay();
      return this.mockResponseGeneration(message);
    } catch (error) {
      console.error('Error generating avatar response:', error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  }

  /**
   * Call OpenAI API to generate a response
   * @param userMessage The user's message
   * @returns The AI-generated response
   */
  private async callOpenAI(userMessage: string): Promise<string> {
    try {
      const response = await fetch(AI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [
            { role: 'system', content: AI_CONFIG.systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 250,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  /**
   * Generate a personalized course based on a topic and difficulty using AI
   * @param topic The course topic
   * @param difficulty The course difficulty level
   * @returns A promise that resolves to a Course object
   */
  async generateCourse(
    topic: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<Course> {
    try {
      // Try to use OpenAI for sophisticated course generation
      if (OPENAI_API_KEY) {
        const prompt = `Create a detailed ${difficulty} level course on "${topic}" with 4-6 modules. 
        Each module should have a title, description, duration, and list of resources.`;
        
        const aiResponse = await this.callOpenAI(prompt);
        
        // In a real implementation, parse the AI response into a structured course
        // For now, we'll fall back to the mock implementation
        console.log('AI course generation response:', aiResponse);
      }
      
      // Use mock implementation for now
      await this.simulateNetworkDelay(2000);
      
      const course = {
        id: Date.now().toString(),
        title: `${topic} Fundamentals`,
        description: `A comprehensive course on ${topic} designed for ${difficulty} learners. This course covers essential concepts and practical applications.`,
        level: difficulty,
        duration: difficulty === 'beginner' ? '4 weeks' : difficulty === 'intermediate' ? '6 weeks' : '8 weeks',
        progress: 0,
        modules: [
          {
            id: '1',
            title: `Introduction to ${topic}`,
            description: `Learn the basic concepts and principles of ${topic}.`,
            duration: '1 week',
            resources: ['Video lectures', 'Interactive quizzes', 'Reading materials'],
            completed: false,
          },
          {
            id: '2',
            title: `${topic} Theory and Concepts`,
            description: 'Dive deeper into theoretical frameworks and core concepts.',
            duration: '1 week',
            resources: ['Video lectures', 'Case studies', 'Discussion forums'],
            completed: false,
          },
          {
            id: '3',
            title: `Practical ${topic} Applications`,
            description: 'Apply your knowledge to real-world scenarios and problems.',
            duration: '1 week',
            resources: ['Project work', 'Labs', 'Peer review sessions'],
            completed: false,
          },
          {
            id: '4',
            title: `Advanced ${topic} Topics`,
            description: 'Explore cutting-edge developments and specialized areas.',
            duration: '1 week',
            resources: ['Expert interviews', 'Research papers', 'Final project'],
            completed: false,
          },
        ],
      };
      
      // Save to course history
      await this.addToCourseHistory(topic);
      
      return course;
    } catch (error) {
      console.error('Error generating course:', error);
      throw new Error('Failed to generate course. Please try again later.');
    }
  }

  /**
   * Get learning suggestions based on user interests or history using AI
   * @param interests Array of user interests
   * @returns A promise that resolves to an array of learning suggestions
   */
  async getLearningRecommendations(interests: string[] = []): Promise<string[]> {
    try {
      const userPrefs = await this.getUserPreferences();
      const userInterests = userPrefs?.learningInterests || interests;
      const courseHistory = userPrefs?.courseHistory || [];
      
      // If we have an OpenAI key, get personalized recommendations
      if (OPENAI_API_KEY) {
        const prompt = `Based on these interests: ${userInterests.join(', ')} 
        and past courses: ${courseHistory.join(', ')}, 
        suggest 5 learning topics that would be valuable for me to explore next. 
        Just list the topics as a comma-separated list without explanation.`;
        
        const aiResponse = await this.callOpenAI(prompt);
        
        // Parse the response (assuming it's a comma-separated list)
        return aiResponse.split(',').map(item => item.trim());
      }
      
      // Fall back to mock recommendations
      await this.simulateNetworkDelay();
      
      // For demonstration, return fixed recommendations plus topic-based ones
      const baseRecommendations = [
        'Quantum Physics for Beginners',
        'Introduction to Machine Learning',
        'World History: Ancient Civilizations',
      ];
      
      // Add interest-based recommendations
      const interestRecommendations = userInterests.map(interest => 
        `${interest} Masterclass`
      );
      
      return [...baseRecommendations, ...interestRecommendations];
    } catch (error) {
      console.error('Error getting learning recommendations:', error);
      return ['Quantum Physics', 'Machine Learning', 'History'];
    }
  }

  /**
   * Start voice recognition
   * In a real implementation, this would connect to a speech-to-text API
   * @returns A promise that resolves to the recognized text
   */
  async startVoiceRecognition(): Promise<string> {
    // In a real app, this would activate the microphone and start listening
    await this.simulateNetworkDelay(2000);
    
    // Return some simulated recognized text
    const sampleTexts = [
      "I want to learn about quantum physics",
      "Can you recommend some history courses?",
      "Help me create a course on machine learning",
      "What are the latest topics in biology?",
      "I'd like to improve my writing skills"
    ];
    
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  }

  /**
   * Stop voice recognition
   */
  stopVoiceRecognition(): void {
    // In a real app, this would stop the microphone and cancel listening
    console.log('Voice recognition stopped');
  }

  /**
   * Save user preferences to persistent storage
   * @param preferences The user preferences to save
   */
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user preferences from persistent storage
   * @returns A promise that resolves to the user preferences or null if not found
   */
  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const prefsString = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!prefsString) {
        return this.defaultPreferences;
      }
      
      return JSON.parse(prefsString) as UserPreferences;
    } catch (error) {
      console.error('Error retrieving user preferences:', error);
      return this.defaultPreferences;
    }
  }

  /**
   * Add a course topic to the user's course history
   * @param topic The course topic to add
   */
  private async addToCourseHistory(topic: string): Promise<void> {
    try {
      const prefs = await this.getUserPreferences();
      if (!prefs) {
        return;
      }
      
      // Add to course history if not already present
      if (!prefs.courseHistory.includes(topic)) {
        prefs.courseHistory.push(topic);
        
        // Keep only the most recent 10 courses
        if (prefs.courseHistory.length > 10) {
          prefs.courseHistory = prefs.courseHistory.slice(-10);
        }
        
        await this.saveUserPreferences(prefs);
      }
    } catch (error) {
      console.error('Error updating course history:', error);
    }
  }

  /**
   * Add a learning interest to the user's interests
   * @param interest The interest to add
   */
  async addLearningInterest(interest: string): Promise<void> {
    try {
      const prefs = await this.getUserPreferences();
      if (!prefs) {
        return;
      }
      
      // Add to interests if not already present
      if (!prefs.learningInterests.includes(interest)) {
        prefs.learningInterests.push(interest);
        await this.saveUserPreferences(prefs);
      }
    } catch (error) {
      console.error('Error updating learning interests:', error);
    }
  }

  /**
   * Remove a learning interest from the user's interests
   * @param interest The interest to remove
   */
  async removeLearningInterest(interest: string): Promise<void> {
    try {
      const prefs = await this.getUserPreferences();
      if (!prefs) {
        return;
      }
      
      // Remove from interests
      prefs.learningInterests = prefs.learningInterests.filter(i => i !== interest);
      await this.saveUserPreferences(prefs);
    } catch (error) {
      console.error('Error removing learning interest:', error);
    }
  }

  // Helper methods for mocking API responses

  private async simulateNetworkDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private mockResponseGeneration(message: string): string {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
      return "Hello! I'm Lyo, your learning assistant. How can I help you today?";
    } else if (lowercaseMessage.includes('course') || lowercaseMessage.includes('learn')) {
      return "I'd be happy to help you create a personalized learning course! What topic are you interested in?";
    } else if (lowercaseMessage.includes('help')) {
      return "I'm here to help with your learning journey. I can suggest courses, create personalized learning paths, or answer questions about any subject. What would you like to focus on?";
    } else if (lowercaseMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else if (lowercaseMessage.includes('physics') || lowercaseMessage.includes('science')) {
      return "Physics is fascinating! Would you like me to create a customized physics course for you? I can focus on mechanics, quantum physics, relativity, or a general overview.";
    } else {
      return "That's interesting! Would you like me to create a learning pathway related to that topic?";
    }
  }
}

export const avatarService = new AvatarService();
