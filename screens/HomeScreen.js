// screens/HomeScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
  SafeAreaView,
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
import { useTheme } from "../contexts/ThemeContext";

export default function HomeScreen({ navigation }) {
  console.log('HomeScreen rendered');
  const { theme, spacing, fontSize, fontWeight } = useTheme();
  const [cosplays, setCosplays] = useState([]);
  const [loading, setLoading] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCosplays();
    }, [])
  );

  const deleteCosplay = async (id) => {
    try {
      await deleteDoc(doc(db, "cosplays", id));
      setCosplays((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const onEditCosplay = (cosplay) => {
    navigation.navigate("Edit Cosplay", { cosplay });
  };

  const renderItem = ({ item }) => (
    <CosplayCard
      cosplay={item}
      onEdit={() => onEditCosplay(item)}
      onDelete={() => deleteCosplay(item.id)}
      onItemToggle={(cosplayId, updatedItems) => {
        setCosplays((prev) =>
          prev.map((c) =>
            c.id === cosplayId ? { ...c, items: updatedItems } : c
          )
        );
      }}
    />
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={{
          fontSize: fontSize["3xl"],
          marginBottom: spacing[3],
        }}
      >
        ✨
      </Text>
      <Text
        style={{
          fontSize: fontSize.xl,
          fontWeight: fontWeight.bold,
          color: theme.text,
          marginBottom: spacing[2],
          textAlign: "center",
        }}
      >
        No Cosplays Yet
      </Text>
      <Text
        style={{
          fontSize: fontSize.base,
          color: theme.textSecondary,
          marginBottom: spacing[4],
          textAlign: "center",
          paddingHorizontal: spacing[4],
        }}
      >
        Start planning your next cosplay adventure by creating a new cosplay project!
      </Text>
      <Button
        title="Create Your First Cosplay"
        variant="primary"
        size="lg"
        onPress={() => navigation.navigate("Add Cosplay")}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[4],
          backgroundColor: theme.primaryLighter,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <Text
          style={{
            fontSize: fontSize["3xl"],
            fontWeight: fontWeight.bold,
            color: theme.primary,
            marginBottom: spacing[1],
          }}
        >
          Cosplay Tracker
        </Text>
        <Text
          style={{
            fontSize: fontSize.base,
            color: theme.textSecondary,
          }}
        >
          Plan, budget, and create amazing cosplays
        </Text>
      </View>

      {/* Content */}
      <FlatList
        data={cosplays}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.flatList}
        contentContainerStyle={{ paddingHorizontal: spacing[4], paddingVertical: spacing[4] }}
        ListEmptyComponent={ListEmpty}
        ListHeaderComponent={
          loading ? (
            <View style={{ alignItems: "center", paddingVertical: spacing[6] }}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : null
        }
        scrollEnabled={true}
      />

      {/* Floating Action Button */}
      <View
        style={{
          position: "absolute",
          bottom: spacing[6],
          right: spacing[4],
          zIndex: 10,
        }}
        pointerEvents="box-none"
      >
        <Button
          title="＋"
          variant="primary"
          size="lg"
          onPress={() => navigation.navigate("Add Cosplay")}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({ web: {}, default: {} }),
  },
  flatList: {
    flex: 1,
    width: "100%",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
});