import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryFilter } from "@/components/CategoryFilter";
import { PostCard } from "@/components/PostCard";
import Colors from "@/constants/colors";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { PostCategory, SAMPLE_POSTS } from "@/data/feed";
import { ONTARIO_UNIVERSITIES } from "@/data/universities";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { subscribed } = useSubscriptions();
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const filteredPosts = useMemo(() => {
    let posts = SAMPLE_POSTS.filter(
      (p) => subscribed.length === 0 || subscribed.includes(p.universityId)
    );
    if (selectedCategory) {
      posts = posts.filter((p) => p.category === selectedCategory);
    }
    if (sortBy === "hot") {
      posts = [...posts].sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === "new") {
      posts = [...posts].reverse();
    } else {
      posts = [...posts].sort((a, b) => b.upvotes + b.comments - (a.upvotes + a.comments));
    }
    return posts;
  }, [subscribed, selectedCategory, sortBy]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const subscribedUnis = ONTARIO_UNIVERSITIES.filter((u) =>
    subscribed.includes(u.id)
  );

  const renderHeader = () => (
    <View>
      {subscribed.length === 0 ? (
        <View style={styles.emptySubscriptions}>
          <Feather name="plus-circle" size={40} color={Colors.light.primary} />
          <Text style={styles.emptyTitle}>Find Your Universities</Text>
          <Text style={styles.emptySubtitle}>
            Subscribe to Ontario universities to see their latest posts, events, and updates.
          </Text>
          <Pressable
            style={styles.exploreBtn}
            onPress={() => router.push("/(tabs)/universities")}
          >
            <Text style={styles.exploreBtnText}>Browse Universities</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.subscribedScroll}>
          <FlatList
            horizontal
            data={subscribedUnis}
            keyExtractor={(u) => u.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.uniPillsRow}
            renderItem={({ item }) => (
              <Pressable
                style={styles.uniPill}
                onPress={() =>
                  router.push({
                    pathname: "/university/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <View style={[styles.uniPillDot, { backgroundColor: item.color }]} />
                <Text style={styles.uniPillText}>{item.shortName}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      <View style={styles.sortRow}>
        {(["hot", "new", "top"] as const).map((s) => (
          <Pressable
            key={s}
            style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
            onPress={() => setSortBy(s)}
          >
            <Feather
              name={s === "hot" ? "trending-up" : s === "new" ? "clock" : "star"}
              size={14}
              color={
                sortBy === s ? Colors.light.primary : Colors.light.textSecondary
              }
            />
            <Text
              style={[
                styles.sortText,
                sortBy === s && styles.sortTextActive,
              ]}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>U</Text>
          </View>
          <View>
            <Text style={styles.appName}>UniHub</Text>
            <Text style={styles.appSubtitle}>Ontario Universities</Text>
          </View>
        </View>
        <Pressable
          style={styles.notifBtn}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Feather name="bell" size={22} color={Colors.light.text} />
        </Pressable>
      </View>

      {subscribed.length === 0 ? (
        <View style={styles.feedEmpty}>
          {renderHeader()}
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.listContent, Platform.OS === "web" && { paddingBottom: 34 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!filteredPosts.length}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.noPostsEmpty}>
              <Feather name="inbox" size={36} color={Colors.light.textMuted} />
              <Text style={styles.noPostsText}>No posts match this filter</Text>
              <Pressable onPress={() => setSelectedCategory(null)}>
                <Text style={styles.clearFilter}>Clear filter</Text>
              </Pressable>
            </View>
          }
        />
      )}
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
    paddingBottom: 12,
    paddingTop: 4,
    backgroundColor: Colors.light.background,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  appName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  appSubtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  notifBtn: {
    padding: 6,
  },
  subscribedScroll: {
    marginBottom: 4,
  },
  uniPillsRow: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: "row",
    paddingVertical: 4,
  },
  uniPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  uniPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  uniPillText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  sortRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
    paddingTop: 8,
    paddingBottom: 2,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  sortTextActive: {
    color: Colors.light.primary,
    fontFamily: "Inter_600SemiBold",
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  feedEmpty: {
    flex: 1,
  },
  emptySubscriptions: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  exploreBtn: {
    marginTop: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  noPostsEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  noPostsText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  clearFilter: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
});
