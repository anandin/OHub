import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import Colors from "@/constants/colors";
import { CATEGORY_CONFIG, PostCategory } from "@/data/feed";

const ALL_CATEGORIES: PostCategory[] = [
  "event",
  "hackathon",
  "openhouse",
  "program",
  "scholarship",
  "competition",
  "club",
  "merch",
  "news",
  "sports",
  "research",
  "admission",
];

interface CategoryFilterProps {
  selected: PostCategory | null;
  onSelect: (cat: PostCategory | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      accessibilityRole="tablist"
      accessibilityLabel="Filter posts by category"
    >
      <Pressable
        style={[styles.chip, !selected && styles.chipActive]}
        onPress={() => onSelect(null)}
        accessibilityRole="tab"
        accessibilityState={{ selected: !selected }}
        accessibilityLabel="All categories"
      >
        <Text style={[styles.chipText, !selected && styles.chipTextActive]}>
          All
        </Text>
      </Pressable>
      {ALL_CATEGORIES.map((cat) => {
        const config = CATEGORY_CONFIG[cat];
        const isActive = selected === cat;
        return (
          <Pressable
            key={cat}
            style={[
              styles.chip,
              isActive && { backgroundColor: config.color, borderColor: config.color },
            ]}
            onPress={() => onSelect(isActive ? null : cat)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${config.label} posts`}
          >
            <Feather
              name={config.icon as any}
              size={12}
              color={isActive ? "#fff" : Colors.light.textSecondary}
            />
            <Text
              style={[styles.chipText, isActive && styles.chipTextActive]}
            >
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  chipTextActive: {
    color: "#fff",
  },
});
