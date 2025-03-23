import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Modal,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const sampleMedicines = [
  {
    id: "1",
    name: "Paracetamol",
    amount: "500mg",
    time: "08:00 AM",
    beforeFood: true,
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png" },
  },
  {
    id: "2",
    name: "Vitamin C",
    amount: "1000mg",
    time: "12:00 PM",
    beforeFood: false,
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" },
  },
  {
    id: "3",
    name: "Amoxicillin",
    amount: "250mg",
    time: "06:00 PM",
    beforeFood: true,
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png" },
  },
];

export function MedicineReminderScreen() {
  const [medicines, setMedicines] = useState([]);
  const [completedPills, setCompletedPills] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    amount: "",
    time: "",
    beforeFood: true,
  });

  useEffect(() => {
    loadMedicineData();
    scheduleNotifications();
  }, []);

  const loadMedicineData = async () => {
    try {
      const storedMedicines = await AsyncStorage.getItem("medicines");
      if (storedMedicines) {
        setMedicines(JSON.parse(storedMedicines));
      } else {
        setMedicines(sampleMedicines);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load medicine data.");
    }
  };

  const scheduleNotifications = async () => {
    for (let medicine of sampleMedicines) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💊 Medicine Reminder",
          body: `It's time to take ${medicine.name} (${medicine.amount})`,
          sound: "default",
        },
        trigger: { hour: parseInt(medicine.time.split(":")[0]), minute: parseInt(medicine.time.split(":")[1]) },
      });
    }
  };

  const markAsTaken = (id, status) => {
    const updatedCompletedPills = [...completedPills, { id, status }];
    setCompletedPills(updatedCompletedPills);
  };

  const addNewMedicine = async () => {
    if (!newMedicine.name || !newMedicine.amount || !newMedicine.time) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const newMed = {
      id: String(Date.now()),
      ...newMedicine,
      icon: { uri: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png" },
    };

    const updatedMedicines = [...medicines, newMed];
    setMedicines(updatedMedicines);
    await AsyncStorage.setItem("medicines", JSON.stringify(updatedMedicines));
    setIsModalVisible(false);
    setNewMedicine({ name: "", amount: "", time: "", beforeFood: true });
  };

  const getTodaysSchedule = () => {
    return medicines.filter((medicine) => !completedPills.some((pill) => pill.id === medicine.id));
  };

  const getUpcomingMedicines = () => {
    return medicines.filter((medicine) => !completedPills.some((pill) => pill.id === medicine.id));
  };

  const getDailyReview = () => {
    return completedPills;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>💊 Medicine Reminder</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add New Reminder</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Today's Schedule</Text>
      <FlatList
        data={getTodaysSchedule()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.medicineCard}>
            <Image source={item.icon} style={styles.pillIcon} />
            <View style={styles.details}>
              <Text style={styles.medicineName}>{item.name} ({item.amount})</Text>
              <Text style={styles.medicineTime}>⏰ {item.time}</Text>
              <Text style={styles.foodInfo}>
                {item.beforeFood ? "🍽 Before Food" : "🥗 After Food"}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => markAsTaken(item.id, "Taken")}>
                <Ionicons name="checkmark-circle" size={28} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => markAsTaken(item.id, "Skipped")}>
                <Ionicons name="close-circle" size={28} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Upcoming Medicines</Text>
      <FlatList
        data={getUpcomingMedicines()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.upcomingMedicineCard}>
            <Text style={styles.medicineName}>{item.name}</Text>
            <Text style={styles.medicineTime}>⏰ {item.time}</Text>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Daily Review</Text>
      <FlatList
        data={getDailyReview()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <Text style={styles.medicineName}>
              {medicines.find((m) => m.id === item.id)?.name}
            </Text>
            <Text style={styles.medicineTime}>
              {item.status === "Taken" ? "✅ Taken" : "❌ Skipped"}
            </Text>
          </View>
        )}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Reminder</Text>
            <TextInput
              style={styles.input}
              placeholder="Medicine Name"
              value={newMedicine.name}
              onChangeText={(text) => setNewMedicine({ ...newMedicine, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount (e.g., 500mg)"
              value={newMedicine.amount}
              onChangeText={(text) => setNewMedicine({ ...newMedicine, amount: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Time (e.g., 08:00 AM)"
              value={newMedicine.time}
              onChangeText={(text) => setNewMedicine({ ...newMedicine, time: text })}
            />
            <View style={styles.toggleContainer}>
              <Text>Before Food?</Text>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setNewMedicine({ ...newMedicine, beforeFood: !newMedicine.beforeFood })}
              >
                <Text>{newMedicine.beforeFood ? "Yes" : "No"}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
              <Button title="Add" onPress={addNewMedicine} />
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
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#007bff",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  medicineCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  pillIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  details: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  medicineTime: {
    fontSize: 14,
    color: "#555",
  },
  foodInfo: {
    fontSize: 14,
    color: "#007bff",
  },
  actions: {
    flexDirection: "row",
  },
  upcomingMedicineCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewCard: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});