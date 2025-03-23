import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

export function TravelScreen() {
  const [travelOptions, setTravelOptions] = useState([]);

  useEffect(() => {
    // Add your travel options data here for Bus, Metro, Train, Airlines
    const travelData = [
      {
        category: "Airlines",
        options: [
          { 
            name: "IndiGo", 
            url: "https://www.goindigo.in", 
            discount: "20% discount for cancer patients.", 
            description: "To avail this offer, visit the IndiGo website and check for the cancer patient discount under the 'Special Offers' section."
          },
          { 
            name: "Air India", 
            url: "https://www.airindia.in", 
            discount: "15% discount for cancer patients.", 
            description: "Visit the Air India website and book your flight under the 'Special Assistance' program to claim this offer."
          },
          { 
            name: "SpiceJet", 
            url: "https://www.spicejet.com", 
            discount: "10% discount for cancer patients.", 
            description: "Call the customer service of SpiceJet to avail the discount. Ensure you mention your medical condition."
          },
          { 
            name: "Vistara", 
            url: "https://www.airvistara.com", 
            discount: "50% discount for cancer patients.", 
            description: "Visit Vistara’s official site, and use the code ‘CANCER50’ to avail the discount on bookings."
          },
        ]
      },
      {
        category: "Train",
        options: [
          { 
            name: "Indian Railways", 
            url: "https://www.irctc.co.in", 
            discount: "10% discount on select routes for cancer patients.",
            description: "Use the IRCTC website and under the 'Offers' section, check for discounts for cancer patients."
          },
          { 
            name: "Shatabdi Express", 
            url: "https://www.irctc.co.in", 
            discount: "5% discount on selected trains.", 
            description: "Book through the IRCTC site and enter 'CANCER5' as a promo code while booking to get the discount."
          },
        ]
      },
      {
        category: "Bus",
        options: [
          { 
            name: "Volvo", 
            url: "https://www.volvobuses.com", 
            discount: "15% discount for cancer patients on long-distance routes.",
            description: "Visit the Volvo official site, navigate to 'Offers,' and you will find cancer patient-specific discounts."
          },
          { 
            name: "KSRTC", 
            url: "https://www.ksrtc.in", 
            discount: "10% discount for cancer patients.", 
            description: "Check KSRTC’s 'Special Offers' section on the website to avail the discount when booking."
          },
        ]
      },
      {
        category: "Metro",
        options: [
          { 
            name: "Delhi Metro", 
            url: "https://www.delhimetrorail.com", 
            discount: "Special offers on weekly passes for cancer patients.",
            description: "Visit the Delhi Metro website to apply for a special metro pass for cancer patients and enjoy the discounts."
          },
          { 
            name: "Mumbai Metro", 
            url: "https://www.mumbaimetro.com", 
            discount: "Discounts available for senior citizens and cancer patients.",
            description: "Check the official Mumbai Metro website for details on discounts available for cancer patients on travel cards."
          },
        ]
      }
    ];

    setTravelOptions(travelData);
  }, []);

  const handleCompanySelection = (company) => {
    Linking.openURL(company.url); // Opens the link when a travel company is selected
  };

  const renderCategoryItem = ({ item: categoryData }) => {
    return (
      <View style={styles.categorySection}>
        <Text style={styles.categoryHeader}>{categoryData.category}</Text>
        <FlatList
          data={categoryData.options}
          keyExtractor={(option) => option.name}
          numColumns={2} // This makes the grid with two columns
          renderItem={({ item }) => (
            <Animatable.View
              animation="fadeInUp"
              duration={1000}
              style={styles.card}
            >
              <TouchableOpacity style={styles.cardContent} onPress={() => handleCompanySelection(item)}>
                <Ionicons
                  name={categoryData.category === "Airlines" ? "airplane" : categoryData.category === "Train" ? "train" : categoryData.category === "Bus" ? "bus" : "business"}
                  size={30}
                  color="#e91e63"
                  style={styles.icon}
                />
                <View style={styles.travelDetails}>
                  <Text style={styles.travelText}>{item.name}</Text>
                  <Text style={styles.travelDiscount}>{item.discount}</Text>
                </View>
              </TouchableOpacity>
            </Animatable.View>
          )}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e91e63" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🚗 Travel Options</Text>
      </View>

      <FlatList
        data={travelOptions}
        keyExtractor={(item) => item.category}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.flatlistContainer}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  categorySection: {
    marginBottom: 20,
    marginHorizontal: 10,
  },
  categoryHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#e91e63",
  },
  card: {
    backgroundColor: "#fff",
    flex: 1,
    margin: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  travelDetails: {
    flex: 1,
  },
  travelText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  travelDiscount: {
    fontSize: 14,
    color: "#888",
  },
  flatlistContainer: {
    paddingHorizontal: 10,
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

export default TravelScreen;
