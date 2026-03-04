// App.js
import React, { useEffect } from "react";
import { SafeAreaView, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./screens/HomeScreen";
import AddCosplayScreen from "./screens/AddCosplayScreen";
import EditCosplayScreen from "./screens/EditCosplayScreen";

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // On web, ensure the root document can scroll so the FlatList
    // (which renders as a plain div) doesn't get clipped.
    if (Platform.OS === "web") {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Cosplay Tracker"
          screenOptions={{
            headerStyle: { backgroundColor: "#6366f1" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        >
          <Stack.Screen
            name="Cosplay Tracker"
            component={HomeScreen}
            options={{ title: "🧵 Cosplay Expenditure Tracker" }}
          />
          <Stack.Screen
            name="Add Cosplay"
            component={AddCosplayScreen}
            options={{ title: "Add New Cosplay" }}
          />
          <Stack.Screen
            name="Edit Cosplay"
            component={EditCosplayScreen}
            options={{ title: "Edit Cosplay" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}