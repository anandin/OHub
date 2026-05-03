import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const ED = {
  paper: '#f5f1e8',
  card: '#fbf8f1',
  ink: '#1a1612',
  softInk: '#5c4a2f',
  muted: '#8b7e62',
  rule: '#e8e0cf',
  amber: '#fef3c7',
  amberBorder: '#fbbf24',
  amberText: '#7c4a03',
  success: '#15803d',
};

const ESSAY_PROMPTS: Record<string, { school: string; form: string; question: string; limit: number; questionNum: string }> = {
  'waterloo-aif-4': {
    school: 'Waterloo',
    form: 'AIF',
    question: 'Describe an activity, project or accomplishment outside school that has been most meaningful to you. Why?',
    limit: 200,
    questionNum: 'Question 4 of 7',
  },
  'queens-pse-1': {
    school: "Queen's",
    form: 'PSE',
    question: 'Tell us about yourself, your values, and what you hope to gain from your university experience.',
    limit: 250,
    questionNum: 'Question 1 of 3',
  },
  'western-supp-1': {
    school: 'Western',
    form: 'Supplementary',
    question: 'Describe a challenge you overcame and what you learned from it.',
    limit: 300,
    questionNum: 'Question 1 of 4',
  },
};

const DEFAULT_PROMPT = ESSAY_PROMPTS['waterloo-aif-4'];

const SEED_TEXT = `Two summers ago I taught myself to weld. Not for school, not for an award — I wanted to build a metal frame for my mom's vegetable garden after the wooden one rotted out.

The first frame was crooked. The second collapsed under tomato vines. By the third, I'd watched maybe forty hours of YouTube and burned a small hole through my dad's gardening glove.

What stuck with me wasn't the welding. It was realizing I could just start something.`;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function getReadingLevel(wordCount: number): string {
  if (wordCount < 50) return 'Too short';
  if (wordCount < 100) return 'Getting there';
  return '~9th grade · Active voice ✓';
}

function getCoachTip(wordCount: number, limit: number): string | null {
  if (wordCount === 0) return 'Start with a specific moment or scene — not a general statement.';
  if (wordCount < 80) return 'You have room. Try to ground this in one specific moment or memory.';
  if (wordCount > limit * 0.9) return `You're near the limit. Cut any sentence that doesn't add new information.`;
  return 'Strong opening. Try ending on a specific moment, not a generalization.';
}

export default function EssayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const prompt = (id && ESSAY_PROMPTS[id]) ?? DEFAULT_PROMPT;

  const [text, setText] = useState(SEED_TEXT);
  const [lastSaved, setLastSaved] = useState('14:32');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordCount = countWords(text);
  const overLimit = wordCount > prompt.limit;
  const tip = getCoachTip(wordCount, prompt.limit);

  const handleChange = (val: string) => {
    setText(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const now = new Date();
      setLastSaved(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: Platform.OS === 'web' ? 20 : insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={ED.ink} />
          </Pressable>
          <View style={styles.autoSaveBadge}>
            <Text style={styles.autoSaveText}>Auto-saved · {lastSaved}</Text>
          </View>
          <Pressable>
            <Feather name="more-horizontal" size={18} color={ED.muted} />
          </Pressable>
        </View>
        <Text style={styles.headerSchool}>{prompt.school} · {prompt.form}</Text>
        <Text style={styles.headerQuestion}>{prompt.questionNum}</Text>
      </View>

      {/* Prompt */}
      <View style={styles.promptBox}>
        <Text style={styles.promptText}>"{prompt.question}"</Text>
        <Text style={styles.promptMeta}>{prompt.limit} words max · plain text only</Text>
      </View>

      {/* Editor */}
      <ScrollView style={styles.editorArea} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.editor}
          value={text}
          onChangeText={handleChange}
          multiline
          placeholder="Start writing…"
          placeholderTextColor={ED.muted}
          autoFocus={false}
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.footerStats}>
          <Text style={[styles.wordCount, overLimit && styles.wordCountOver]}>
            {wordCount} / {prompt.limit} words
          </Text>
          <Text style={styles.readingLevel}>{getReadingLevel(wordCount)}</Text>
        </View>

        {tip && (
          <View style={styles.coachCard}>
            <View style={styles.coachIcon}>
              <Text style={styles.coachIconText}>◇</Text>
            </View>
            <View style={styles.coachBody}>
              <Text style={styles.coachTitle}>oHub coach suggests</Text>
              <Text style={styles.coachTip}>{tip}</Text>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0cf',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 4,
  },
  autoSaveBadge: {
    backgroundColor: '#fef3e2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  autoSaveText: { fontSize: 11, color: '#9a3412', fontFamily: 'Inter_500Medium' },
  headerSchool: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 3,
  },
  headerQuestion: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    color: '#1a1612',
    lineHeight: 26,
  },
  promptBox: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fbf8f1',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0cf',
  },
  promptText: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 15,
    lineHeight: 22,
    color: '#1a1612',
  },
  promptMeta: { fontSize: 11, color: '#8b7e62', marginTop: 8, fontFamily: 'Inter_400Regular' },
  editorArea: { flex: 1, paddingHorizontal: 20, paddingTop: 18 },
  editor: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 15,
    lineHeight: 26,
    color: '#1a1612',
    minHeight: 200,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e8e0cf',
    backgroundColor: '#fbf8f1',
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wordCount: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: '#5c4a2f',
  },
  wordCountOver: { color: '#c2410c' },
  readingLevel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: '#15803d',
  },
  coachCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 12,
    padding: 12,
  },
  coachIcon: { marginTop: 1 },
  coachIconText: { fontSize: 14, color: '#7c4a03' },
  coachBody: { flex: 1 },
  coachTitle: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#7c4a03', marginBottom: 2 },
  coachTip: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7c4a03', lineHeight: 18 },
});
