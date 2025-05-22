import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  useInfiniteQuery,
  QueryKey as _QueryKey,
  QueryFunctionContext,
  InfiniteData as _InfiniteData,
} from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";

import { MainTabParamList } from "../navigation/types";
import {
  feedService,
  AppError,
  StoriesResponse,
  FeedResponse,
  Story,
  FeedPost as Post,
} from "../services/feedService";

// Placeholder for StoryItem and PostItem components
const StoryItem = ({ story }: { story: Story }) => (
  <View style={styles.storyItem}>
    <Image
      source={{ uri: story.userAvatar || "https://via.placeholder.com/50" }}
      style={styles.storyAvatar}
    />
    <Text style={styles.storyUsername}>{story.userName || "username"}</Text>
  </View>
);

const PostItem = ({ post }: { post: Post }) => (
  <View style={styles.postItem}>
    <View style={styles.postHeader}>
      <Image
        source={{ uri: post.userAvatar || "https://via.placeholder.com/40" }}
        style={styles.postAvatar}
      />
      <Text style={styles.postUsername}>{post.userName || "username"}</Text>
    </View>
    {post.imageUrl && (
      <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
    )}
    <Text style={styles.postCaption}>{post.content || "No caption"}</Text>
  </View>
);

export const HomeScreen: React.FC = () => {
  const _navigation =
    useNavigation<NativeStackNavigationProp<MainTabParamList>>();

  const {
    data: storiesDataResult,
    fetchNextPage: _fetchNextStories,
    hasNextPage: _hasNextStories,
    isFetchingNextPage: _isFetchingNextStories,
    isLoading: isStoriesLoading,
    isError: isStoriesError,
    error: storiesError,
    refetch: refetchStories,
    isRefetching: isRefetchingStories,
  } = useInfiniteQuery<
    StoriesResponse, // TQueryFnData: Data type returned by queryFn for a single page
    AppError, // TError: Error type
    StoriesResponse, // TData: For v4-like InfiniteData, this is TQueryFnData. The result.data will be InfiniteData<StoriesResponse>.
    string[], // TQueryKey: Type of the query key array
    number // TPageParam: Type of the page parameter
  >({
    queryKey: ["stories"],
    queryFn: async ({
      pageParam = 0,
    }: QueryFunctionContext<string[], number>) =>
      feedService.getStories(pageParam),
    // Adjusted signature for getNextPageParam (v4-like)
    getNextPageParam: (
      _lastPage: StoriesResponse,
      _allPages: StoriesResponse[],
    ) => {
      // If stories are not paginated or always fetch all, return undefined.
      // If stories had a next cursor: return lastPage.nextCursor (adjust type of lastPageParam if needed)
      return undefined;
    },
    initialPageParam: 0,
  });

  const {
    data: feedDataResult,
    fetchNextPage: fetchNextFeed,
    hasNextPage: hasNextFeed,
    isFetchingNextPage: isFetchingNextFeed,
    isLoading: isFeedLoading,
    isError: isFeedError,
    error: feedError,
    refetch: refetchFeed,
    isRefetching: isRefetchingFeed,
  } = useInfiniteQuery<
    FeedResponse, // TQueryFnData
    AppError, // TError
    FeedResponse, // TData: For v4-like InfiniteData, this is TQueryFnData. The result.data will be InfiniteData<FeedResponse>.
    string[], // TQueryKey
    string | undefined // TPageParam
  >({
    queryKey: ["feed"],
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<string[], string | undefined>) =>
      feedService.getFeed(pageParam),
    // Adjusted signature for getNextPageParam (v4-like)
    getNextPageParam: (_lastPage: FeedResponse, _allPages: FeedResponse[]) =>
      _lastPage.nextCursor,
    initialPageParam: undefined,
  });

  const stories: Story[] = useMemo(() => {
    // Assuming storiesDataResult.pages is an array of StoriesResponse
    return (
      storiesDataResult?.pages.flatMap(
        (page: StoriesResponse) => page.stories,
      ) ?? []
    );
  }, [storiesDataResult]);

  const posts: Post[] = useMemo(() => {
    // Assuming feedDataResult.pages is an array of FeedResponse
    return (
      feedDataResult?.pages.flatMap((page: FeedResponse) => page.posts) ?? []
    );
  }, [feedDataResult]);

  const handleRefresh = useCallback(() => {
    refetchStories();
    refetchFeed();
  }, [refetchStories, refetchFeed]);

  const loadMoreFeed = useCallback(() => {
    if (hasNextFeed && !isFetchingNextFeed) {
      fetchNextFeed();
    }
  }, [hasNextFeed, isFetchingNextFeed, fetchNextFeed]);

  // Combined initial loading state
  const initialLoading = isStoriesLoading || isFeedLoading;
  // Combined refreshing state
  const refreshing = isRefetchingStories || isRefetchingFeed;

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      </SafeAreaView>
    );
  }

  if (isStoriesError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Error loading stories: {storiesError?.message}</Text>
          <TouchableOpacity onPress={() => refetchStories()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isFeedError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Error loading feed: {feedError?.message}</Text>
          <TouchableOpacity onPress={() => refetchFeed()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        ListHeaderComponent={
          <>
            {stories.length > 0 && (
              <View style={styles.storiesContainer}>
                <Text style={styles.sectionTitle}>Stories</Text>
                <FlatList
                  data={stories}
                  renderItem={({ item }) => <StoryItem story={item} />}
                  keyExtractor={(item, index) =>
                    item.id?.toString() || `story-${index}`
                  }
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.storiesList}
                  // Add story loading/error handling if pagination for stories is implemented
                />
              </View>
            )}
            <Text style={styles.sectionTitle}>Feed</Text>
          </>
        }
        data={posts}
        renderItem={({ item }) => <PostItem post={item} />}
        keyExtractor={(item, index) => item.id?.toString() || `post-${index}`}
        onEndReached={loadMoreFeed}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetchingNextFeed ? (
            <ActivityIndicator
              style={{ marginVertical: 20 }}
              size="small"
              color="#00ff00"
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#00ff00"]}
            tintColor="#00ff00"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedListContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  retryText: {
    color: "#007bff",
    marginTop: 10, // Reverted: insetBlockStart
  },
  storiesContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    marginBottom: 10, // Reverted: insetBlockEnd
  },
  storiesList: {
    paddingStart: 10, // Kept: paddingLeft equivalent
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginStart: 15, // Kept: marginLeft equivalent
    marginBottom: 10, // Reverted: insetBlockEnd
    marginTop: 10, // Reverted: insetBlockStart
  },
  storyItem: {
    alignItems: "center",
    marginEnd: 15, // Kept: marginRight equivalent
  },
  storyAvatar: {
    width: 60, // Reverted: inlineSize
    height: 60, // Reverted: blockSize
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#00ff00",
  },
  storyUsername: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 5, // Reverted: insetBlockStart
  },
  postItem: {
    backgroundColor: "#121212",
    marginBottom: 10, // Reverted: insetBlockEnd
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  postAvatar: {
    width: 40, // Reverted: inlineSize
    height: 40, // Reverted: blockSize
    borderRadius: 20,
    marginEnd: 10, // Kept: marginRight equivalent
  },
  postUsername: {
    fontWeight: "bold",
    color: "#fff",
  },
  postImage: {
    width: "100%", // Reverted: inlineSize
    height: 400, // Reverted: blockSize
    resizeMode: "cover",
  },
  postCaption: {
    padding: 10,
    color: "#fff",
  },
  feedListContent: {
    paddingBottom: 20, // Reverted: paddingBlockEnd
  },
});

export default HomeScreen;
