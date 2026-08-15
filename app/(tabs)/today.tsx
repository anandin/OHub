import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
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

import { useUser } from "@/context/UserContext";
import { getUpcomingDeadlines } from "@/data/deadlines";
import { FEATURED_ARTICLES, UPCOMING_EVENTS } from "@/data/userData";
import { useApplications } from "@/context/ApplicationsContext";
import { ED } from "@/constants/theme";


type Priority = 'high' | 'med' | 'low';

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

function AddTaskModal({ onAdd, onClose }: {
  onAdd: (label: string, est: string, priority: Priority) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState('');
  const [est, setEst] = useState('');
  const [priority, setPriority] = useState<Priority>('med');

  const PRIORITIES: { id: Priority; label: string }[] = [
    { id: 'high', label: 'High' },
    { id: 'med',  label: 'Medium' },
    { id: 'low',  label: 'Low' },
  ];

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add task</Text>
            <Pressable
              onPress={onClose}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Close add task"
            >
              <Feather name="x" size={18} color={ED.muted} />
            </Pressable>
          </View>

          <Text style={styles.modalLabel}>What do you need to do?</Text>
          <TextInput
            style={styles.modalInput}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Finish Waterloo AIF Section 5"
            placeholderTextColor={ED.muted}
            autoFocus
          />

          <Text style={styles.modalLabel}>Estimated time (optional)</Text>
          <TextInput
            style={[styles.modalInput, { marginBottom: 16 }]}
            value={est}
            onChangeText={setEst}
            placeholder="e.g. 20 min"
            placeholderTextColor={ED.muted}
          />

          <Text style={styles.modalLabel}>Priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(p => (
              <Pressable
                key={p.id}
                style={[styles.priorityChip, priority === p.id && styles.priorityChipActive]}
                onPress={() => setPriority(p.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: priority === p.id }}
                accessibilityLabel={`${p.label} priority`}
              >
                <Text style={[styles.priorityChipText, priority === p.id && styles.priorityChipTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.addBtn, !label.trim() && styles.addBtnDisabled]}
            disabled={!label.trim()}
            onPress={() => {
              if (label.trim()) {
                onAdd(label.trim(), est.trim(), priority);
                onClose();
              }
            }}
          >
            <Text style={styles.addBtnText}>Add task</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const { profile, tasks, doneTasks, toggleTask, addTask, deleteTask } = useUser();
  const firstName = profile.name.trim().split(' ')[0] ?? '';
  const { applications } = useApplications();
  const [editingTasks, setEditingTasks] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

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
    <>
      <ScrollView
        style={[styles.container, { paddingTop: topInset }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Date + Issue */}
        <View style={styles.dateLine}>
          <Text style={styles.dateText}>
            {firstName ? `${formatDay()} · Hi, ${firstName}` : formatDay()}
          </Text>
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
              <Text style={styles.heroCount}>You&rsquo;re on track.</Text>
              <Text style={styles.heroSub}>No upcoming deadlines. Keep going.</Text>
            </>
          )}
        </View>

        <View style={styles.divider} />

        {/* Today's plan */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.eyebrow}>Your plan, today</Text>
            <Pressable
              onPress={() => setEditingTasks(e => !e)}
              style={styles.editTasksBtn}
              accessibilityRole="button"
              accessibilityLabel={editingTasks ? 'Finish editing tasks' : 'Edit tasks'}
            >
              <Text style={styles.editTasksBtnText}>{editingTasks ? 'Done' : 'Edit'}</Text>
            </Pressable>
          </View>

          {tasks.map((task, i) => {
            const done = doneTasks.has(task.id);
            return (
              <Pressable
                key={task.id}
                style={[styles.taskRow, i > 0 && styles.taskRowBorder]}
                onPress={() => !editingTasks && toggleTask(task.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done, disabled: editingTasks }}
                accessibilityLabel={`${task.label}. ${task.est}, ${priorityLabel(task.priority)} priority`}
                accessibilityHint={editingTasks ? undefined : 'Marks the task done'}
              >
                {editingTasks ? (
                  <Pressable
                    onPress={() => deleteTask(task.id)}
                    style={styles.deleteBtn}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete task: ${task.label}`}
                  >
                    <Feather name="trash-2" size={15} color={ED.warn} />
                  </Pressable>
                ) : (
                  <View style={[styles.checkbox, done && styles.checkboxDone]}>
                    {done && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                )}
                <View style={styles.taskBody}>
                  <Text style={[styles.taskLabel, done && !editingTasks && styles.taskLabelDone]}>
                    {task.label}
                  </Text>
                  <Text style={styles.taskMeta}>{task.est} · {priorityLabel(task.priority)}</Text>
                </View>
              </Pressable>
            );
          })}

          {tasks.length === 0 && (
            <Text style={styles.emptyTasks}>No tasks yet. Add one below.</Text>
          )}

          <Pressable
            style={styles.addTaskBtn}
            onPress={() => setShowAddTask(true)}
            accessibilityRole="button"
            accessibilityLabel="Add a task"
          >
            <Feather name="plus" size={14} color={ED.muted} />
            <Text style={styles.addTaskBtnText}>Add task</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Featured article */}
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Read · {article.readTime}</Text>
          <Pressable
            style={styles.articleCard}
            onPress={() => article.essayRoute && router.push(article.essayRoute as any)}
            disabled={!article.essayRoute}
            accessibilityRole="button"
            accessibilityLabel={`Read: ${article.title}. ${article.readTime}`}
          >
            <Text style={styles.articleTitle}>{article.title}</Text>
            <Text style={styles.articleBlurb}>{article.blurb}</Text>
            <View style={styles.tagRow}>
              {article.tags.map(tag => (
                <View key={tag} style={styles.pill}>
                  <Text style={styles.pillText}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={styles.articleReadMore}>
              <Text style={styles.articleReadMoreText}>Open essay editor</Text>
              <Feather name="arrow-right" size={12} color={ED.softInk} />
            </View>
          </Pressable>
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

      {showAddTask && (
        <AddTaskModal
          onAdd={addTask}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  iconBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
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
    color: '#6f6449',
    fontFamily: 'Inter_500Medium',
  },
  issueText: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#6f6449',
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
  progressLabel: { fontSize: 11, color: '#6f6449', fontFamily: 'Inter_400Regular' },
  divider: { height: 1, backgroundColor: '#e8e0cf', marginHorizontal: 24 },
  section: { paddingHorizontal: 24, paddingTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#6f6449',
    fontFamily: 'Inter_500Medium',
  },
  editTasksBtn: { paddingVertical: 2, paddingHorizontal: 4 },
  editTasksBtnText: { fontSize: 12, color: '#6f6449', fontFamily: 'Inter_400Regular' },
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
  deleteBtn: { marginTop: 1, flexShrink: 0 },
  taskBody: { flex: 1 },
  taskLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#1a1612',
  },
  taskLabelDone: {
    textDecorationLine: 'line-through',
    color: '#6f6449',
  },
  taskMeta: { fontSize: 11, color: '#6f6449', marginTop: 2, fontFamily: 'Inter_400Regular' },
  emptyTasks: {
    fontSize: 13,
    color: '#6f6449',
    fontFamily: 'Inter_400Regular',
    paddingVertical: 8,
  },
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e8e0cf',
    marginTop: 2,
  },
  addTaskBtnText: { fontSize: 13, color: '#6f6449', fontFamily: 'Inter_400Regular' },
  articleCard: {
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 14,
    padding: 18,
    marginBottom: 4,
    marginTop: 8,
  },
  articleReadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
  },
  articleReadMoreText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#5c4a2f',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  eventMeta: { fontSize: 11, color: '#6f6449', marginTop: 2, fontFamily: 'Inter_400Regular' },
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
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(26,22,18,0.45)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fbf8f1',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#1a1612' },
  modalLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6f6449',
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f5f1e8',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1a1612',
    marginBottom: 16,
  },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  priorityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4c9b0',
    backgroundColor: 'transparent',
  },
  priorityChipActive: { backgroundColor: '#1a1612', borderColor: '#1a1612' },
  priorityChipText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#1a1612' },
  priorityChipTextActive: { color: '#f5f1e8' },
  addBtn: {
    backgroundColor: '#1a1612',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: '#d4c9b0' },
  addBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#f5f1e8' },
});
