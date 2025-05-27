import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { userService, Notification } from "../services/userService";

const NotificationsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("all");
  const queryClient = useQueryClient();

  // Query for fetching notifications
  const { 
    data: notifications, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userService.getNotifications(50, 0),
  });

  // Mutation for marking notifications as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds: string[]) => userService.markNotificationsRead(notificationIds),
    onSuccess: () => {
      // Invalidate the notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => userService.markAllNotificationsRead(),
    onSuccess: () => {
      // Invalidate the notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Handle marking a notification as read
  const handleMarkAsRead = (notificationId: string) => {
    if (!markAsReadMutation.isPending) {
      markAsReadMutation.mutate([notificationId]);
    }
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    if (!markAllAsReadMutation.isPending) {
      markAllAsReadMutation.mutate();
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    
    if (activeTab === "all") {
      return notifications;
    } else if (activeTab === "mentions") {
      return notifications.filter(
        (notification) => notification.type === "comment",
      );
    } else {
      return notifications.filter(
        (notification) => notification.type === "follow",
      );
    }
  }, [activeTab, notifications]);

  // Format relative time from ISO string
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  // Generate AI summary based on notifications
  const generateAISummary = () => {
    if (!notifications || notifications.length === 0) {
      return "You don't have any new notifications.";
    }
    
    const unreadCount = notifications.filter(n => !n.read).length;
    const followCount = notifications.filter(n => n.type === "follow" && !n.read).length;
    const likeCount = notifications.filter(n => n.type === "like" && !n.read).length;
    const commentCount = notifications.filter(n => n.type === "comment" && !n.read).length;
    const eventCount = notifications.filter(n => n.type === "event" && !n.read).length;
    
    if (unreadCount === 0) {
      return "You're all caught up! No new notifications.";
    }
    
    let summary = `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}: `;
    const parts = [];
    
    if (followCount > 0) {
      parts.push(`${followCount} new follower${followCount > 1 ? 's' : ''}`);
    }
    if (likeCount > 0) {
      parts.push(`${likeCount} like${likeCount > 1 ? 's' : ''}`);
    }
    if (commentCount > 0) {
      parts.push(`${commentCount} comment${commentCount > 1 ? 's' : ''}`);
    }
    if (eventCount > 0) {
      parts.push(`${eventCount} event${eventCount > 1 ? 's' : ''}`);
    }
    
    return summary + parts.join(", ") + ".";
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    // Get user data from the notification
    const userData = item.data?.userId ? {
      name: item.data?.userName || "User",
      avatar: item.data?.userAvatar || "https://placekitten.com/100/100"
    } : undefined;
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification,
        ]}
        onPress={() => handleMarkAsRead(item.id)}
      >
        <View style={styles.notificationIconContainer}>
          {userData ? (
            <Image
              source={{ uri: userData.avatar }}
              style={styles.userAvatar}
            />
          ) : (
            <View
              style={[
                styles.notificationIcon,
                item.type === "event" && styles.eventIcon,
                item.type === "achievement" && styles.achievementIcon,
                item.type === "course" && styles.courseIcon,
              ]}
            >
              {item.type === "event" && (
                <Ionicons name="calendar" size={20} color="#fff" />
              )}
              {item.type === "achievement" && (
                <Ionicons name="trophy" size={20} color="#fff" />
              )}
              {item.type === "course" && (
                <Ionicons name="book" size={20} color="#fff" />
              )}
            </View>
          )}
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            {userData && <Text style={styles.userName}>{userData.name}</Text>}
            <Text
              style={[
                styles.notificationText,
                !userData && styles.systemNotificationText,
              ]}
            >
              {item.message}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatRelativeTime(item.createdAt)}</Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderAISummary = () => {
    return (
      <View style={styles.aiSummaryContainer}>
        <View style={styles.aiSummaryHeader}>
          <Ionicons name="flash" size={20} color="#9b59b6" />
          <Text style={styles.aiSummaryTitle}>AI Summary</Text>
        </View>
        <Text style={styles.aiSummaryText}>
          {generateAISummary()}
        </Text>
      </View>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (isError) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
        <Text style={styles.errorText}>
          Error loading notifications: {error instanceof Error ? error.message : "Unknown error"}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleMarkAllAsRead}
          disabled={markAllAsReadMutation.isPending}
        >
          {markAllAsReadMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark-done-outline" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "mentions" && styles.activeTab]}
          onPress={() => setActiveTab("mentions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "mentions" && styles.activeTabText,
            ]}
          >
            Mentions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "follows" && styles.activeTab]}
          onPress={() => setActiveTab("follows")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "follows" && styles.activeTabText,
            ]}
          >
            Follows
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsList}
        ListHeaderComponent={renderAISummary}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications in this category</Text>
        }
        refreshing={isLoading}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3498db",
  },
  tabText: {
    color: "#999",
    fontSize: 16,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  notificationsList: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  aiSummaryContainer: {
    backgroundColor: "rgba(155, 89, 182, 0.1)",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(155, 89, 182, 0.3)",
  },
  aiSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aiSummaryTitle: {
    color: "#9b59b6",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  aiSummaryText: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
  },
  notificationItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: "relative",
  },
  unreadNotification: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
  },
  notificationIconContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  eventIcon: {
    backgroundColor: "#e74c3c",
  },
  achievementIcon: {
    backgroundColor: "#f39c12",
  },
  courseIcon: {
    backgroundColor: "#2ecc71",
  },
  notificationContent: {
    flex: 1,
    justifyContent: "center",
  },
  notificationHeader: {
    marginBottom: 4,
  },
  userName: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  notificationText: {
    color: "#ccc",
    fontSize: 14,
  },
  systemNotificationText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 15,
  },
  timeText: {
    color: "#777",
    fontSize: 12,
  },
  unreadDot: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3498db",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#e74c3c",
    marginTop: 12,
    textAlign: "center",
    fontSize: 16,
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});

export default NotificationsScreen;
