import Feather from "@expo/vector-icons/Feather";
import type { Palette } from "@/constants/theme";
import { usePalette } from "@/context/ThemeContext";
import { useThemedStyles } from "@/lib/useThemedStyles";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

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
  const c = usePalette();
  const styles = useThemedStyles(makeStyles);
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
              color={isActive ? c.paper : c.softInk}
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

const makeStyles = (c: Palette) => StyleSheet.create({
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
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.rule,
  },
  chipActive: {
    backgroundColor: c.ink,
    borderColor: c.ink,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.softInk,
  },
  chipTextActive: {
    color: c.paper,
  },
});
