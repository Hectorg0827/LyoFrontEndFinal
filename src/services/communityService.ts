import { AppError, ErrorType } from "../utils/AppError";
import apiService from "./apiService";

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  startDate: string;
  endDate: string;
  attendees: number;
  isAttending: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  imageUrl: string;
  isJoined: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Post {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
}

// Community service for map, events and groups
export const communityService = {
  // Get events near user location
  async getEvents(
    latitude: number,
    longitude: number,
    radiusInKm = 10,
  ): Promise<Event[]> {
    try {
      return await apiService.getEvents(latitude, longitude, radiusInKm);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to fetch nearby events",
        error
      );
    }
  },

  // Get event details
  async getEventDetails(eventId: string): Promise<Event> {
    if (!eventId) {
      throw new AppError(ErrorType.Validation, "Event ID is required");
    }
    
    try {
      return await apiService.getEventDetails(eventId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to get details for event ${eventId}`,
        error
      );
    }
  },

  // RSVP to an event
  async attendEvent(eventId: string): Promise<void> {
    if (!eventId) {
      throw new AppError(ErrorType.Validation, "Event ID is required");
    }
    
    try {
      return await apiService.attendEvent(eventId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to attend event ${eventId}`,
        error
      );
    }
  },

  // Cancel RSVP
  async unattendEvent(eventId: string): Promise<void> {
    if (!eventId) {
      throw new AppError(ErrorType.Validation, "Event ID is required");
    }
    
    try {
      return await apiService.unattendEvent(eventId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to unattend event ${eventId}`,
        error
      );
    }
  },

  // Get communities near location
  async getCommunities(
    latitude: number,
    longitude: number,
    radiusInKm = 10,
  ): Promise<Community[]> {
    try {
      return await apiService.getCommunities(latitude, longitude, radiusInKm);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        "Failed to fetch nearby communities",
        error
      );
    }
  },

  // Get community details with posts
  async getCommunityDetails(communityId: string): Promise<{
    community: Community;
    posts: Post[];
  }> {
    if (!communityId) {
      throw new AppError(ErrorType.Validation, "Community ID is required");
    }
    
    try {
      return await apiService.getCommunityDetails(communityId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to get details for community ${communityId}`,
        error
      );
    }
  },

  // Join a community
  async joinCommunity(communityId: string): Promise<void> {
    if (!communityId) {
      throw new AppError(ErrorType.Validation, "Community ID is required");
    }
    
    try {
      return await apiService.joinCommunity(communityId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to join community ${communityId}`,
        error
      );
    }
  },

  // Leave a community
  async leaveCommunity(communityId: string): Promise<void> {
    if (!communityId) {
      throw new AppError(ErrorType.Validation, "Community ID is required");
    }
    
    try {
      return await apiService.leaveCommunity(communityId);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to leave community ${communityId}`,
        error
      );
    }
  },

  // Create a post in a community
  async createPost(
    communityId: string,
    data: {
      content: string;
      imageUrl?: string;
    },
  ): Promise<Post> {
    if (!communityId) {
      throw new AppError(ErrorType.Validation, "Community ID is required");
    }
    
    if (!data.content || data.content.trim() === "") {
      throw new AppError(ErrorType.Validation, "Post content is required");
    }
    
    try {
      return await apiService.createPost(communityId, data);
    } catch (error: any) {
      throw new AppError(
        ErrorType.Server,
        `Failed to create post in community ${communityId}`,
        error
      );
    }
  },
};
