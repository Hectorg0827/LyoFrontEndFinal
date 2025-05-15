import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { initializeApi } from './src/services/apiMiddleware';
import * as Linking from 'expo-linking';
import { AvatarProvider } from './src/components/Avatar/AvatarContext';
import LyoAvatar from './src/components/Avatar/LyoAvatar';
import AvatarChat from './src/components/Avatar/AvatarChat';

// Configure deep linking
const prefix = Linking.createURL('/');
const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      Auth: 'auth',
      Main: {
        screens: {
          Home: 'home',
          Search: 'search',
          Learn: 'learn',
          Community: 'community',
          Profile: 'profile',
        },
      },
      Notifications: 'notifications',
      Bookshelf: 'bookshelf',
      AIClassroom: 'aiclassroom',
    },
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize API and other services
    const prepare = async () => {
      try {
        // Initialize API with stored auth token
        await initializeApi();
        
        // Any other initialization tasks
        // await Font.loadAsync({ ... });
        
        // Mark as ready when done
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsReady(true); // Still mark as ready to avoid getting stuck
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#8E54E9" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AvatarProvider>
          <StatusBar style="light" />
          <AppNavigator linking={linking} />
          <LyoAvatar />
          <AvatarChat />
        </AvatarProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
