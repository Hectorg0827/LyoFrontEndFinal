import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
  id: string;
  type: 'follow' | 'mention' | 'like' | 'comment' | 'event' | 'achievement';
  content: string;
  time: string;
  user?: {
    name: string;
    avatar: string;
  };
  read: boolean;
  link?: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'follow',
    content: 'started following you',
    time: '2h ago',
    user: {
      name: 'Mark Brown',
      avatar: 'https://placekitten.com/100/100',
    },
    read: false,
  },
  {
    id: '2',
    type: 'mention',
    content: 'mentioned you in a comment: "Thanks @JaneDoe for your insights!"',
    time: '3h ago',
    user: {
      name: 'Sarah Williams',
      avatar: 'https://placekitten.com/101/101',
    },
    read: false,
  },
  {
    id: '3',
    type: 'event',
    content: 'Your upcoming event "AI Workshop" starts in 2 hours',
    time: '5h ago',
    read: true,
  },
  {
    id: '4',
    type: 'like',
    content: 'liked your post about Data Science',
    time: '1d ago',
    user: {
      name: 'John Smith',
      avatar: 'https://placekitten.com/102/102',
    },
    read: true,
  },
  {
    id: '5',
    type: 'achievement',
    content: 'You\'ve earned the "7-Day Streak" badge! Keep it up!',
    time: '2d ago',
    read: true,
  },
  {
    id: '6',
    type: 'comment',
    content: 'commented on your post: "This is really insightful!"',
    time: '3d ago',
    user: {
      name: 'Emily Johnson',
      avatar: 'https://placekitten.com/103/103',
    },
    read: true,
  },
];

const NotificationsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('all');
  
  const filteredNotifications = React.useMemo(() => {
    if (activeTab === 'all') {
      return notifications;
    } else if (activeTab === 'mentions') {
      return notifications.filter(notification => notification.type === 'mention');
    } else {
      return notifications.filter(notification => notification.type === 'follow');
    }
  }, [activeTab]);

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem, 
          !item.read && styles.unreadNotification
        ]}
      >
        <View style={styles.notificationIconContainer}>
          {item.user ? (
            <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
          ) : (
            <View style={[
              styles.notificationIcon,
              item.type === 'event' && styles.eventIcon,
              item.type === 'achievement' && styles.achievementIcon,
            ]}>
              {item.type === 'event' && <Ionicons name="calendar" size={20} color="#fff" />}
              {item.type === 'achievement' && <Ionicons name="trophy" size={20} color="#fff" />}
            </View>
          )}
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            {item.user && <Text style={styles.userName}>{item.user.name}</Text>}
            <Text 
              style={[
                styles.notificationText, 
                !item.user && styles.systemNotificationText
              ]}
            >
              {item.content}
            </Text>
          </View>
          <Text style={styles.timeText}>{item.time}</Text>
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
          Today, you received 2 new followers, 1 mention, and have an upcoming AI Workshop event in 2 hours.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'mentions' && styles.activeTab]} 
          onPress={() => setActiveTab('mentions')}
        >
          <Text style={[styles.tabText, activeTab === 'mentions' && styles.activeTabText]}>Mentions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'follows' && styles.activeTab]} 
          onPress={() => setActiveTab('follows')}
        >
          <Text style={[styles.tabText, activeTab === 'follows' && styles.activeTabText]}>Follows</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsList}
        ListHeaderComponent={renderAISummary}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    color: '#999',
    fontSize: 16,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  notificationsList: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  aiSummaryContainer: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.3)',
  },
  aiSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSummaryTitle: {
    color: '#9b59b6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  aiSummaryText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
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
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventIcon: {
    backgroundColor: '#e74c3c',
  },
  achievementIcon: {
    backgroundColor: '#f39c12',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationHeader: {
    marginBottom: 4,
  },
  userName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  notificationText: {
    color: '#ccc',
    fontSize: 14,
  },
  systemNotificationText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
  timeText: {
    color: '#777',
    fontSize: 12,
  },
  unreadDot: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498db',
  },
});

export default NotificationsScreen;
