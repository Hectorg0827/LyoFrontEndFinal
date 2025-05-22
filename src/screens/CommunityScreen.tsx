import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface MapPin {
  id: string;
  type: "event" | "library" | "study-group" | "club" | "online-session";
  title: string;
  description: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  date?: string;
  time?: string;
  attendees?: number;
}

interface NearbyEvent {
  id: string;
  title: string;
  type: string;
  location: string;
  date: string;
  time: string;
  imageUrl: string;
  attendees: number;
  distance: string;
}

const mapPins: MapPin[] = [
  {
    id: "1",
    type: "event",
    title: "AI Workshop",
    description: "Learn about the latest AI trends and applications",
    coordinate: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
    date: "May 20, 2023",
    time: "5:00 PM",
    attendees: 32,
  },
  {
    id: "2",
    type: "library",
    title: "Central Library",
    description: "Public library with study spaces and resources",
    coordinate: {
      latitude: 37.79025,
      longitude: -122.4314,
    },
  },
  {
    id: "3",
    type: "study-group",
    title: "Data Science Study Group",
    description: "Weekly meetup for data science enthusiasts",
    coordinate: {
      latitude: 37.78625,
      longitude: -122.4354,
    },
    date: "Every Thursday",
    time: "7:00 PM",
    attendees: 12,
  },
];

const nearbyEvents: NearbyEvent[] = [
  {
    id: "1",
    title: "AI Workshop",
    type: "Workshop",
    location: "Tech Hub Downtown",
    date: "May 20, 2023",
    time: "5:00 PM",
    imageUrl: "https://picsum.photos/400/300",
    attendees: 32,
    distance: "0.5 miles",
  },
  {
    id: "2",
    title: "Data Science Study Group",
    type: "Study Group",
    location: "Central Library",
    date: "Every Thursday",
    time: "7:00 PM",
    imageUrl: "https://picsum.photos/401/300",
    attendees: 12,
    distance: "0.8 miles",
  },
  {
    id: "3",
    title: "Book Club: Sci-Fi Classics",
    type: "Book Club",
    location: "Community Center",
    date: "May 22, 2023",
    time: "6:30 PM",
    imageUrl: "https://picsum.photos/402/300",
    attendees: 18,
    distance: "1.2 miles",
  },
];

const filterOptions = [
  "All",
  "Events",
  "Libraries",
  "Study Groups",
  "Clubs",
  "Online",
];

const { height } = Dimensions.get("window");

const CommunityScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const drawerHeight = useSharedValue(height * 0.3);
  const mapRef = useRef<MapView>(null);

  const handleMarkerPress = (pin: MapPin) => {
    mapRef.current?.animateToRegion(
      {
        latitude: pin.coordinate.latitude,
        longitude: pin.coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
  };

  const drawerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: drawerHeight.value,
    };
  });

  const toggleDrawer = () => {
    drawerHeight.value = withSpring(
      drawerHeight.value === height * 0.3 ? height * 0.7 : height * 0.3,
      { damping: 15 },
    );
  };

  const customMapStyle = [
    {
      elementType: "geometry",
      stylers: [
        {
          color: "#212121",
        },
      ],
    },
    {
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#212121",
        },
      ],
    },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#9e9e9e",
        },
      ],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#bdbdbd",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [
        {
          color: "#181818",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#616161",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#1b1b1b",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#2c2c2c",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#8a8a8a",
        },
      ],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        {
          color: "#373737",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [
        {
          color: "#3c3c3c",
        },
      ],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [
        {
          color: "#4e4e4e",
        },
      ],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#616161",
        },
      ],
    },
    {
      featureType: "transit",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#000000",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#3d3d3d",
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={customMapStyle}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {mapPins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={pin.coordinate}
            onPress={() => handleMarkerPress(pin)}
          >
            <View style={styles.markerContainer}>
              {pin.type === "event" && (
                <View style={[styles.marker, { backgroundColor: "#e74c3c" }]}>
                  <Ionicons name="calendar" size={16} color="#fff" />
                </View>
              )}
              {pin.type === "library" && (
                <View style={[styles.marker, { backgroundColor: "#3498db" }]}>
                  <Ionicons name="book" size={16} color="#fff" />
                </View>
              )}
              {pin.type === "study-group" && (
                <View style={[styles.marker, { backgroundColor: "#2ecc71" }]}>
                  <Ionicons name="people" size={16} color="#fff" />
                </View>
              )}
              {pin.type === "club" && (
                <View style={[styles.marker, { backgroundColor: "#9b59b6" }]}>
                  <Ionicons name="glasses" size={16} color="#fff" />
                </View>
              )}
              {pin.type === "online-session" && (
                <View style={[styles.marker, { backgroundColor: "#f39c12" }]}>
                  <Ionicons name="laptop" size={16} color="#fff" />
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.topBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity style={styles.createButton}>
        <LinearGradient
          colors={["#9b59b6", "#3498db"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.createButtonGradient}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <Animated.View style={[styles.drawer, drawerAnimatedStyle]}>
        <View style={styles.drawerHandle}>
          <TouchableOpacity
            onPress={toggleDrawer}
            style={styles.drawerHandleButton}
          >
            <View style={styles.drawerHandleBar} />
          </TouchableOpacity>
        </View>

        <Text style={styles.drawerTitle}>Nearby Learning Opportunities</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.eventsList}
        >
          {nearbyEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <Image
                source={{ uri: event.imageUrl }}
                style={styles.eventImage}
              />
              <View style={styles.eventInfo}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventType}>{event.type}</Text>
                  <Text style={styles.eventDistance}>{event.distance}</Text>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailItem}>
                    <Ionicons name="calendar-outline" size={14} color="#999" />
                    <Text style={styles.eventDetailText}>{event.date}</Text>
                  </View>
                  <View style={styles.eventDetailItem}>
                    <Ionicons name="time-outline" size={14} color="#999" />
                    <Text style={styles.eventDetailText}>{event.time}</Text>
                  </View>
                  <View style={styles.eventDetailItem}>
                    <Ionicons name="people-outline" size={14} color="#999" />
                    <Text style={styles.eventDetailText}>
                      {event.attendees} attending
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingTop: 8,
  },
  filterScrollView: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(40, 40, 40, 0.8)",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#3498db",
  },
  filterText: {
    color: "#999",
    fontSize: 14,
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  createButton: {
    position: "absolute",
    right: 16,
    bottom: height * 0.32,
    zIndex: 1,
  },
  createButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHandle: {
    alignItems: "center",
    marginBottom: 12,
  },
  drawerHandleButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  drawerHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#555",
    borderRadius: 2,
  },
  drawerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  eventImage: {
    width: 100,
    height: "100%",
  },
  eventInfo: {
    flex: 1,
    padding: 12,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eventType: {
    color: "#3498db",
    fontSize: 12,
    fontWeight: "600",
  },
  eventDistance: {
    color: "#777",
    fontSize: 12,
  },
  eventTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventLocation: {
    color: "#999",
    fontSize: 12,
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  eventDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  eventDetailText: {
    color: "#999",
    fontSize: 12,
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
});

export default CommunityScreen;
