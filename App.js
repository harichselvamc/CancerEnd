import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { PaperProvider } from "react-native-paper"; 

import { HomeScreen } from "./screens/HomeScreen";
import { ToDoScreen } from "./screens/ToDoScreen";
import { MedicineScreen } from "./screens/MedicineScreen";
import { ReminderScreen } from "./screens/ReminderScreen";
import { AIChatScreen } from "./screens/AIChatScreen";
import { TravelScreen } from "./screens/TravelScreen";
import { FinancialAssistanceScreen } from "./screens/FinancialAssistanceScreen";
import { MedicalRecordsScreen } from "./screens/MedicalRecordsScreen";
import { HealthInsightsScreen } from "./screens/HealthInsightsScreen"; 
import { CaregiverScreen } from "./screens/CaregiverScreen";
import { MedicineReminderScreen } from "./screens/MedicineReminderScreen"; 
const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider> 
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ToDo" component={ToDoScreen} />
          <Stack.Screen name="Medicine" component={MedicineScreen} />
          <Stack.Screen name="Reminder" component={ReminderScreen} />
          <Stack.Screen name="AIChat" component={AIChatScreen} />
          <Stack.Screen name="Travel" component={TravelScreen} />
          <Stack.Screen name="FinancialAssistance" component={FinancialAssistanceScreen} />
          <Stack.Screen name="MedicalRecords" component={MedicalRecordsScreen} />
          <Stack.Screen name="HealthInsights" component={HealthInsightsScreen} />
          <Stack.Screen name="Caregiver" component={CaregiverScreen} />
          <Stack.Screen name="MedicineReminder" component={MedicineReminderScreen} /> 
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
