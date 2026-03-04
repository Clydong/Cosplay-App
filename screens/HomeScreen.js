// screens/HomeScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import CosplayCard from "../components/CosplayCard";
import Button from "../components/Button";

export default function HomeScreen({ navigation }) {
  const [cosplays, setCosplays] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────

  const fetchCosplays = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "cosplays"));
      const list = [];
      querySnapshot.forEach((docItem) => {
        list.push({ id: docItem.id, ...docItem.data() });
      });
      setCosplays(list);
    } catch (err) {
      console.error("Fetch failed:", err);
      if (typeof window !== "undefined")
        window.alert("Failed to load cosplays: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Refetch every time the screen comes into focus (i.e. after add/edit)
  useFocusEffect(
    React.useCallback(() => {
      fetchCosplays();
    }, [])
  );

  // ── Optimistic item-toggle handler ────────────────────────────────
  // CosplayCard already writes the Firestore update itself; this callback
  // allows HomeScreen to update its local state immediately so the UI
  // reflects the checkbox change without waiting for a full re-fetch.
  const handleItemToggle = (cosplayId, updatedItems) => {
    setCosplays((prev) =>
      prev.map((c) =>
        c.id === cosplayId ? { ...c, items: updatedItems } : c
      )
    );
  };

  // ── Delete ────────────────────────────────────────────────────────

  const deleteCosplay = async (id) => {
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm("Are you sure you want to delete this cosplay?")
        : true;
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "cosplays", id));
      // Remove from local state immediately for a snappy feel
      setCosplays((prev) => prev.filter((c) => c.id !== id));
      if (typeof window !== "undefined") window.alert("Cosplay deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      if (typeof window !== "undefined")
        window.alert("Delete failed: " + (err.message || err));
    }
  };

  // ── Render item ───────────────────────────────────────────────────

  const renderItem = ({ item }) => (
    <CosplayCard
      cosplay={item}
      onEdit={() => navigation.navigate("Edit Cosplay", { cosplay: item })}
      onDelete={() => deleteCosplay(item.id)}
      onItemToggle={handleItemToggle}
    />
  );

  // ── Empty / Loading states ────────────────────────────────────────

  const ListEmpty = () => {
    if (loading) return null; // spinner shown by ListHeaderComponent
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cosplays yet.</Text>
        <Text style={styles.emptySubText}>
          Tap "Add New Cosplay" to start tracking your build!
        </Text>
      </View>
    );
  };

  // ── Full render ───────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <FlatList
        data={cosplays}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.flatList}
        contentContainerStyle={styles.contentContainer}
        scrollEnabled={true}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        ListEmptyComponent={ListEmpty}
        ListHeaderComponent={
          <View>
            <Button
              title="＋ Add New Cosplay"
              bgColor="bg-green-500"
              onPress={() => navigation.navigate("Add Cosplay")}
              style={{ marginBottom: 15 }}
            />
            {loading && (
              <ActivityIndicator
                size="large"
                color="#6366f1"
                style={{ marginBottom: 20 }}
              />
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    ...Platform.select({ web: {}, default: {} }),
  },
  flatList: {
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6b7280",
  },
  emptySubText: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 6,
    textAlign: "center",
  },
});