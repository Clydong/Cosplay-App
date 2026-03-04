// components/CosplayCard.js
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Button from "./Button";
import placeholder from "../assets/placeholder.png";

export default function CosplayCard({ cosplay, onEdit, onDelete, onItemToggle }) {
  const [broken, setBroken] = useState(false);
  // Track which items are being updated to show per-row loading feedback
  const [togglingIds, setTogglingIds] = useState([]);

  const imageSource =
    broken || !cosplay.imageUrl ? placeholder : { uri: cosplay.imageUrl };

  const items = cosplay.items || [];

  // Remaining cost = sum of costs for items that are NOT yet checked
  const remainingCost = items
    .filter((item) => !item.isChecked)
    .reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);

  // Toggle an individual item's isChecked state and persist to Firestore immediately
  const toggleItem = async (itemId) => {
    // Prevent double-tapping while the write is in flight
    if (togglingIds.includes(itemId)) return;
    setTogglingIds((prev) => [...prev, itemId]);

    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );

    try {
      const cosplayRef = doc(db, "cosplays", cosplay.id);
      await updateDoc(cosplayRef, { items: updatedItems });
      // Notify the parent (HomeScreen) so it can refresh local state without
      // a full Firestore re-fetch — keeps the UI snappy
      if (onItemToggle) onItemToggle(cosplay.id, updatedItems);
    } catch (err) {
      console.error("Failed to toggle item:", err);
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== itemId));
    }
  };

  return (
    <View style={styles.card}>
      {/* ── Top Section: split 50/50 row ─────────────────────────────── */}
      <View style={styles.splitRow}>
        {/* Left: character image */}
        <Image
          source={imageSource}
          style={styles.image}
          onError={() => setBroken(true)}
          resizeMode="cover"
        />

        {/* Right: key info */}
        <View style={styles.infoPanel}>
          <Text style={styles.characterName} numberOfLines={2}>
            {cosplay.characterName}
          </Text>

          <Text style={styles.detailLabel}>Deadline</Text>
          <Text style={styles.detailValue}>{cosplay.deadline}</Text>

          {cosplay.location ? (
            <>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{cosplay.location}</Text>
            </>
          ) : null}

          {/* Remaining cost is the "money still needed" KPI */}
          <View style={styles.remainingBadge}>
            <Text style={styles.remainingLabel}>Still Needed</Text>
            <Text style={styles.remainingAmount}>
              ₱{remainingCost.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Checklist Section ─────────────────────────────────────────── */}
      {items.length > 0 && (
        <View style={styles.checklistContainer}>
          <Text style={styles.checklistTitle}>Items</Text>
          {items.map((item) => {
            const isToggling = togglingIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.itemRow}
                onPress={() => toggleItem(item.id)}
                activeOpacity={0.7}
              >
                {/* Custom checkbox */}
                <View
                  style={[
                    styles.checkbox,
                    item.isChecked && styles.checkboxChecked,
                  ]}
                >
                  {isToggling ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : item.isChecked ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : null}
                </View>

                <Text
                  style={[
                    styles.itemName,
                    item.isChecked && styles.strikethrough,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <Text
                  style={[
                    styles.itemCost,
                    item.isChecked && styles.strikethrough,
                  ]}
                >
                  ₱{parseFloat(item.cost || 0).toFixed(2)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── Action Buttons ────────────────────────────────────────────── */}
      <View style={styles.buttonRow}>
        <Button
          title="Edit"
          bgColor="bg-blue-500"
          onPress={onEdit}
          style={styles.halfButton}
        />
        <Button
          title="Delete"
          bgColor="bg-red-500"
          onPress={onDelete}
          style={styles.halfButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },

  // ── Split row ──────────────────────────────────────────────────────
  splitRow: {
    flexDirection: "row",
  },
  image: {
    width: "50%",
    height: 200,
  },
  infoPanel: {
    width: "50%",
    padding: 12,
    justifyContent: "center",
  },
  characterName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 10,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 13,
    color: "#374151",
  },
  remainingBadge: {
    marginTop: 12,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  remainingLabel: {
    fontSize: 10,
    color: "#92400e",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  remainingAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#b45309",
  },

  // ── Checklist ──────────────────────────────────────────────────────
  checklistContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    lineHeight: 16,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  itemCost: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 8,
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: "#9ca3af",
  },

  // ── Buttons ────────────────────────────────────────────────────────
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    paddingTop: 8,
  },
  halfButton: {
    flex: 0.48,
  },
});