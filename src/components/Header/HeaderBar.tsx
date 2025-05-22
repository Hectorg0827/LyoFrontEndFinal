import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet } from "react-native";

const HeaderBar: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Lyo</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="chatbubbles" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={{ uri: "https://placekitten.com/100/100" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#000",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
});

export default HeaderBar;
