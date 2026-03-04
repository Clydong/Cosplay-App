import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.primary }]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 18, color: theme.text }}>
        {isDarkMode ? "☀️" : "🌙"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
});
