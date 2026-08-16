import { router } from "expo-router";
import type { Palette } from "@/constants/theme";
import { usePalette } from "@/context/ThemeContext";
import { useThemedStyles } from "@/lib/useThemedStyles";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";

import { Post, SAMPLE_POSTS, CATEGORY_CONFIG } from "@/data/feed";
import { getUniversityById } from "@/data/universities";
import { useSavedPosts } from "@/context/SavedPostsContext";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { sharePost } from "@/lib/share";

type FeedTab = 'following' | 'trending' | 'all';


function PostItem({
  post,
  onTagPress,
}: {
  post: Post;
  onTagPress: (tag: string) => void;
}) {
  const c = usePalette();
  const styles = useThemedStyles(makeStyles);
  const uni = getUniversityById(post.universityId);
  const catCfg = CATEGORY_CONFIG[post.category];
  const { toggleSubscription, isSubscribed } = useSubscriptions();
  const { isLiked, toggleLike } = useSavedPosts();
  const following = isSubscribed(post.universityId);
  const liked = isLiked(post.id);
  const likes = liked ? post.likes + 1 : post.likes;
  const [shareNote, setShareNote] = useState<string | null>(null);

  const handleLike = () => toggleLike(post.id);

  const handleShare = async () => {
    const result = await sharePost({
      title: post.title,
      body: post.body,
      url: post.sourceUrl,
    });
    if (result.via === "clipboard") {
      setShareNote("Copied to clipboard");
      setTimeout(() => setShareNote(null), 2000);
    } else if (!result.ok) {
      setShareNote("Couldn't share that");
      setTimeout(() => setShareNote(null), 2000);
    }
  };

  return (
    <Pressable
      style={styles.postItem}
      onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${post.title}. ${catCfg.label}${uni ? ` from ${uni.shortName}` : ''}, ${post.timeAgo}.`}
      accessibilityHint="Opens the full post"
    >
      {/* Meta row */}
      <View style={styles.postMeta}>
        <View style={[styles.uniDot, { backgroundColor: uni?.color ?? c.muted }]} />
        <Text style={styles.postAuthor}>{post.author}</Text>
        <Text style={styles.postMetaSep}>·</Text>
        <Text style={styles.postUni}>{uni?.shortName ?? 'Ontario'}</Text>
        <Text style={styles.postMetaSep}>·</Text>
        <Text style={styles.postTime}>{post.timeAgo}</Text>
        <View style={[styles.catBadge, { backgroundColor: catCfg.color + '18' }]}>
          <Text style={[styles.catBadgeText, { color: catCfg.color }]}>{catCfg.label}</Text>
        </View>
        <Pressable
          style={[styles.followPill, following && styles.followPillActive]}
          onPress={e => { e.stopPropagation?.(); toggleSubscription(post.universityId); }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: following }}
          accessibilityLabel={`${following ? 'Unfollow' : 'Follow'} ${uni?.shortName ?? 'this university'}`}
        >
          <Text style={[styles.followPillText, following && styles.followPillTextActive]}>
            {following ? '✓' : '+'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.postTitle}>{post.title}</Text>
      {post.body.length > 0 && (
        <Text style={styles.postBody} numberOfLines={3}>{post.body}</Text>
      )}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagRow}>
          {post.tags.slice(0, 3).map(tag => (
            <Pressable
              key={tag}
              style={styles.tag}
              onPress={e => { e.stopPropagation?.(); onTagPress(tag); }}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={`Filter the feed by ${tag}`}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <Pressable
          style={styles.actionBtn}
          onPress={e => { e.stopPropagation?.(); handleLike(); }}
          accessibilityRole="button"
          accessibilityState={{ selected: liked }}
          accessibilityLabel={`${liked ? 'Unlike' : 'Like'} this post. ${likes} likes`}
        >
          <Feather name="heart" size={14} color={liked ? c.warn : c.muted} />
          <Text style={[styles.actionText, liked && { color: c.warn }]}>{likes}</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={e => { e.stopPropagation?.(); void handleShare(); }}
          accessibilityRole="button"
          accessibilityLabel="Share this post"
        >
          <Feather name="share" size={14} color={c.muted} />
          <Text style={styles.actionText}>{shareNote ?? 'Share'}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function PulseScreen() {
  const c = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const { subscribed } = useSubscriptions();
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const handleTagPress = (tag: string) => {
    setActiveTag(prev => prev === tag ? null : tag);
  };

  const posts = useMemo(() => {
    let base: Post[];
    if (activeTab === 'following') {
      if (subscribed.length === 0) base = [];
      else base = SAMPLE_POSTS.filter(p => subscribed.includes(p.universityId));
    } else if (activeTab === 'trending') {
      base = [...SAMPLE_POSTS].sort((a, b) => (b.likes + b.comments * 2) - (a.likes + a.comments * 2));
    } else {
      base = SAMPLE_POSTS;
    }
    if (activeTag) {
      return base.filter(p => p.tags.includes(activeTag));
    }
    return base;
  }, [activeTab, subscribed, activeTag]);

  const tabs: { id: FeedTab; label: string }[] = [
    { id: 'following', label: 'Following' },
    { id: 'trending', label: 'Trending' },
    { id: 'all', label: 'All' },
  ];

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Community</Text>
          <Text style={styles.title}>Pulse</Text>
        </View>
      </View>

      {/* Tab pills */}
      <View style={styles.tabRow}>
        {tabs.map(tab => (
          <Pressable
            key={tab.id}
            style={[styles.tabPill, activeTab === tab.id && styles.tabPillActive]}
            onPress={() => setActiveTab(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
            accessibilityLabel={`${tab.label} posts`}
          >
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Pulse is a worked example, not a live feed. The posts carry relative
          timestamps ("3h", "1d") because that is what a real feed looks like —
          without this line those stamps read as recent activity, which is the
          same kind of quiet fiction the app refuses to commit with marks. */}
      <View style={styles.sampleNotice}>
        <Feather name="info" size={12} color={c.muted} />
        <Text style={styles.sampleNoticeText}>
          Sample feed — example posts, not live university updates.
        </Text>
      </View>

      {/* Active tag filter bar */}
      {activeTag && (
        <View style={styles.tagFilterBar}>
          <Feather name="tag" size={12} color={c.softInk} />
          <Text style={styles.tagFilterLabel}>{activeTag}</Text>
          <Pressable
            onPress={() => setActiveTag(null)}
            hitSlop={8}
            style={styles.tagFilterClear}
            accessibilityRole="button"
            accessibilityLabel="Clear the tag filter"
          >
            <Feather name="x" size={13} color={c.muted} />
          </Pressable>
        </View>
      )}

      <FlatList
        data={posts}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <PostItem post={item} onTagPress={handleTagPress} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {activeTag ? (
              <>
                <Feather name="tag" size={28} color={c.muted} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No posts tagged &ldquo;{activeTag}&rdquo;</Text>
                <Pressable
                  onPress={() => setActiveTag(null)}
                  style={styles.clearTagBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Clear the tag filter"
                >
                  <Text style={styles.clearTagBtnText}>Clear filter</Text>
                </Pressable>
              </>
            ) : activeTab === 'following' ? (
              <>
                <Feather name="rss" size={28} color={c.muted} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>Follow schools to see their posts</Text>
                <Text style={styles.emptyBody}>
                  Tap the + on any post to follow that school.
                </Text>
              </>
            ) : (
              <Text style={styles.emptyTitle}>No posts yet</Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  sampleNotice: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 16, paddingVertical: 9,
    backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.rule,
  },
  sampleNoticeText: { fontSize: 12, color: c.muted, fontFamily: 'Inter_400Regular', flexShrink: 1 },
  container: { flex: 1, backgroundColor: c.paper },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: c.muted,
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 30, color: c.ink, lineHeight: 32 },
  tabRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingBottom: 12 },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.pillBorder,
    backgroundColor: 'transparent',
  },
  tabPillActive: { backgroundColor: c.ink, borderColor: c.ink },
  tabLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: c.ink },
  tabLabelActive: { color: c.paper },
  tagFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 10,
    backgroundColor: c.ink,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  tagFilterLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: c.paper },
  tagFilterClear: { marginLeft: 2 },
  listContent: { paddingBottom: 100 },
  separator: { height: 1, backgroundColor: c.rule, marginHorizontal: 24 },
  postItem: { paddingHorizontal: 24, paddingVertical: 18 },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  uniDot: { width: 7, height: 7, borderRadius: 999 },
  postAuthor: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: c.ink },
  postUni: { fontSize: 12, fontFamily: 'Inter_400Regular', color: c.muted },
  postMetaSep: { fontSize: 12, color: c.pillBorder },
  postTime: { fontSize: 11, color: c.muted, fontFamily: 'Inter_400Regular' },
  catBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 2,
  },
  catBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  followPill: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.pillBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  followPillActive: { backgroundColor: c.ink, borderColor: c.ink },
  followPillText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: c.softInk, lineHeight: 14 },
  followPillTextActive: { color: c.paper },
  postTitle: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 17,
    lineHeight: 22,
    color: c.ink,
    marginBottom: 6,
  },
  postBody: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: c.softInk,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  tag: {
    borderWidth: 1,
    borderColor: c.pillBorder,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: c.card,
  },
  tagText: { fontSize: 11, color: c.softInk, fontFamily: 'Inter_500Medium' },
  postActions: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 12, color: c.muted, fontFamily: 'Inter_400Regular' },
  emptyState: { padding: 48, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 18, color: c.ink, marginBottom: 8, textAlign: 'center' },
  emptyBody: { fontSize: 13, color: c.muted, textAlign: 'center', lineHeight: 20, fontFamily: 'Inter_400Regular' },
  clearTagBtn: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.pillBorder,
  },
  clearTagBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: c.ink },
});
