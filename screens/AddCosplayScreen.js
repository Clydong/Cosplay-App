// screens/AddCosplayScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Button from "../components/Button";
import placeholder from "../assets/placeholder.png";

// ── Helpers ─────────────────────────────────────────────────────────────────

function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// Creates a fresh blank item row with a unique id
function createItem() {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    cost: "",
    isChecked: false,
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AddCosplayScreen({ navigation }) {
  const [characterName, setCharacterName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewBroken, setPreviewBroken] = useState(false);

  // Location is optional; the input is hidden until the user explicitly asks for it
  const [showLocation, setShowLocation] = useState(false);
  const [location, setLocation] = useState("");

  // Start with one blank item row so the form never feels empty
  const [items, setItems] = useState([createItem()]);

  // ── Item helpers ──────────────────────────────────────────────────

  const addItem = () => setItems((prev) => [...prev, createItem()]);

  const removeItem = (id) => {
    // Prevent removing the very last row — at least one item is required
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

  // Real-time total: only counts rows where cost can be parsed as a valid number
  const totalCost = items.reduce(
    (sum, item) => sum + (parseFloat(item.cost) || 0),
    0
  );

  // ── Save ──────────────────────────────────────────────────────────

  const saveCosplay = async () => {
    // ── Validation ────────────────────────────────────────────────
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

    // Every item row must have at least a name; cost defaults to 0 if blank
    const invalidItem = items.find((item) => !item.name.trim());
    if (invalidItem) {
      window.alert("All item rows must have a name.");
      return;
    }

    // Normalise cost to a number before storing
    const normalisedItems = items.map((item) => ({
      ...item,
      cost: parseFloat(item.cost) || 0,
    }));

    try {
      await addDoc(collection(db, "cosplays"), {
        characterName: characterName.trim(),
        deadline: deadline.trim(),
        imageUrl: imageUrl.trim(),
        location: showLocation ? location.trim() : "",
        items: normalisedItems,
      });
      window.alert("Cosplay saved!");
      navigation.goBack();
    } catch (err) {
      console.error("Save failed:", err);
      window.alert("Failed to save cosplay: " + (err.message || err));
    }
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ── Character Info ─────────────────────────────────────────── */}
      <Text style={styles.sectionHeader}>Character Info</Text>

      {/*
        Two-column layout: image preview sits on the LEFT at a fixed width
        so it gets a natural portrait shape, while the three inputs stack
        on the RIGHT. This prevents the image from stretching full-width
        and getting awkwardly cropped.
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

        {/* Right column: text inputs */}
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
              // Reset the broken flag whenever the user types a new URL
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

      {/* Column headers */}
      <View style={styles.itemHeaderRow}>
        <Text style={[styles.itemHeaderCell, { flex: 2 }]}>Item Name</Text>
        <Text style={[styles.itemHeaderCell, { flex: 1 }]}>Cost (₱)</Text>
        <Text style={[styles.itemHeaderCell, { width: 70 }]}>Remove</Text>
      </View>

      {items.map((item, index) => (
        <View key={item.id} style={styles.itemRow}>
          <TextInput
            style={[styles.input, { flex: 2, marginBottom: 0, marginRight: 6 }]}
            value={item.name}
            onChangeText={(val) => updateItem(item.id, "name", val)}
            placeholder={`e.g. Wig`}
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

      {/* ── Save ───────────────────────────────────────────────────── */}
      <Button
        title="Save Cosplay"
        bgColor="bg-green-500"
        onPress={saveCosplay}
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
    marginTop: 18,
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
    width: 180,           // Fixed width keeps the image portrait-shaped
    flexShrink: 0,        // Never allow it to squash below this width
  },
  fieldsColumn: {
    flex: 1,              // Takes all remaining horizontal space
  },
  preview: {
    width: "100%",
    height: 240,          // Taller than wide → natural portrait aspect ratio
    borderRadius: 8,
    marginBottom: 6,
  },
  // Items table
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
  // Total
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