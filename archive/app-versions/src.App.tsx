import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>LyoAI Learning Assistant</Text>
        <Text style={styles.subtitle}>Your AI Learning Companion</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>✅ App Successfully Initialized</Text>
          <Text style={styles.statusText}>✅ iOS Build Ready</Text>
          <Text style={styles.statusText}>✅ Android Build Ready</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
});
