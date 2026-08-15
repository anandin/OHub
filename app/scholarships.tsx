import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { ED } from "@/constants/theme";
import { openExternalUrl } from "@/lib/safeLink";
import Feather from "@expo/vector-icons/Feather";

import {
  SCHOLARSHIP_AWARDS,
  SCHOLARSHIP_SOURCES,
  ScholarshipCategory,
} from "@/data/scholarships";


type FilterTab = 'all' | ScholarshipCategory | 'auto';
type SortMode = 'value' | 'az';

const FILTERS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'National', label: 'National' },
  { id: 'University', label: 'University' },
  { id: 'Ontario', label: 'Ontario' },
  { id: 'Community', label: 'Community' },
  { id: 'auto', label: 'No application' },
];

export default function ScholarshipsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortMode, setSortMode] = useState<SortMode>('value');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = SCHOLARSHIP_AWARDS.filter(s => {
      if (activeFilter === 'auto' && s.applicationRequired) return false;
      if (activeFilter !== 'all' && activeFilter !== 'auto' && s.category !== activeFilter) return false;
      if (!q) return true;
      const hay = `${s.name} ${s.provider} ${s.description} ${s.tags.join(' ')} ${s.eligibility.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
    list = [...list].sort((a, b) =>
      sortMode === 'value' ? b.valueNum - a.valueNum : a.name.localeCompare(b.name)
    );
    return list;
  }, [query, activeFilter, sortMode]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={ED.ink} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Money</Text>
          <Text style={styles.title}>Scholarship search</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Feather name="search" size={15} color={ED.muted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, keyword or eligibility…"
          placeholderTextColor={ED.muted}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Feather name="x" size={15} color={ED.muted} />
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map(f => (
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
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Count + sort */}
        <View style={styles.metaRow}>
          <Text style={styles.metaCount}>
            {filtered.length} scholarship{filtered.length === 1 ? '' : 's'}
          </Text>
          <Pressable
            style={styles.sortBtn}
            onPress={() => setSortMode(m => (m === 'value' ? 'az' : 'value'))}
          >
            <Feather name={sortMode === 'value' ? 'trending-down' : 'chevron-down'} size={12} color={ED.softInk} />
            <Text style={styles.sortBtnText}>
              {sortMode === 'value' ? 'Highest value' : 'A–Z'}
            </Text>
          </Pressable>
        </View>

        {/* List */}
        {filtered.map((s, i) => (
          <Pressable
            key={s.id}
            style={[styles.row, i > 0 && styles.rowBorder]}
            onPress={() => router.push(`/scholarship/${s.id}`)}
          >
            <View style={styles.rowTop}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowName}>{s.name}</Text>
                <Text style={styles.rowProvider}>{s.provider}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{s.value}</Text>
                {!s.applicationRequired && (
                  <View style={styles.autoPill}>
                    <Text style={styles.autoPillText}>Automatic</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.rowDesc} numberOfLines={2}>{s.description}</Text>
            <View style={styles.rowMeta}>
              <Text style={styles.rowMetaText}>Deadline: {s.deadline}</Text>
              <Feather name="chevron-right" size={14} color={ED.muted} />
            </View>
          </Pressable>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptyBody}>
              Try a different keyword or clear the filters — or browse the databases below.
            </Text>
          </View>
        )}

        {/* External databases */}
        <View style={styles.sourcesSection}>
          <Text style={styles.sectionLabel}>Search more databases</Text>
          <Text style={styles.sourcesIntro}>
            Thousands more awards live in these directories. Make an account and set up alerts.
          </Text>
          {SCHOLARSHIP_SOURCES.map((src, i) => (
            <Pressable
              key={src.id}
              style={[styles.sourceRow, i > 0 && styles.rowBorder]}
              onPress={() => void openExternalUrl(src.url)}
              accessibilityRole="link"
              accessibilityLabel={`${src.name}. ${src.blurb}`}
              accessibilityHint="Opens in a new tab"
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.sourceName}>{src.name}</Text>
                <Text style={styles.sourceBlurb}>{src.blurb}</Text>
              </View>
              <Feather name="external-link" size={14} color={ED.softInk} />
            </Pressable>
          ))}
        </View>
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
    paddingBottom: 14,
    gap: 16,
  },
  backBtn: { paddingTop: 4 },
  headerText: { flex: 1 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#6f6449',
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 28, color: '#1a1612', lineHeight: 32 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#1a1612',
    padding: 0,
    margin: 0,
  },
  filterScroll: { flexGrow: 0, marginBottom: 4 },
  filterRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingBottom: 10 },
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
  content: { paddingBottom: 60 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 6,
  },
  metaCount: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6f6449',
    fontFamily: 'Inter_500Medium',
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortBtnText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#5c4a2f' },
  row: { paddingHorizontal: 24, paddingVertical: 16 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#e8e0cf' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLeft: { flex: 1 },
  rowName: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 17,
    lineHeight: 21,
    color: '#1a1612',
  },
  rowProvider: {
    fontSize: 11,
    color: '#6f6449',
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rowRight: { alignItems: 'flex-end', flexShrink: 0, maxWidth: 130 },
  rowValue: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 14,
    color: '#1a1612',
    textAlign: 'right',
  },
  autoPill: {
    marginTop: 4,
    backgroundColor: '#ecfdf5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  autoPillText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#14532d' },
  rowDesc: {
    fontSize: 12,
    color: '#5c4a2f',
    marginTop: 6,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  rowMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rowMetaText: { fontSize: 11, color: '#6f6449', fontFamily: 'Inter_400Regular' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 18, color: '#1a1612', marginBottom: 6 },
  emptyBody: {
    fontSize: 13,
    color: '#6f6449',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    maxWidth: 280,
  },
  sourcesSection: {
    marginTop: 24,
    marginHorizontal: 24,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 14,
    padding: 18,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#6f6449',
    fontFamily: 'Inter_500Medium',
    marginBottom: 6,
  },
  sourcesIntro: {
    fontSize: 12,
    color: '#5c4a2f',
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
    marginBottom: 6,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  sourceName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#1a1612' },
  sourceBlurb: { fontSize: 11, color: '#6f6449', fontFamily: 'Inter_400Regular', marginTop: 2 },
});
