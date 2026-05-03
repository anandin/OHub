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
import { Feather } from "@expo/vector-icons";

import { Post, SAMPLE_POSTS } from "@/data/feed";
import { getUniversityById } from "@/data/universities";
import { useSubscriptions } from "@/context/SubscriptionsContext";

type FeedTab = 'following' | 'school' | 'all';

const ED = {
  paper: '#f5f1e8',
  card: '#fbf8f1',
  ink: '#1a1612',
  softInk: '#5c4a2f',
  muted: '#8b7e62',
  rule: '#e8e0cf',
  warn: '#c2410c',
  warnBg: '#fef3e2',
  success: '#15803d',
  pillBorder: '#d4c9b0',
};

function PostItem({ post }: { post: Post }) {
  const uni = getUniversityById(post.universityId);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
  };

  const isTip = post.category === 'advice' || post.category === 'academic';

  return (
    <View style={styles.postItem}>
      {isTip && (
        <View style={styles.tipBadge}>
          <Text style={styles.tipBadgeText}>oHub Tips</Text>
        </View>
      )}
      <View style={styles.postMeta}>
        <View style={[styles.uniDot, { backgroundColor: uni?.color ?? '#8b7e62' }]} />
        <Text style={styles.postAuthor}>{post.author}</Text>
        <Text style={styles.postMetaSep}>·</Text>
        <Text style={styles.postUni}>{uni?.shortName ?? 'Ontario'}</Text>
        <Text style={styles.postMetaSep}>·</Text>
        <Text style={styles.postTime}>{post.timeAgo}</Text>
      </View>
      <Text style={styles.postTitle}>{post.title}</Text>
      {post.body.length > 0 && (
        <Text style={styles.postBody} numberOfLines={3}>{post.body}</Text>
      )}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagRow}>
          {post.tags.slice(0, 3).map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.postActions}>
        <Pressable style={styles.actionBtn} onPress={handleLike}>
          <Feather
            name="heart"
            size={14}
            color={liked ? ED.warn : ED.muted}
            style={liked ? { fill: ED.warn } : undefined}
          />
          <Text style={[styles.actionText, liked && { color: ED.warn }]}>{likes}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Feather name="message-circle" size={14} color={ED.muted} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Feather name="share" size={14} color={ED.muted} />
        </Pressable>
      </View>
    </View>
  );
}

export default function PulseScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const { subscribed } = useSubscriptions();
  const [activeTab, setActiveTab] = useState<FeedTab>('all');

  const posts = useMemo(() => {
    if (activeTab === 'following' && subscribed.length > 0) {
      return SAMPLE_POSTS.filter(p => subscribed.includes(p.universityId));
    }
    return SAMPLE_POSTS;
  }, [activeTab, subscribed]);

  const tabs: { id: FeedTab; label: string }[] = [
    { id: 'following', label: 'Following' },
    { id: 'school', label: 'School' },
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
        <Pressable style={styles.composeBtn}>
          <Feather name="edit-2" size={18} color={ED.ink} />
        </Pressable>
      </View>

      {/* Tab pills */}
      <View style={styles.tabRow}>
        {tabs.map(tab => (
          <Pressable
            key={tab.id}
            style={[styles.tabPill, activeTab === tab.id && styles.tabPillActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={posts}
        keyExtractor={p => p.id}
        renderItem={({ item }) => <PostItem post={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyBody}>
              {activeTab === 'following'
                ? 'Follow some schools to see their posts here.'
                : 'The community feed is quiet right now.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 30,
    color: '#1a1612',
    lineHeight: 32,
  },
  composeBtn: { padding: 4 },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4c9b0',
    backgroundColor: 'transparent',
  },
  tabPillActive: {
    backgroundColor: '#1a1612',
    borderColor: '#1a1612',
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#1a1612',
  },
  tabLabelActive: { color: '#f5f1e8' },
  listContent: { paddingBottom: 100 },
  separator: { height: 1, backgroundColor: '#e8e0cf', marginHorizontal: 24 },
  postItem: { paddingHorizontal: 24, paddingVertical: 18 },
  tipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3e2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  tipBadgeText: { fontSize: 10, color: '#9a3412', fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  uniDot: { width: 7, height: 7, borderRadius: 999 },
  postAuthor: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#1a1612' },
  postUni: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#8b7e62' },
  postMetaSep: { fontSize: 12, color: '#d4c9b0' },
  postTime: { fontSize: 11, color: '#8b7e62', fontFamily: 'Inter_400Regular' },
  postTitle: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 17,
    lineHeight: 22,
    color: '#1a1612',
    marginBottom: 6,
  },
  postBody: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#5c4a2f',
    lineHeight: 20,
    marginBottom: 8,
  },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  tag: {
    borderWidth: 1,
    borderColor: '#d4c9b0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#fbf8f1',
  },
  tagText: { fontSize: 10, color: '#5c4a2f', fontFamily: 'Inter_500Medium' },
  postActions: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 12, color: '#8b7e62', fontFamily: 'Inter_400Regular' },
  emptyState: { padding: 48, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 18, color: '#1a1612', marginBottom: 8 },
  emptyBody: { fontSize: 13, color: '#8b7e62', textAlign: 'center', lineHeight: 20, fontFamily: 'Inter_400Regular' },
});
