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
import Feather from "@expo/vector-icons/Feather";
import { ED } from "@/constants/theme";


const ESSAY_PROMPTS: Record<string, {
  school: string;
  form: string;
  question: string;
  limit: number;
  questionNum: string;
}> = {
  /* ── Waterloo AIF ── */
  'waterloo-aif-1': {
    school: 'Waterloo', form: 'AIF',
    question: 'List your extracurricular activities, employment, volunteer experience, and academic achievements from Grade 9 to present. Include dates, hours per week, and your role.',
    limit: 600, questionNum: 'Question 1 of 7',
  },
  'waterloo-aif-2': {
    school: 'Waterloo', form: 'AIF',
    question: 'Describe one of your most significant extracurricular activities or achievements and your role in it. What impact did it have and what did you learn?',
    limit: 200, questionNum: 'Question 2 of 7',
  },
  'waterloo-aif-3': {
    school: 'Waterloo', form: 'AIF',
    question: 'Describe a situation where you worked as part of a team. What was your role, and what did you learn about working with others?',
    limit: 200, questionNum: 'Question 3 of 7',
  },
  'waterloo-aif-4': {
    school: 'Waterloo', form: 'AIF',
    question: 'Describe an activity, project or accomplishment outside school that has been most meaningful to you. Why?',
    limit: 200, questionNum: 'Question 4 of 7',
  },
  'waterloo-aif-5': {
    school: 'Waterloo', form: 'AIF',
    question: 'Tell us about your career goals. How does your chosen program at Waterloo connect with these goals?',
    limit: 200, questionNum: 'Question 5 of 7',
  },
  'waterloo-aif-6': {
    school: 'Waterloo', form: 'AIF',
    question: 'Describe a technical project you have worked on, inside or outside of school. What was your approach and what did you learn?',
    limit: 200, questionNum: 'Question 6 of 7',
  },
  'waterloo-aif-7': {
    school: 'Waterloo', form: 'AIF',
    question: 'Describe a current issue or challenge in a field related to your program. What interests you about it?',
    limit: 200, questionNum: 'Question 7 of 7',
  },

  /* ── Queen's PSE ── */
  'queens-pse-1': {
    school: "Queen's", form: 'PSE',
    question: 'Tell us about yourself, your values, and what you hope to gain from your university experience.',
    limit: 250, questionNum: 'Question 1 of 3',
  },
  'queens-pse-2': {
    school: "Queen's", form: 'PSE',
    question: 'Describe a significant challenge you have faced and how you overcame it. What did the experience teach you?',
    limit: 250, questionNum: 'Question 2 of 3',
  },
  'queens-pse-3': {
    school: "Queen's", form: 'PSE',
    question: 'Why did you choose this program at Queen\'s? How does it align with your interests and goals?',
    limit: 250, questionNum: 'Question 3 of 3',
  },

  /* ── McMaster Health Sciences ── */
  'mcmaster-health-1': {
    school: 'McMaster', form: 'Health Sci Supp.',
    question: 'Why are you interested in McMaster\'s Health Sciences program? Describe a specific experience that shaped your understanding of health, medicine, or people, and explain what it revealed about you.',
    limit: 300, questionNum: 'Question 1 of 2',
  },
  'mcmaster-health-2': {
    school: 'McMaster', form: 'Health Sci Supp.',
    question: 'Describe how you learn best. Give a specific example of a time you took initiative to learn something deeply, beyond what was required.',
    limit: 300, questionNum: 'Question 2 of 2',
  },

  /* ── University of Toronto ── */
  'uoft-supp-1': {
    school: 'U of T', form: 'Supplementary',
    question: 'Describe your most significant non-academic achievement or experience and explain why it is meaningful to you. What does it say about who you are?',
    limit: 350, questionNum: 'Question 1 of 2',
  },
  'uoft-supp-2': {
    school: 'U of T', form: 'Supplementary',
    question: 'What aspect of your chosen program or field of study are you most passionate about, and why? How have you pursued this interest?',
    limit: 350, questionNum: 'Question 2 of 2',
  },

  /* ── Ivey AEO ── */
  'ivey-aeo-1': {
    school: 'Ivey', form: 'AEO Essay',
    question: 'Describe a situation where you demonstrated leadership — formal or informal. What was the outcome, and what did you learn about your leadership style?',
    limit: 300, questionNum: 'Question 1 of 2',
  },
  'ivey-aeo-2': {
    school: 'Ivey', form: 'AEO Essay',
    question: 'Why do you want to be a business leader? Describe a business problem or opportunity that excites you and explain your thinking.',
    limit: 300, questionNum: 'Question 2 of 2',
  },

  /* ── Western ── */
  'western-supp-1': {
    school: 'Western', form: 'Supplementary',
    question: 'Describe a challenge you overcame and what you learned from it.',
    limit: 300, questionNum: 'Question 1 of 3',
  },
  'western-supp-2': {
    school: 'Western', form: 'Supplementary',
    question: 'Describe your personal and professional goals. How does Western\'s program support them?',
    limit: 300, questionNum: 'Question 2 of 3',
  },
  'western-supp-3': {
    school: 'Western', form: 'Supplementary',
    question: 'Describe your involvement in your school or community. What roles have you taken on and what impact have you made?',
    limit: 300, questionNum: 'Question 3 of 3',
  },

  /* ── York / Schulich ── */
  'yorku-supp-1': {
    school: 'York (Schulich)', form: 'Supplementary',
    question: 'Why do you want to study business at Schulich? Describe an experience that shaped your interest in business or entrepreneurship.',
    limit: 300, questionNum: 'Question 1 of 1',
  },
};

