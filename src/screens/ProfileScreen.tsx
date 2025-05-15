import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Achievement {
  id: string;
  name: string;
  icon: string;
}

interface StatItem {
  label: string;
  value: string | number;
}

const achievements: Achievement[] = [
  { id: '1', name: 'Fast Learner', icon: 'rocket' },
  { id: '2', name: 'Knowledge Seeker', icon: 'book' },
  { id: '3', name: 'Consistent Learner', icon: 'calendar' },
  { id: '4', name: 'Helper', icon: 'people' },
];

const stats: StatItem[] = [
  { label: 'Courses Completed', value: 12 },
  { label: 'Total Hours', value: '56h' },
  { label: 'Current Streak', value: '7 days' },
];

// Dummy data for the tabs
const posts = [1, 2, 3, 4];
const saved = [1, 2, 3, 4, 5, 6];
const completed = [1, 2, 3];

const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('posts');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: 'https://placekitten.com/300/300' }} 
              style={styles.profileImage} 
            />
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={['#4776E6', '#8E54E9']}
                style={styles.verifiedBadge}
              >
                <Ionicons name="checkmark" size={12} color="#fff" />
              </LinearGradient>
            </View>
          </View>
          
          <Text style={styles.userName}>Jane Doe</Text>
          <Text style={styles.userBio}>Learning enthusiast | Data Scientist | Book lover</Text>
          
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Ionicons name={achievement.icon as any} size={24} color="#fff" />
                </View>
                <Text style={styles.achievementName}>{achievement.name}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your XP Level</Text>
              <Text style={styles.progressValue}>Level 7</Text>
            </View>
            <View style={styles.xpProgressContainer}>
              <View style={[styles.xpProgressBar, { width: '75%' }]} />
              <Text style={styles.xpProgressText}>2,250 / 3,000 XP</Text>
            </View>
            <Text style={styles.progressHelperText}>750 XP more to reach Level 8</Text>
          </View>
        </View>

        <View style={styles.tabsSection}>
          <View style={styles.tabsBar}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
            >
              <Ionicons 
                name="grid-outline" 
                size={22} 
                color={activeTab === 'posts' ? '#fff' : '#777'} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
              onPress={() => setActiveTab('saved')}
            >
              <Ionicons 
                name="bookmark-outline" 
                size={22} 
                color={activeTab === 'saved' ? '#fff' : '#777'} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
              onPress={() => setActiveTab('completed')}
            >
              <Ionicons 
                name="checkmark-circle-outline" 
                size={22} 
                color={activeTab === 'completed' ? '#fff' : '#777'} 
              />
            </TouchableOpacity>
          </View>
          
          {activeTab === 'posts' && (
            <View style={styles.tabContent}>
              <View style={styles.postsGrid}>
                {posts.map((_, index) => (
                  <TouchableOpacity key={index} style={styles.postItem}>
                    <Image 
                      source={{ uri: `https://picsum.photos/500/500?random=${index}` }}
                      style={styles.postImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {activeTab === 'saved' && (
            <View style={styles.tabContent}>
              <View style={styles.savedGrid}>
                {saved.map((_, index) => (
                  <TouchableOpacity key={index} style={styles.savedItem}>
                    <Image 
                      source={{ uri: `https://picsum.photos/500/300?random=${index + 10}` }}
                      style={styles.savedImage}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.savedGradient}
                    />
                    <View style={styles.savedInfo}>
                      <Text style={styles.savedType}>{index % 2 === 0 ? 'COURSE' : 'ARTICLE'}</Text>
                      <Text style={styles.savedTitle}>{index % 2 === 0 ? 'Introduction to Python' : 'How AI is Changing Education'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {activeTab === 'completed' && (
            <View style={styles.tabContent}>
              <View style={styles.completedList}>
                {completed.map((_, index) => (
                  <View key={index} style={styles.completedItem}>
                    <Image 
                      source={{ uri: `https://picsum.photos/100/100?random=${index + 20}` }}
                      style={styles.completedImage}
                    />
                    <View style={styles.completedInfo}>
                      <Text style={styles.completedType}>COURSE</Text>
                      <Text style={styles.completedTitle}>Data Visualization with D3.js</Text>
                      <View style={styles.completedMeta}>
                        <Ionicons name="time-outline" size={12} color="#999" />
                        <Text style={styles.completedMetaText}>Completed on May 10, 2023</Text>
                      </View>
                    </View>
                    <View style={styles.completedBadge}>
                      <Ionicons name="trophy" size={24} color="#FFD700" />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userBio: {
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#222',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '48%',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementName: {
    color: '#fff',
    fontWeight: '600',
  },
  progressSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressValue: {
    color: '#3498db',
    fontSize: 18,
    fontWeight: '700',
  },
  xpProgressContainer: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
    position: 'relative',
  },
  xpProgressBar: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  xpProgressText: {
    position: 'absolute',
    top: 12,
    right: 0,
    color: '#999',
    fontSize: 12,
  },
  progressHelperText: {
    color: '#999',
    fontSize: 12,
    marginTop: 16,
  },
  tabsSection: {
    marginBottom: 24,
  },
  tabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabContent: {
    paddingTop: 16,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 2,
  },
  postItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  savedGrid: {
    paddingHorizontal: 16,
  },
  savedItem: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  savedImage: {
    width: '100%',
    height: '100%',
  },
  savedGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  savedInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  savedType: {
    color: '#3498db',
    fontSize: 12,
    marginBottom: 4,
  },
  savedTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  completedList: {
    paddingHorizontal: 16,
  },
  completedItem: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  completedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  completedInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  completedType: {
    color: '#3498db',
    fontSize: 12,
    marginBottom: 4,
  },
  completedTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  completedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedMetaText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 4,
  },
  completedBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});

export default ProfileScreen;
