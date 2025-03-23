import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

export function CaregiverScreen() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("");
  const [selectedCaregiverType, setSelectedCaregiverType] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [applicationDetails, setApplicationDetails] = useState({
    type: "",
    accommodationHours: "",
    duration: "",
    reason: "",
    termsAccepted: false,
  });
  const [appliedCaregivers, setAppliedCaregivers] = useState([]);

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    setLoading(true);
    let apiUrl = "https://randomuser.me/api/?results=5";

    if (selectedGender) apiUrl += `&gender=${selectedGender}`;
    if (selectedNationality) apiUrl += `&nat=${selectedNationality}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      // Randomly assign caregiver type to each caregiver
      const caregiversWithType = data.results.map((caregiver) => {
        const caregiverType =
          Math.random() > 0.5 ? "Professional Caregiver" : "Freelance";
        return { ...caregiver, type: caregiverType };
      });

      // Filter caregivers based on selected type
      const filteredCaregivers =
        selectedCaregiverType === ""
          ? caregiversWithType
          : caregiversWithType.filter(
              (caregiver) => caregiver.type === selectedCaregiverType
            );

      setCaregivers(filteredCaregivers);
    } catch (error) {
      console.error("Error fetching caregivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const openApplicationModal = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setIsModalVisible(true);
  };

  const handleSubmit = () => {
    if (!applicationDetails.termsAccepted) {
      alert("You must accept the terms and conditions.");
      return;
    }
    alert("Application submitted successfully for " + selectedCaregiver?.name?.first);
    setIsModalVisible(false);
    setAppliedCaregivers([...appliedCaregivers, selectedCaregiver.login.uuid]);
    setApplicationDetails({
      type: "",
      accommodationHours: "",
      duration: "",
      reason: "",
      termsAccepted: false,
    });
    setSelectedCaregiver(null);
  };

  const handleFilterApply = () => {
    fetchCaregivers();
    setIsFilterModalVisible(false);
  };

  const resetFilters = () => {
    setSelectedGender("");
    setSelectedNationality("");
    setSelectedCaregiverType("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>👩‍⚕️ Available Caregivers</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e91e63" />
          <Text style={styles.loadingText}>Loading caregivers...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {caregivers.length > 0 ? (
            caregivers.map((caregiver, index) => (
              <View key={index} style={styles.card}>
                <Image source={{ uri: caregiver.picture.large }} style={styles.avatar} />
                <View style={styles.info}>
                  <Text style={styles.name}>
                    {caregiver.name.title} {caregiver.name.first} {caregiver.name.last}
                  </Text>
                  <Text style={styles.details}>📅 Age: {caregiver.dob.age}</Text>
                  <Text style={styles.details}>
                    📍 {caregiver.location.city}, {caregiver.location.state}
                  </Text>
                  <Text style={styles.details}>💼 Type: {caregiver.type}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    appliedCaregivers.includes(caregiver.login.uuid) && styles.appliedButton,
                  ]}
                  onPress={() => openApplicationModal(caregiver)}
                  disabled={appliedCaregivers.includes(caregiver.login.uuid)}
                >
                  <Ionicons
                    name={appliedCaregivers.includes(caregiver.login.uuid) ? "checkmark-circle" : "checkmark-circle-outline"}
                    size={20}
                    color="white"
                  />
                  <Text style={styles.applyText}>
                    {appliedCaregivers.includes(caregiver.login.uuid) ? "Applied" : "Apply"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="people-circle-outline" size={60} color="white" />
              </View>
              <Text style={styles.welcomeTitle}>No Caregivers Found</Text>
              <Text style={styles.welcomeText}>
                Try adjusting your filters to find caregivers that match your requirements.
              </Text>
              <View style={styles.suggestionContainer}>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => {
                    resetFilters();
                    fetchCaregivers();
                  }}
                >
                  <Text style={styles.suggestionText}>Reset All Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Application Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Apply for {selectedCaregiver?.name?.first || "Caregiver"}
            </Text>

            <Text style={styles.modalLabel}>Caregiver Gender</Text>
            <Text style={styles.modalValue}>
              {selectedCaregiver?.gender === "male" ? "Male" : "Female"}
            </Text>

            <Text style={styles.modalLabel}>Caregiver Type</Text>
            <Text style={styles.modalValue}>{selectedCaregiver?.type}</Text>

            <Text style={styles.modalLabel}>Duration of Accommodation Needed</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 3 months"
              value={applicationDetails.duration}
              onChangeText={(text) => setApplicationDetails({ ...applicationDetails, duration: text })}
            />

            <Text style={styles.modalLabel}>Reason for Caretaker Needed</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Elderly care"
              value={applicationDetails.reason}
              onChangeText={(text) => setApplicationDetails({ ...applicationDetails, reason: text })}
            />

            <View style={styles.checkboxContainer}>
              <TouchableOpacity onPress={() => setApplicationDetails({ ...applicationDetails, termsAccepted: !applicationDetails.termsAccepted })}>
                <Ionicons name={applicationDetails.termsAccepted ? "checkbox" : "square-outline"} size={24} color="#e91e63" />
              </TouchableOpacity>
              <Text style={styles.termsText}>I accept the terms and conditions</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={isFilterModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Caregivers</Text>
            
            <Text style={styles.modalLabel}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedGender}
                onValueChange={(itemValue) => setSelectedGender(itemValue)}
                style={styles.modalPicker}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
              </Picker>
            </View>

            <Text style={styles.modalLabel}>Nationality</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedNationality}
                onValueChange={(itemValue) => setSelectedNationality(itemValue)}
                style={styles.modalPicker}
              >
                <Picker.Item label="Select Nationality" value="" />
                <Picker.Item label="Australia (AU)" value="AU" />
                <Picker.Item label="Canada (CA)" value="CA" />
                <Picker.Item label="India (IN)" value="IN" />
                <Picker.Item label="United States (US)" value="US" />
              </Picker>
            </View>

            <Text style={styles.modalLabel}>Caregiver Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCaregiverType}
                onValueChange={(itemValue) => setSelectedCaregiverType(itemValue)}
                style={styles.modalPicker}
              >
                <Picker.Item label="Select Caregiver Type" value="" />
                <Picker.Item label="Professional Caregiver" value="Professional Caregiver" />
                <Picker.Item label="Freelance" value="Freelance" />
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={() => {
                  resetFilters();
                }}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsFilterModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleFilterApply}>
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  loadingText: {
    marginLeft: 8,
    color: "#e91e63",
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    flexDirection: "row",
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#e91e63",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  applyButton: {
    backgroundColor: "#e91e63",
    padding: 10,
    borderRadius: 24,
    alignItems: "center",
    flexDirection: "row",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  appliedButton: {
    backgroundColor: "#9e9e9e",
  },
  applyText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    width: "90%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#e91e63",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  modalValue: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
  },
  modalPicker: {
    height: 50,
    width: "100%",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  termsText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: "#607d8b",
    padding: 12,
    borderRadius: 24,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cancelButton: {
    backgroundColor: "#9e9e9e",
    padding: 12,
    borderRadius: 24,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  submitButton: {
    backgroundColor: "#e91e63",
    padding: 12,
    borderRadius: 24,
    flex: 1,
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