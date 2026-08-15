import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ALL_PROGRAMS, Program } from "@/data/programs";
import { getUniversityById } from "@/data/universities";
import { useUser } from "@/context/UserContext";
import {
  classifyTier,
  formatAverage,
  parseAverageCutoff,
  TIER_CONFIG,
  TIER_ORDER,
} from "@/lib/admissions";

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

type TierFilter = 'all' | 'reach' | 'target' | 'safety';

const ITEM_HEIGHT = 148;

function ProgramRow({ program, userAvg }: { program: Program; userAvg: number | null }) {
  const uni = getUniversityById(program.universityId);
  if (!uni) return null;
  const tier = classifyTier(program.competitiveness, program.averageGrade, userAvg);
  const tc = TIER_CONFIG[tier];
  const cutoff = parseAverageCutoff(program.averageGrade);

  return (
    <Pressable
      style={styles.programRow}
      onPress={() => router.push({ pathname: '/program/[id]', params: { id: program.id } })}
    >
      <View style={styles.programTop}>
        <View style={styles.programLeft}>
          <Text style={styles.programUniLabel}>{uni.shortName} · {uni.location}</Text>
          <Text style={styles.programName}>{program.name}</Text>
          <Text style={styles.programFaculty}>{program.faculty}</Text>
        </View>
        <View style={[styles.uniBadge, { backgroundColor: uni.color }]}>
          <Text style={styles.uniInitials}>
            {uni.shortName.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.programStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Cutoff</Text>
          <Text style={styles.statNum}>{cutoff}%</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Your avg</Text>
          <Text
            style={[
              styles.statNum,
              userAvg !== null && cutoff !== null
                ? { color: userAvg >= cutoff ? ED.success : ED.warn }
                : { color: ED.muted },
            ]}
          >
            {formatAverage(userAvg)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tier</Text>
          <View style={[styles.tierBadge, { backgroundColor: tc.bg }]}>
            <Text style={[styles.tierLabel, { color: tc.color }]}>{tc.label}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const { profile } = useUser();
  const userAvg = profile.avg;

  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<TierFilter>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const results = ALL_PROGRAMS.filter(p => {
      if (q) {
        const uni = getUniversityById(p.universityId);
        const matchName = p.name.toLowerCase().includes(q);
        const matchUni = uni ? (
          uni.name.toLowerCase().includes(q) ||
          uni.shortName.toLowerCase().includes(q) ||
          uni.location.toLowerCase().includes(q)
        ) : false;
        const matchFaculty = p.faculty.toLowerCase().includes(q);
        if (!matchName && !matchUni && !matchFaculty) return false;
      }
      if (tier !== 'all') {
        const t = classifyTier(p.competitiveness, p.averageGrade, userAvg);
        if (t !== tier) return false;
      }
      return true;
    });
    // Sort: Target → Safety → Reach, then by cutoff descending within tier
    return results.sort((a, b) => {
      const ta = classifyTier(a.competitiveness, a.averageGrade, userAvg);
      const tb = classifyTier(b.competitiveness, b.averageGrade, userAvg);
      const od = TIER_ORDER[ta] - TIER_ORDER[tb];
      if (od !== 0) return od;
      return (parseAverageCutoff(b.averageGrade) ?? 0) - (parseAverageCutoff(a.averageGrade) ?? 0);
    });
  }, [query, tier, userAvg]);

  const tierOptions: { id: TierFilter; label: string }[] = [
    { id: 'all', label: `All ${ALL_PROGRAMS.length.toLocaleString()}` },
    { id: 'reach', label: 'Reach' },
    { id: 'target', label: 'Target' },
    { id: 'safety', label: 'Safety' },
  ];

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Discover</Text>
        <Text style={styles.title}>Programs</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Waterloo CS, Ivey, Health Sci…"
            placeholderTextColor={ED.muted}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Tier chips */}
      <View style={styles.chipRow}>
        {tierOptions.map(opt => (
          <Pressable
            key={opt.id}
            style={[styles.chip, tier === opt.id && styles.chipActive]}
            onPress={() => setTier(opt.id)}
          >
            <Text style={[styles.chipText, tier === opt.id && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Count */}
      <Text style={styles.countLabel}>
        {filtered.length.toLocaleString()} program{filtered.length !== 1 ? 's' : ''}
        {userAvg !== null
          ? `  ·  tiers based on your ${userAvg}% average`
          : '  ·  add your marks in You to see Reach / Target / Safety'}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        renderItem={({ item }) => <ProgramRow program={item} userAvg={userAvg} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No programs match</Text>
            <Text style={styles.emptyBody}>
              {query.trim()
                ? `Nothing found for "${query.trim()}". Try a shorter search, or clear the tier filter.`
                : 'Try clearing the tier or university filter.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 30, color: '#1a1612', lineHeight: 32 },
  searchWrap: { paddingHorizontal: 24, paddingBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchIcon: { fontSize: 16, color: '#8b7e62' },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1a1612',
    padding: 0,
  },
  clearBtn: { fontSize: 12, color: '#8b7e62', padding: 4 },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4c9b0',
    backgroundColor: 'transparent',
  },
  chipActive: { backgroundColor: '#1a1612', borderColor: '#1a1612' },
  chipText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#1a1612' },
  chipTextActive: { color: '#f5f1e8' },
  countLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    paddingHorizontal: 24,
    paddingBottom: 6,
  },
  listContent: { paddingBottom: 100 },
  programRow: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8e0cf',
    minHeight: ITEM_HEIGHT,
    justifyContent: 'space-between',
  },
  programTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  programLeft: { flex: 1 },
  programUniLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 3,
  },
  programName: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 18,
    lineHeight: 22,
    color: '#1a1612',
  },
  programFaculty: { fontSize: 11, color: '#5c4a2f', fontFamily: 'Inter_400Regular', marginTop: 2 },
  uniBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  uniInitials: { fontFamily: 'Fraunces_600SemiBold', fontSize: 12, color: '#fff' },
  programStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginTop: 10,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 3,
  },
  statNum: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
    color: '#1a1612',
  },
  tierBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tierLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  statDivider: { width: 1, height: 28, backgroundColor: '#e8e0cf' },
  empty: { padding: 48, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 18, color: '#1a1612', marginBottom: 4 },
  emptyBody: { fontSize: 13, color: '#8b7e62', fontFamily: 'Inter_400Regular' },
});
