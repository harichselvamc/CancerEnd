import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Modal from "react-native-modal";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";

export function FinancialAssistanceScreen() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    cancerType: "",
    age: "",
    occupation: "",
    income: "",
    panCardNumber: "",
    currentTreatment: "",
    costNeeded: "",
    aadhaarNumber: "",
    address: "",
    dob: "",
  });

  const [isModalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      { key: "name", label: "Full Name" },
      { key: "gender", label: "Gender" },
      { key: "cancerType", label: "Cancer Type" },
      { key: "age", label: "Age" },
      { key: "occupation", label: "Occupation" },
      { key: "income", label: "Monthly Income" },
      { key: "panCardNumber", label: "PAN Card Number" },
      { key: "currentTreatment", label: "Current Treatment" },
      { key: "costNeeded", label: "Financial Assistance Needed" },
      { key: "aadhaarNumber", label: "Aadhaar Number" },
      { key: "address", label: "Address" },
      { key: "dob", label: "Date of Birth" },
    ];

    let isValid = true;
    requiredFields.forEach(({ key, label }) => {
      if (!formData[key] || formData[key].trim() === "") {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    if (!termsAccepted) {
      newErrors.terms = "You must confirm that the information is accurate";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Scroll to first error message
      const errorMessage = Object.values(errors).find(error => error);
      Alert.alert("Incomplete Form", errorMessage || "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://emailserver-h0jt.onrender.com/submit_form/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setModalVisible(true);
      } else {
        Alert.alert("Error", result.detail ? result.detail[0].msg : "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "",
      cancerType: "",
      age: "",
      occupation: "",
      income: "",
      panCardNumber: "",
      currentTreatment: "",
      costNeeded: "",
      aadhaarNumber: "",
      address: "",
      dob: "",
    });
    setTermsAccepted(false);
    setErrors({});
  };

  const toggleTermsAccepted = () => {
    setTermsAccepted(!termsAccepted);
    if (errors.terms) {
      setErrors({
        ...errors,
        terms: null,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Financial Assistance</Text>
        <TouchableOpacity style={styles.headerButton} onPress={resetForm}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isSubmitting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e91e63" />
          <Text style={styles.loadingText}>Submitting...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="cash-outline" size={50} color="white" />
            </View>
            <Text style={styles.welcomeTitle}>Financial Support Application</Text>
            <Text style={styles.welcomeText}>
              Please complete the form below to apply for financial assistance for your cancer treatment. All information provided will be kept confidential.
            </Text>
          </View>

          <Text style={styles.modalLabel}>Personal Information</Text>

          <TextInput
            style={[styles.modalInput, errors.name && styles.inputError]}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <View style={[styles.pickerContainer, errors.gender && styles.inputError]}>
            <RNPickerSelect
              onValueChange={(value) => handleChange("gender", value)}
              items={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
              placeholder={{ label: "Select Gender", value: null }}
              style={pickerSelectStyles}
            />
          </View>
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

          <TextInput
            style={[styles.modalInput, errors.dob && styles.inputError]}
            placeholder="Date of Birth"
            value={formData.dob}
            onChangeText={(text) => handleChange("dob", text)}
          />
          {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

          <TextInput
            style={[styles.modalInput, errors.age && styles.inputError]}
            placeholder="Age"
            value={formData.age}
            onChangeText={(text) => handleChange("age", text)}
            keyboardType="numeric"
          />
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

          <TextInput
            style={[styles.modalInput, errors.address && styles.inputError]}
            placeholder="Address"
            value={formData.address}
            onChangeText={(text) => handleChange("address", text)}
            multiline
            numberOfLines={3}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

          <Text style={styles.modalLabel}>Medical Information</Text>

          <TextInput
            style={[styles.modalInput, errors.cancerType && styles.inputError]}
            placeholder="Cancer Type"
            value={formData.cancerType}
            onChangeText={(text) => handleChange("cancerType", text)}
          />
          {errors.cancerType && <Text style={styles.errorText}>{errors.cancerType}</Text>}

          <TextInput
            style={[styles.modalInput, errors.currentTreatment && styles.inputError]}
            placeholder="Current Treatment"
            value={formData.currentTreatment}
            onChangeText={(text) => handleChange("currentTreatment", text)}
            multiline
            numberOfLines={3}
          />
          {errors.currentTreatment && <Text style={styles.errorText}>{errors.currentTreatment}</Text>}

          <Text style={styles.modalLabel}>Financial Information</Text>

          <TextInput
            style={[styles.modalInput, errors.occupation && styles.inputError]}
            placeholder="Occupation"
            value={formData.occupation}
            onChangeText={(text) => handleChange("occupation", text)}
          />
          {errors.occupation && <Text style={styles.errorText}>{errors.occupation}</Text>}

          <TextInput
            style={[styles.modalInput, errors.income && styles.inputError]}
            placeholder="Monthly Income (₹)"
            value={formData.income}
            onChangeText={(text) => handleChange("income", text)}
            keyboardType="numeric"
          />
          {errors.income && <Text style={styles.errorText}>{errors.income}</Text>}

          <TextInput
            style={[styles.modalInput, errors.costNeeded && styles.inputError]}
            placeholder="Financial Assistance Needed (₹)"
            value={formData.costNeeded}
            onChangeText={(text) => handleChange("costNeeded", text)}
            keyboardType="numeric"
          />
          {errors.costNeeded && <Text style={styles.errorText}>{errors.costNeeded}</Text>}

          <Text style={styles.modalLabel}>Documents</Text>

          <TextInput
            style={[styles.modalInput, errors.panCardNumber && styles.inputError]}
            placeholder="PAN Card Number"
            value={formData.panCardNumber}
            onChangeText={(text) => handleChange("panCardNumber", text)}
          />
          {errors.panCardNumber && <Text style={styles.errorText}>{errors.panCardNumber}</Text>}

          <TextInput
            style={[styles.modalInput, errors.aadhaarNumber && styles.inputError]}
            placeholder="Aadhaar Number"
            value={formData.aadhaarNumber}
            onChangeText={(text) => handleChange("aadhaarNumber", text)}
          />
          {errors.aadhaarNumber && <Text style={styles.errorText}>{errors.aadhaarNumber}</Text>}

          <TouchableOpacity 
            style={[styles.checkboxContainer, errors.terms && styles.checkboxError]} 
            onPress={toggleTermsAccepted}
          >
            <Ionicons 
              name={termsAccepted ? "checkbox-outline" : "square-outline"} 
              size={24} 
              color={termsAccepted ? "#e91e63" : "#666"} 
            />
            <Text style={styles.termsText}>
              I confirm that all the information provided is accurate and true.
            </Text>
          </TouchableOpacity>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                !termsAccepted && styles.disabledButton
              ]} 
              onPress={handleSubmit}
              disabled={!termsAccepted}
            >
              <Text style={styles.buttonText}>Submit Application</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <Modal isVisible={isModalVisible} animationIn="zoomIn" animationOut="zoomOut">
        <View style={styles.modalContent}>
          <Ionicons name="checkmark-circle" size={60} color="#e91e63" style={{ marginBottom: 20 }} />
          <Text style={styles.modalTitle}>Application Submitted!</Text>
          <Text style={styles.modalValue}>
            Thank you for submitting your application for financial assistance. We will review your
            information and get back to you shortly.
          </Text>
          <TouchableOpacity style={styles.submitButton} onPress={toggleModal}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
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
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 10,
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
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
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
    marginVertical: 8,
    color: "#333",
  },
  modalValue: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#e91e63",
    borderWidth: 1,
  },
  errorText: {
    color: "#e91e63",
    fontSize: 12,
    marginBottom: 12,
    marginTop: -4,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 8,
  },
  checkboxError: {
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    borderRadius: 8,
  },
  termsText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 40,
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
  disabledButton: {
    backgroundColor: "#e0e0e0",
    elevation: 0,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});