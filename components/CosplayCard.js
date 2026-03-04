// components/CosplayCard.js
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Button from "./Button";
import placeholder from "../assets/placeholder.png";
import { useTheme } from "../contexts/ThemeContext";

export default function CosplayCard({ cosplay, onEdit, onDelete, onItemToggle }) {
  const { theme, spacing, borderRadius, shadows, fontSize, fontWeight } = useTheme();
  const [broken, setBroken] = useState(false);
  const [togglingIds, setTogglingIds] = useState([]);

  const imageSource = broken || !cosplay.imageUrl ? placeholder : { uri: cosplay.imageUrl };
  const items = cosplay.items || [];
  const completedCount = items.filter((item) => item.isChecked).length;
  const totalCost = items.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
  const remainingCost = items
    .filter((item) => !item.isChecked)
    .reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);

  const toggleItem = async (itemId) => {
    if (togglingIds.includes(itemId)) return;
    setTogglingIds((prev) => [...prev, itemId]);

    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );

    try {
      const cosplayRef = doc(db, "cosplays", cosplay.id);
      await updateDoc(cosplayRef, { items: updatedItems });
      if (onItemToggle) onItemToggle(cosplay.id, updatedItems);
    } catch (err) {
      console.error("Failed to toggle item:", err);
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceLight, ...shadows.lg }]}>
      {/* Header with image and gradient overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image}
          onError={() => setBroken(true)}
          resizeMode="cover"
        />
        {items.length > 0 && (
          <View style={[styles.progressOverlay, { backgroundColor: `rgba(0,0,0,0.4)` }]}>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.success,
                    width: `${progressPercentage}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount}/{items.length} done
            </Text>
          </View>
        )}
      </View>

      {/* Main Content Section */}
      <View style={{ padding: spacing[4] }}>
        {/* Title and Meta */}
        <View style={styles.header}>
          <Text
            style={[
              {
                fontSize: fontSize["2xl"],
                fontWeight: fontWeight.bold,
                color: theme.text,
                marginBottom: spacing[2],
              },
            ]}
            numberOfLines={2}
          >
            {cosplay.characterName}
          </Text>

          {/* Quick Info Grid */}
          <View style={styles.metaGrid}>
            {cosplay.deadline && (
              <View style={styles.metaItem}>
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.semibold,
                    color: theme.textTertiary,
                    textTransform: "uppercase",
                    marginBottom: spacing[1],
                  }}
                >
                  Deadline
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.medium,
                    color: theme.primary,
                  }}
                >
                  {cosplay.deadline}
                </Text>
              </View>
            )}

            {cosplay.location && (
              <View style={styles.metaItem}>
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.semibold,
                    color: theme.textTertiary,
                    textTransform: "uppercase",
                    marginBottom: spacing[1],
                  }}
                >
                  Location
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.medium,
                    color: theme.text,
                  }}
                  numberOfLines={1}
                >
                  {cosplay.location}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Cost Summary Card */}
        <View
          style={[
            styles.costSummary,
            {
              backgroundColor: theme.primaryLighter,
              borderRadius: borderRadius.lg,
              paddingVertical: spacing[3],
              paddingHorizontal: spacing[4],
              marginVertical: spacing[4],
            },
          ]}
        >
          <View style={styles.costRow}>
            <View>
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: fontWeight.semibold,
                  color: theme.primaryDark,
                  textTransform: "uppercase",
                  marginBottom: spacing[1],
                }}
              >
                Total Budget
              </Text>
              <Text
                style={{
                  fontSize: fontSize.xl,
                  fontWeight: fontWeight.bold,
                  color: theme.primary,
                }}
              >
                ₱{totalCost.toFixed(2)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: fontWeight.semibold,
                  color: theme.primaryDark,
                  textTransform: "uppercase",
                  marginBottom: spacing[1],
                }}
              >
                Still Needed
              </Text>
              <Text
                style={{
                  fontSize: fontSize.xl,
                  fontWeight: fontWeight.bold,
                  color: remainingCost > 0 ? theme.warning : theme.success,
                }}
              >
                ₱{remainingCost.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Items Checklist */}
        {items.length > 0 && (
          <View>
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.bold,
                color: theme.textSecondary,
                textTransform: "uppercase",
                marginBottom: spacing[2],
                letterSpacing: 0.5,
              }}
            >
              Shopping List
            </Text>

            <View style={[{ borderRadius: borderRadius.md }, styles.itemsList]}>
              {items.map((item, index) => {
                const isToggling = togglingIds.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: spacing[3],
                        paddingHorizontal: spacing[3],
                        borderBottomWidth: index < items.length - 1 ? 1 : 0,
                        borderBottomColor: theme.border,
                        backgroundColor: item.isChecked ? theme.successLight : "transparent",
                      },
                    ]}
                    onPress={() => toggleItem(item.id)}
                    activeOpacity={0.6}
                  >
                    {/* Large interactive checkbox */}
                    <View
                      style={[
                        {
                          width: 28,
                          height: 28,
                          borderRadius: borderRadius.md,
                          borderWidth: 2,
                          borderColor: item.isChecked ? theme.success : theme.border,
                          backgroundColor: item.isChecked ? theme.success : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: spacing[3],
                        },
                      ]}
                    >
                      {isToggling ? (
                        <ActivityIndicator size="small" color={theme.textInvert} />
                      ) : item.isChecked ? (
                        <Text style={{ color: theme.textInvert, fontSize: 14, fontWeight: fontWeight.bold }}>✓</Text>
                      ) : null}
                    </View>

                    {/* Item details */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: fontSize.base,
                          fontWeight: fontWeight.medium,
                          color: item.isChecked ? theme.textSecondary : theme.text,
                          textDecorationLine: item.isChecked ? "line-through" : "none",
                          marginBottom: spacing[1],
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </View>

                    {/* Cost */}
                    <Text
                      style={{
                        fontSize: fontSize.base,
                        fontWeight: fontWeight.bold,
                        color: item.isChecked ? theme.textSecondary : theme.primary,
                        marginLeft: spacing[2],
                      }}
                    >
                      ₱{parseFloat(item.cost || 0).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing[2],
          padding: spacing[4],
          paddingTop: spacing[3],
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        <Button
          title="Edit"
          variant="outline"
          onPress={onEdit}
          size="md"
          fullWidth={true}
          style={{ flex: 1 }}
        />
        <Button
          title="Delete"
          variant="danger"
          onPress={onDelete}
          size="md"
          fullWidth={true}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  progressOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  header: {
    marginBottom: 8,
  },
  metaGrid: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flex: 1,
  },
  costSummary: {
    justifyContent: "center",
  },
  costRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  itemsList: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
});
