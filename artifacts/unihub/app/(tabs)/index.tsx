import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUser } from "@/context/UserContext";
import { getUpcomingDeadlines } from "@/data/deadlines";
import { FEATURED_ARTICLES, UPCOMING_EVENTS } from "@/data/userData";
import { useApplications } from "@/context/ApplicationsContext";

const ED = {
  paper: '#f5f1e8',
  card: '#fbf8f1',
  ink: '#1a1612',
  softInk: '#5c4a2f',
  muted: '#8b7e62',
  rule: '#e8e0cf',
  pillBorder: '#d4c9b0',
  warn: '#c2410c',
  warnBg: '#fef3e2',
  success: '#15803d',
  successBg: '#ecfdf5',
};

function issueNumber() {
  const start = new Date('2025-09-01');
  const now = new Date();
  const weeks = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, weeks + 1);
}

function formatDay() {
  const d = new Date();
  return d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const { profile, tasks, doneTasks, toggleTask } = useUser();
  const { applications } = useApplications();

  const submitted = applications.filter(a => ['applied', 'supp_sent', 'offer', 'accepted'].includes(a.status)).length;
  const total = Math.max(applications.length, submitted);

  const deadlines = useMemo(() => getUpcomingDeadlines(3), []);
  const nextDeadline = deadlines[0] ?? null;
  const daysLeft = nextDeadline ? nextDeadline.daysUntil : 0;

  const article = FEATURED_ARTICLES[0];
  const progress = total > 0 ? (submitted / total) * 100 : 0;

  const priorityLabel = (p: string) =>
    p === 'high' ? 'High priority' : p === 'med' ? 'Medium' : 'Low';

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topInset }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Date + Issue */}
      <View style={styles.dateLine}>
        <Text style={styles.dateText}>{formatDay()}</Text>
        <Text style={styles.issueText}>Issue №{issueNumber()}</Text>
      </View>

      {/* Hero countdown */}
      <View style={styles.heroSection}>
        {nextDeadline ? (
          <>
            <Text style={styles.heroCount}>{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</Text>
            <Text style={styles.heroSub}>
              until {nextDeadline.title}.{'\n'}
              <Text style={styles.heroSubBold}>
                {total > 0 ? `${submitted}/${total} submitted.` : "Add your applications."}
              </Text>
            </Text>
            {total > 0 && (
              <>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{submitted} submitted</Text>
                  <Text style={styles.progressLabel}>{total - submitted} remaining</Text>
                </View>
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.heroCount}>You're on track.</Text>
            <Text style={styles.heroSub}>No upcoming deadlines. Keep going.</Text>
          </>
        )}
      </View>

      <View style={styles.divider} />

      {/* Today's plan */}
      <View style={styles.section}>
        <Text style={styles.eyebrow}>Your plan, today</Text>
        {tasks.map((task, i) => {
          const done = doneTasks.has(task.id);
          return (
            <Pressable
              key={task.id}
              style={[styles.taskRow, i > 0 && styles.taskRowBorder]}
              onPress={() => toggleTask(task.id)}
            >
              <View style={[styles.checkbox, done && styles.checkboxDone]}>
                {done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.taskBody}>
                <Text style={[styles.taskLabel, done && styles.taskLabelDone]}>{task.label}</Text>
                <Text style={styles.taskMeta}>{task.est} · {priorityLabel(task.priority)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* Featured article */}
      <View style={styles.section}>
        <Text style={styles.eyebrow}>Read · {article.readTime}</Text>
        <View style={styles.articleCard}>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.articleBlurb}>{article.blurb}</Text>
          <View style={styles.tagRow}>
            {article.tags.map(tag => (
              <View key={tag} style={styles.pill}>
                <Text style={styles.pillText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* This week */}
      <View style={[styles.section, { paddingBottom: 32 }]}>
        <Text style={styles.eyebrow}>This week</Text>
        {UPCOMING_EVENTS.slice(0, 3).map((event, i) => (
          <View key={event.id} style={[styles.eventRow, i > 0 && styles.eventRowBorder]}>
            <View style={styles.eventBody}>
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventMeta}>{event.host} · {event.date}, {event.time}</Text>
            </View>
            {event.attending ? (
              <View style={styles.goingBadge}>
                <Text style={styles.goingText}>Going</Text>
              </View>
            ) : (
              <View style={styles.rsvpBadge}>
                <Text style={styles.rsvpText}>RSVP</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  content: { paddingBottom: 100 },
  dateLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 0,
  },
  dateText: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
  },
  issueText: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'JetBrainsMono_400Regular',
  },
  heroSection: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  heroCount: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 44,
    lineHeight: 48,
    color: '#1a1612',
  },
  heroSub: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 22,
    lineHeight: 28,
    color: '#5c4a2f',
    marginTop: 6,
  },
  heroSubBold: {
    fontFamily: 'Fraunces_600SemiBold',
    color: '#1a1612',
  },
  progressTrack: {
    marginTop: 14,
    height: 6,
    backgroundColor: '#e8e0cf',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1a1612',
    borderRadius: 999,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: '#8b7e62',
    fontFamily: 'Inter_400Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#e8e0cf',
    marginHorizontal: 24,
  },
  section: { paddingHorizontal: 24, paddingTop: 20 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  taskRowBorder: { borderTopWidth: 1, borderTopColor: '#e8e0cf' },
  checkbox: {
    width: 18,
    height: 18,
    marginTop: 2,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#b8a888',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: '#1a1612',
    borderColor: '#1a1612',
  },
  checkmark: { color: '#f5f1e8', fontSize: 10, lineHeight: 12 },
  taskBody: { flex: 1 },
  taskLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#1a1612',
  },
  taskLabelDone: {
    textDecorationLine: 'line-through',
    color: '#8b7e62',
  },
  taskMeta: { fontSize: 11, color: '#8b7e62', marginTop: 2, fontFamily: 'Inter_400Regular' },
  articleCard: {
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 14,
    padding: 18,
    marginBottom: 4,
  },
  articleTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    lineHeight: 24,
    color: '#1a1612',
  },
  articleBlurb: {
    fontSize: 13,
    color: '#5c4a2f',
    marginTop: 10,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 14, flexWrap: 'wrap' },
  pill: {
    borderWidth: 1,
    borderColor: '#d4c9b0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fbf8f1',
  },
  pillText: { fontSize: 11, color: '#1a1612', fontFamily: 'Inter_500Medium' },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  eventRowBorder: { borderTopWidth: 1, borderTopColor: '#e8e0cf' },
  eventBody: { flex: 1 },
  eventName: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#1a1612' },
  eventMeta: { fontSize: 11, color: '#8b7e62', marginTop: 2, fontFamily: 'Inter_400Regular' },
  goingBadge: {
    backgroundColor: '#ecfdf5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  goingText: { fontSize: 11, color: '#14532d', fontFamily: 'Inter_500Medium' },
  rsvpBadge: {
    borderWidth: 1,
    borderColor: '#d4c9b0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fbf8f1',
  },
  rsvpText: { fontSize: 11, color: '#1a1612', fontFamily: 'Inter_500Medium' },
});
