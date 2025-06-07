import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';

import { communityService, Event, Community } from "../services/communityService";

// Define pin types as a union type to ensure type safety
type PinType = "event" | "library" | "study-group" | "club" | "online-session";

interface MapPin {
  id: string;
  type: PinType;
  title: string;
  description: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  date?: string;
  time?: string;
  attendees?: number;
  isAttending?: boolean;
}

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
  const queryClient = useQueryClient();
  
  // Location state
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 37.78825,
    longitude: -122.4324
  });
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  
  // Load user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationPermissionDenied(true);
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({
          accuracy: 3 // Balanced accuracy (enum value)
        });
        
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Query for nearby events
  const { 
    data: events, 
    isLoading: isLoadingEvents, 
    isError: isErrorEvents 
  } = useQuery({
    queryKey: ['events', location],
    queryFn: () => communityService.getEvents(
      location.latitude,
      location.longitude,
      10 // 10km radius
    ),
    enabled: !!location.latitude && !!location.longitude,
  });
  
  // Query for nearby communities
  const { 
    data: communities, 
    isLoading: isLoadingCommunities, 
    isError: isErrorCommunities 
  } = useQuery({
    queryKey: ['communities', location],
    queryFn: () => communityService.getCommunities(
      location.latitude,
      location.longitude,
      10 // 10km radius
    ),
    enabled: !!location.latitude && !!location.longitude,
  });
  
  // Mutation for attending events
  const attendEventMutation = useMutation({
    mutationFn: (eventId: string) => communityService.attendEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });
  
  // Mutation for unattending events
  const unattendEventMutation = useMutation({
    mutationFn: (eventId: string) => communityService.unattendEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });
  
  // Toggle attendance for an event
  const toggleEventAttendance = (event: Event) => {
    if (event.isAttending) {
      unattendEventMutation.mutate(event.id);
    } else {
      attendEventMutation.mutate(event.id);
    }
  };
  
  // Convert events to map pins
  const mapPins = React.useMemo(() => {
    if (!events) {
      return [];
    }
    
    return events.map(event => ({
      id: event.id,
      type: "event" as PinType,
      title: event.title,
      description: event.description,
      coordinate: {
        latitude: event.location.latitude,
        longitude: event.location.longitude
      },
      date: new Date(event.startDate).toLocaleDateString(),
      time: `${new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(event.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      attendees: event.attendees,
      isAttending: event.isAttending
    }));
  }, [events]);
  
  // Function to calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    
    if (d < 1) {
      return `${Math.round(d * 1000)} m`;
    } else {
      return `${d.toFixed(1)} km`;
    }
  };
  
  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };
  
  // Format events for the list
  const nearbyEvents = React.useMemo(() => {
    if (!events) {
      return [];
    }
    
    return events.map(event => ({
      id: event.id,
      title: event.title,
      type: "Event",
      location: event.location.name,
      date: new Date(event.startDate).toLocaleDateString(),
      time: new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      imageUrl: event.imageUrl,
      attendees: event.attendees,
      distance: calculateDistance(
        location.latitude, 
        location.longitude, 
        event.location.latitude, 
        event.location.longitude
      ),
      isAttending: event.isAttending
    }));
  }, [events, location]);
  
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

  // Handle location permission errors
  if (locationPermissionDenied) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="navigate-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>Location Access Required</Text>
        <Text style={styles.errorMessage}>
          We need location permission to show you nearby events and communities.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermissionDenied(status !== 'granted');
          }}
        >
          <Text style={styles.retryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render loading state
  if (isLoadingEvents || isLoadingCommunities) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>
          Discovering nearby learning opportunities...
        </Text>
      </View>
    );
  }

  // Handle error state
  if (isErrorEvents || isErrorCommunities) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cloud-offline" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>
          We couldn't load the community data. Please check your connection and try again.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['communities'] });
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filter events based on selected category
  const filteredEvents = React.useMemo(() => {
    if (!nearbyEvents || nearbyEvents.length === 0) return [];
    
    if (selectedFilter === 'All') {
      return nearbyEvents;
    }
    
    // Convert filter name to match event type
    const filterType = selectedFilter === 'Events' ? 'Event' 
      : selectedFilter === 'Libraries' ? 'Library'
      : selectedFilter === 'Study Groups' ? 'Study Group'
      : selectedFilter === 'Clubs' ? 'Club'
      : selectedFilter === 'Online' ? 'Online Session'
      : '';
      
    return nearbyEvents.filter(event => event.type === filterType);
  }, [nearbyEvents, selectedFilter]);

  // Main render
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={customMapStyle}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* User's location marker */}
        <Marker
          coordinate={location}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.userLocationMarker}>
            <View style={styles.userLocationDot} />
          </View>
        </Marker>
        
        {/* Event markers */}
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

      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => Alert.alert("Create Event", "Event creation functionality coming soon!")}
      >
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

        {filteredEvents.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="calendar-outline" size={64} color="#555" />
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'All' 
                ? "No events found in your area" 
                : `No ${selectedFilter.toLowerCase()} found nearby`}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Try changing your filters or check back later
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.eventsList}
          >
            {filteredEvents.map((event) => {
              const originalEvent = events?.find(e => e.id === event.id);
              const isAttending = originalEvent?.isAttending || false;
              
              return (
                <TouchableOpacity 
                  key={event.id} 
                  style={styles.eventCard}
                  onPress={() => {
                    // Navigate to event details (to be implemented)
                    Alert.alert(
                      "Event Details", 
                      `View details for ${event.title}`
                    );
                  }}
                >
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
                    <TouchableOpacity 
                      style={[
                        styles.joinButton,
                        isAttending && styles.joinedButton
                      ]}
                      onPress={() => {
                        if (originalEvent) {
                          toggleEventAttendance(originalEvent);
                        }
                      }}
                      disabled={attendEventMutation.isPending || unattendEventMutation.isPending}
                    >
                      {(attendEventMutation.isPending || unattendEventMutation.isPending) && 
                       (attendEventMutation.variables === event.id || unattendEventMutation.variables === event.id) ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.joinButtonText}>
                          {isAttending ? "Leave" : "Join"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
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
    minWidth: 80,
    alignItems: "center",
  },
  joinedButton: {
    backgroundColor: "#2c3e50",
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
  // Error and loading states
  errorContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  errorMessage: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  // Empty state
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  emptyStateText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    color: "#777",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  // User location marker
  userLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(52, 152, 219, 0.3)",
    borderWidth: 1,
    borderColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3498db",
    borderWidth: 1,
    borderColor: "#fff",
  },
});

export default CommunityScreen;
