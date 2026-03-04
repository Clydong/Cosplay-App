// screens/EditCosplayScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Button from "../components/Button";
import placeholder from "../assets/placeholder.png";
import { useTheme } from "../contexts/ThemeContext";

function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function createItem() {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    cost: "",
    isChecked: false,
  };
}

export default function EditCosplayScreen({ route, navigation }) {
  const { theme, spacing, fontSize, fontWeight, borderRadius, shadows } = useTheme();
  const { cosplay } = route.params;

  const [characterName, setCharacterName] = useState(cosplay.characterName || "");
  const [deadline, setDeadline] = useState(cosplay.deadline || "");
  const [imageUrl, setImageUrl] = useState(cosplay.imageUrl || "");
  const [previewBroken, setPreviewBroken] = useState(false);

  // If the cosplay already has a location, show the address field by default
  const [showLocation, setShowLocation] = useState(!!cosplay.location);
  const [location, setLocation] = useState(cosplay.location || "");

  // Pre-populate existing items; convert numeric cost back to string for TextInput
  const [items, setItems] = useState(
    cosplay.items && cosplay.items.length > 0
      ? cosplay.items.map((item) => ({
          ...item,
          cost: String(item.cost ?? ""),
        }))
      : [createItem()]
  );

  const addItem = () => setItems((prev) => [...prev, createItem()]);

  const removeItem = (id) => {
    if (items.length === 1) {
      alert("At least one item is required.");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const totalCost = items.reduce(
    (sum, item) => sum + (parseFloat(item.cost) || 0),
    0
  );

  const updateCosplay = async () => {
    if (!characterName.trim()) {
      alert("Character name is required.");
      return;
    }
    if (!deadline.trim()) {
      alert("Deadline is required.");
      return;
    }
    if (!imageUrl.trim()) {
      alert("Image URL is required.");
      return;
    }
    if (!isValidHttpUrl(imageUrl)) {
      alert("Enter a valid image URL (must start with http/https).");
      return;
    }
    const invalidItem = items.find((item) => !item.name.trim());
    if (invalidItem) {
      alert("All item rows must have a name.");
      return;
    }

    const normalisedItems = items.map((item) => ({
      ...item,
      cost: parseFloat(item.cost) || 0,
    }));

    try {
      const cosplayRef = doc(db, "cosplays", cosplay.id);
      await updateDoc(cosplayRef, {
        characterName: characterName.trim(),
        deadline: deadline.trim(),
        imageUrl: imageUrl.trim(),
        location: showLocation ? location.trim() : "",
        items: normalisedItems,
      });
      alert("Cosplay updated!");
      navigation.goBack();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update cosplay: " + (err.message || err));
    }
  };

  const FormInput = ({ label, value, onChangeText, placeholder, ...props }) => (
    <View style={{ marginBottom: spacing[4] }}>
      <Text
        style={{
          fontSize: fontSize.sm,
          fontWeight: fontWeight.semibold,
          color: theme.text,
          marginBottom: spacing[2],
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: theme.input,
          borderWidth: 1.5,
          borderColor: theme.inputBorder,
          borderRadius: borderRadius.lg,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[3],
          fontSize: fontSize.base,
          color: theme.text,
          ...shadows.sm,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.inputPlaceholder}
        {...props}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[4],
          paddingBottom: spacing[8],
        }}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: fontSize["3xl"],
            fontWeight: fontWeight.bold,
            color: theme.primary,
            marginBottom: spacing[1],
          }}
        >
          Edit Cosplay
        </Text>
        <Text
          style={{
            fontSize: fontSize.base,
            color: theme.textSecondary,
            marginBottom: spacing[6],
          }}
        >
          Update your cosplay project details
        </Text>

        {/* Character Info Section */}
        <View
          style={{
            backgroundColor: theme.surfaceLight,
            borderRadius: borderRadius.xl,
            padding: spacing[4],
            marginBottom: spacing[6],
            ...shadows.md,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold,
              color: theme.primary,
              marginBottom: spacing[4],
            }}
          >
            Character Information
          </Text>

          <FormInput
            label="Character Name *"
            value={characterName}
            onChangeText={setCharacterName}
            placeholder="e.g. Himeko from Honkai: Star Rail"
          />

          <FormInput
            label="Deadline *"
            value={deadline}
            onChangeText={setDeadline}
            placeholder="e.g. 2025-08-15 or August 15"
          />

          <FormInput
            label="Image URL *"
            value={imageUrl}
            onChangeText={(text) => {
              setImageUrl(text);
              setPreviewBroken(false);
            }}
            placeholder="https://example.com/image.jpg"
            autoCapitalize="none"
          />

          {/* Image Preview */}
          {imageUrl && (
            <View
              style={{
                marginTop: spacing[3],
                borderRadius: borderRadius.lg,
                overflow: "hidden",
                ...shadows.md,
              }}
            >
              <Image
                source={previewBroken || !isValidHttpUrl(imageUrl) ? placeholder : { uri: imageUrl }}
                onError={() => setPreviewBroken(true)}
                style={{ width: "100%", height: 200 }}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        {/* Location Section */}
        <View
          style={{
            backgroundColor: theme.surfaceLight,
            borderRadius: borderRadius.xl,
            padding: spacing[4],
            marginBottom: spacing[6],
            ...shadows.md,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.bold,
                color: theme.text,
              }}
            >
              Location (Optional)
            </Text>
            {!showLocation && (
              <Button
                title="+ Add"
                variant="outline"
                size="sm"
                onPress={() => setShowLocation(true)}
              />
            )}
          </View>

          {showLocation && (
            <>
              <FormInput
                label="Location"
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. SM North EDSA, Quezon City"
              />
              <Button
                title="Remove Location"
                variant="danger"
                size="sm"
                fullWidth={true}
                onPress={() => {
                  setShowLocation(false);
                  setLocation("");
                }}
              />
            </>
          )}
        </View>

        {/* Items Section */}
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing[4],
            }}
          >
            <Text
              style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.bold,
                color: theme.primary,
              }}
            >
              Shopping List *
            </Text>
            <Button
              title="+ Add Item"
              variant="secondary"
              size="sm"
              onPress={addItem}
            />
          </View>

          {items.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: theme.surfaceLight,
                borderRadius: borderRadius.lg,
                padding: spacing[3],
                marginBottom: spacing[3],
                ...shadows.sm,
              }}
            >
              <View style={{ flexDirection: "row", gap: spacing[2], alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: fontWeight.semibold,
                      color: theme.textSecondary,
                      marginBottom: spacing[1],
                      textTransform: "uppercase",
                    }}
                  >
                    Item Name
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: theme.input,
                      borderWidth: 1,
                      borderColor: theme.inputBorder,
                      borderRadius: borderRadius.md,
                      paddingHorizontal: spacing[2],
                      paddingVertical: spacing[2],
                      fontSize: fontSize.base,
                      color: theme.text,
                    }}
                    value={item.name}
                    onChangeText={(val) => updateItem(item.id, "name", val)}
                    placeholder="e.g. Wig"
                    placeholderTextColor={theme.inputPlaceholder}
                  />
                </View>

                <View style={{ width: 90 }}>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: fontWeight.semibold,
                      color: theme.textSecondary,
                      marginBottom: spacing[1],
                      textTransform: "uppercase",
                    }}
                  >
                    Cost (₱)
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: theme.input,
                      borderWidth: 1,
                      borderColor: theme.inputBorder,
                      borderRadius: borderRadius.md,
                      paddingHorizontal: spacing[2],
                      paddingVertical: spacing[2],
                      fontSize: fontSize.base,
                      color: theme.text,
                    }}
                    value={item.cost}
                    onChangeText={(val) => updateItem(item.id, "cost", val)}
                    placeholder="0"
                    placeholderTextColor={theme.inputPlaceholder}
                    keyboardType="numeric"
                  />
                </View>

                <Button
                  title="✕"
                  variant="danger"
                  size="sm"
                  onPress={() => removeItem(item.id)}
                  style={{ marginTop: spacing[6] }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Total Cost Summary */}
        <View
          style={{
            backgroundColor: theme.primaryLighter,
            borderRadius: borderRadius.xl,
            padding: spacing[4],
            marginVertical: spacing[6],
            ...shadows.md,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.xs,
              fontWeight: fontWeight.semibold,
              color: theme.primaryDark,
              textTransform: "uppercase",
              marginBottom: spacing[2],
            }}
          >
            Total Budget
          </Text>
          <Text
            style={{
              fontSize: fontSize["3xl"],
              fontWeight: fontWeight.bold,
              color: theme.primary,
            }}
          >
            ₱{totalCost.toFixed(2)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: spacing[2] }}>
          <Button
            title="Cancel"
            variant="outline"
            size="lg"
            fullWidth={true}
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
          />
          <Button
            title="Update"
            variant="primary"
            size="lg"
            fullWidth={true}
            onPress={updateCosplay}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});