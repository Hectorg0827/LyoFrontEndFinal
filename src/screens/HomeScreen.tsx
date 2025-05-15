import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header/HeaderBar';
import StoryOrbs from '../components/Feed/StoryOrbs';
import FeedList from '../components/Feed/FeedList';
import { StatusBar } from 'expo-status-bar';
import { feedService } from '../services/feedService';

export const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch stories
  const { 
    data: storiesData,
    isLoading: isStoriesLoading,
    isError: isStoriesError,
    refetch: refetchStories
  } = useQuery(['stories'], () => feedService.getStories());

  // Fetch feed with pagination
  const {
    data: feedData,
    isLoading: isFeedLoading,
    isError: isFeedError,
    refetch: refetchFeed,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useQuery(
    ['feed'],
    () => feedService.getFeed(),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStories(), refetchFeed()]);
    setRefreshing(false);
  };

  // Loading state
  if ((isStoriesLoading || isFeedLoading) && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8E54E9" />
          <Text style={styles.loadingText}>Loading your feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isStoriesError || isFeedError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <Header />
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color="#8E54E9" />
          <Text style={styles.errorText}>Unable to load content</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // For now, we'll use dummy data until the backend is connected
  // In production, replace with: const stories = storiesData?.stories || [];
  const stories = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah',
      userAvatar: 'https://placekitten.com/100/100',
      imageUrl: 'https://picsum.photos/200',
      viewed: false,
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Michael',
      userAvatar: 'https://placekitten.com/101/101',
      imageUrl: 'https://picsum.photos/201',
      viewed: true,
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Jessica',
      userAvatar: 'https://placekitten.com/102/102',
      imageUrl: 'https://picsum.photos/202',
      viewed: false,
    },
    {
      id: '4',
      userId: 'user4',
      userName: 'David',
      userAvatar: 'https://placekitten.com/103/103',
      imageUrl: 'https://picsum.photos/203',
      viewed: false,
    },
  ];

  // For now, we'll use dummy data until the backend is connected
  // In production, replace with: const posts = feedData?.pages.flatMap(page => page.posts) || [];
  const posts = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah Williams',
      userAvatar: 'https://placekitten.com/100/100',
      content: 'Learning about molecular structures today! 🧬 #Science #Learning',
      imageUrl: 'https://picsum.photos/400',
      likes: 1205,
      comments: 48,
      liked: false,
      saved: false,
      createdAt: new Date().toISOString(),
      tags: ['Science', 'Learning'],
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Michael Chen',
      userAvatar: 'https://placekitten.com/101/101',
      content: 'Just finished this amazing book on quantum physics! Highly recommend it to everyone interested in the subject. #Physics #Reading',
      imageUrl: 'https://picsum.photos/401',
      likes: 856,
      comments: 32,
      liked: true,
      saved: true,
      createdAt: new Date().toISOString(),
      tags: ['Physics', 'Reading'],
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Jessica Martinez',
      userAvatar: 'https://placekitten.com/102/102',
      content: 'Today\'s study session at the library was so productive! Making great progress on my research paper. #Study #Productivity',
      imageUrl: 'https://picsum.photos/402',
      likes: 745,
      comments: 15,
      liked: false,
      saved: false,
      createdAt: new Date().toISOString(),
      tags: ['Study', 'Productivity'],
    },
  ];
  
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Header />
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#8E54E9" 
          />
        }
      >
        <StoryOrbs stories={stories} />
        <FeedList 
          posts={posts} 
          onLoadMore={loadMore}
          isLoadingMore={isFetchingNextPage}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8E54E9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
