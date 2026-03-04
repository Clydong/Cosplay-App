// App.js
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

import HomeScreen from "./screens/HomeScreen";
import AddCosplayScreen from "./screens/AddCosplayScreen";
import EditCosplayScreen from "./screens/EditCosplayScreen";

const Stack = createStackNavigator();

function AppNavigator() {
  console.log('AppNavigator running');
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Cosplay Tracker"
        screenOptions={{
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () => <ThemeToggle />,
          headerRightContainerStyle: { paddingRight: 16 },
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
  );
}

export default function App() {
  console.log('App root rendering');
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}