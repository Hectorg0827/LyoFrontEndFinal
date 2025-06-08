import React from 'react';
import { View, StyleSheet } from 'react-native';
import APIConnectionTest from './src/components/APIConnectionTest';

export default function App() {
  return (
    <View style={styles.container}>
      <APIConnectionTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50, // Add some top padding for status bar
  },
});
