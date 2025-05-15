import React, { useState } from 'react';
import { View, TextInput, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

interface PopularTopic {
  id: string;
  title: string;
}

interface TrendingContent {
  id: string;
  type: 'course' | 'user' | 'book' | 'video' | 'podcast';
  title: string;
  imageUrl: string;
  author?: string;
}

const popularTopics: PopularTopic[] = [
  { id: '1', title: 'Python Best Practices' },
  { id: '2', title: 'History of Art' },
  { id: '3', title: 'Machine Learning Basics' },
  { id: '4', title: 'Creative Writing' },
];

const trendingContent: TrendingContent[] = [
  { id: '1', type: 'course', title: 'Data Science Basics', imageUrl: 'https://picsum.photos/200/300', author: 'John Smith' },
  { id: '2', type: 'book', title: 'The Art of Programming', imageUrl: 'https://picsum.photos/201/300', author: 'Jane Doe' },
  { id: '3', type: 'video', title: 'Understanding Quantum Physics', imageUrl: 'https://picsum.photos/202/300', author: 'Albert Einstein' },
];

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState(['React Native', 'TypeScript', 'UI Design']);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for topics, users, content..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Recent Searches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
            {recentSearches.map((search, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text style={styles.tagText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Topics</Text>
          <View style={styles.topicsList}>
            {popularTopics.map((topic) => (
              <TouchableOpacity key={topic.id} style={styles.topicItem}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#888" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Content</Text>
          <View style={styles.contentGrid}>
            {trendingContent.map((item) => (
              <TouchableOpacity key={item.id} style={styles.contentCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.contentImage} />
                <View style={styles.contentInfo}>
                  <Text style={styles.contentType}>{item.type.toUpperCase()}</Text>
                  <Text style={styles.contentTitle} numberOfLines={2}>{item.title}</Text>
                  {item.author && <Text style={styles.contentAuthor}>By {item.author}</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: {
    color: '#fff',
  },
  topicsList: {
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
  },
  topicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  topicTitle: {
    color: '#fff',
    fontSize: 16,
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contentCard: {
    width: '48%',
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  contentImage: {
    width: '100%',
    height: 120,
  },
  contentInfo: {
    padding: 12,
  },
  contentType: {
    color: '#777',
    fontSize: 12,
    marginBottom: 4,
  },
  contentTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentAuthor: {
    color: '#999',
    fontSize: 12,
  },
});

export default SearchScreen;