const DEFAULT_ID = 'waterloo-aif-4';

const SEED_TEXT: Record<string, string> = {
  'waterloo-aif-4': `Two summers ago I taught myself to weld. Not for school, not for an award — I wanted to build a metal frame for my mom's vegetable garden after the wooden one rotted out.

The first frame was crooked. The second collapsed under tomato vines. By the third, I'd watched maybe forty hours of YouTube and burned a small hole through my dad's gardening glove.

What stuck with me wasn't the welding. It was realizing I could just start something.`,
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function getReadingStatus(wordCount: number, limit: number): string {
  if (wordCount === 0) return 'Start writing';
  if (wordCount < limit * 0.3) return 'Too short';
  if (wordCount < limit * 0.6) return 'Getting there';
  if (wordCount > limit) return 'Over limit';
  return '~9th grade · Active voice ✓';
}

function getCoachTip(wordCount: number, limit: number): string | null {
  if (wordCount === 0) return 'Start with a specific moment or scene — not a general statement.';
  if (wordCount < 80) return 'You have room. Ground this in one specific moment or memory.';
  if (wordCount > limit) return `You're ${wordCount - limit} words over. Cut sentences that repeat information you've already stated.`;
  if (wordCount > limit * 0.9) return `You're near the limit. Cut any sentence that doesn't add new information.`;
  return 'Strong opening. Try ending on a specific moment, not a generalization.';
}

export default function EssayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const prompt = (id ? ESSAY_PROMPTS[id] : undefined) ?? ESSAY_PROMPTS[DEFAULT_ID];

  const [text, setText] = useState(SEED_TEXT[id ?? DEFAULT_ID] ?? '');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordCount = countWords(text);
  const overLimit = wordCount > prompt.limit;
  const tip = getCoachTip(wordCount, prompt.limit);
  const readingStatus = getReadingStatus(wordCount, prompt.limit);

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
          {lastSaved ? (
            <View style={styles.autoSaveBadge}>
              <Text style={styles.autoSaveText}>Auto-saved · {lastSaved}</Text>
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <Pressable>
            <Feather name="more-horizontal" size={18} color={ED.muted} />
          </Pressable>
        </View>
        <Text style={styles.headerSchool}>{prompt.school} · {prompt.form}</Text>
        <Text style={styles.headerQuestion}>{prompt.questionNum}</Text>
      </View>

      {/* Prompt */}
      <View style={styles.promptBox}>
        <Text style={styles.promptText}>&ldquo;{prompt.question}&rdquo;</Text>
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
          <Text style={[styles.readingLevel, overLimit && styles.wordCountOver]}>
            {readingStatus}
          </Text>
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
    color: '#6f6449',
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
  promptMeta: { fontSize: 11, color: '#6f6449', marginTop: 8, fontFamily: 'Inter_400Regular' },
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
  wordCount: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: '#5c4a2f' },
  wordCountOver: { color: '#b03a09' },
  readingLevel: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: '#12652f' },
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
