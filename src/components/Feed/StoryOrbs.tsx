import { Image as ExpoImage } from "expo-image"; // Import ExpoImage
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Story } from "../../services/feedService";

interface StoryOrbProps {
  story: Story;
  onPress: (storyId: string) => void;
}

interface StoryOrbsProps {
  stories: Story[];
  onStoryPress?: (storyId: string) => void;
}

const StoryOrb: React.FC<StoryOrbProps> = ({ story, onPress }) => {
  const handlePress = () => {
    onPress(story.id);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View entering={FadeIn} style={styles.storyContainer}>
        <LinearGradient
          colors={story.viewed ? ["#666", "#999"] : ["#FF3366", "#9933FF"]}
          style={styles.gradientBorder}
        >
          <View style={styles.imageContainer}>
            {/* <Image
              source={{ uri: story.imageUrl }}
              style={styles.storyImage}
            /> */}
            <ExpoImage
              source={{ uri: story.imageUrl }}
              style={styles.storyImage}
              contentFit="cover"
              transition={300}
              cachePolicy="memory-disk"
            />
          </View>
        </LinearGradient>
        <View style={styles.profilePictureContainer}>
          <ExpoImage
            source={{ uri: story.userAvatar }}
            style={styles.profilePicture}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>
        <Text style={styles.userName} numberOfLines={1}>
          {story.userName}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const StoryOrbs: React.FC<StoryOrbsProps> = ({ stories, onStoryPress }) => {
  const handleStoryPress = (storyId: string) => {
    if (onStoryPress) {
      onStoryPress(storyId);
    } else {
      // Handle viewing story within the component
      console.log("Viewing story:", storyId);
    }
  };

  // If no stories, don't render anything
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {stories.map((story) => (
        <StoryOrb key={story.id} story={story} onPress={handleStoryPress} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  storyContainer: {
    width: 80,
    height: 100,
    position: "relative",
    alignItems: "center",
  },
  gradientBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 2,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 38,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  storyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profilePictureContainer: {
    position: "absolute",
    bottom: 24, // Adjusted to make room for name
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#000",
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  profilePicture: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  userName: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    width: 80,
    textAlign: "center",
  },
});

export default StoryOrbs;
