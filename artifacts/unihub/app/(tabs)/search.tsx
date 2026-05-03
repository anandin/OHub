import { router } from "expo-router";
import React, { useState } from "react";
import {
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

import { useUser } from "@/context/UserContext";
import { useApplications } from "@/context/ApplicationsContext";

const ED = {
  paper: '#f5f1e8',
  card: '#fbf8f1',
  ink: '#1a1612',
  softInk: '#5c4a2f',
  muted: '#8b7e62',
  rule: '#e8e0cf',
  pillBorder: '#d4c9b0',
  success: '#15803d',
  successBg: '#ecfdf5',
  warn: '#c2410c',
  warnBg: '#fef3e2',
};

const TIER_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  reach:  { color: '#9a3412', bg: '#fef3e2', label: 'Reach'  },
  target: { color: '#1a1612', bg: '#f0ebe0', label: 'Target' },
  safety: { color: '#14532d', bg: '#ecfdf5', label: 'Safety' },
};

function parseAvg(grades: string[]): number | null {
  const parsed = grades.map(g => parseFloat(g)).filter(g => !isNaN(g) && g > 0 && g <= 100);
  if (parsed.length === 0) return null;
  return Math.round((parsed.reduce((a, b) => a + b, 0) / parsed.length) * 10) / 10;
}

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const { profile, tasks, doneTasks, updateMarks } = useUser();
  const { applications } = useApplications();
  const [editingMarks, setEditingMarks] = useState(false);
  const [localMarks, setLocalMarks] = useState<string[]>(profile.marks);

  const avg = parseAvg(localMarks);

  const appStats = {
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    applied: applications.filter(a => ['applied', 'supp_sent'].includes(a.status)).length,
    offers: applications.filter(a => ['offer', 'accepted'].includes(a.status)).length,
    total: applications.length,
  };

  const doneFraction = tasks.length > 0
    ? `${doneTasks.size}/${tasks.length} done today`
    : 'No tasks';

  const handleSaveMarks = () => {
    updateMarks(localMarks);
    setEditingMarks(false);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topInset }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Your profile</Text>
          <Text style={styles.title}>You</Text>
        </View>
        <Pressable onPress={() => router.push('/scholarships')} style={styles.schBtn}>
          <Feather name="award" size={18} color={ED.ink} />
        </Pressable>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {profile.name.split(' ').map(s => s[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileSchool}>{profile.school}</Text>
          <View style={styles.ouacRow}>
            <Text style={styles.ouacLabel}>OUAC Ref</Text>
            <Text style={styles.ouacRef}>{profile.ouacRef}</Text>
          </View>
        </View>
      </View>

      {/* Average card */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Top 6 Avg</Text>
          <Text style={styles.statValue}>{avg !== null ? `${avg}%` : '—'}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Applications</Text>
          <Text style={styles.statValue}>{appStats.total}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tasks today</Text>
          <Text style={styles.statValue}>{doneFraction}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Marks editor */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top 6 Marks</Text>
          {editingMarks ? (
            <Pressable onPress={handleSaveMarks} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setEditingMarks(true)} style={styles.editBtn}>
              <Feather name="edit-2" size={13} color={ED.muted} />
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.marksGrid}>
          {[0, 1, 2, 3, 4, 5].map(i => {
            const val = localMarks[i] ?? '';
            const num = parseFloat(val);
            const isValid = !isNaN(num) && num > 0 && num <= 100;
            return (
              <View key={i} style={styles.markItem}>
                <Text style={styles.markCourse}>Course {i + 1}</Text>
                {editingMarks ? (
                  <TextInput
                    style={styles.markInput}
                    value={val}
                    onChangeText={v => {
                      const next = [...localMarks];
                      next[i] = v;
                      setLocalMarks(next);
                    }}
                    placeholder="00"
                    placeholderTextColor={ED.muted}
                    keyboardType="decimal-pad"
                    maxLength={5}
                  />
                ) : (
                  <Text style={[styles.markValue, !isValid && styles.markValueEmpty]}>
                    {isValid ? `${num}%` : '—'}
                  </Text>
                )}
                {isValid && (
                  <View style={styles.markBar}>
                    <View style={[styles.markBarFill, { width: `${num}%` as any }]} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Application summary */}
      {appStats.total > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applications</Text>
          {[
            { label: 'Shortlisted', count: appStats.shortlisted, color: ED.muted },
            { label: 'Submitted / Supp sent', count: appStats.applied, color: ED.ink },
            { label: 'Offers', count: appStats.offers, color: ED.success },
          ].map(row => (
            <View key={row.label} style={styles.appSummaryRow}>
              <Text style={styles.appSummaryLabel}>{row.label}</Text>
              <Text style={[styles.appSummaryCount, { color: row.color }]}>{row.count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick links */}
      <View style={[styles.section, styles.quickLinks]}>
        <Pressable style={styles.quickLink} onPress={() => router.push('/scholarships')}>
          <Feather name="award" size={16} color={ED.softInk} />
          <Text style={styles.quickLinkText}>Scholarships</Text>
          <Feather name="chevron-right" size={14} color={ED.muted} style={{ marginLeft: 'auto' }} />
        </Pressable>
        <Pressable style={[styles.quickLink, styles.quickLinkBorder]} onPress={() => router.push('/chats')}>
          <Feather name="message-circle" size={16} color={ED.softInk} />
          <Text style={styles.quickLinkText}>Chats</Text>
          <Feather name="chevron-right" size={14} color={ED.muted} style={{ marginLeft: 'auto' }} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  content: { paddingBottom: 100 },
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
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 30, color: '#1a1612', lineHeight: 32 },
  schBtn: { padding: 4 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 18,
    backgroundColor: '#fbf8f1',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8e0cf',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#1a1612',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitials: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#f5f1e8' },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1a1612' },
  profileSchool: { fontSize: 12, color: '#8b7e62', marginTop: 2, fontFamily: 'Inter_400Regular' },
  ouacRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  ouacLabel: { fontSize: 10, color: '#8b7e62', fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.8 },
  ouacRef: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: '#5c4a2f' },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: { fontSize: 9, color: '#8b7e62', fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, textAlign: 'center' },
  statValue: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#1a1612', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#e8e0cf', marginHorizontal: 24, marginBottom: 20 },
  section: { paddingHorizontal: 24, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#8b7e62', textTransform: 'uppercase', letterSpacing: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: 12, color: '#8b7e62', fontFamily: 'Inter_400Regular' },
  saveBtn: { backgroundColor: '#1a1612', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999 },
  saveBtnText: { fontSize: 12, color: '#f5f1e8', fontFamily: 'Inter_500Medium' },
  marksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  markItem: { width: '47%', backgroundColor: '#fbf8f1', borderWidth: 1, borderColor: '#e8e0cf', borderRadius: 10, padding: 12 },
  markCourse: { fontSize: 10, color: '#8b7e62', fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  markValue: { fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#1a1612' },
  markValueEmpty: { color: '#d4c9b0' },
  markInput: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 20,
    color: '#1a1612',
    borderBottomWidth: 1,
    borderBottomColor: '#d4c9b0',
    paddingBottom: 2,
    paddingTop: 0,
    margin: 0,
  },
  markBar: { height: 3, backgroundColor: '#e8e0cf', borderRadius: 999, marginTop: 8, overflow: 'hidden' },
  markBarFill: { height: '100%', backgroundColor: '#1a1612', borderRadius: 999 },
  appSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e8e0cf',
  },
  appSummaryLabel: { fontSize: 13, color: '#1a1612', fontFamily: 'Inter_400Regular' },
  appSummaryCount: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18 },
  quickLinks: { gap: 0 },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  quickLinkBorder: { borderTopWidth: 1, borderTopColor: '#e8e0cf' },
  quickLinkText: { fontSize: 14, color: '#1a1612', fontFamily: 'Inter_500Medium', flex: 1 },
});
