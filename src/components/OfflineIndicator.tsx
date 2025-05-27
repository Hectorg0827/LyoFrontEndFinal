import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetworkUtils from '../utils/networkUtils';

interface OfflineIndicatorProps {
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  showRefreshButton = true,
  onRefresh 
}) => {
  const { isConnected, refreshConnectionStatus } = NetworkUtils.useNetworkStatus();
  const [isVisible, setIsVisible] = useState(false);
  const translateY = React.useRef(new Animated.Value(-60)).current;
  
  useEffect(() => {
    if (isConnected === false) {
      setIsVisible(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8
      }).start();
    } else if (isConnected === true && isVisible) {
      Animated.timing(translateY, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true
      }).start(() => setIsVisible(false));
    }
  }, [isConnected, isVisible, translateY]);
  
  const handleRefresh = async () => {
    // Try to refresh connection
    await refreshConnectionStatus();
    
    // Call parent refresh handler if provided
    if (onRefresh) {
      onRefresh();
    }
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }] }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={20} color="#fff" />
        <Text style={styles.text}>You're offline. Using cached data.</Text>
        
        {showRefreshButton && (
          <TouchableOpacity 
            onPress={handleRefresh}
            style={styles.refreshButton}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#e74c3c',
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 5,
  },
});

export default OfflineIndicator;