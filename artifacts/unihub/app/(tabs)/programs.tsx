import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

import Colors from "@/constants/colors";
import {
  ALL_PROGRAMS,
  FACULTY_TYPES,
  FacultyType,
  Program,
} from "@/data/programs";
import { ONTARIO_UNIVERSITIES, getUniversityById } from "@/data/universities";

type SortMode = "name" | "avg_low" | "avg_high" | "university";

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "name", label: "A–Z" },
  { id: "avg_low", label: "Easiest Entry" },
  { id: "avg_high", label: "Hardest Entry" },
  { id: "university", label: "University" },
];

const COMPETITIVENESS_CONFIG = {
  moderate:  { label: "Moderate",   color: "#6B7280" },
  high:      { label: "High",       color: "#0EA5E9" },
  very_high: { label: "Very High",  color: "#F59E0B" },
  extreme:   { label: "Extremely Competitive", color: "#EF4444" },
};

function parseAvg(avg: string): number {
  const match = avg.match(/(\d+)/);
  return match ? parseInt(match[1]) : 75;
}

function ProgramCard({ program }: { program: Program }) {
  const uni = getUniversityById(program.universityId);
  if (!uni) return null;
  const comp = COMPETITIVENESS_CONFIG[program.competitiveness];

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/program/[id]", params: { id: program.id } })
      }
    >
      <View style={[styles.cardAccent, { backgroundColor: uni.color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardEmoji}>{uni.logo}</Text>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardName} numberOfLines={2}>{program.name}</Text>
              <Text style={styles.cardUni}>{uni.shortName} · {program.faculty}</Text>
            </View>
          </View>
          <View style={styles.cardAvgBox}>
            <Text style={styles.cardAvgNum}>{program.averageGrade}</Text>
            <Text style={styles.cardAvgLabel}>avg</Text>
          </View>
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>{program.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardChip}>
            <Feather name="book-open" size={11} color={Colors.light.textMuted} />
            <Text style={styles.cardChipText}>{program.degree}</Text>
          </View>
          <View style={styles.cardChip}>
            <Feather name="clock" size={11} color={Colors.light.textMuted} />
            <Text style={styles.cardChipText}>{program.duration}</Text>
          </View>
          {program.hasCoOp && (
            <View style={[styles.cardChip, styles.coopChip]}>
              <Text style={styles.coopChipText}>Co-op ✓</Text>
            </View>
          )}
          {program.suppRequired && (
            <View style={[styles.cardChip, styles.suppChip]}>
              <Feather name="file-text" size={11} color="#F59E0B" />
              <Text style={styles.suppChipText}>Supp. Required</Text>
            </View>
          )}
          <View style={[styles.compBadge, { backgroundColor: comp.color + "18" }]}>
            <Text style={[styles.compBadgeText, { color: comp.color }]}>{comp.label}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const [query, setQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyType | null>(null);
  const [selectedUni, setSelectedUni] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [showUniPicker, setShowUniPicker] = useState(false);

  const filtered = useMemo(() => {
    let list = [...ALL_PROGRAMS];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.faculty.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.careerPaths.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (selectedFaculty) {
      list = list.filter((p) => p.facultyType === selectedFaculty);
    }

    if (selectedUni) {
      list = list.filter((p) => p.universityId === selectedUni);
    }

    list.sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name);
      if (sortMode === "avg_low") return parseAvg(a.averageGrade) - parseAvg(b.averageGrade);
      if (sortMode === "avg_high") return parseAvg(b.averageGrade) - parseAvg(a.averageGrade);
      if (sortMode === "university") {
        const uA = getUniversityById(a.universityId)?.shortName ?? "";
        const uB = getUniversityById(b.universityId)?.shortName ?? "";
        return uA.localeCompare(uB);
      }
      return 0;
    });

    return list;
  }, [query, selectedFaculty, selectedUni, sortMode]);

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={Colors.light.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search programs, careers, keywords…"
          placeholderTextColor={Colors.light.textMuted}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && Platform.OS !== "ios" && (
          <Pressable onPress={() => setQuery("")}>
            <Feather name="x" size={16} color={Colors.light.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Faculty type filter pills */}
      <FlatList
        horizontal
        data={[null, ...FACULTY_TYPES] as (FacultyType | null)[]}
        keyExtractor={(item) => item ?? "all"}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.filterPill,
              selectedFaculty === item && styles.filterPillActive,
            ]}
            onPress={() => setSelectedFaculty(item)}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedFaculty === item && styles.filterPillTextActive,
              ]}
            >
              {item ?? "All Fields"}
            </Text>
          </Pressable>
        )}
      />

      {/* University + Sort row */}
      <View style={styles.sortRow}>
        <Pressable
          style={[styles.uniPickerBtn, selectedUni && styles.uniPickerBtnActive]}
          onPress={() => setShowUniPicker((s) => !s)}
        >
          <Feather
            name="grid"
            size={13}
            color={selectedUni ? Colors.light.primary : Colors.light.textSecondary}
          />
          <Text
            style={[styles.uniPickerText, selectedUni && styles.uniPickerTextActive]}
            numberOfLines={1}
          >
            {selectedUni
              ? (ONTARIO_UNIVERSITIES.find((u) => u.id === selectedUni)?.shortName ?? "University")
              : "All Universities"}
          </Text>
          <Feather name="chevron-down" size={13} color={Colors.light.textMuted} />
        </Pressable>

        <FlatList
          horizontal
          data={SORT_OPTIONS}
          keyExtractor={(o) => o.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
          style={styles.sortList}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.sortBtn, sortMode === item.id && styles.sortBtnActive]}
              onPress={() => setSortMode(item.id)}
            >
              <Text
                style={[styles.sortText, sortMode === item.id && styles.sortTextActive]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* University picker dropdown */}
      {showUniPicker && (
        <View style={styles.uniDropdown}>
          <Pressable
            style={[styles.uniOption, !selectedUni && styles.uniOptionActive]}
            onPress={() => { setSelectedUni(null); setShowUniPicker(false); }}
          >
            <Text style={[styles.uniOptionText, !selectedUni && styles.uniOptionTextActive]}>
              All Universities
            </Text>
          </Pressable>
          {ONTARIO_UNIVERSITIES.map((u) => (
            <Pressable
              key={u.id}
              style={[styles.uniOption, selectedUni === u.id && styles.uniOptionActive]}
              onPress={() => { setSelectedUni(u.id); setShowUniPicker(false); }}
            >
              <Text style={styles.uniOptionEmoji}>{u.logo}</Text>
              <Text style={[styles.uniOptionText, selectedUni === u.id && styles.uniOptionTextActive]}>
                {u.shortName}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          {filtered.length} program{filtered.length !== 1 ? "s" : ""}
        </Text>
        {(selectedFaculty || selectedUni || query) && (
          <Pressable
            onPress={() => {
              setQuery("");
              setSelectedFaculty(null);
              setSelectedUni(null);
            }}
          >
            <Text style={styles.clearAll}>Clear filters</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Programs</Text>
          <Text style={styles.subtitle}>All Ontario university programs</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <ProgramCard program={item} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={Colors.light.textMuted} />
            <Text style={styles.emptyTitle}>No Programs Found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different search term or clear your filters.
            </Text>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
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
    marginTop: 1,
  },
  headerBlock: {
    gap: 10,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
  },
  filterRow: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: "row",
    paddingVertical: 2,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterPillActive: {
    backgroundColor: Colors.light.primaryMuted,
    borderColor: Colors.light.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  filterPillTextActive: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  uniPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    maxWidth: 160,
  },
  uniPickerBtnActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryMuted,
  },
  uniPickerText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
    flex: 1,
  },
  uniPickerTextActive: {
    color: Colors.light.primary,
    fontFamily: "Inter_600SemiBold",
  },
  sortList: {
    flex: 1,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sortBtnActive: {
    backgroundColor: Colors.light.primaryMuted,
    borderColor: Colors.light.primary,
  },
  sortText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  sortTextActive: {
    color: Colors.light.primary,
    fontFamily: "Inter_600SemiBold",
  },
  uniDropdown: {
    marginHorizontal: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
    maxHeight: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  uniOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  uniOptionActive: {
    backgroundColor: Colors.light.primaryMuted,
  },
  uniOptionEmoji: {
    fontSize: 18,
  },
  uniOptionText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  uniOptionTextActive: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  resultsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 2,
  },
  resultsCount: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  clearAll: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  listContent: {
    paddingBottom: 110,
  },
  card: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardAccent: {
    width: 4,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 7,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  cardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  cardEmoji: {
    fontSize: 22,
    marginTop: 1,
  },
  cardTitleBlock: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  cardUni: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  cardAvgBox: {
    alignItems: "center",
    backgroundColor: Colors.light.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexShrink: 0,
  },
  cardAvgNum: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.light.primary,
  },
  cardAvgLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: Colors.light.primary,
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  cardChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  cardChipText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  coopChip: {
    backgroundColor: Colors.light.success + "15",
  },
  coopChipText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.success,
  },
  suppChip: {
    backgroundColor: "#FEF3C7",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  suppChipText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#B45309",
  },
  compBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  compBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
});
