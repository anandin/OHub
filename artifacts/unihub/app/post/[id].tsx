import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useSavedPosts } from "@/context/SavedPostsContext";
import { CATEGORY_CONFIG, Post, SAMPLE_POSTS } from "@/data/feed";
import { REFRESH_BATCHES } from "@/data/feedRefreshBatches";
import { getUniversityById } from "@/data/universities";

function findPost(id: string): Post | undefined {
  const all: Post[] = [
    ...SAMPLE_POSTS,
    ...REFRESH_BATCHES.flat(),
  ];
  return all.find((p) => p.id === id);
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { isSaved, isLiked, toggleSave, toggleLike } = useSavedPosts();

  const post = findPost(id);

  if (!post) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Post not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const uni = getUniversityById(post.universityId);
  const saved = isSaved(post.id);
  const liked = isLiked(post.id);
  const categoryConfig = CATEGORY_CONFIG[post.category];
  const displayLikes = liked ? post.likes + 1 : post.likes;

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike(post.id);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSave(post.id);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={Colors.light.text} />
        </Pressable>
        <View style={styles.topBarActions}>
          <Pressable style={styles.iconBtn} onPress={handleSave}>
            <Feather
              name="bookmark"
              size={20}
              color={saved ? Colors.light.primary : Colors.light.textSecondary}
            />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Feather name="share-2" size={20} color={Colors.light.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
      >
        {uni && (
          <Pressable
            style={styles.uniRow}
            onPress={() =>
              router.push({ pathname: "/university/[id]", params: { id: uni.id } })
            }
          >
            <View style={[styles.uniDot, { backgroundColor: uni.color }]} />
            <Text style={styles.uniName}>{uni.name}</Text>
            <Feather name="chevron-right" size={14} color={Colors.light.textMuted} />
          </Pressable>
        )}

        <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color + "15" }]}>
          <Feather name={categoryConfig.icon as any} size={13} color={categoryConfig.color} />
          <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
            {categoryConfig.label}
          </Text>
        </View>

        <Text style={styles.title}>{post.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.author}>Posted by {post.author}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>

        <Text style={styles.body}>{post.body}</Text>

        {post.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {post.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.actionsRow}>
          {/* Like button */}
          <Pressable
            style={[styles.actionBtn, liked && styles.likeActive]}
            onPress={handleLike}
          >
            <Feather
              name="heart"
              size={18}
              color={liked ? Colors.light.likeColor : Colors.light.textSecondary}
            />
            <Text style={[styles.actionText, liked && styles.likeText]}>
              {formatCount(displayLikes)} {displayLikes === 1 ? "like" : "likes"}
            </Text>
          </Pressable>

          <View style={styles.commentCount}>
            <Feather name="message-square" size={18} color={Colors.light.textSecondary} />
            <Text style={styles.actionText}>{formatCount(post.comments)} comments</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.sourceSection}>
          <Text style={styles.sourceSectionTitle}>Source</Text>
          <Pressable
            style={styles.sourceLink}
            onPress={() => post.sourceUrl && Linking.openURL(post.sourceUrl)}
          >
            <Feather name="globe" size={15} color={Colors.light.primary} />
            <Text style={styles.sourceLinkText}>{post.source}</Text>
            <Feather name="external-link" size={13} color={Colors.light.primary} />
          </Pressable>
        </View>

        {uni && (
          <Pressable
            style={[styles.uniCard, { borderLeftColor: uni.color }]}
            onPress={() =>
              router.push({ pathname: "/university/[id]", params: { id: uni.id } })
            }
          >
            <View style={styles.uniCardContent}>
              <Text style={styles.uniCardEmoji}>{uni.logo}</Text>
              <View style={styles.uniCardInfo}>
                <Text style={styles.uniCardName}>{uni.name}</Text>
                <Text style={styles.uniCardLocation}>{uni.location}</Text>
              </View>
            </View>
            <View style={styles.viewUniBtn}>
              <Text style={[styles.viewUniBtnText, { color: uni.color }]}>
                View University
              </Text>
              <Feather name="chevron-right" size={14} color={uni.color} />
            </View>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  backLink: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 4,
    backgroundColor: Colors.light.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  topBarActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    gap: 12,
  },
  uniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  uniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  uniName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  author: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  dot: {
    fontSize: 13,
    color: Colors.light.textMuted,
  },
  timeAgo: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  body: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 26,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.light.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 4,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  likeActive: {
    backgroundColor: "#FF2D5512",
  },
  actionText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  likeText: {
    color: Colors.light.likeColor,
  },
  commentCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  sourceSection: {
    gap: 8,
  },
  sourceSectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sourceLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.primaryMuted,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sourceLinkText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.primary,
  },
  uniCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  uniCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  uniCardEmoji: {
    fontSize: 24,
  },
  uniCardInfo: {
    flex: 1,
    gap: 2,
  },
  uniCardName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  uniCardLocation: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  viewUniBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  viewUniBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
