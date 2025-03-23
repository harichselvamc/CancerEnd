import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";

export function WebPreviewScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { url } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Website Preview</Text>
        <TouchableOpacity onPress={() => Linking.openURL(url)}>
          <Ionicons name="open-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>
      <WebView source={{ uri: url }} style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#007bff",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
