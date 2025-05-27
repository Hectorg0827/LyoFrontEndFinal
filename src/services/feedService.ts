import { AppError, ErrorType } from "../utils/AppError";
import apiService from "./apiService";

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

// Export AppError
export { AppError, ErrorType };

// Feed service for home screen content
export const feedService = {
  // Get feed posts with pagination
  async getFeed(cursor?: string | number): Promise<FeedResponse> {
    // Allow number for pageParam consistency
    try {
      return await apiService.getFeed(cursor ? String(cursor) : undefined);
    } catch (error: any) {
      throw new AppError(ErrorType.Server, "Failed to get feed", error);
    }
  },

  // Get stories for the story orbs
  async getStories(pageParam?: number): Promise<StoriesResponse> {
    // Added optional pageParam for pagination if needed later
    try {
      return await apiService.getStories();
    } catch (error: any) {
      throw new AppError(ErrorType.Server, "Failed to get stories", error);
    }
  },

  // Like a post
  async likePost(postId: string): Promise<void> {
    if (!postId) {
      throw new AppError(
        ErrorType.Validation,
        "Post ID is required for like action",
      );
    }
    try {
      return await apiService.likePost(postId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to like post ${postId}`,
        error,
      );
    }
  },

  // Unlike a post
  async unlikePost(postId: string): Promise<void> {
    if (!postId) {
      throw new AppError(
        ErrorType.Validation,
        "Post ID is required for unlike action",
      );
    }
    try {
      return await apiService.unlikePost(postId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to unlike post ${postId}`,
        error,
      );
    }
  },

  // Save a post to bookshelf
  async savePost(postId: string): Promise<void> {
    if (!postId) {
      throw new AppError(
        ErrorType.Validation,
        "Post ID is required for save action",
      );
    }
    try {
      return await apiService.savePost(postId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to save post ${postId}`,
        error,
      );
    }
  },

  // Unsave a post
  async unsavePost(postId: string): Promise<void> {
    if (!postId) {
      throw new AppError(
        ErrorType.Validation,
        "Post ID is required for unsave action",
      );
    }
    try {
      return await apiService.unsavePost(postId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to unsave post ${postId}`,
        error,
      );
    }
  },

  // Mark a story as viewed
  async markStoryViewed(storyId: string): Promise<void> {
    if (!storyId) {
      throw new AppError(
        ErrorType.Validation,
        "Story ID is required for mark as viewed action",
      );
    }
    try {
      return await apiService.markStoryViewed(storyId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to mark story ${storyId} as viewed`,
        error,
      );
    }
  },
};