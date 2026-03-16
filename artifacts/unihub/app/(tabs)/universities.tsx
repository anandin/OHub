import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UniversityCard } from "@/components/UniversityCard";
import Colors from "@/constants/colors";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { ONTARIO_UNIVERSITIES } from "@/data/universities";

type Filter = "all" | "subscribed";

export default function UniversitiesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { subscribed } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let unis = ONTARIO_UNIVERSITIES;
    if (filter === "subscribed") {
      unis = unis.filter((u) => subscribed.includes(u.id));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      unis = unis.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.shortName.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q) ||
          u.faculties.some((f) => f.toLowerCase().includes(q))
      );
    }
    return unis;
  }, [query, filter, subscribed]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Universities</Text>
        <Text style={styles.subtitle}>
          {ONTARIO_UNIVERSITIES.length} Ontario universities
        </Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={Colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search universities, faculties…"
            placeholderTextColor={Colors.light.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={16} color={Colors.light.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "all" && styles.filterChipTextActive,
            ]}
          >
            All ({ONTARIO_UNIVERSITIES.length})
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            filter === "subscribed" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("subscribed")}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "subscribed" && styles.filterChipTextActive,
            ]}
          >
            Joined ({subscribed.length})
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => <UniversityCard university={item} />}
        contentContainerStyle={[
          styles.list,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={36} color={Colors.light.textMuted} />
            <Text style={styles.emptyText}>No universities found</Text>
            <Pressable onPress={() => { setQuery(""); setFilter("all"); }}>
              <Text style={styles.clearText}>Clear search</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  searchRow: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    paddingTop: 4,
    paddingBottom: 100,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  clearText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
});
