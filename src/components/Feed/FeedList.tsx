import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { FeedPost } from '../../services/feedService';
import { useAppStore } from '../../store/appStore';

interface FeedListProps {
  posts: FeedPost[];
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  onLikePress?: (postId: string, isLiked: boolean) => void;
  onSavePress?: (postId: string, isSaved: boolean) => void;
  onCommentPress?: (postId: string) => void;
}

const FeedCard: React.FC<{ 
  post: FeedPost;
  onLikePress?: (postId: string, isLiked: boolean) => void;
  onSavePress?: (postId: string, isSaved: boolean) => void;
  onCommentPress?: (postId: string) => void;
}> = ({ post, onLikePress, onSavePress, onCommentPress }) => {
  const isDarkMode = useAppStore(state => state.isDarkMode);
  
  const handleLikePress = () => {
    if (onLikePress) {
      onLikePress(post.id, !post.liked);
    }
  };

  const handleSavePress = () => {
    if (onSavePress) {
      onSavePress(post.id, !post.saved);
    }
  };

  const handleCommentPress = () => {
    if (onCommentPress) {
      onCommentPress(post.id);
    }
  };

  // Format date to display relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays}d`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo`;
    }
    
    return `${Math.floor(diffInMonths / 12)}y`;
  };

  return (
    <View style={[styles.card, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: isDarkMode ? '#fff' : '#000' }]}>
            {post.userName}
          </Text>
          <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={isDarkMode ? "#fff" : "#333"} />
        </TouchableOpacity>
      </View>

      {post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.contentImage}
          resizeMode="cover"
        />
      )}

      <Text style={[styles.caption, { color: isDarkMode ? '#fff' : '#000' }]}>
        {post.content}
      </Text>

      {post.tags && post.tags.length > 0 && (
        <View style={styles.tags}>
          {post.tags.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tagButton}>
              <Text style={styles.tagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
          <Ionicons 
            name={post.liked ? "heart" : "heart-outline"} 
            size={24} 
            color={post.liked ? "#FF3366" : isDarkMode ? "#fff" : "#333"} 
          />
          <Text style={[styles.actionText, { color: isDarkMode ? '#fff' : '#333' }]}>
            {post.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleCommentPress}>
          <Ionicons 
            name="chatbubble-outline" 
            size={24} 
            color={isDarkMode ? "#fff" : "#333"} 
          />
          <Text style={[styles.actionText, { color: isDarkMode ? '#fff' : '#333' }]}>
            {post.comments}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSavePress}>
          <Ionicons 
            name={post.saved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={post.saved ? "#8E54E9" : isDarkMode ? "#fff" : "#333"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FeedList: React.FC<FeedListProps> = ({ 
  posts,
  onLoadMore,
  isLoadingMore,
  onLikePress,
  onSavePress,
  onCommentPress
}) => {
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#8E54E9" />
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <FlashList
        data={posts}
        renderItem={({ item }) => (
          <FeedCard 
            post={item} 
            onLikePress={onLikePress}
            onSavePress={onSavePress}
            onCommentPress={onCommentPress}
          />
        )}
        estimatedItemSize={400}
        showsVerticalScrollIndicator={false}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 600, // This gives the FlashList a fixed height so it can render properly
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 14,
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 6,
  },
  contentImage: {
    width: '100%',
    height: 300,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    padding: 12,
    paddingTop: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  tagButton: {
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    color: '#8E54E9',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default FeedList;
