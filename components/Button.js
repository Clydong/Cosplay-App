// components/Button.js
import React from "react";
import { TouchableOpacity, Text } from "react-native";

const BG_MAP = {
  "bg-green-500": "#16a34a",
  "bg-blue-500": "#2563eb",
  "bg-red-500": "#dc2626",
  "bg-yellow-500": "#f59e0b",
  "bg-indigo-500": "#6366f1",
};

export default function Button({ title, onPress, bgColor = "bg-blue-500", style }) {
  const backgroundColor = BG_MAP[bgColor] || "#2563eb";
  return (
    <TouchableOpacity
      onPress={() => {
        console.log("Button pressed:", title);
        try {
          if (typeof onPress === "function") onPress();
        } catch (err) {
          console.error("Button onPress threw:", err);
        }
      }}
      accessibilityRole="button"
      style={[
        { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor },
        style,
      ]}
    >
      <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>{title}</Text>
    </TouchableOpacity>
  );
}