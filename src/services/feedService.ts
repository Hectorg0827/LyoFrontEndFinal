import { api } from './api';

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  createdAt: string;
  expiresAt: string;
  viewed: boolean;
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  tags: string[];
  liked: boolean;
  saved: boolean;
}

export interface FeedResponse {
  posts: FeedPost[];
  nextCursor?: string;
}

export interface StoriesResponse {
  stories: Story[];
}

// Feed service for home screen content
export const feedService = {
  // Get feed posts with pagination
  async getFeed(cursor?: string, limit: number = 10): Promise<FeedResponse> {
    return api.get<FeedResponse>('/feed', { cursor, limit });
  },
  
  // Get stories for the story orbs
  async getStories(): Promise<StoriesResponse> {
    return api.get<StoriesResponse>('/stories');
  },
  
  // Like a post
  async likePost(postId: string): Promise<void> {
    return api.post(`/posts/${postId}/like`);
  },
  
  // Unlike a post
  async unlikePost(postId: string): Promise<void> {
    return api.delete(`/posts/${postId}/like`);
  },
  
  // Save a post to bookshelf
  async savePost(postId: string): Promise<void> {
    return api.post(`/posts/${postId}/save`);
  },
  
  // Unsave a post
  async unsavePost(postId: string): Promise<void> {
    return api.delete(`/posts/${postId}/save`);
  },
  
  // Mark a story as viewed
  async markStoryViewed(storyId: string): Promise<void> {
    return api.post(`/stories/${storyId}/view`);
  }
};
