import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { useAppStore } from "../../store/appStore";

export interface EnhancedFeature {
  id: string;
  title: string;
  description: string;
  iconName: string; // Ionicons name
  iconColor: string;
  screenName?: string; // Navigation screen to link to (if applicable)
  imageUrl?: string;
  isNew?: boolean;
  badge?: string;
}

interface EnhancedFeatureListProps {
  features: EnhancedFeature[];
  onFeaturePress?: (feature: EnhancedFeature) => void;
  showImages?: boolean;
}

const FeatureCard: React.FC<{
  feature: EnhancedFeature;
  onPress?: (feature: EnhancedFeature) => void;
  showImage?: boolean;
}> = ({ feature, onPress, showImage = true }) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const { width } = useWindowDimensions();
  const cardWidth = width * 0.9; // 90% of screen width
  
  const handlePress = () => {
    if (onPress) {
      onPress(feature);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          backgroundColor: isDarkMode ? "#1A1A1A" : "#FFFFFF",
          width: cardWidth,
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.featureHeader}>
        <View style={[styles.iconContainer, { backgroundColor: feature.iconColor + '20' }]}>
          <Ionicons
            name={feature.iconName as any}
            size={28}
            color={feature.iconColor}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: isDarkMode ? "#FFFFFF" : "#000000" }]}>
            {feature.title}
          </Text>
          {feature.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {feature.badge && (
            <View style={[styles.badge, { backgroundColor: "#8E54E9" }]}>
              <Text style={styles.badgeText}>{feature.badge}</Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={[styles.description, { color: isDarkMode ? "#CCCCCC" : "#555555" }]}>
        {feature.description}
      </Text>
      
      {showImage && feature.imageUrl && (
        <Image
          source={{ uri: feature.imageUrl }}
          style={styles.featureImage}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );
};

const EnhancedFeatureList: React.FC<EnhancedFeatureListProps> = ({
  features,
  onFeaturePress,
  showImages = true,
}) => {
  const navigation = useNavigation();
  
  const handleFeaturePress = (feature: EnhancedFeature) => {
    if (onFeaturePress) {
      onFeaturePress(feature);
    } else if (feature.screenName) {
      // @ts-ignore - This is a dynamic navigation
      navigation.navigate(feature.screenName);
    }
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={features}
        renderItem={({ item }) => (
          <FeatureCard
            feature={item}
            onPress={handleFeaturePress}
            showImage={showImages}
          />
        )}
        estimatedItemSize={180}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 240, // Adjust as needed
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  card: {
    marginHorizontal: 8,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  featureImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginTop: 8,
  },
  newBadge: {
    backgroundColor: "#FF3366",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default EnhancedFeatureList;