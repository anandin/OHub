import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { displayHost, openExternalUrl } from "@/lib/safeLink";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { CATEGORY_CONFIG, SAMPLE_POSTS } from "@/data/feed";
import { REFRESH_BATCHES } from "@/data/feedRefreshBatches";
import { getUniversityById } from "@/data/universities";
import { ED } from "@/constants/theme";


export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 20 : insets.top;
  const { toggleSubscription, isSubscribed } = useSubscriptions();

  const allPosts = [...SAMPLE_POSTS, ...REFRESH_BATCHES.flat()];
  const post = allPosts.find(p => p.id === id);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes ?? 0);

  if (!post) {
    return (
      <View style={[styles.container, { paddingTop: topInset, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.notFoundText}>Post not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: ED.muted, fontFamily: 'Inter_400Regular' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const uni = getUniversityById(post.universityId);
  const catCfg = CATEGORY_CONFIG[post.category];
  const following = isSubscribed(post.universityId);

  const handleLike = () => {
    setLiked(l => !l);
    setLikeCount(n => liked ? n - 1 : n + 1);
  };

  const handleFollow = () => {
    toggleSubscription(post.universityId);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.title}\n\n${post.body.slice(0, 280)}${post.body.length > 280 ? '…' : ''}\n\n— via UniHub`,
        title: post.title,
      });
    } catch {}
  };

  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={ED.ink} />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable style={styles.iconBtn} onPress={handleShare}>
            <Feather name="share" size={18} color={ED.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* University row */}
        {uni && (
          <View style={styles.uniRow}>
            <View style={[styles.uniDot, { backgroundColor: uni.color }]} />
            <Text style={styles.uniName}>{uni.name}</Text>
            <Pressable
              style={[styles.followBtn, following && styles.followBtnActive]}
              onPress={handleFollow}
            >
              <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
                {following ? 'Following' : '+ Follow'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Category badge */}
        <View style={[styles.catBadge, { backgroundColor: catCfg.color + '18' }]}>
          <Feather name={catCfg.icon as any} size={12} color={catCfg.color} />
          <Text style={[styles.catBadgeText, { color: catCfg.color }]}>{catCfg.label}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{post.title}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaAuthor}>Posted by {post.author}</Text>
          <Text style={styles.metaSep}>·</Text>
          <Text style={styles.metaTime}>{post.timeAgo}</Text>
        </View>

        {/* Body */}
        <Text style={styles.body}>{post.body}</Text>

        {/* Tags */}
        {post.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {post.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        {/* Actions — like + share only, no comments */}
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, liked && styles.actionBtnLiked]}
            onPress={handleLike}
          >
            <Feather name="heart" size={16} color={liked ? ED.warn : ED.muted} />
            <Text style={[styles.actionBtnText, liked && { color: ED.warn }]}>
              {formatCount(likeCount)} {likeCount === 1 ? 'like' : 'likes'}
            </Text>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <Feather name="share" size={16} color={ED.muted} />
            <Text style={styles.actionBtnText}>Share</Text>
          </Pressable>
        </View>

        {/* Source */}
        {post.source && (
          <>
            <View style={styles.divider} />
            <View style={styles.sourceRow}>
              <Text style={styles.sourceLabel}>Source</Text>
              <Pressable
                style={styles.sourceLink}
                onPress={() => void openExternalUrl(post.sourceUrl)}
                disabled={!post.sourceUrl}
                accessibilityRole="link"
                accessibilityLabel={`Open source: ${post.source}${post.sourceUrl ? ` at ${displayHost(post.sourceUrl)}` : ''}`}
                accessibilityHint="Opens in a new tab"
              >
                <Feather name="globe" size={13} color={ED.softInk} />
                <Text style={styles.sourceLinkText}>{post.source}</Text>
                {post.sourceUrl && <Feather name="external-link" size={12} color={ED.muted} />}
              </Pressable>
            </View>
          </>
        )}

        {/* University card */}
        {uni && (
          <>
            <View style={styles.divider} />
            <View style={[styles.uniCard, { borderLeftColor: uni.color }]}>
              <View style={styles.uniCardLeft}>
                <View style={[styles.uniCardDot, { backgroundColor: uni.color }]} />
                <View>
                  <Text style={styles.uniCardName}>{uni.name}</Text>
                  <Text style={styles.uniCardLocation}>{uni.location}</Text>
                </View>
              </View>
              <Pressable
                style={[styles.followBtn, following && styles.followBtnActive]}
                onPress={handleFollow}
              >
                <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
                  {following ? 'Following' : '+ Follow'}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0cf',
  },
  backBtn: { padding: 4 },
  topActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8 },
  notFoundText: { fontFamily: 'Fraunces_500Medium', fontSize: 18, color: '#1a1612' },
  content: { padding: 24, paddingBottom: 60, gap: 16 },
  uniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uniDot: { width: 8, height: 8, borderRadius: 999 },
  uniName: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#1a1612' },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4c9b0',
    backgroundColor: 'transparent',
  },
  followBtnActive: { backgroundColor: '#1a1612', borderColor: '#1a1612' },
  followBtnText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#1a1612' },
  followBtnTextActive: { color: '#f5f1e8' },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  catBadgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 24,
    lineHeight: 30,
    color: '#1a1612',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaAuthor: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#5c4a2f' },
  metaSep: { fontSize: 12, color: '#d4c9b0' },
  metaTime: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#6f6449' },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#1a1612',
    lineHeight: 25,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    borderWidth: 1,
    borderColor: '#d4c9b0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fbf8f1',
  },
  tagText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#5c4a2f' },
  divider: { height: 1, backgroundColor: '#e8e0cf' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e8e0cf',
    backgroundColor: '#fbf8f1',
  },
  actionBtnLiked: { borderColor: '#fca5a5', backgroundColor: '#fef3e2' },
  actionBtnText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#6f6449' },
  sourceRow: { gap: 8 },
  sourceLabel: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6f6449', fontFamily: 'Inter_500Medium' },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sourceLinkText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium', color: '#5c4a2f' },
  uniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbf8f1',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e8e0cf',
    padding: 14,
  },
  uniCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  uniCardDot: { width: 32, height: 32, borderRadius: 8 },
  uniCardName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1a1612' },
  uniCardLocation: { fontSize: 11, color: '#6f6449', fontFamily: 'Inter_400Regular', marginTop: 1 },
});
