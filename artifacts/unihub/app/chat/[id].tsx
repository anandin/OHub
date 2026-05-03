import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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

interface Message {
  id: string;
  who: string;
  text: string;
  time: string;
  mine: boolean;
}

const SEED_MESSAGES: Message[] = [
  { id: '1', who: 'Aanya P.', text: 'anyone else freaking out about Waterloo AIF??', time: '10:42', mine: false },
  { id: '2', who: 'Rishi M.', text: 'lol yes. on question 4 rn and stuck', time: '10:43', mine: false },
  { id: '3', who: 'You', text: 'i found this oHub article super helpful', time: '10:45', mine: true },
  { id: '4', who: 'You', text: "basically — pick ONE concrete moment per question. don't list five things", time: '10:45', mine: true },
  { id: '5', who: 'Aanya P.', text: 'omg ok thank you', time: '10:47', mine: false },
  { id: '6', who: 'Maya L.', text: 'how long is everyone making them?', time: '10:48', mine: false },
  { id: '7', who: 'You', text: '~150 words each. they read like 1000 of these', time: '10:50', mine: true },
];

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const chat = CHAT_LIST.find(c => c.id === id) ?? CHAT_LIST[0];
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!draft.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages(prev => [...prev, { id: Date.now().toString(), who: 'You', text: draft.trim(), time, mine: true }]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item: m }: { item: Message }) => {
    const initials = m.who.split(' ').map(s => s[0]).join('').slice(0, 2);
    return (
      <View style={[styles.messageWrap, m.mine && styles.messageWrapMine]}>
        {!m.mine && (
          <View style={styles.msgAvatar}>
            <Text style={styles.msgAvatarText}>{initials}</Text>
          </View>
        )}
        <View style={styles.msgContent}>
          {!m.mine && <Text style={styles.msgWho}>{m.who}</Text>}
          <View style={[styles.bubble, m.mine && styles.bubbleMine]}>
            <Text style={[styles.bubbleText, m.mine && styles.bubbleTextMine]}>{m.text}</Text>
          </View>
          <Text style={[styles.msgTime, m.mine && styles.msgTimeMine]}>{m.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: Platform.OS === 'web' ? 20 : insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={ED.ink} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{chat.name}</Text>
          <Text style={styles.headerSub}>
            {chat.dm ? 'Direct message' : `${chat.members} members`}
          </Text>
        </View>
        <Pressable style={styles.moreBtn}>
          <Feather name="more-horizontal" size={18} color={ED.muted} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        ListHeaderComponent={
          <Text style={styles.timeStamp}>Today, 10:42 AM</Text>
        }
      />

      {/* Composer */}
      <View style={[styles.composer, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable style={styles.composerAttach}>
          <Feather name="plus" size={20} color={ED.muted} />
        </Pressable>
        <TextInput
          style={styles.composerInput}
          value={draft}
          onChangeText={setDraft}
          placeholder="Message…"
          placeholderTextColor={ED.muted}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!draft.trim()}
        >
          <Feather name="send" size={16} color={draft.trim() ? '#f5f1e8' : ED.muted} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0cf',
    backgroundColor: '#fbf8f1',
    gap: 12,
  },
  backBtn: { padding: 2 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#1a1612' },
  headerSub: { fontSize: 11, color: '#8b7e62', fontFamily: 'Inter_400Regular', marginTop: 1 },
  moreBtn: { padding: 2 },
  messageList: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  timeStamp: {
    textAlign: 'center',
    fontSize: 11,
    color: '#8b7e62',
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  messageWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  messageWrapMine: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#d4a574',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 18,
  },
  msgAvatarText: { fontFamily: 'Fraunces_600SemiBold', fontSize: 11, color: '#fbf8f1' },
  msgContent: { maxWidth: '72%' },
  msgWho: { fontSize: 11, color: '#8b7e62', fontFamily: 'Inter_400Regular', marginBottom: 3, marginLeft: 2 },
  bubble: {
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    padding: 10,
  },
  bubbleMine: {
    backgroundColor: '#1a1612',
    borderWidth: 0,
    borderRadius: 14,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 14,
  },
  bubbleText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#1a1612', lineHeight: 19 },
  bubbleTextMine: { color: '#f5f1e8' },
  msgTime: { fontSize: 10, color: '#8b7e62', marginTop: 3, marginLeft: 2, fontFamily: 'Inter_400Regular' },
  msgTimeMine: { textAlign: 'right', marginLeft: 0, marginRight: 2 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e8e0cf',
    backgroundColor: '#fbf8f1',
  },
  composerAttach: { padding: 4 },
  composerInput: {
    flex: 1,
    backgroundColor: '#f5f1e8',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#1a1612',
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#1a1612',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#e8e0cf' },
});
