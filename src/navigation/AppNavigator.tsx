import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import BookshelfScreen from '../screens/BookshelfScreen';
import CommunityScreen from '../screens/CommunityScreen'; 
import LearnScreen from '../screens/LearnScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AuthScreen from '../screens/AuthScreen';
import AIClassroomScreen from '../screens/AIClassroomScreen';
import AvatarSettingsScreen from '../screens/AvatarSettingsScreen';
import { useAppStore } from '../store/appStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom button for the Learn tab
const LearnButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={styles.learnButtonContainer}
      onPress={onPress}
    >
      <LinearGradient
        colors={['#4776E6', '#8E54E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.learnButton}
      >
        <Ionicons name="book" size={24} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={100} style={StyleSheet.absoluteFill} />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Bookshelf':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Community':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      
      {/* Custom Learn button in the middle */}
      <Tab.Screen 
        name="Learn" 
        component={LearnScreen}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <LearnButton onPress={() => navigation.navigate('Learn')} />
          ),
        })}
      />
      
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

interface AppNavigatorProps {
  linking?: any;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ linking }) => {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ animation: 'fade' }}
          />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Bookshelf" component={BookshelfScreen} />
            <Stack.Screen name="AIClassroom" component={AIClassroomScreen} />
            {/* Add other stack screens for modals, etc. */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 8,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 0,
    elevation: 0,
  },
  learnButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4776E6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AppNavigator;
