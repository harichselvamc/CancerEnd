import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

export function HealthInsightsScreen() {
  // Mock health data
  const [healthData, setHealthData] = useState({
    steps: 7523,
    caloriesBurned: 450,
    heartRate: 72,
    sleepDuration: 6.5, // in hours
  });

  // Mock weekly steps data for the chart
  const [weeklyStepsData, setWeeklyStepsData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [5000, 7000, 8000, 6000, 9000, 10000, 12000],
        color: (opacity = 1) => `rgba(233, 30, 99, ${opacity})`, // Pink (#e91e63)
        strokeWidth: 2,
      },
    ],
  });

  // Refresh mock data (for demonstration purposes)
  const refreshHealthData = () => {
    const newSteps = Math.floor(Math.random() * 12000) + 1000; // Random steps between 1000 - 12000
    const newCaloriesBurned = Math.floor(Math.random() * 800) + 200; // 200 - 1000 kcal
    const newHeartRate = Math.floor(Math.random() * 40) + 60; // 60 - 100 bpm
    const newSleepDuration = (Math.random() * 4 + 4).toFixed(1); // 4 - 8 hrs

    // Update health data
    setHealthData({
      steps: newSteps,
      caloriesBurned: newCaloriesBurned,
      heartRate: newHeartRate,
      sleepDuration: newSleepDuration,
    });

    // Update weekly steps data
    const newWeeklySteps = weeklyStepsData.datasets[0].data.map(() =>
      Math.floor(Math.random() * 12000) + 1000
    );
    setWeeklyStepsData({
      ...weeklyStepsData,
      datasets: [
        {
          ...weeklyStepsData.datasets[0],
          data: newWeeklySteps,
        },
      ],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Health Insights</Text>
        <TouchableOpacity style={styles.headerButton} onPress={refreshHealthData}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeIcon}>
          <Ionicons name="analytics-outline" size={50} color="white" />
        </View>
        <Text style={styles.welcomeTitle}>Your Health at a Glance</Text>
        <Text style={styles.welcomeText}>
          Monitor your daily activity, track your progress, and achieve your fitness goals.
        </Text>
      </View>

      {/* Health Metrics */}
      <View style={styles.listContainer}>
        <TouchableOpacity style={styles.modalContent} onPress={refreshHealthData}>
          <Text style={styles.modalTitle}>Steps</Text>
          <Text style={styles.modalValue}>{healthData.steps}</Text>
          <ProgressBar
            progress={healthData.steps / 10000} // Assuming 10,000 steps is the goal
            color="#e91e63"
            style={styles.progressBar}
          />
          <Text style={styles.errorText}>
            {((healthData.steps / 10000) * 100).toFixed(1)}% of daily goal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modalContent} onPress={refreshHealthData}>
          <Text style={styles.modalTitle}>Calories Burned</Text>
          <Text style={styles.modalValue}>{healthData.caloriesBurned} kcal</Text>
          <ProgressBar
            progress={healthData.caloriesBurned / 800} // Assuming 800 kcal is the goal
            color="#e91e63"
            style={styles.progressBar}
          />
          <Text style={styles.errorText}>
            {((healthData.caloriesBurned / 800) * 100).toFixed(1)}% of daily goal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modalContent} onPress={refreshHealthData}>
          <Text style={styles.modalTitle}>Heart Rate</Text>
          <Text style={styles.modalValue}>{healthData.heartRate} bpm</Text>
          <Text style={[styles.errorText, { textAlign: 'center' }]}>
            {healthData.heartRate < 60
              ? "Low"
              : healthData.heartRate > 100
              ? "High"
              : "Normal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modalContent} onPress={refreshHealthData}>
          <Text style={styles.modalTitle}>Sleep Duration</Text>
          <Text style={styles.modalValue}>{healthData.sleepDuration} hrs</Text>
          <ProgressBar
            progress={healthData.sleepDuration / 8} // Assuming 8 hrs is the goal
            color="#e91e63"
            style={styles.progressBar}
          />
          <Text style={styles.errorText}>
            {((healthData.sleepDuration / 8) * 100).toFixed(1)}% of daily goal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Steps Chart */}
      <View style={[styles.modalContent, { margin: 16 }]}>
        <Text style={styles.modalTitle}>Weekly Steps</Text>
        <LineChart
          data={weeklyStepsData}
          width={width - 70}
          height={220}
          yAxisSuffix=" steps"
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(233, 30, 99, ${opacity})`, // Pink
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#e91e63",
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={refreshHealthData}>
          <Text style={styles.buttonText}>Refresh All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  listContainer: {
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 16,
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
  modalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    width: "100%",
    marginTop: 10,
    borderRadius: 4,
  },
  errorText: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
  },
  chart: {
    borderRadius: 12,
    marginTop: 10,
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

export default HealthInsightsScreen;