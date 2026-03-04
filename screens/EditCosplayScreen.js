// screens/EditCosplayScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Button from "../components/Button";
import placeholder from "../assets/placeholder.png";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Component ────────────────────────────────────────────────────────────────

export default function EditCosplayScreen({ route, navigation }) {
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

  // ── Item helpers ──────────────────────────────────────────────────

  const addItem = () => setItems((prev) => [...prev, createItem()]);

  const removeItem = (id) => {
    if (items.length === 1) {
      window.alert("At least one item is required.");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Live total from currently entered costs
  const totalCost = items.reduce(
    (sum, item) => sum + (parseFloat(item.cost) || 0),
    0
  );

  // ── Update ────────────────────────────────────────────────────────

  const updateCosplay = async () => {
    if (!characterName.trim()) {
      window.alert("Character name is required.");
      return;
    }
    if (!deadline.trim()) {
      window.alert("Deadline is required.");
      return;
    }
    if (!imageUrl.trim()) {
      window.alert("Image URL is required.");
      return;
    }
    if (!isValidHttpUrl(imageUrl)) {
      window.alert("Enter a valid image URL (must start with http/https).");
      return;
    }
    const invalidItem = items.find((item) => !item.name.trim());
    if (invalidItem) {
      window.alert("All item rows must have a name.");
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
      window.alert("Cosplay updated!");
      navigation.goBack();
    } catch (err) {
      console.error("Update failed:", err);
      window.alert("Failed to update cosplay: " + (err.message || err));
    }
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ── Character Info ─────────────────────────────────────────── */}
      <Text style={styles.sectionHeader}>Character Info</Text>

      {/*
        Same two-column layout as AddCosplayScreen: the image preview sits
        on the LEFT at a fixed width so it stays portrait-shaped, while the
        three text inputs stack on the RIGHT, pre-populated with existing data.
      */}
      <View style={styles.characterInfoRow}>

        {/* Left column: image preview */}
        <View style={styles.previewColumn}>
          <Text style={styles.label}>Preview</Text>
          <Image
            source={
              previewBroken || !imageUrl || !isValidHttpUrl(imageUrl)
                ? placeholder
                : { uri: imageUrl }
            }
            onError={() => setPreviewBroken(true)}
            style={styles.preview}
            resizeMode="cover"
          />
        </View>

        {/* Right column: text inputs (pre-filled from route.params.cosplay) */}
        <View style={styles.fieldsColumn}>
          <Text style={styles.label}>Character Name *</Text>
          <TextInput
            style={styles.input}
            value={characterName}
            onChangeText={setCharacterName}
            placeholder="e.g. Himeko from Honkai: Star Rail"
          />

          <Text style={styles.label}>Deadline *</Text>
          <TextInput
            style={styles.input}
            value={deadline}
            onChangeText={setDeadline}
            placeholder="e.g. 2025-08-15 or August 15, 2025"
          />

          <Text style={styles.label}>Image URL *</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={(text) => {
              setImageUrl(text);
              setPreviewBroken(false);
            }}
            placeholder="https://example.com/cosplay.jpg"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

      </View>

      {/* ── Optional Address ───────────────────────────────────────── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionHeader}>Address / Location</Text>
        {!showLocation && (
          <Button
            title="+ Add Address"
            bgColor="bg-yellow-500"
            onPress={() => setShowLocation(true)}
            style={styles.inlineButton}
          />
        )}
      </View>

      {showLocation && (
        <>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. SM North EDSA, Quezon City"
          />
          <Button
            title="Remove Address"
            bgColor="bg-red-500"
            onPress={() => {
              setShowLocation(false);
              setLocation("");
            }}
            style={{ marginBottom: 10 }}
          />
        </>
      )}

      {/* ── Items ──────────────────────────────────────────────────── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionHeader}>Items *</Text>
        <Button
          title="+ Add Item"
          bgColor="bg-indigo-500"
          onPress={addItem}
          style={styles.inlineButton}
        />
      </View>

      <View style={styles.itemHeaderRow}>
        <Text style={[styles.itemHeaderCell, { flex: 2 }]}>Item Name</Text>
        <Text style={[styles.itemHeaderCell, { flex: 1 }]}>Cost (₱)</Text>
        <Text style={[styles.itemHeaderCell, { width: 70 }]}>Remove</Text>
      </View>

      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <TextInput
            style={[styles.input, { flex: 2, marginBottom: 0, marginRight: 6 }]}
            value={item.name}
            onChangeText={(val) => updateItem(item.id, "name", val)}
            placeholder="e.g. Wig"
          />
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 6 }]}
            value={item.cost}
            onChangeText={(val) => updateItem(item.id, "cost", val)}
            placeholder="0"
            keyboardType="numeric"
          />
          <Button
            title="✕"
            bgColor="bg-red-500"
            onPress={() => removeItem(item.id)}
            style={styles.removeButton}
          />
        </View>
      ))}

      {/* ── Live Total ─────────────────────────────────────────────── */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Cost</Text>
        <Text style={styles.totalAmount}>₱{totalCost.toFixed(2)}</Text>
      </View>

      {/* ── Update ─────────────────────────────────────────────────── */}
      <Button
        title="Update Cosplay"
        bgColor="bg-indigo-500"
        onPress={updateCosplay}
        style={{ marginTop: 20, marginBottom: 40 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
  inlineButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontWeight: "600",
    color: "#374151",
    marginTop: 6,
    marginBottom: 4,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fafafa",
  },
  // Two-column row: image left, inputs right
  characterInfoRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  previewColumn: {
    width: 180,
    flexShrink: 0,
  },
  fieldsColumn: {
    flex: 1,
  },
  preview: {
    width: "100%",
    height: 240,
    borderRadius: 8,
    marginBottom: 6,
  },
  itemHeaderRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  itemHeaderCell: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  removeButton: {
    width: 60,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    padding: 14,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e40af",
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1d4ed8",
  },
});