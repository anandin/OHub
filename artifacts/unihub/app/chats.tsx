import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { CHAT_LIST } from "@/data/userData";

const ED = {
  paper: '#f5f1e8',
  card: '#fbf8f1',
  ink: '#1a1612',
  softInk: '#5c4a2f',
  muted: '#8b7e62',
  rule: '#e8e0cf',
};

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;

  const pinned = CHAT_LIST.filter(c => c.pinned);
  const all = CHAT_LIST.filter(c => !c.pinned);

  const ChatRow = ({ chat, noBorder }: { chat: typeof CHAT_LIST[0]; noBorder?: boolean }) => {
    const initials = chat.dm
      ? chat.name.split(' ').map(s => s[0]).join('').slice(0, 2)
      : '#';
    const bgColor = chat.dm ? '#d4a574' : ED.ink;

    return (
      <Pressable
        style={[styles.chatRow, !noBorder && styles.chatRowBorder]}
        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chat.id } })}
      >
        <View style={[styles.chatAvatar, { backgroundColor: bgColor }]}>
          <Text style={styles.chatAvatarText}>{initials}</Text>
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatInfoTop}>
            <Text style={[styles.chatName, chat.unread > 0 && styles.chatNameBold]}>
              {chat.name}
            </Text>
            <Text style={styles.chatTime}>{chat.time}</Text>
          </View>
          <Text style={styles.chatLast} numberOfLines={1}>{chat.last}</Text>
        </View>
        {chat.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{chat.unread}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={ED.ink} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Messages</Text>
          <Text style={styles.title}>Chats</Text>
        </View>
        <Pressable style={styles.composeBtn}>
          <Feather name="edit-2" size={18} color={ED.ink} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Pinned */}
        {pinned.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Pinned</Text>
            {pinned.map((c, i) => (
              <ChatRow key={c.id} chat={c} noBorder={i === 0} />
            ))}
          </>
        )}

        {/* All */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>All</Text>
        {all.map((c, i) => (
          <ChatRow key={c.id} chat={c} noBorder={i === 0} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: { paddingBottom: 4 },
  headerText: { flex: 1 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 30, color: '#1a1612', lineHeight: 32 },
  composeBtn: { paddingBottom: 4 },
  content: { paddingBottom: 40 },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  sectionLabelSpaced: { paddingTop: 20 },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 12,
  },
  chatRowBorder: { borderTopWidth: 1, borderTopColor: '#e8e0cf' },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chatAvatarText: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
    color: '#fbf8f1',
  },
  chatInfo: { flex: 1, minWidth: 0 },
  chatInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  chatName: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#1a1612' },
  chatNameBold: { fontFamily: 'Inter_600SemiBold' },
  chatTime: { fontSize: 11, color: '#8b7e62', fontFamily: 'Inter_400Regular' },
  chatLast: {
    fontSize: 12,
    color: '#5c4a2f',
    fontFamily: 'Inter_400Regular',
  },
  unreadBadge: {
    backgroundColor: '#1a1612',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#f5f1e8',
  },
});
