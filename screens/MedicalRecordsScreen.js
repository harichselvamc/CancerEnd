import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Linking,
  Modal,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import * as IntentLauncher from "expo-intent-launcher";

const RECORDS_FOLDER = FileSystem.documentDirectory + "MedicalRecords/";

export function MedicalRecordsScreen() {
  const [records, setRecords] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [recordName, setRecordName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    ensureFolderExists();
    loadRecords();
  }, []);

  const ensureFolderExists = async () => {
    const folderInfo = await FileSystem.getInfoAsync(RECORDS_FOLDER);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(RECORDS_FOLDER, { intermediates: true });
    }
  };

  const loadRecords = async () => {
    try {
      const storedRecords = await AsyncStorage.getItem("medicalRecords");
      if (storedRecords) setRecords(JSON.parse(storedRecords));
    } catch (error) {
      Alert.alert("Error", "Failed to load records.");
    }
  };

  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
        setModalVisible(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  const saveRecord = async () => {
    if (!recordName.trim() || !selectedFile) {
      Alert.alert("Error", "Please enter a name and select a file.");
      return;
    }

    try {
      setIsUploading(true);

      const fileExtension = selectedFile.mimeType.split("/")[1];
      const uniqueFileName = `${recordName}_${Date.now()}.${fileExtension}`;
      const newFilePath = RECORDS_FOLDER + uniqueFileName;

      await FileSystem.copyAsync({
        from: selectedFile.uri,
        to: newFilePath,
      });

      const newRecord = {
        id: Date.now(),
        name: recordName,
        uri: newFilePath,
        fileType: selectedFile.mimeType || "Unknown Format",
        uploadDate: new Date().toLocaleString(),
      };

      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      await AsyncStorage.setItem("medicalRecords", JSON.stringify(updatedRecords));

      setModalVisible(false);
      setRecordName("");
      setSelectedFile(null);
    } catch (error) {
      Alert.alert("Error", "Failed to save file.");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteRecord = async (id, fileUri) => {
    Alert.alert("Delete Record?", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
          } catch (error) {
            console.warn("Failed to delete file:", error);
          }

          const updatedRecords = records.filter((r) => r.id !== id);
          setRecords(updatedRecords);
          await AsyncStorage.setItem("medicalRecords", JSON.stringify(updatedRecords));
        },
      },
    ]);
  };

  const openFile = async (fileUri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        Alert.alert("Error", "File not found.");
        return;
      }

      if (Platform.OS === "android") {
        const contentUri = await FileSystem.getContentUriAsync(fileUri);
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
        });
      } else {
        await Linking.openURL(fileUri);
      }
    } catch (error) {
      Alert.alert("Error", "Cannot open file.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>📂 Medical Records</Text>
      </View>

      {/* Medical Records List */}
      {records.length === 0 ? (
        <Text style={styles.emptyText}>No records uploaded yet.</Text>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openFile(item.uri)}>
              <View style={styles.recordInfo}>
                {item.fileType.includes("image") ? (
                  <Image source={{ uri: item.uri }} style={styles.filePreview} />
                ) : (
                  <Ionicons name="document-text-outline" size={40} color="#e91e63" />
                )}
                <View style={styles.details}>
                  <Text style={styles.recordName}>{item.name || "Unnamed Record"}</Text>
                  <Text style={styles.fileType}>📄 {item.fileType || "Unknown Format"}</Text>
                  <Text style={styles.uploadDate}>📅 {item.uploadDate || "Unknown Date"}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteRecord(item.id, item.uri)}>
                  <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Upload Button */}
      <TouchableOpacity style={styles.fab} onPress={pickDocument}>
        <Ionicons name="add-circle" size={60} color="#e91e63" />
      </TouchableOpacity>

      {/* Upload Modal */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalBackground}>
          <KeyboardAvoidingView behavior="padding" style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <Text style={styles.modalTitle}>Enter Record Name</Text>
              <TextInput
                placeholder="E.g. Blood Test Report"
                value={recordName}
                onChangeText={setRecordName}
                style={styles.modalInput}
              />
              {selectedFile?.mimeType.includes("image") && (
                <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
              )}
              <TouchableOpacity style={styles.saveButton} onPress={saveRecord} disabled={isUploading}>
                {isUploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Record</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
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
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
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
  recordInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  filePreview: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  recordName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  fileType: {
    fontSize: 14,
    color: "#e91e63",
    marginTop: 4,
  },
  uploadDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  scrollViewContainer: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#e91e63",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#e91e63",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
