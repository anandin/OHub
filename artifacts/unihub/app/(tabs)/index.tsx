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
import { Post, PostCategory, SAMPLE_POSTS } from "@/data/feed";
import { getUpcomingDeadlines } from "@/data/deadlines";
import { ONTARIO_UNIVERSITIES } from "@/data/universities";
import { useFeedRefresh } from "@/hooks/useFeedRefresh";

type SortBy = "hot" | "new" | "top";

const APPLICANT_HIDE_CATEGORIES: PostCategory[] = ["club", "sports", "merch"];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { subscribed } = useSubscriptions();
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("hot");
  const [applicantMode, setApplicantMode] = useState(false);

  const { extraPosts, nextRefreshIn, manualRefresh } = useFeedRefresh();
  const upcomingDeadlines = useMemo(() => getUpcomingDeadlines(1), []);
  const nextDeadline = upcomingDeadlines[0] ?? null;

  const allPosts = useMemo<Post[]>(() => [...extraPosts, ...SAMPLE_POSTS], [extraPosts]);

  const filteredPosts = useMemo(() => {
    let posts = allPosts.filter(
      (p) => subscribed.length === 0 || subscribed.includes(p.universityId)
    );
    if (applicantMode) {
      posts = posts.filter((p) => !APPLICANT_HIDE_CATEGORIES.includes(p.category));
    }
    if (selectedCategory) {
      posts = posts.filter((p) => p.category === selectedCategory);
    }
    if (sortBy === "hot") {
      posts = [...posts].sort((a, b) => b.likes - a.likes);
    } else if (sortBy === "new") {
      posts = [...posts].reverse();
    } else {
      posts = [...posts].sort(
        (a, b) => b.likes + b.comments - (a.likes + a.comments)
      );
    }
    return posts;
  }, [allPosts, subscribed, selectedCategory, sortBy, applicantMode]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await manualRefresh();
    setRefreshing(false);
  };

  const subscribedUnis = ONTARIO_UNIVERSITIES.filter((u) =>
    subscribed.includes(u.id)
  );

  const renderHeader = () => (
    <View>
      {/* Deadline banner */}
      {nextDeadline && (
        <Pressable
          style={[
            styles.deadlineBanner,
            nextDeadline.daysUntil <= 14 && styles.deadlineBannerUrgent,
          ]}
          onPress={() => router.push("/(tabs)/apply")}
        >
          <View style={styles.deadlineBannerLeft}>
            <Feather
              name="clock"
              size={14}
              color={nextDeadline.daysUntil <= 14 ? "#EF4444" : Colors.light.primary}
            />
            <View style={styles.deadlineBannerText}>
              <Text style={styles.deadlineBannerTitle} numberOfLines={1}>
                {nextDeadline.title}
              </Text>
              <Text
                style={[
                  styles.deadlineBannerDays,
                  { color: nextDeadline.daysUntil <= 14 ? "#EF4444" : Colors.light.primary },
                ]}
              >
                {nextDeadline.daysUntil === 0
                  ? "Due today"
                  : nextDeadline.daysUntil === 1
                  ? "Due tomorrow"
                  : `${nextDeadline.daysUntil} days left`}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={16} color={Colors.light.textMuted} />
        </Pressable>
      )}

      {/* Subscribed university pills */}
      {subscribed.length > 0 && (
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
                  router.push({ pathname: "/university/[id]", params: { id: item.id } })
                }
              >
                <View style={[styles.uniPillDot, { backgroundColor: item.color }]} />
                <Text style={styles.uniPillText}>{item.shortName}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Sort + Applicant Mode row */}
      <View style={styles.sortRow}>
        {(["hot", "new", "top"] as SortBy[]).map((s) => (
          <Pressable
            key={s}
            style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
            onPress={() => setSortBy(s)}
          >
            <Feather
              name={s === "hot" ? "trending-up" : s === "new" ? "clock" : "star"}
              size={14}
              color={sortBy === s ? Colors.light.primary : Colors.light.textSecondary}
            />
            <Text style={[styles.sortText, sortBy === s && styles.sortTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={[styles.applicantToggle, applicantMode && styles.applicantToggleActive]}
          onPress={() => {
            setApplicantMode((m) => !m);
            if (applicantMode) setSelectedCategory(null);
          }}
        >
          <Feather
            name="user-check"
            size={13}
            color={applicantMode ? "#fff" : Colors.light.textSecondary}
          />
          <Text
            style={[
              styles.applicantToggleText,
              applicantMode && styles.applicantToggleTextActive,
            ]}
          >
            Applicant
          </Text>
        </Pressable>
      </View>

      {applicantMode && (
        <View style={styles.applicantModeBanner}>
          <Feather name="info" size={12} color={Colors.light.primary} />
          <Text style={styles.applicantModeText}>
            Showing admission-relevant posts · Club, sports &amp; merch posts hidden
          </Text>
        </View>
      )}

      {nextRefreshIn.length > 0 && (
        <View style={styles.refreshHint}>
          <Feather name="refresh-cw" size={10} color={Colors.light.textMuted} />
          <Text style={styles.refreshHintText}>Next update in {nextRefreshIn}</Text>
        </View>
      )}

      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {extraPosts.length > 0 && (
        <View style={styles.newPostsBanner}>
          <Feather name="zap" size={12} color={Colors.light.primary} />
          <Text style={styles.newPostsText}>
            {extraPosts.length} new posts added
          </Text>
        </View>
      )}
    </View>
  );

  if (subscribed.length === 0) {
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
        </View>
        <View style={styles.feedEmpty}>
          <Feather name="plus-circle" size={40} color={Colors.light.primary} />
          <Text style={styles.emptyTitle}>Find Your Universities</Text>
          <Text style={styles.emptySubtitle}>
            Subscribe to Ontario universities to see their latest posts, events, and updates in your feed.
          </Text>
          <Pressable
            style={styles.exploreBtn}
            onPress={() => router.push("/(tabs)/universities")}
          >
            <Text style={styles.exploreBtnText}>Browse Universities</Text>
          </Pressable>
        </View>
      </View>
    );
  }

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
          onPress={() => router.push("/(tabs)/apply")}
        >
          <Feather name="bell" size={22} color={Colors.light.text} />
        </Pressable>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled
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
            <Pressable
              onPress={() => {
                setSelectedCategory(null);
                setApplicantMode(false);
              }}
            >
              <Text style={styles.clearFilter}>Clear filters</Text>
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
  deadlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.light.primary + "30",
  },
  deadlineBannerUrgent: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF444430",
  },
  deadlineBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  deadlineBannerText: {
    flex: 1,
    gap: 1,
  },
  deadlineBannerTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  deadlineBannerDays: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
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
    gap: 6,
    paddingTop: 8,
    paddingBottom: 2,
    alignItems: "center",
    flexWrap: "wrap",
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
  applicantToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginLeft: "auto",
  },
  applicantToggleActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  applicantToggleText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  applicantToggleTextActive: {
    color: "#fff",
  },
  applicantModeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 12,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.light.primaryMuted,
  },
  applicantModeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.primary,
    flex: 1,
  },
  refreshHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginHorizontal: 12,
    marginTop: 6,
  },
  refreshHintText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  newPostsBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryMuted,
  },
  newPostsText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  feedEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
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
