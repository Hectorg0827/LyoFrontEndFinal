import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BookshelfItem {
  id: string;
  title: string;
  type: "video" | "book" | "podcast" | "course" | "article";
  imageUrl: string;
  author?: string;
  progress?: number;
  duration?: string;
}

interface Collection {
  id: string;
  name: string;
  count: number;
  coverUrl: string;
}

const savedItems: BookshelfItem[] = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    type: "course",
    imageUrl: "https://picsum.photos/300/200",
    author: "Dr. Jane Smith",
    progress: 0.45,
    duration: "4h 30m",
  },
  {
    id: "2",
    title: "The Art of Programming",
    type: "book",
    imageUrl: "https://picsum.photos/301/200",
    author: "John Doe",
    progress: 0.2,
  },
];

const collections: Collection[] = [
  {
    id: "1",
    name: "STEM Stack",
    count: 12,
    coverUrl: "https://picsum.photos/302/200",
  },
  {
    id: "2",
    name: "Weekend Reads",
    count: 5,
    coverUrl: "https://picsum.photos/303/200",
  },
];

const suggestedItems: BookshelfItem[] = [
  {
    id: "3",
    title: "Advanced Data Structures",
    type: "video",
    imageUrl: "https://picsum.photos/304/200",
    author: "Prof. Michael Chen",
    duration: "1h 15m",
  },
];

const BookshelfScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState("saved");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookshelf</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "saved" && styles.activeTab]}
          onPress={() => setActiveTab("saved")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "saved" && styles.activeTabText,
            ]}
          >
            Saved by You
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "for-you" && styles.activeTab]}
          onPress={() => setActiveTab("for-you")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "for-you" && styles.activeTabText,
            ]}
          >
            For You
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "in-progress" && styles.activeTab]}
          onPress={() => setActiveTab("in-progress")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "in-progress" && styles.activeTabText,
            ]}
          >
            In Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "collections" && styles.activeTab]}
          onPress={() => setActiveTab("collections")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "collections" && styles.activeTabText,
            ]}
          >
            Collections
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "saved" && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Continue Learning</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.itemsRow}
              >
                {savedItems.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.itemImage}
                    />
                    {item.progress && (
                      <View style={styles.progressContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            { width: `${item.progress * 100}%` },
                          ]}
                        />
                      </View>
                    )}
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemType}>
                        {item.type.toUpperCase()}
                      </Text>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {item.author && (
                        <Text style={styles.itemAuthor}>{item.author}</Text>
                      )}
                      {item.duration && (
                        <Text style={styles.itemDuration}>{item.duration}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Collections</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.itemsRow}
              >
                {collections.map((collection) => (
                  <TouchableOpacity
                    key={collection.id}
                    style={styles.collectionCard}
                  >
                    <LinearGradient
                      colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
                      style={styles.collectionGradient}
                    >
                      <Image
                        source={{ uri: collection.coverUrl }}
                        style={styles.collectionImage}
                      />
                      <View style={styles.collectionDetails}>
                        <Text style={styles.collectionName}>
                          {collection.name}
                        </Text>
                        <Text style={styles.collectionCount}>
                          {collection.count} items
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.addCollectionCard}>
                  <View style={styles.addCollectionContent}>
                    <Ionicons name="add" size={32} color="#fff" />
                    <Text style={styles.addCollectionText}>Create New</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Suggested For You</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.itemsRow}
              >
                {suggestedItems.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemType}>
                        {item.type.toUpperCase()}
                      </Text>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {item.author && (
                        <Text style={styles.itemAuthor}>{item.author}</Text>
                      )}
                      {item.duration && (
                        <Text style={styles.itemDuration}>{item.duration}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {activeTab === "for-you" && (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="sparkles" size={48} color="#666" />
            <Text style={styles.emptyStateTitle}>Personalized Content</Text>
            <Text style={styles.emptyStateText}>
              Explore more content to get personalized recommendations based on
              your learning interests.
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Explore Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "in-progress" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <View style={styles.progressList}>
              {savedItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.progressItem}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.progressItemImage}
                  />
                  <View style={styles.progressItemDetails}>
                    <Text style={styles.progressItemTitle}>{item.title}</Text>
                    <Text style={styles.progressItemAuthor}>{item.author}</Text>
                    {item.progress && (
                      <View style={styles.inlineProgressContainer}>
                        <View
                          style={[
                            styles.inlineProgressBar,
                            { width: `${item.progress * 100}%` },
                          ]}
                        />
                        <Text style={styles.progressText}>
                          {Math.round(item.progress * 100)}%
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity style={styles.continueButton}>
                    <Ionicons name="play" size={16} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === "collections" && (
          <View style={styles.collectionsGrid}>
            {collections.map((collection) => (
              <TouchableOpacity
                key={collection.id}
                style={styles.collectionGridCard}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
                  style={styles.collectionGridGradient}
                >
                  <Image
                    source={{ uri: collection.coverUrl }}
                    style={styles.collectionGridImage}
                  />
                  <View style={styles.collectionGridDetails}>
                    <Text style={styles.collectionName}>{collection.name}</Text>
                    <Text style={styles.collectionCount}>
                      {collection.count} items
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addCollectionGridCard}>
              <View style={styles.addCollectionContent}>
                <Ionicons name="add" size={32} color="#fff" />
                <Text style={styles.addCollectionText}>Create New</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    marginRight: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
  },
  tabText: {
    color: "#999",
    fontSize: 14,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  itemsRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  itemCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: 120,
  },
  progressContainer: {
    height: 3,
    width: "100%",
    backgroundColor: "#333",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3498db",
  },
  itemDetails: {
    padding: 12,
  },
  itemType: {
    color: "#777",
    fontSize: 12,
    marginBottom: 4,
  },
  itemTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemAuthor: {
    color: "#999",
    fontSize: 12,
  },
  itemDuration: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },
  collectionCard: {
    width: 160,
    height: 200,
    marginRight: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  collectionGradient: {
    flex: 1,
  },
  collectionImage: {
    ...StyleSheet.absoluteFillObject,
  },
  collectionDetails: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  collectionName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  collectionCount: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  addCollectionCard: {
    width: 160,
    height: 200,
    backgroundColor: "#222",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addCollectionContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  addCollectionText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 14,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  progressList: {
    paddingHorizontal: 16,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressItemImage: {
    width: 80,
    height: 80,
  },
  progressItemDetails: {
    flex: 1,
    padding: 12,
  },
  progressItemTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  progressItemAuthor: {
    color: "#999",
    fontSize: 12,
    marginBottom: 8,
  },
  inlineProgressContainer: {
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    marginTop: 4,
  },
  inlineProgressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 2,
  },
  progressText: {
    position: "absolute",
    top: -18,
    right: 0,
    fontSize: 10,
    color: "#999",
  },
  continueButton: {
    backgroundColor: "#3498db",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
  },
  collectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  collectionGridCard: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 12,
    marginRight: "4%",
    borderRadius: 12,
    overflow: "hidden",
  },
  collectionGridGradient: {
    flex: 1,
  },
  collectionGridImage: {
    ...StyleSheet.absoluteFillObject,
  },
  collectionGridDetails: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  addCollectionGridCard: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: "#222",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
});

export default BookshelfScreen;
