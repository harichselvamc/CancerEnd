import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Switch,
  SectionList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB, Card, IconButton } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

// Sample Reminders
const sampleReminders = [
  {
    id: "1",
    text: "Doctor's Appointment",
    description: "Annual check-up at the clinic",
    time: "08:00 AM",
    type: "Meeting",
  },
  {
    id: "2",
    text: "Take Paracetamol",
    description: "500mg, before food",
    time: "12:00 PM",
    type: "Medicine",
    beforeFood: true,
  },
  {
    id: "3",
    text: "Buy Groceries",
    description: "List of groceries needed",
    time: "06:00 PM",
    type: "Notes",
  },
];

export function ReminderScreen() {
  const [reminders, setReminders] = useState([]);
  const [reminderText, setReminderText] = useState("");
  const [reminderDescription, setReminderDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reminderType, setReminderType] = useState("Notes"); // Default to Notes
  const [beforeFood, setBeforeFood] = useState(true); // Default to before food for medicines
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode toggle
  const [collapsedSections, setCollapsedSections] = useState({}); // Track collapsed sections

  useEffect(() => {
    loadReminders();
    requestNotificationPermissions();
  }, []);

  // Request Notification Permissions
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      await Notifications.requestPermissionsAsync();
    }
  };

  // Load stored reminders
  const loadReminders = async () => {
    try {
      const storedReminders = await AsyncStorage.getItem("reminders");
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      } else {
        setReminders(sampleReminders);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load reminders.");
    }
  };

  // Schedule Notification for custom reminders
  const scheduleReminder = async (text, date) => {
    const trigger = new Date(date);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Reminder Alert!",
        body: text,
        sound: "default",
      },
      trigger,
    });

    // Trigger Vibration for feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Add Custom Reminder
  const addReminder = async () => {
    if (reminderText.trim().length === 0 || reminderDescription.trim().length === 0) {
      Alert.alert("Error", "Reminder text and description cannot be empty!");
      return;
    }

    const newReminder = {
      id: Date.now(),
      text: reminderText,
      description: reminderDescription,
      time: selectedDate.toISOString(),
      type: reminderType,
      beforeFood: reminderType === "Medicine" ? beforeFood : undefined,
    };

    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    await AsyncStorage.setItem("reminders", JSON.stringify(updatedReminders));

    // Schedule Notification for custom reminder
    scheduleReminder(reminderText, selectedDate);
    setReminderText("");
    setReminderDescription("");
    setIsModalVisible(false); // Close modal after adding
  };

  // Delete Reminder
  const deleteReminder = async (id) => {
    Alert.alert("Delete Reminder?", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const updatedReminders = reminders.filter((r) => r.id !== id);
          setReminders(updatedReminders);
          await AsyncStorage.setItem("reminders", JSON.stringify(updatedReminders));
        },
      },
    ]);
  };

  // Group reminders by type
  const groupedReminders = reminders.reduce((acc, reminder) => {
    if (!acc[reminder.type]) {
      acc[reminder.type] = [];
    }
    acc[reminder.type].push(reminder);
    return acc;
  }, {});

  // Convert grouped reminders into SectionList format
  const sectionData = Object.keys(groupedReminders).map((type) => ({
    title: type,
    data: groupedReminders[type],
  }));

  // Toggle section collapse
  const toggleSection = (type) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Render section header
  const renderSectionHeader = ({ section: { title } }) => (
    <TouchableOpacity onPress={() => toggleSection(title)} style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderText, isDarkMode && styles.darkText]}>
        {title} ({groupedReminders[title].length})
      </Text>
      <Text style={[styles.sectionHeaderText, isDarkMode && styles.darkText]}>
        {collapsedSections[title] ? "▼" : "▲"}
      </Text>
    </TouchableOpacity>
  );

  // Render reminder item
  const renderReminderItem = ({ item }) => (
    <Card style={[styles.reminderCard, isDarkMode && styles.darkCard]}>
      <View style={styles.reminderRow}>
        <View style={styles.reminderDetails}>
          <Text style={[styles.reminderText, isDarkMode && styles.darkText]}>
            {item.type === "Meeting" ? `📅 ${item.text}` : item.text}
          </Text>
          <Text style={[styles.detailsText, isDarkMode && styles.darkText]}>
            {item.description}
          </Text>
          <Text style={[styles.detailsText, isDarkMode && styles.darkText]}>
            🕒 Time: {new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
          {item.type === "Medicine" && (
            <Text style={[styles.detailsText, isDarkMode && styles.darkText]}>
              {item.beforeFood ? "🍴 Before Food" : "🍴 After Food"}
            </Text>
          )}
        </View>
        <IconButton icon="delete" size={24} color="#ff4444" onPress={() => deleteReminder(item.id)} />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#333" : "#f5f5f5"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.scrollContent}>
          {/* Updated Header Style */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>⏰ Set Reminder</Text>
          </View>

          {/* Theme Toggle */}
          <View style={styles.themeToggle}>
            <Text style={[styles.themeToggleText, isDarkMode && styles.darkText]}>Dark Mode</Text>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>

          {/* Grouped Reminders */}
          <SectionList
            sections={sectionData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReminderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.sectionList}
            extraData={collapsedSections}
            initialNumToRender={10}
            removeClippedSubviews={true}
          />
        </View>
      </KeyboardAvoidingView>

      {/* FAB for Adding Reminders */}
      <FAB icon="plus" label="Add Reminder" onPress={() => setIsModalVisible(true)} style={styles.fabAdd} />

      {/* Modal for Adding Reminders */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <Card style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Add New Reminder</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Enter reminder title..."
              placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
              value={reminderText}
              onChangeText={setReminderText}
            />
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Enter reminder description..."
              placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
              value={reminderDescription}
              onChangeText={setReminderDescription}
            />
            {/* Reminder Type Selection */}
            <View style={styles.pickerContainer}>
              <Text style={[styles.pickerLabel, isDarkMode && styles.darkText]}>Reminder Type:</Text>
              <View style={styles.picker}>
                <TouchableOpacity onPress={() => setReminderType("Medicine")} style={[styles.pickerButton, isDarkMode && styles.darkButton]}>
                  <Text style={[styles.pickerButtonText, isDarkMode && styles.darkText]}>Medicine</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setReminderType("Meeting")} style={[styles.pickerButton, isDarkMode && styles.darkButton]}>
                  <Text style={[styles.pickerButtonText, isDarkMode && styles.darkText]}>Meeting</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setReminderType("Notes")} style={[styles.pickerButton, isDarkMode && styles.darkButton]}>
                  <Text style={[styles.pickerButtonText, isDarkMode && styles.darkText]}>Notes</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Conditional Fields for Medicine */}
            {reminderType === "Medicine" && (
              <View style={styles.foodTimeContainer}>
                <Text style={[styles.pickerLabel, isDarkMode && styles.darkText]}>When to take:</Text>
                <TouchableOpacity
                  onPress={() => setBeforeFood(true)}
                  style={[styles.foodButton, beforeFood && styles.selectedFoodButton, isDarkMode && styles.darkButton]}
                >
                  <Text style={[styles.foodButtonText, isDarkMode && styles.darkText]}>Before Food</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setBeforeFood(false)}
                  style={[styles.foodButton, !beforeFood && styles.selectedFoodButton, isDarkMode && styles.darkButton]}
                >
                  <Text style={[styles.foodButtonText, isDarkMode && styles.darkText]}>After Food</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Time Picker */}
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
              <Text style={[styles.dateButtonText, isDarkMode && styles.darkText]}>
                {selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selected) => {
                  setShowPicker(false);
                  if (selected) setSelectedDate(selected);
                }}
              />
            )}

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addReminder} style={[styles.modalButton, styles.addButton]}>
                <Text style={styles.modalButtonText}>Add Reminder</Text>
              </TouchableOpacity>
            </View>
          </Card>
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
  darkContainer: {
    backgroundColor: "#333",
  },
  headerContainer: {
    backgroundColor: "#e91e63",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  darkText: {
    color: "white",
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  themeToggleText: {
    fontSize: 16,
    color: "#e91e63",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  darkCard: {
    backgroundColor: "#444",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#e91e63",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e91e63",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  darkInput: {
    backgroundColor: "#555",
    borderColor: "#777",
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: "#e91e63",
  },
  picker: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e91e63",
    margin: 5,
  },
  pickerButtonText: {
    color: "#e91e63",
    fontWeight: "bold",
  },
  foodTimeContainer: {
    marginBottom: 10,
  },
  foodButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e91e63",
    margin: 5,
  },
  selectedFoodButton: {
    backgroundColor: "#e91e63",
  },
  foodButtonText: {
    color: "#e91e63",
    fontWeight: "bold",
  },
  dateButton: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#e91e63",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: "48%",
  },
  cancelButton: {
    backgroundColor: "#ddd",
  },
  addButton: {
    backgroundColor: "#e91e63",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  fabAdd: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#e91e63",
  },
  reminderCard: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  reminderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reminderDetails: {
    flex: 1,
  },
  reminderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detailsText: {
    fontSize: 14,
    color: "#777",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e91e63",
  },
  flex: {
    flex: 1,
  },
  sectionList: {
    paddingBottom: 80,
  },
});

export default ReminderScreen;
