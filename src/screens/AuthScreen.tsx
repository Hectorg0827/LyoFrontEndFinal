import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/api';

// Define the sign in methods
type SignInMethod = 'email' | 'google' | 'apple' | 'facebook';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation<StackNavigationProp<any>>();
  const setUser = useAppStore(state => state.setUser);
  const setAuthenticated = useAppStore(state => state.setAuthenticated);

  // Handle authentication with different methods
  const handleAuth = async (method: SignInMethod) => {
    if (error) setError(null);
    setLoading(true);
    
    try {
      if (method === 'email') {
        if (isLogin) {
          // Login with email and password
          if (!email || !password) {
            throw new Error('Please enter both email and password');
          }
          
          const response = await authService.login({ email, password });
          setUser({
            id: response.user.id,
            name: response.user.name,
            avatar: response.user.avatar || 'https://placekitten.com/300/300'
          });
          setAuthenticated(true);
        } else {
          // Register with email, name and password
          if (!name || !email || !password) {
            throw new Error('Please fill in all fields');
          }
          
          if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
          }
          
          const response = await authService.register({ name, email, password });
          setUser({
            id: response.user.id,
            name: response.user.name,
            avatar: response.user.avatar || 'https://placekitten.com/300/300'
          });
          setAuthenticated(true);
        }
      } else {
        // For demo purposes, mock social authentication
        // In a real app, integrate with Firebase Auth, Auth0, etc.
        console.log(`Auth with ${method}`);
        
        // Simulate successful social login
        setUser({ 
          id: 'user456', 
          name: method === 'google' ? 'Google User' : method === 'apple' ? 'Apple User' : 'Facebook User',
          avatar: 'https://placekitten.com/300/300'
        });
        setAuthenticated(true);
      }
      
      // Navigation is handled by AppNavigator based on isAuthenticated state
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    if (error) setError(null);
    setIsLogin(!isLogin);
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address to reset your password.');
      return;
    }
    
    // For demo purposes
    Alert.alert('Password Reset', `A password reset link has been sent to ${email}`);
    
    // In real implementation:
    // authService.forgotPassword(email).then(() => {
    //   Alert.alert('Password Reset', `A password reset link has been sent to ${email}`);
    // }).catch(err => {
    //   Alert.alert('Error', err.message);
    // });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Image 
              source={{ uri: 'https://placekitten.com/600/300' }}  // Replace with your logo
              style={styles.logo}
            />
          </View>
          
          <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>
            {isLogin 
              ? 'Sign in to continue your learning journey' 
              : 'Sign up to start your learning journey'
            }
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#777"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#777" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#777"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#777"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.visibilityIcon}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Ionicons 
                  name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#777" 
                />
              </TouchableOpacity>
            </View>
            
            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={() => handleAuth('email')}
              disabled={loading}
            >
              <LinearGradient
                colors={['#4776E6', '#8E54E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={[styles.socialButton, styles.googleButton]}
                onPress={() => handleAuth('google')}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialButton, styles.appleButton]}
                onPress={() => handleAuth('apple')}
                disabled={loading}
              >
                <Ionicons name="logo-apple" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialButton, styles.facebookButton]}
                onPress={() => handleAuth('facebook')}
                disabled={loading}
              >
                <Ionicons name="logo-facebook" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.footerLink}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 56,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 16,
  },
  visibilityIcon: {
    position: 'absolute',
    right: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#777',
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  appleButton: {
    backgroundColor: '#333',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
  footerLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AuthScreen;
