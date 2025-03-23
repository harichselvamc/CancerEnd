import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, FAB, IconButton } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

export function MedicineScreen() {
  const [meds, setMeds] = useState([]);
  const [medName, setMedName] = useState("");
  const [buyDate, setBuyDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [totalTablets, setTotalTablets] = useState("");
  const [perDayDose, setPerDayDose] = useState("");
  const [showBuyPicker, setShowBuyPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  useEffect(() => {
    loadMeds();
  }, []);

  // Load stored medicines
  const loadMeds = async () => {
    try {
      const storedMeds = await AsyncStorage.getItem("meds");
      if (storedMeds) setMeds(JSON.parse(storedMeds));
    } catch (error) {
      Alert.alert("Error", "Failed to load medicines.");
    }
  };

  // Calculate remaining tablets and days to end
  const calculateMedicineDetails = (buyDate, expiryDate, totalTablets, perDayDose) => {
    const today = new Date();
    const buyDateObj = new Date(buyDate);
    const expiryDateObj = new Date(expiryDate);

    // Check if the medicine has expired
    if (today > expiryDateObj) {
      return { status: "Expired", remainingTablets: 0, daysToEnd: 0 };
    }

    // Calculate days passed since buy date
    const timeDiff = today - buyDateObj;
    const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Calculate remaining tablets
    const consumedTablets = daysPassed * perDayDose;
    const remainingTablets = Math.max(totalTablets - consumedTablets, 0);

    // Calculate days to end
    const daysToEnd = Math.ceil(remainingTablets / perDayDose);

    // Check if out of stock
    if (remainingTablets <= 0) {
      return { status: "Out of Stock", remainingTablets: 0, daysToEnd: 0 };
    }

    return { status: "Active", remainingTablets, daysToEnd };
  };

  // Add new medicine
  const addMed = async () => {
    if (medName.trim().length === 0 || totalTablets.trim().length === 0 || perDayDose.trim().length === 0) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    const newMed = {
      id: Date.now(),
      name: medName,
      buyDate: buyDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      totalTablets: parseInt(totalTablets),
      perDayDose: parseInt(perDayDose),
    };

    const updatedMeds = [...meds, newMed];
    setMeds(updatedMeds);
    await AsyncStorage.setItem("meds", JSON.stringify(updatedMeds));

    setMedName("");
    setTotalTablets("");
    setPerDayDose("");
  };

  // Delete medicine
  const deleteMed = async (id) => {
    Alert.alert("Delete Medicine?", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const updatedMeds = meds.filter((m) => m.id !== id);
          setMeds(updatedMeds);
          await AsyncStorage.setItem("meds", JSON.stringify(updatedMeds));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>💊 Medicine Tracker</Text>
      </View>

      {/* Scrollable Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Medicine Input */}
          <Card style={styles.inputCard}>
            <Text style={styles.inputLabel}>Medicine Name</Text>
            <TextInput
              placeholder="Enter medicine name"
              value={medName}
              onChangeText={setMedName}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Total Tablets</Text>
            <TextInput
              placeholder="Enter total tablets"
              value={totalTablets}
              onChangeText={setTotalTablets}
              keyboardType="numeric"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Per Day Dose</Text>
            <TextInput
              placeholder="Enter per day dose"
              value={perDayDose}
              onChangeText={setPerDayDose}
              keyboardType="numeric"
              style={styles.input}
            />

            {/* Buy Date Picker */}
            <Text style={styles.inputLabel}>Buy Date</Text>
            <TouchableOpacity onPress={() => setShowBuyPicker(true)} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>{buyDate.toDateString()}</Text>
            </TouchableOpacity>
            {showBuyPicker && (
              <DateTimePicker
                value={buyDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowBuyPicker(false);
                  if (date) setBuyDate(date);
                }}
              />
            )}

            {/* Expiry Date Picker */}
            <Text style={styles.inputLabel}>Expiry Date</Text>
            <TouchableOpacity onPress={() => setShowExpiryPicker(true)} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>{expiryDate.toDateString()}</Text>
            </TouchableOpacity>
            {showExpiryPicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowExpiryPicker(false);
                  if (date) setExpiryDate(date);
                }}
              />
            )}

            <FAB icon="plus" label="Add Medicine" onPress={addMed} style={styles.fabAdd} />
          </Card>

          {/* Medicine List */}
          {meds.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="medkit-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>No medicines added. Add one! 📅</Text>
            </View>
          ) : (
            <FlatList
              data={meds}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const { status, remainingTablets, daysToEnd } = calculateMedicineDetails(
                  item.buyDate,
                  item.expiryDate,
                  item.totalTablets,
                  item.perDayDose
                );

                return (
                  <Card style={styles.medicineCard}>
                    <View style={styles.medicineRow}>
                      <View style={styles.medicineDetails}>
                        <Text style={styles.medicineText}>{item.name}</Text>
                        <View style={styles.statusBadge}>
                          <Text
                            style={[
                              styles.statusText,
                              status === "Expired" && styles.expiredStatus,
                              status === "Out of Stock" && styles.outOfStockStatus,
                              status === "Active" && styles.activeStatus,
                            ]}
                          >
                            {status}
                          </Text>
                        </View>
                        <Text style={styles.detailsText}>🛒 Buy Date: {new Date(item.buyDate).toDateString()}</Text>
                        <Text style={styles.detailsText}>⏳ Expiry Date: {new Date(item.expiryDate).toDateString()}</Text>
                        <Text style={styles.detailsText}>💊 Total: {item.totalTablets}</Text>
                        <Text style={styles.detailsText}>🔄 Per Day: {item.perDayDose}</Text>
                        <Text style={styles.detailsText}>✅ Remaining: {remainingTablets}</Text>
                        {status === "Active" && (
                          <Text style={styles.detailsText}>⏰ Days to End: {daysToEnd}</Text>
                        )}
                      </View>
                      <IconButton
                        icon="delete"
                        size={24}
                        color="#ff4444"
                        onPress={() => deleteMed(item.id)}
                        style={styles.deleteIcon}
                      />
                    </View>
                  </Card>
                );
              }}
              scrollEnabled={false} // Disable FlatList's internal scroll
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Action Button */}
      <FAB icon="plus" label="Add Medicine" onPress={addMed} style={styles.fab} />
    </SafeAreaView>
  );
}

// Styling with the theme
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
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
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 100 },
  inputCard: { padding: 20, backgroundColor: "white", borderRadius: 15, marginBottom: 20, elevation: 3 },
  inputLabel: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 15 },
  dateButton: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 15 },
  dateButtonText: { fontSize: 16, color: "#333" },
  fabAdd: { backgroundColor: "#e91e63", marginTop: 10 },
  medicineCard: { padding: 20, marginBottom: 15, backgroundColor: "white", borderRadius: 15, elevation: 3 },
  medicineRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  medicineDetails: { flex: 1 },
  medicineText: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10 },
  statusBadge: { backgroundColor: "#eee", padding: 5, borderRadius: 5, alignSelf: "flex-start", marginBottom: 10 },
  statusText: { fontSize: 14, fontWeight: "bold" },
  activeStatus: { color: "#28a745" },
  outOfStockStatus: { color: "#ff4444" },
  expiredStatus: { color: "#888" },
  detailsText: { fontSize: 14, color: "#555", marginTop: 5 },
  deleteIcon: { marginLeft: 10 },
  emptyStateContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyStateText: { fontSize: 16, color: "#888", marginTop: 10 },
  fab: { position: "absolute", bottom: 30, right: 20, backgroundColor: "#e91e63" },
});
