import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

export function ToDoScreen() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState(new Date());
  const [category, setCategory] = useState("Personal");
  const [inputError, setInputError] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    } catch (error) {
      Alert.alert("Error", "Failed to load tasks.");
    }
  };

  const addTask = async () => {
    if (task.trim().length === 0) {
      setInputError(true);
      return;
    }
    setInputError(false);

    const newTask = {
      id: Date.now(),
      text: task,
      description,
      priority,
      dueDate: dueDate.toISOString(),
      category,
      completed: false,
    };

    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    await AsyncStorage.setItem("tasks", JSON.stringify(newTasks));

    setTask("");
    setDescription("");
    setPriority("Low");
    setDueDate(new Date());
    setCategory("Personal");
  };

  const deleteTask = async (id) => {
    Alert.alert("Delete Task?", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const updatedTasks = tasks.filter((t) => t.id !== id);
          setTasks(updatedTasks);
          await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
        },
      },
    ]);
  };

  const toggleCompletion = async (id) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e91e63" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>📝 To-Do List</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Task Input Section */}
          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            style={styles.card}
          >
            <TextInput
              placeholder="Task title"
              value={task}
              onChangeText={setTask}
              style={[styles.input, inputError && styles.inputError]}
            />
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              multiline
            />

            <View style={styles.priorityContainer}>
              <Text style={styles.label}>Priority:</Text>
              {["Low", "Medium", "High"].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setPriority(level)}
                  style={[
                    styles.priorityButton,
                    priority === level && styles.selectedPriority,
                  ]}
                >
                  <Text style={styles.priorityText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={addTask} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Task List */}
          {tasks.length === 0 ? (
            <Text style={styles.emptyState}>No tasks yet. Add one! 🎉</Text>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Animatable.View
                  animation="fadeInUp"
                  duration={1000}
                  style={styles.card}
                >
                  <View style={styles.taskRow}>
                    <TouchableOpacity onPress={() => toggleCompletion(item.id)}>
                      <Ionicons
                        name={item.completed ? "checkbox-outline" : "square-outline"}
                        size={24}
                        color={item.completed ? "#e91e63" : "#ccc"}
                      />
                    </TouchableOpacity>
                    <View style={styles.taskDetails}>
                      <Text
                        style={[styles.taskText, item.completed && styles.completedTask]}
                      >
                        {item.text}
                      </Text>
                      <Text style={styles.taskDescription}>{item.description}</Text>
                      <Text style={styles.taskMeta}>
                        📅 {new Date(item.dueDate).toDateString()} | 🏷️ {item.category} | ⚡ {item.priority}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteTask(item.id)}>
                      <Ionicons name="trash" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </Animatable.View>
              )}
            />
          )}
        </View>
      </KeyboardAvoidingView>

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
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e91e63", 
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  priorityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  priorityButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#eee",
  },
  selectedPriority: {
    backgroundColor: "#e91e63",
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  emptyState: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskDetails: {
    flex: 1,
    marginLeft: 10,
  },
  taskText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  taskDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  taskMeta: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
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

export default ToDoScreen;
