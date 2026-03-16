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

import { PostCard } from "@/components/PostCard";
import Colors from "@/constants/colors";
import { SAMPLE_POSTS } from "@/data/feed";
import { SAMPLE_PROGRAMS } from "@/data/programs";
import { ONTARIO_UNIVERSITIES } from "@/data/universities";

type SearchTab = "posts" | "programs" | "universities";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("posts");

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SAMPLE_POSTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.author.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredPrograms = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SAMPLE_PROGRAMS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.faculty.toLowerCase().includes(q) ||
        p.careerPaths.some((c) => c.toLowerCase().includes(q))
    );
  }, [query]);

  const filteredUniversities = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ONTARIO_UNIVERSITIES.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.faculties.some((f) => f.toLowerCase().includes(q))
    );
  }, [query]);

  const SEARCH_TABS: { id: SearchTab; label: string }[] = [
    { id: "posts", label: `Posts${filteredPosts.length ? ` (${filteredPosts.length})` : ""}` },
    { id: "programs", label: `Programs${filteredPrograms.length ? ` (${filteredPrograms.length})` : ""}` },
    { id: "universities", label: `Universities${filteredUniversities.length ? ` (${filteredUniversities.length})` : ""}` },
  ];

  const POPULAR_SEARCHES = [
    "Computer Science",
    "Open House",
    "Hackathon",
    "Waterloo co-op",
    "Scholarship",
    "Engineering",
    "Business",
    "Medicine",
  ];

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={18} color={Colors.light.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts, programs, universities…"
          placeholderTextColor={Colors.light.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Feather name="x-circle" size={18} color={Colors.light.textMuted} />
          </Pressable>
        )}
      </View>

      {query.trim() ? (
        <>
          <View style={styles.tabsRow}>
            {SEARCH_TABS.map((tab) => (
              <Pressable
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === "posts" && (
            <FlatList
              data={filteredPosts}
              keyExtractor={(p) => p.id}
              renderItem={({ item }) => <PostCard post={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!!filteredPosts.length}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Feather name="file-text" size={36} color={Colors.light.textMuted} />
                  <Text style={styles.emptyText}>No posts found</Text>
                </View>
              }
            />
          )}

          {activeTab === "programs" && (
            <FlatList
              data={filteredPrograms}
              keyExtractor={(p) => p.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!!filteredPrograms.length}
              renderItem={({ item }) => {
                const uni = ONTARIO_UNIVERSITIES.find(
                  (u) => u.id === item.universityId
                );
                return (
                  <Pressable
                    style={styles.programCard}
                    onPress={() =>
                      router.push({
                        pathname: "/university/[id]",
                        params: { id: item.universityId },
                      })
                    }
                  >
                    <View style={styles.programHeader}>
                      <View>
                        <Text style={styles.programName}>{item.name}</Text>
                        <Text style={styles.programUni}>{uni?.shortName} · {item.faculty}</Text>
                      </View>
                      <View style={[styles.gradeBadge, item.hasCoOp && styles.coOpBadge]}>
                        <Text style={[styles.gradeText, item.hasCoOp && { color: Colors.light.success }]}>
                          {item.hasCoOp ? "Co-op" : item.degree}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.programDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.programMeta}>
                      <View style={styles.metaItem}>
                        <Feather name="bar-chart-2" size={12} color={Colors.light.textMuted} />
                        <Text style={styles.metaText}>{item.averageGrade} avg</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Feather name="clock" size={12} color={Colors.light.textMuted} />
                        <Text style={styles.metaText}>{item.duration}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Feather name="dollar-sign" size={12} color={Colors.light.textMuted} />
                        <Text style={styles.metaText}>{item.tuition}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Feather name="book-open" size={36} color={Colors.light.textMuted} />
                  <Text style={styles.emptyText}>No programs found</Text>
                </View>
              }
            />
          )}

          {activeTab === "universities" && (
            <FlatList
              data={filteredUniversities}
              keyExtractor={(u) => u.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!!filteredUniversities.length}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.uniResult}
                  onPress={() =>
                    router.push({
                      pathname: "/university/[id]",
                      params: { id: item.id },
                    })
                  }
                >
                  <View
                    style={[
                      styles.uniLogo,
                      { backgroundColor: item.color + "20" },
                    ]}
                  >
                    <Text style={styles.uniLogoText}>{item.logo}</Text>
                  </View>
                  <View style={styles.uniInfo}>
                    <Text style={styles.uniName}>{item.name}</Text>
                    <Text style={styles.uniLocation}>{item.location}</Text>
                    <Text style={styles.uniFaculties}>
                      {item.faculties.slice(0, 3).join(", ")}
                      {item.faculties.length > 3 ? "…" : ""}
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={Colors.light.textMuted}
                  />
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Feather name="map-pin" size={36} color={Colors.light.textMuted} />
                  <Text style={styles.emptyText}>No universities found</Text>
                </View>
              }
            />
          )}
        </>
      ) : (
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>Popular Searches</Text>
          <View style={styles.popularGrid}>
            {POPULAR_SEARCHES.map((term) => (
              <Pressable
                key={term}
                style={styles.popularChip}
                onPress={() => setQuery(term)}
              >
                <Feather name="trending-up" size={12} color={Colors.light.primary} />
                <Text style={styles.popularChipText}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
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
    paddingBottom: 8,
    paddingTop: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    padding: 0,
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 100,
  },
  programCard: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  programName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  programUni: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: Colors.light.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coOpBadge: {
    backgroundColor: Colors.light.success + "15",
  },
  gradeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  programDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  programMeta: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  uniResult: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  uniLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uniLogoText: {
    fontSize: 22,
  },
  uniInfo: {
    flex: 1,
    gap: 2,
  },
  uniName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  uniLocation: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  uniFaculties: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 2,
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
  popularSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  popularTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 12,
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  popularChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  popularChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
});
