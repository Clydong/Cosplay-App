// components/Button.js
import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const VARIANT_CONFIG = {
  primary: (theme) => ({
    bg: theme.primary,
    text: theme.textInvert,
    border: "transparent",
  }),
  secondary: (theme) => ({
    bg: theme.secondary,
    text: theme.textInvert,
    border: "transparent",
  }),
  success: (theme) => ({
    bg: theme.success,
    text: theme.textInvert,
    border: "transparent",
  }),
  warning: (theme) => ({
    bg: theme.warning,
    text: theme.textInvert,
    border: "transparent",
  }),
  danger: (theme) => ({
    bg: theme.danger,
    text: theme.textInvert,
    border: "transparent",
  }),
  outline: (theme) => ({
    bg: "transparent",
    text: theme.primary,
    border: theme.primary,
  }),
  ghost: (theme) => ({
    bg: "transparent",
    text: theme.primary,
    border: "transparent",
  }),
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  fullWidth = false,
}) {
  const { theme, spacing, borderRadius, shadows, fontSize, fontWeight } = useTheme();
  const [pressed, setPressed] = useState(false);

  const config = VARIANT_CONFIG[variant]?.(theme) || VARIANT_CONFIG.primary(theme);

  // Size configurations
  const sizeConfig = {
    sm: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      fontSize: fontSize.sm,
    },
    md: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      fontSize: fontSize.base,
    },
    lg: {
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[3],
      fontSize: fontSize.lg,
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  const opacity = disabled ? 0.5 : pressed ? 0.8 : 1;
  const backgroundColor = disabled ? theme.textTertiary : config.bg;

  return (
    <TouchableOpacity
      onPress={() => {
        if (disabled) return;
        try {
          if (typeof onPress === "function") onPress();
        } catch (err) {
          console.error("Button onPress threw:", err);
        }
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        {
          ...currentSize,
          borderRadius: borderRadius.lg,
          backgroundColor,
          borderWidth: config.border === "transparent" ? 0 : 2,
          borderColor: config.border,
          opacity,
          width: fullWidth ? "100%" : "auto",
          alignItems: "center",
          justifyContent: "center",
          ...shadows.md,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: disabled ? theme.textTertiary : config.text,
          fontSize: currentSize.fontSize,
          fontWeight: fontWeight.semibold,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}