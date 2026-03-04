import React, { createContext, useState, useContext } from "react";

// Typography system - professional and modern
export const typography = {
  // Font families (using system fonts for best performance)
  fontFamily: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
  },
  // Font sizes with consistent scale
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
  },
  // Font weights
  fontWeight: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// Spacing system
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
};

// Border radius system
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
};

// Shadow system for depth
export const shadows = {
  none: { shadowColor: "transparent", elevation: 0 },
  sm: { shadowColor: "rgba(0,0,0,0.05)", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: "rgba(0,0,0,0.1)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 6, elevation: 3 },
  lg: { shadowColor: "rgba(0,0,0,0.15)", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 15, elevation: 8 },
  xl: { shadowColor: "rgba(0,0,0,0.2)", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 1, shadowRadius: 25, elevation: 12 },
};

// Light theme with sophisticated purple and white palette
export const lightTheme = {
  // Backgrounds
  background: "#F8F9FB",
  surfaceLight: "#FFFFFF",
  surface: "#F3F4F6",
  surfaceDark: "#E5E7EB",
  
  // Primary colors - Premium purple
  primary: "#7C3AED",
  primaryLight: "#C4B5FD",
  primaryLighter: "#EDE9FE",
  primaryDark: "#6D28D9",
  primaryDarker: "#5B21B6",
  
  // Secondary colors
  secondary: "#06B6D4",
  secondaryLight: "#A5F3FC",
  secondaryDark: "#0891B2",
  
  // Status colors
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",
  
  // Text colors
  text: "#1F2937",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textInvert: "#FFFFFF",
  
  // Borders & dividers
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  divider: "#D1D5DB",
  
  // Input styling
  input: "#FFFFFF",
  inputBorder: "#E5E7EB",
  inputPlaceholder: "#9CA3AF",
  inputFocus: "#7C3AED",
  
  // Special elements
  badgeBg: "#FEF3C7",
  badgeText: "#92400E",
  
  // Shadows
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowDark: "rgba(0, 0, 0, 0.2)",
};

// Dark theme with premium purple tones
export const darkTheme = {
  // Backgrounds
  background: "#0F172A",
  surfaceLight: "#1E293B",
  surface: "#334155",
  surfaceDark: "#475569",
  
  // Primary colors - Premium light purple
  primary: "#A78BFA",
  primaryLight: "#DDD6FE",
  primaryLighter: "#F3E8FF",
  primaryDark: "#7C3AED",
  primaryDarker: "#6D28D9",
  
  // Secondary colors
  secondary: "#22D3EE",
  secondaryLight: "#06B6D4",
  secondaryDark: "#0891B2",
  
  // Status colors
  success: "#6EE7B7",
  successLight: "#064E3B",
  warning: "#FBBF24",
  warningLight: "#78350F",
  danger: "#F87171",
  dangerLight: "#7F1D1D",
  info: "#60A5FA",
  infoLight: "#1E3A8A",
  
  // Text colors
  text: "#F1F5F9",
  textSecondary: "#CBD5E1",
  textTertiary: "#94A3B8",
  textInvert: "#0F172A",
  
  // Borders & dividers
  border: "#334155",
  borderLight: "#475569",
  divider: "#1E293B",
  
  // Input styling
  input: "#1E293B",
  inputBorder: "#334155",
  inputPlaceholder: "#64748B",
  inputFocus: "#A78BFA",
  
  // Special elements
  badgeBg: "#1E293B",
  badgeText: "#FCD34D",
  
  // Shadows
  shadow: "rgba(0, 0, 0, 0.3)",
  shadowDark: "rgba(0, 0, 0, 0.5)",
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  console.log('ThemeProvider initialized');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Design tokens available for all components.  Spread the
  // individual typography groups so callers can destructure
  // `fontSize`, `fontWeight`, etc. directly (used throughout screens).
  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        theme: currentTheme,
        ...typography,    // fontSize, fontWeight, lineHeight, fontFamily
        spacing,
        borderRadius,
        shadows,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
