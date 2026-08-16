import Feather from "@expo/vector-icons/Feather";
import type { Palette } from "@/constants/theme";
import { usePalette } from "@/context/ThemeContext";
import { useThemedStyles } from "@/lib/useThemedStyles";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PostCard } from "@/components/PostCard";
import { useSavedPosts } from "@/context/SavedPostsContext";
import { SAMPLE_POSTS } from "@/data/feed";

export default function SavedScreen() {
  const c = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { savedPostIds } = useSavedPosts();

  const savedPosts = SAMPLE_POSTS.filter((p) => savedPostIds.includes(p.id));

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>
          {savedPosts.length} saved {savedPosts.length === 1 ? "post" : "posts"}
        </Text>
      </View>

      <FlatList
        data={savedPosts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={[
          styles.listContent,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!savedPosts.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bookmark" size={48} color={c.muted} />
            <Text style={styles.emptyTitle}>No saved posts yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the bookmark icon on any post to save it for later.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.paper,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: c.ink,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.muted,
    marginTop: 2,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 100,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: c.ink,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.softInk,
    textAlign: "center",
    lineHeight: 20,
  },
});
