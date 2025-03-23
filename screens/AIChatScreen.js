import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button, Avatar } from "react-native-paper";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// AI Chat Assistant API
const GEMINI_API_KEY = "AIzaSyATZ_zcdaIUdzsEAC_CXbsGQ2uvYrTnKN8";
const AI_CHAT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export function AIChatScreen() {
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  // AI Chat API Call
  const askAI = async () => {
    if (userMessage.trim().length === 0) {
      return;
    }

    setLoading(true);

    // Add User Message to Chat
    const newChat = [...chatMessages, { text: userMessage, sender: "user" }];
    setChatMessages(newChat);
    setUserMessage("");

    try {
      const response = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an AI assistant for cancer patients. Your role is to provide support, motivation, and helpful responses in a warm and encouraging tone.\n\nUser Message: "${userMessage}"`,
                },
              ],
            },
          ],
        }),
      });

      const json = await response.json();

      let aiResponse = json?.candidates?.[0]?.content?.parts?.[0]?.text || null;

      // If AI fails to generate a response, provide a default positive message
      if (!aiResponse) {
        aiResponse =
          "I'm here to support you. Keep believing in yourself and know that you are not alone. ❤️";
      }

      // Add AI Response to Chat
      setChatMessages([...newChat, { text: aiResponse, sender: "ai" }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setChatMessages([
        ...newChat,
        { text: "Error fetching AI response. Please try again later.", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle send on Enter key press
  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
      askAI();
    }
  };

  const renderWelcomeMessage = () => {
    if (chatMessages.length === 0) {
      return (
        <View style={styles.welcomeContainer}>
          <Avatar.Icon 
            size={80} 
            icon={() => <FontAwesome5 name="hands-helping" size={40} color="#fff" />} 
            style={styles.welcomeIcon} 
          />
          <Text style={styles.welcomeTitle}>Welcome to Your Support Chat</Text>
          <Text style={styles.welcomeText}>
            I'm here to provide support and answer questions during your cancer journey. 
            Feel free to ask anything - you're not alone in this.
          </Text>
          <View style={styles.suggestionContainer}>
            <TouchableOpacity 
              style={styles.suggestionChip}
              onPress={() => setUserMessage("How can I manage treatment side effects?")}
            >
              <Text style={styles.suggestionText}>Managing side effects</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.suggestionChip}
              onPress={() => setUserMessage("Do you have any tips for staying positive?")}
            >
              <Text style={styles.suggestionText}>Staying positive</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.suggestionChip}
              onPress={() => setUserMessage("How can I explain my diagnosis to family?")}
            >
              <Text style={styles.suggestionText}>Talking to family</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="heart" size={24} color="white" />
        <Text style={styles.headerText}>Supportive AI Companion</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="information-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContainer}
        >
          {renderWelcomeMessage()}
          
          {chatMessages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.sender === "user" ? styles.userMessage : styles.aiMessage,
              ]}
            >
              {msg.sender === "ai" && (
                <View style={styles.avatarContainer}>
                  <Avatar.Icon size={36} icon="robot" style={styles.avatar} />
                </View>
              )}
              <View style={msg.sender === "user" ? styles.userBubble : styles.aiBubble}>
                <Text style={[
                  styles.messageText,
                  msg.sender === "user" ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
          
          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#e91e63" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Chat Input */}
        <Card style={styles.inputCard}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type your message here..."
              value={userMessage}
              onChangeText={setUserMessage}
              onKeyPress={handleKeyPress}
              multiline
              style={styles.input}
            />
            <TouchableOpacity 
              onPress={askAI} 
              style={[styles.sendButton, !userMessage.trim() && styles.sendButtonDisabled]}
              disabled={!userMessage.trim()}
            >
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Card>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Enhanced Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    backgroundColor: "#e91e63",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  headerButton: {
    padding: 4,
  },
  chatContainer: {
    flexGrow: 1,
    padding: 16,
  },
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  welcomeIcon: {
    backgroundColor: "#e91e63",
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  suggestionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#dbe1e6",
  },
  suggestionText: {
    color: "#6b7c93",
    fontSize: 14,
  },
  messageBubble: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  aiMessage: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    backgroundColor: "#e91e63",
  },
  userBubble: {
    backgroundColor: "#e91e63",
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: "80%",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  aiBubble: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    maxWidth: "80%",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userMessageText: {
    color: "white",
    fontSize: 16,
  },
  aiMessageText: {
    color: "#333",
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: "#e91e63",
    fontSize: 14,
  },
  inputCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    padding: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 24,
    padding: 12,
    paddingRight: 48,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: "#f8f9fa",
  },
  sendButton: {
    position: "absolute",
    right: 4,
    bottom: 4,
    backgroundColor: "#e91e63",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#f0f0f0",
  },
});