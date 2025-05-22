import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack"; // Import NativeStackNavigationProp
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";

import { MainTabParamList } from "../../navigation/types"; // Import MainTabParamList
import { avatarService } from "../../services/avatarService";

import { useAvatar } from "./AvatarContext";

// Message type definition
interface Message {
  id: string;
  text: string;
  sender: "user" | "lyo";
  timestamp: Date;
}

const AvatarChat: React.FC = () => {
  const {
    isChatOpen,
    closeChat,
    setAvatarState,
    userPreferences,
    recognizedText,
    startVoiceRecognition,
    stopVoiceRecognition,
    isListening,
    speakResponse,
  } = useAvatar();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Lyo, your learning assistant. How can I help you today?",
      sender: "lyo",
      timestamp: new Date(),
    },
  ]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const listRef = useRef<FlatList>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<MainTabParamList>>(); // Use NativeStackNavigationProp

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
      console.error("Error generating response:", error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
  };

  const handleSend = async (text: string = inputText) => {
    if (text.trim() === "") {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");

    // Set avatar to processing state
    setAvatarState("processing");

    try {
      // Get AI response
      const responseText = await generateResponse(text);

      // Add Lyo's response
      const lyoResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "lyo",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, lyoResponse]);

      // Speak the response if voice is enabled
      if (userPreferences.voiceEnabled) {
        speakResponse(responseText);
      } else {
        // Just set avatar to speaking briefly
        setAvatarState("speaking");
        setTimeout(() => {
          setAvatarState("idle");
        }, 1000);
      }

      // Check for potential course creation
      if (
        responseText
          .toLowerCase()
          .includes("create a personalized learning course") ||
        responseText.toLowerCase().includes("create a learning pathway") ||
        responseText.toLowerCase().includes("create a customized")
      ) {
        // Show a button to navigate to course creation
        setTimeout(() => {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: (Date.now() + 2).toString(),
              text: "🚀 Would you like me to create a course for you now?",
              sender: "lyo",
              timestamp: new Date(),
            },
          ]);
        }, 1000);
      }
    } catch (error) {
      console.error("Error in chat interaction:", error);

      // Add error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I encountered an error. Please try again.",
          sender: "lyo",
          timestamp: new Date(),
        },
      ]);

      // Return to idle state
      setAvatarState("idle");
    }
  };

  const navigateToAIClassroom = () => {
    closeChat();
    navigation.navigate("AIClassroom");
  };

  // If chat is not open, don't render anything
  // This was causing the "Remove unreachable code" warning, so it's commented out.
  // The component will simply render an empty Animated.View if !isChatOpen, which is fine.
  // if (!isChatOpen) {
  //   return null;
  // }

  const renderMessage = ({ item }: { item: Message }) => {
    // Special button message for course creation
    if (
      item.sender === "lyo" &&
      item.text.includes("Would you like me to create a course")
    ) {
      return (
        <View style={[styles.messageContainer, styles.lyoMessageContainer]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <TouchableOpacity
            style={styles.createCourseButton}
            onPress={navigateToAIClassroom}
          >
            <LinearGradient
              colors={["#4776E6", "#8E54E9"]}
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
          item.sender === "lyo"
            ? styles.lyoMessageContainer
            : styles.userMessageContainer,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                  colors={["#4776E6", "#8E54E9"]}
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
                  style={[
                    styles.voiceButton,
                    isListening && styles.activeVoiceButton,
                  ]}
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
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.disabledSendButton,
                ]}
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
    position: "absolute",
    top: 0, // Reverted: insetBlockStart
    left: 0, // Reverted: insetInlineStart
    right: 0, // Reverted: insetInlineEnd
    bottom: 0, // Reverted: insetBlockEnd
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  chatContainer: {
    height: "80%", // Reverted: blockSize
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  blurView: {
    flex: 1,
    backgroundColor: "rgba(20, 20, 20, 0.8)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#1F1F1F",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  avatarIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarGradient: {
    width: 20, // Reverted: inlineSize
    height: 20, // Reverted: blockSize
    borderRadius: 10,
    marginRight: 10, // Reverted: marginEnd
  },
  avatarName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    maxWidth: "80%", // Reverted: maxInlineSize
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  lyoMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(71, 118, 230, 0.2)",
    borderBottomLeftRadius: 5,
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(142, 84, 233, 0.2)",
    borderBottomRightRadius: 5,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
    alignSelf: "flex-end",
    marginLeft: 10, // Reverted: marginStart
    top: 4, // Reverted: insetBlockStart
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 15 : 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#1F1F1F",
  },
  input: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 10, // Reverted: marginEnd
    maxHeight: 100, // Reverted: maxBlockSize
  },
  sendButton: {
    backgroundColor: "#7640E0",
    borderRadius: 22,
    width: 44, // Reverted: inlineSize
    height: 44, // Reverted: blockSize
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSendButton: {
    backgroundColor: "#555",
  },
  micButton: {
    padding: 10,
  },
  suggestionsContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#1F1F1F",
  },
  suggestionChip: {
    backgroundColor: "#2C2C2E",
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8, // Reverted: marginEnd
  },
  suggestionText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%", // Reverted: inlineSize
    height: "80%", // Reverted: blockSize
    resizeMode: "contain",
  },
  typingIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  typingAvatar: {
    width: 20, // Reverted: inlineSize
    height: 20, // Reverted: blockSize
    borderRadius: 10,
    marginRight: 10, // Reverted: marginEnd
  },
  typingText: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  voiceButton: {
    padding: 10,
    marginLeft: 5, // Reverted: marginStart
  },
  activeVoiceButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 22,
  },
  voiceWaveContainer: {
    position: "absolute",
    bottom: 0, // Reverted: insetBlockEnd
    left: 0, // Reverted: insetInlineStart
    right: 0, // Reverted: insetInlineEnd
    height: 100, // Reverted: blockSize
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  stopVoiceButton: {
    top: 10, // Reverted: insetBlockStart
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  stopVoiceButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  createCourseButton: {
    top: 10, // Reverted: insetBlockStart
    borderRadius: 8,
    overflow: "hidden",
  },
  createCourseGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  createCourseButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default AvatarChat;
