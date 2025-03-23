import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");

export function HomeScreen() {
  const navigation = useNavigation();

  const menuItems = [
    { id: 1, name: "Financial Assistance", icon: "cash", screen: "FinancialAssistance" },
    { id: 2, name: "Medical Records", icon: "folder", screen: "MedicalRecords" },
    { id: 3, name: "Medicine Tracker", icon: "medkit", screen: "Medicine" },
    { id: 4, name: "Caregiver Recruitment", icon: "people", screen: "Caregiver" },
    { id: 5, name: "To-Do List", icon: "list-circle", screen: "ToDo" },
    { id: 6, name: "Travel Assistance", icon: "airplane", screen: "Travel" },
    { id: 7, name: "AI Chat", icon: "chatbubbles", screen: "AIChat" },
    { id: 8, name: "Health Insights", icon: "analytics", screen: "HealthInsights" },
    { id: 9, name: "Reminders", icon: "alarm", screen: "Reminder" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e91e63" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>CanEndCer</Text>
       
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Animatable.View
            animation="bounceIn"
            duration={1500}
            delay={500}
            style={styles.welcomeIcon}
          >
            <Image
              source={require('../assets/logo.jpg')} // Corrected image path
              style={styles.logo}
            />
          </Animatable.View>

          <Animatable.Text
            animation="fadeInDown"
            duration={1000}
            delay={800}
            style={styles.welcomeTitle}
          >
            Welcome to CanEndCer
          </Animatable.Text>

          <Animatable.Text
            animation="fadeInUp"
            duration={1000}
            delay={1000}
            style={styles.welcomeText}
          >
            Your personal health assistant designed to support your wellness journey
          </Animatable.Text>
        </View>

        {/* Grid Layout */}
        <View style={styles.listContainer}>
          {menuItems.map((item, index) => (
            <Animatable.View
              key={item.id}
              animation="fadeInUp"
              duration={1000}
              delay={index * 100}
              style={styles.gridItemWrapper}
            >
              <TouchableOpacity
                style={styles.modalContent}
                onPress={() => navigation.navigate(item.screen)}
                accessibilityLabel={item.name}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon} size={40} color="#e91e63" />
                </View>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.buttonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    padding: 8,
    borderRadius: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeIcon: {
    backgroundColor: "#fff",
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
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
  listContainer: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItemWrapper: {
    width: "48%", // Adjusting to 2 items per row with space in between
    marginBottom: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: "hidden", // Ensure content doesn't overflow the border
  },
  menuIconContainer: {
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flexShrink: 1, // Ensures text doesn't overflow and wraps properly
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  submitButton: {
    backgroundColor: "#e91e63",
    padding: 12,
    borderRadius: 24,
    width: "100%",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
