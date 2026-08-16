import { router } from "expo-router";
import type { Palette } from "@/constants/theme";
import { usePalette } from "@/context/ThemeContext";
import { useThemedStyles } from "@/lib/useThemedStyles";
import React, { useEffect, useState } from "react";
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
import { useApplications } from "@/context/ApplicationsContext";
import { computeAverage } from "@/lib/admissions";
import { maskOuacRef } from "@/lib/privacy";


function EditProfileModal({ profile, onSave, onClose }: {
  profile: { name: string; school: string; ouacRef: string };
  onSave: (name: string, school: string, ouacRef: string) => void;
  onClose: () => void;
}) {
  const c = usePalette();
  const styles = useThemedStyles(makeStyles);
  const [name, setName] = useState(profile.name);
  const [school, setSchool] = useState(profile.school);
  const [ouacRef, setOuacRef] = useState(profile.ouacRef);

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBg} onPress={onClose}>
        <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit profile</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={18} color={c.muted} />
            </Pressable>
          </View>

          <Text style={styles.modalLabel}>Your name</Text>
          <TextInput
            style={styles.modalInput}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={c.muted}
            autoFocus
          />

          <Text style={styles.modalLabel}>School</Text>
          <TextInput
            style={styles.modalInput}
            value={school}
            onChangeText={setSchool}
            placeholder="High school name"
            placeholderTextColor={c.muted}
          />

          <Text style={styles.modalLabel}>OUAC Reference Number</Text>
          <TextInput
            style={[styles.modalInput, { fontFamily: 'JetBrainsMono_400Regular' }]}
            value={ouacRef}
            onChangeText={setOuacRef}
            placeholder="2026-0000000"
            placeholderTextColor={c.muted}
            keyboardType="numbers-and-punctuation"
          />

          <Pressable
            style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
            disabled={!name.trim()}
            onPress={() => {
              onSave(name.trim(), school.trim(), ouacRef.trim());
              onClose();
            }}
          >
            <Text style={styles.saveBtnText}>Save changes</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function YouScreen() {
  const c = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const { profile, tasks, doneTasks, hasProfile, updateMarks, updateProfile } = useUser();
  const { applications } = useApplications();
  const [editingMarks, setEditingMarks] = useState(false);
  const [localMarks, setLocalMarks] = useState<string[]>(profile.marks);
  const [localCodes, setLocalCodes] = useState<string[]>(profile.courseCodes ?? ['', '', '', '', '', '']);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // The profile is read from storage asynchronously. Without this the marks
  // editor would keep showing the empty first-render draft and silently
  // overwrite real saved marks the first time the student pressed Save.
  useEffect(() => {
    if (editingMarks) return;
    setLocalMarks(profile.marks);
    setLocalCodes(profile.courseCodes ?? ['', '', '', '', '', '']);
  }, [profile.marks, profile.courseCodes, editingMarks]);

  const avg = computeAverage(localMarks);

  const appStats = {
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    applied: applications.filter(a => ['applied', 'supp_sent'].includes(a.status)).length,
    offers: applications.filter(a => ['offer', 'accepted'].includes(a.status)).length,
    total: applications.length,
  };

  const initials = profile.name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const doneFraction = tasks.length > 0
    ? `${doneTasks.size}/${tasks.length}`
    : '—';

  const handleSaveMarks = () => {
    updateMarks(localMarks, localCodes);
    setEditingMarks(false);
  };

  const handleSaveProfile = (name: string, school: string, ouacRef: string) => {
    updateProfile({ name, school, ouacRef });
  };

  return (
    <>
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
          <Pressable
            onPress={() => router.push('/scholarships')}
            style={styles.schBtn}
            accessibilityRole="button"
            accessibilityLabel="Scholarships"
          >
            <Feather name="award" size={18} color={c.ink} />
          </Pressable>
        </View>

        {/* Profile card — tap to edit */}
        <Pressable
          style={styles.profileCard}
          onPress={() => setShowEditProfile(true)}
          accessibilityRole="button"
          accessibilityLabel={
            hasProfile
              ? `Edit profile for ${profile.name}`
              : 'Add your name, school and OUAC reference'
          }
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials || '+'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, !hasProfile && styles.placeholderText]}>
              {profile.name || 'Add your name'}
            </Text>
            <Text style={[styles.profileSchool, !profile.school && styles.placeholderText]}>
              {profile.school || 'Add your high school'}
            </Text>
            <View style={styles.ouacRow}>
              <Text style={styles.ouacLabel}>OUAC Ref</Text>
              <Text style={styles.ouacRef}>{maskOuacRef(profile.ouacRef)}</Text>
            </View>
          </View>
          <Feather name="edit-2" size={14} color={c.muted} />
        </Pressable>

        {/* Stats grid */}
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
            <Text style={styles.statLabel}>Tasks done</Text>
            <Text style={styles.statValue}>{doneFraction}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Marks editor */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top 6 Marks</Text>
            {editingMarks ? (
              <Pressable
                onPress={handleSaveMarks}
                style={styles.saveMarksBtn}
                accessibilityRole="button"
                accessibilityLabel="Save top 6 marks"
              >
                <Text style={styles.saveMarksBtnText}>Save</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setEditingMarks(true)}
                style={styles.editBtn}
                accessibilityRole="button"
                accessibilityLabel="Edit top 6 marks"
              >
                <Feather name="edit-2" size={13} color={c.muted} />
                <Text style={styles.editBtnText}>Edit</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.marksGrid}>
            {[0, 1, 2, 3, 4, 5].map(i => {
              const val = localMarks[i] ?? '';
              const code = localCodes[i] ?? '';
              const num = parseFloat(val);
              const isValid = !isNaN(num) && num > 0 && num <= 100;
              return (
                <View key={i} style={styles.markItem}>
                  {editingMarks ? (
                    <TextInput
                      style={styles.markCodeInput}
                      value={code}
                      onChangeText={v => {
                        const next = [...localCodes];
                        next[i] = v.toUpperCase();
                        setLocalCodes(next);
                      }}
                      placeholder="MHF4U"
                      placeholderTextColor={c.muted}
                      maxLength={6}
                      autoCapitalize="characters"
                    />
                  ) : (
                    <Text style={styles.markCourse}>
                      {code.trim() ? code : `Course ${i + 1}`}
                    </Text>
                  )}
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
                      placeholderTextColor={c.muted}
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
              { label: 'Shortlisted', count: appStats.shortlisted, color: c.muted },
              { label: 'Submitted / Supp sent', count: appStats.applied, color: c.ink },
              { label: 'Offers', count: appStats.offers, color: c.success },
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
          <Pressable
            style={styles.quickLink}
            onPress={() => router.push('/scholarships')}
            accessibilityRole="button"
            accessibilityLabel="Scholarships"
          >
            <Feather name="award" size={16} color={c.softInk} />
            <Text style={styles.quickLinkText}>Scholarships</Text>
            <Feather name="chevron-right" size={14} color={c.muted} style={{ marginLeft: 'auto' }} />
          </Pressable>
          <Pressable
            style={[styles.quickLink, styles.quickLinkBorder]}
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings and privacy"
          >
            <Feather name="shield" size={16} color={c.softInk} />
            <Text style={styles.quickLinkText}>Settings & privacy</Text>
            <Feather name="chevron-right" size={14} color={c.muted} style={{ marginLeft: 'auto' }} />
          </Pressable>
        </View>
      </ScrollView>

      {showEditProfile && (
        <EditProfileModal
          profile={{ name: profile.name, school: profile.school, ouacRef: profile.ouacRef }}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.paper },
  placeholderText: { color: c.muted, fontStyle: 'italic' },
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
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: c.muted,
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 30, color: c.ink, lineHeight: 32 },
  schBtn: { padding: 4 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 18,
    backgroundColor: c.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.rule,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: c.ink,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitials: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: c.paper },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: c.ink },
  profileSchool: { fontSize: 12, color: c.muted, marginTop: 2, fontFamily: 'Inter_400Regular' },
  ouacRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  ouacLabel: { fontSize: 11, color: c.muted, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.8 },
  ouacRef: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: c.softInk },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.rule,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: { fontSize: 11, color: c.muted, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, textAlign: 'center' },
  statValue: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: c.ink, textAlign: 'center' },
  divider: { height: 1, backgroundColor: c.rule, marginHorizontal: 24, marginBottom: 20 },
  section: { paddingHorizontal: 24, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: c.muted, textTransform: 'uppercase', letterSpacing: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: 12, color: c.muted, fontFamily: 'Inter_400Regular' },
  saveMarksBtn: { backgroundColor: c.ink, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999 },
  saveMarksBtnText: { fontSize: 12, color: c.paper, fontFamily: 'Inter_500Medium' },
  marksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  markItem: { width: '47%', backgroundColor: c.card, borderWidth: 1, borderColor: c.rule, borderRadius: 10, padding: 12 },
  markCourse: { fontSize: 11, color: c.muted, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, minHeight: 16 },
  markCodeInput: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: c.ink,
    borderBottomWidth: 1,
    borderBottomColor: c.pillBorder,
    paddingBottom: 2,
    marginBottom: 4,
    paddingTop: 0,
  },
  markValue: { fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: c.ink },
  markValueEmpty: { color: c.pillBorder },
  markInput: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 20,
    color: c.ink,
    borderBottomWidth: 1,
    borderBottomColor: c.pillBorder,
    paddingBottom: 2,
    paddingTop: 0,
    margin: 0,
  },
  markBar: { height: 3, backgroundColor: c.rule, borderRadius: 999, marginTop: 8, overflow: 'hidden' },
  markBarFill: { height: '100%', backgroundColor: c.ink, borderRadius: 999 },
  appSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: c.rule,
  },
  appSummaryLabel: { fontSize: 13, color: c.ink, fontFamily: 'Inter_400Regular' },
  appSummaryCount: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18 },
  quickLinks: { gap: 0 },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  quickLinkBorder: { borderTopWidth: 1, borderTopColor: c.rule },
  quickLinkText: { fontSize: 14, color: c.ink, fontFamily: 'Inter_500Medium', flex: 1 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(26,22,18,0.45)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: c.card,
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
  modalTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: c.ink },
  modalLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: c.muted,
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: c.paper,
    borderWidth: 1,
    borderColor: c.rule,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: c.ink,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: c.ink,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnDisabled: { backgroundColor: c.pillBorder },
  saveBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: c.paper },
});
