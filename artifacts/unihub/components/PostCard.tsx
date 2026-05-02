import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSavedPosts } from "@/context/SavedPostsContext";
import { CATEGORY_CONFIG, Post } from "@/data/feed";
import { getUniversityById } from "@/data/universities";
import Colors from "@/constants/colors";

interface PostCardProps {
  post: Post;
  showUniversity?: boolean;
}

export function PostCard({ post, showUniversity = true }: PostCardProps) {
  const uni = getUniversityById(post.universityId);
  const { isSaved, isLiked, toggleSave, toggleLike } = useSavedPosts();
  const saved = isSaved(post.id);
  const liked = isLiked(post.id);
  const categoryConfig = CATEGORY_CONFIG[post.category];

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike(post.id);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSave(post.id);
  };

  const handlePress = () => {
    router.push({ pathname: "/post/[id]", params: { id: post.id } });
  };

  const displayLikes = liked ? post.likes + 1 : post.likes;

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={handlePress}
    >
      {post.isPinned && (
        <View style={styles.pinnedBanner}>
          <Feather name="bookmark" size={11} color={Colors.light.primary} />
          <Text style={styles.pinnedText}>Pinned</Text>
        </View>
      )}

      {showUniversity && uni && (
        <View style={styles.uniRow}>
          <View style={[styles.uniDot, { backgroundColor: uni.color }]} />
          <Text style={styles.uniName}>{uni.shortName}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.author} numberOfLines={1}>{post.author}</Text>
        </View>
      )}

      <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color + "18" }]}>
        <Feather
          name={categoryConfig.icon as any}
          size={11}
          color={categoryConfig.color}
        />
        <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
          {categoryConfig.label}
        </Text>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body} numberOfLines={3}>
        {post.body}
      </Text>

      {post.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {post.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        {/* Like button */}
        <Pressable
          style={[styles.actionBtn, liked && styles.likeActive]}
          onPress={handleLike}
          hitSlop={8}
        >
          <Feather
            name="heart"
            size={15}
            color={liked ? Colors.light.likeColor : Colors.light.textSecondary}
          />
          <Text style={[styles.actionText, liked && styles.likeText]}>
            {formatCount(displayLikes)}
          </Text>
        </Pressable>

        {/* Comment count */}
        <Pressable style={styles.actionBtn} onPress={handlePress} hitSlop={8}>
          <Feather name="message-square" size={15} color={Colors.light.textSecondary} />
          <Text style={styles.actionText}>{formatCount(post.comments)}</Text>
        </Pressable>

        <View style={styles.rightActions}>
          <Pressable onPress={handleSave} hitSlop={8} style={styles.iconBtn}>
            <Feather
              name="bookmark"
              size={16}
              color={saved ? Colors.light.primary : Colors.light.textSecondary}
            />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconBtn}>
            <Feather name="share-2" size={16} color={Colors.light.textSecondary} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  pinnedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  pinnedText: {
    fontSize: 11,
    color: Colors.light.primary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  uniRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 4,
  },
  uniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  uniName: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  dot: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontFamily: "Inter_400Regular",
  },
  author: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontFamily: "Inter_400Regular",
    flexShrink: 1,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: Colors.light.tag,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.tagText,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  likeActive: {
    backgroundColor: "#FF2D5515",
  },
  actionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  likeText: {
    color: Colors.light.likeColor,
  },
  rightActions: {
    marginLeft: "auto",
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
});
