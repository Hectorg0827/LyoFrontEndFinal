import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAvatar } from './AvatarContext';
import { useNavigation } from '@react-navigation/native';
import { avatarService } from '../../services/avatarService';

// Message type definition
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lyo';
  timestamp: Date;
}

const AvatarChat: React.FC = () => {
  const { 
    isChatOpen, 
    closeChat, 
    avatarState, 
    setAvatarState, 
    userPreferences,
    recognizedText,
    startVoiceRecognition,
    stopVoiceRecognition,
    isListening,
    speakResponse
  } = useAvatar();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m Lyo, your learning assistant. How can I help you today?',
      sender: 'lyo',
      timestamp: new Date(),
    },
  ]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const listRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (isChatOpen) {
      // Animate the chat in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate the chat out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isChatOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Update with recognizedText when it changes
  useEffect(() => {
    if (recognizedText && isChatOpen) {
      setInputText(recognizedText);
      // Auto-send the recognized text if it's a complete thought
      if (recognizedText.length > 10) {
        handleSend(recognizedText);
      }
    }
  }, [recognizedText]);

  // Mock function to generate responses - in a real app, this would connect to an AI backend
  const generateResponse = async (userInput: string): Promise<string> => {
    try {
      // Use our avatarService to generate a real AI response
      return await avatarService.generateResponse(userInput);
    } catch (error) {
      console.error('Error generating response:', error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
  };

  const handleSend = async (text: string = inputText) => {
    if (text.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    
    // Set avatar to processing state
    setAvatarState('processing');

    try {
      // Get AI response
      const responseText = await generateResponse(text);
      
      // Add Lyo's response
      const lyoResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'lyo',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, lyoResponse]);
      
      // Speak the response if voice is enabled
      if (userPreferences.voiceEnabled) {
        speakResponse(responseText);
      } else {
        // Just set avatar to speaking briefly
        setAvatarState('speaking');
        setTimeout(() => {
          setAvatarState('idle');
        }, 1000);
      }
      
      // Check for potential course creation
      if (
        responseText.toLowerCase().includes('create a personalized learning course') ||
        responseText.toLowerCase().includes('create a learning pathway') ||
        responseText.toLowerCase().includes('create a customized')
      ) {
        // Show a button to navigate to course creation
        setTimeout(() => {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: (Date.now() + 2).toString(),
              text: '🚀 Would you like me to create a course for you now?',
              sender: 'lyo',
              timestamp: new Date(),
            },
          ]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error in chat interaction:', error);
      
      // Add error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I encountered an error. Please try again.",
          sender: 'lyo',
          timestamp: new Date(),
        },
      ]);
      
      // Return to idle state
      setAvatarState('idle');
    }
  };

  const navigateToAIClassroom = () => {
    closeChat();
    // @ts-ignore - Navigation typing needs to be set up properly
    navigation.navigate('AIClassroom');
  };

  // If chat is not open, don't render anything
  if (!isChatOpen) {
    return null;
  }

  const renderMessage = ({ item }: { item: Message }) => {
    // Special button message for course creation
    if (item.sender === 'lyo' && item.text.includes('Would you like me to create a course')) {
      return (
        <View style={[styles.messageContainer, styles.lyoMessageContainer]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <TouchableOpacity style={styles.createCourseButton} onPress={navigateToAIClassroom}>
            <LinearGradient
              colors={['#4776E6', '#8E54E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createCourseGradient}
            >
              <Text style={styles.createCourseButtonText}>Create Course</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    // Regular message
    return (
      <View
        style={[
          styles.messageContainer,
          item.sender === 'lyo' ? styles.lyoMessageContainer : styles.userMessageContainer,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Animated.View
          style={[
            styles.chatContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <BlurView intensity={80} style={styles.blurView}>
            <View style={styles.header}>
              <View style={styles.avatarIndicator}>
                <LinearGradient
                  colors={['#4776E6', '#8E54E9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                />
                <Text style={styles.avatarName}>Lyo</Text>
              </View>
              <TouchableOpacity onPress={closeChat} style={styles.closeButton}>
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              ref={listRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesContainer}
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask Lyo anything..."
                placeholderTextColor="#666"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSend()}
                returnKeyType="send"
              />
              {userPreferences.voiceEnabled && (
                <TouchableOpacity
                  style={[styles.voiceButton, isListening && styles.activeVoiceButton]}
                  onPress={() => {
                    if (isListening) {
                      stopVoiceRecognition();
                    } else {
                      startVoiceRecognition();
                    }
                  }}
                >
                  <Ionicons 
                    name={isListening ? "radio" : "mic-outline"} 
                    size={24} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.disabledSendButton]}
                onPress={() => handleSend()}
                disabled={!inputText.trim()}
              >
                <Ionicons name="send" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGradient: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  avatarName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
  },
  lyoMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(71, 118, 230, 0.2)',
    borderBottomLeftRadius: 5,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(142, 84, 233, 0.2)',
    borderBottomRightRadius: 5,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#8E54E9',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: 'rgba(142, 84, 233, 0.5)',
  },
  voiceButton: {
    backgroundColor: 'rgba(71, 118, 230, 0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeVoiceButton: {
    backgroundColor: '#FF5454',
  },
  createCourseButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  createCourseGradient: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createCourseButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AvatarChat;
