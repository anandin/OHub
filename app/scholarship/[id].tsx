import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";

import { displayHost, openExternalUrl } from "@/lib/safeLink";
import { getScholarshipById } from "@/data/scholarships";

const ED = {
  paper: '#f5f1e8',
  card: '#fbf8f1',
  ink: '#1a1612',
  softInk: '#5c4a2f',
  muted: '#8b7e62',
  rule: '#e8e0cf',
  pillBorder: '#d4c9b0',
  success: '#15803d',
  successText: '#14532d',
  successBg: '#ecfdf5',
};

function FactRow({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.factRow}>
      <Feather name={icon} size={14} color={ED.muted} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.factLabel}>{label}</Text>
        <Text style={styles.factValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ScholarshipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const s = getScholarshipById(id ?? '');

  if (!s) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={ED.ink} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Scholarship not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={ED.ink} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{s.category} · {s.provider}</Text>
          <Text style={styles.title}>{s.name}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: 120 + bottomInset }]}
      >
        {/* Value card */}
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Award value</Text>
          <Text style={styles.valueAmount}>{s.value}</Text>
          <View style={styles.tagRow}>
            {!s.applicationRequired && (
              <View style={[styles.tag, styles.tagAuto]}>
                <Text style={[styles.tagText, { color: ED.successText }]}>No application needed</Text>
              </View>
            )}
            {s.tags.map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About this award</Text>
          <Text style={styles.body}>{s.description}</Text>
        </View>

        {/* Key facts */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Key details</Text>
          <View style={styles.factsCard}>
            <FactRow icon="hash" label="How many awarded" value={s.quantity} />
            <View style={styles.factDivider} />
            <FactRow icon="calendar" label="Deadline" value={s.deadline} />
            <View style={styles.factDivider} />
            <FactRow icon="refresh-cw" label="Renewability" value={s.renewable} />
            <View style={styles.factDivider} />
            <FactRow
              icon="edit-3"
              label="Application"
              value={s.applicationRequired ? 'Application required' : 'Automatic — considered when you apply for admission'}
            />
          </View>
        </View>

        {/* Eligibility */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Eligibility</Text>
          {s.eligibility.map((e, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{e}</Text>
            </View>
          ))}
        </View>

        {/* Source note */}
        <View style={styles.section}>
          <Text style={styles.sourceNote}>
            Details from {s.source}. Amounts and deadlines can change year to year — always confirm on the official page before applying.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky apply button */}
      <View style={[styles.applyBar, { paddingBottom: 16 + bottomInset }]}>
        <Pressable
          style={styles.applyBtn}
          onPress={() => void openExternalUrl(s.applyUrl)}
          accessibilityRole="link"
          accessibilityLabel={`${s.applicationRequired ? 'Apply for' : 'View'} ${s.name} on ${displayHost(s.applyUrl) || 'the official site'}`}
          accessibilityHint="Opens in a new tab"
        >
          <Feather name="external-link" size={16} color={ED.paper} />
          <Text style={styles.applyBtnText}>
            {s.applicationRequired ? 'Apply on official site' : 'View official page'}
          </Text>
        </Pressable>
        <Text style={styles.applyBarSource}>{s.source}</Text>
      </View>
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
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 24, color: '#1a1612', lineHeight: 29 },
  content: { paddingTop: 4 },
  valueCard: {
    marginHorizontal: 24,
    marginBottom: 22,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 14,
    padding: 18,
  },
  valueLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  valueAmount: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 32,
    color: '#1a1612',
    lineHeight: 38,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: {
    borderWidth: 1,
    borderColor: '#d4c9b0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagAuto: { backgroundColor: '#ecfdf5', borderColor: '#ecfdf5' },
  tagText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#5c4a2f' },
  section: { paddingHorizontal: 24, marginBottom: 22 },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  body: { fontSize: 14, color: '#1a1612', lineHeight: 22, fontFamily: 'Inter_400Regular' },
  factsCard: {
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 14,
    padding: 16,
  },
  factRow: { flexDirection: 'row', gap: 10 },
  factDivider: { height: 1, backgroundColor: '#f0ebe0', marginVertical: 12 },
  factLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  factValue: { fontSize: 13, color: '#1a1612', lineHeight: 19, fontFamily: 'Inter_500Medium' },
  bulletRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#8b7e62',
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: { flex: 1, fontSize: 13, color: '#5c4a2f', lineHeight: 20, fontFamily: 'Inter_400Regular' },
  sourceNote: { fontSize: 11, color: '#8b7e62', lineHeight: 17, fontFamily: 'Inter_400Regular' },
  applyBar: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: '#f5f1e8',
    borderTopWidth: 1,
    borderTopColor: '#e8e0cf',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1612',
    borderRadius: 999,
    paddingVertical: 14,
  },
  applyBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#f5f1e8' },
  applyBarSource: {
    fontSize: 10,
    color: '#8b7e62',
    fontFamily: 'JetBrainsMono_400Regular',
    textAlign: 'center',
    marginTop: 6,
  },
  emptyState: { padding: 48, alignItems: 'center' },
  emptyTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 20, color: '#1a1612' },
});
