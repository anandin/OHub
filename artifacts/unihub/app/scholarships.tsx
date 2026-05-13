import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { SCHOLARSHIPS } from "@/data/userData";

const ED = {
  paper: '#f5f1e8',
  card: '#fbf8f1',
  ink: '#1a1612',
  softInk: '#5c4a2f',
  muted: '#8b7e62',
  rule: '#e8e0cf',
  pillBorder: '#d4c9b0',
  warn: '#c2410c',
  warnText: '#9a3412',
  warnBg: '#fef3e2',
  success: '#15803d',
  successText: '#14532d',
  successBg: '#ecfdf5',
};

type FilterTab = 'all' | 'eligible' | 'submitted' | 'auto';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Eligible:  { label: 'Eligible',       color: ED.warnText,    bg: ED.warnBg    },
  Submitted: { label: 'Submitted',      color: ED.successText, bg: ED.successBg },
  Auto:      { label: 'Auto-considered',color: ED.muted,       bg: '#f0ebe0'    },
};

export default function ScholarshipsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filtered = SCHOLARSHIPS.filter(s => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'eligible') return s.status === 'Eligible';
    if (activeFilter === 'submitted') return s.status === 'Submitted';
    if (activeFilter === 'auto') return s.status === 'Auto';
    return true;
  });

  const eligibleCount = SCHOLARSHIPS.filter(s => s.status === 'Eligible').length;

  const filters: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'eligible', label: 'Eligible' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'auto', label: 'Auto-considered' },
  ];

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={ED.ink} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Money</Text>
          <Text style={styles.title}>Scholarships{'\n'}for you</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Summary card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Awards tracked</Text>
          <Text style={styles.totalAmount}>{SCHOLARSHIPS.length}</Text>
          <Text style={styles.totalSub}>
            {eligibleCount} still open to apply · tap any card to visit official page
          </Text>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {filters.map(f => (
            <Pressable
              key={f.id}
              style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.id)}
            >
              <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Scholarship list */}
        {filtered.map((s, i) => {
          const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.Auto;
          const barColor = s.match >= 90 ? ED.success : s.match >= 80 ? ED.ink : '#b8a888';
          return (
            <View key={s.id} style={[styles.scholRow, i > 0 && styles.scholRowBorder]}>
              <View style={styles.scholTop}>
                <View style={styles.scholLeft}>
                  <Text style={styles.scholName}>{s.name}</Text>
                  <Text style={styles.scholUni}>{s.university}</Text>
                  <Text style={styles.scholDesc}>{s.description}</Text>
                  <Text style={styles.scholMeta}>
                    Deadline: {s.deadline} · Match {s.match}%
                  </Text>
                </View>
                <Text style={styles.scholValue}>{s.value}</Text>
              </View>

              <View style={styles.scholBottom}>
                <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
                <Pressable
                  style={styles.linkBtn}
                  onPress={() => Linking.openURL(s.url)}
                >
                  <Feather name="external-link" size={12} color={ED.softInk} />
                  <Text style={styles.linkBtnText}>Official page</Text>
                </Pressable>
              </View>

              {/* Match bar */}
              <View style={styles.matchTrack}>
                <View style={[styles.matchFill, { width: `${s.match}%` as any, backgroundColor: barColor }]} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },
  backBtn: { paddingTop: 4 },
  headerText: { flex: 1 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 30, color: '#1a1612', lineHeight: 34 },
  content: { paddingBottom: 60 },
  totalCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 14,
    padding: 18,
  },
  totalLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  totalAmount: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 48,
    color: '#1a1612',
    lineHeight: 52,
  },
  totalSub: { fontSize: 12, color: '#5c4a2f', marginTop: 6, fontFamily: 'Inter_400Regular' },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4c9b0',
  },
  filterChipActive: { backgroundColor: '#1a1612', borderColor: '#1a1612' },
  filterText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#1a1612' },
  filterTextActive: { color: '#f5f1e8' },
  scholRow: { paddingHorizontal: 24, paddingVertical: 18 },
  scholRowBorder: { borderTopWidth: 1, borderTopColor: '#e8e0cf' },
  scholTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  scholLeft: { flex: 1 },
  scholName: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 18,
    lineHeight: 22,
    color: '#1a1612',
  },
  scholUni: {
    fontSize: 11,
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  scholDesc: {
    fontSize: 12,
    color: '#5c4a2f',
    marginTop: 6,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  scholMeta: { fontSize: 11, color: '#8b7e62', marginTop: 6, fontFamily: 'Inter_400Regular' },
  scholValue: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#1a1612', textAlign: 'right', flexShrink: 0 },
  scholBottom: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#d4c9b0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  linkBtnText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#5c4a2f' },
  matchTrack: {
    marginTop: 12,
    height: 3,
    backgroundColor: '#e8e0cf',
    borderRadius: 999,
    overflow: 'hidden',
  },
  matchFill: { height: '100%', borderRadius: 999 },
});
