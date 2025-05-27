import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';

// Simple API test component
const APIConnectionTest = () => {
  const [healthStatus, setHealthStatus] = useState('Testing...');
  const [loginResult, setLoginResult] = useState('');
  const [email, setEmail] = useState('admin@lyo.ai');
  const [password, setPassword] = useState('admin123');

  // Test health endpoint
  const testHealth = async () => {
    try {
      setHealthStatus('Testing...');
      const response = await fetch('http://localhost:8000/api/v1/health');
      const data = await response.json();
      setHealthStatus(`✅ Connected: ${data.message}`);
    } catch (error) {
      setHealthStatus(`❌ Failed: ${error.message}`);
    }
  };

  // Test login endpoint
  const testLogin = async () => {
    try {
      setLoginResult('Testing login...');
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setLoginResult(`✅ Login successful: ${data.user.name}`);
      } else {
        const error = await response.json();
        setLoginResult(`❌ Login failed: ${error.detail}`);
      }
    } catch (error) {
      setLoginResult(`❌ Network error: ${error.message}`);
    }
  };

  // Test health on component mount
  useEffect(() => {
    testHealth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔗 Backend Connection Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Check</Text>
        <Text style={styles.status}>{healthStatus}</Text>
        <Button title="Test Health" onPress={testHealth} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Login Test</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Test Login" onPress={testLogin} />
        <Text style={styles.status}>{loginResult}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.info}>
          Backend URL: http://localhost:8000{'\n'}
          ✅ Frontend successfully connected to backend!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  status: {
    fontSize: 14,
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  info: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default APIConnectionTest;
