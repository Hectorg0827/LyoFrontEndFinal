import { api } from "./api";

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
    return api.get<Event[]>("/events", {
      latitude,
      longitude,
      radius: radiusInKm,
    });
  },

  // Get event details
  async getEventDetails(eventId: string): Promise<Event> {
    return api.get<Event>(`/events/${eventId}`);
  },

  // RSVP to an event
  async attendEvent(eventId: string): Promise<void> {
    return api.post(`/events/${eventId}/attend`);
  },

  // Cancel RSVP
  async unattendEvent(eventId: string): Promise<void> {
    return api.delete(`/events/${eventId}/attend`);
  },

  // Get communities near location
  async getCommunities(
    latitude: number,
    longitude: number,
    radiusInKm = 10,
  ): Promise<Community[]> {
    return api.get<Community[]>("/communities", {
      latitude,
      longitude,
      radius: radiusInKm,
    });
  },

  // Get community details with posts
  async getCommunityDetails(communityId: string): Promise<{
    community: Community;
    posts: Post[];
  }> {
    return api.get<{ community: Community; posts: Post[] }>(
      `/communities/${communityId}`,
    );
  },

  // Join a community
  async joinCommunity(communityId: string): Promise<void> {
    return api.post(`/communities/${communityId}/join`);
  },

  // Leave a community
  async leaveCommunity(communityId: string): Promise<void> {
    return api.delete(`/communities/${communityId}/join`);
  },

  // Create a post in a community
  async createPost(
    communityId: string,
    data: {
      content: string;
      imageUrl?: string;
    },
  ): Promise<Post> {
    return api.post<Post>(`/communities/${communityId}/posts`, data);
  },
};
