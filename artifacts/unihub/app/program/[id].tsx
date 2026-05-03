import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

import { useApplications } from "@/context/ApplicationsContext";
import { useUser } from "@/context/UserContext";
import { ALL_PROGRAMS } from "@/data/programs";
import { getAdviceForProgram, SOURCE_TYPE_CONFIG } from "@/data/suppAdvice";
import { getUniversityById } from "@/data/universities";

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
  amber: '#fef3c7',
  amberText: '#7c4a03',
};

function parseAvgNum(grade: string): number {
  const m = grade.match(/(\d+)/);
  return m ? parseInt(m[1]) : 75;
}

function getTier(competitiveness: string, avgGrade: string, userAvg: number): 'reach' | 'target' | 'safety' {
  const cutoff = parseAvgNum(avgGrade);
  const diff = userAvg - cutoff;
  if (competitiveness === 'extreme' || (competitiveness === 'very_high' && diff < 2)) return 'reach';
  if (competitiveness === 'high' || (diff >= -2 && diff <= 5)) return 'target';
  return 'safety';
}

const TIER_CONFIG = {
  reach:  { label: 'Reach',  color: '#9a3412', bg: '#fef3e2' },
  target: { label: 'Target', color: '#1a1612', bg: '#f0ebe0' },
  safety: { label: 'Safety', color: '#14532d', bg: '#ecfdf5' },
};

const ESSAY_ROUTES: Record<string, string> = {
  waterloo: 'waterloo-aif-4',
  queens: 'queens-pse-1',
  western: 'western-supp-1',
  mcmaster: 'mcmaster-health-1',
  uoft: 'uoft-supp-1',
  yorku: 'yorku-supp-1',
  ivey: 'ivey-aeo-1',
};

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 20 : insets.top;
  const { profile } = useUser();
  const { addApplication, isTracked, removeApplication, getApplication } = useApplications();
  const [expandedAdvice, setExpandedAdvice] = useState<string | null>(null);

  const program = ALL_PROGRAMS.find(p => p.id === id);

  if (!program) {
    return (
      <View style={[styles.container, { paddingTop: topInset, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.notFoundText}>Program not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: ED.muted, fontFamily: 'Inter_400Regular' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const uni = getUniversityById(program.universityId);
  const userAvg = profile.avg;
  const tier = getTier(program.competitiveness, program.averageGrade, userAvg);
  const tc = TIER_CONFIG[tier];
  const cutoff = parseAvgNum(program.averageGrade);
  const tracked = isTracked(program.universityId);
  const application = getApplication(program.universityId);
  const adviceCards = getAdviceForProgram(program.id);
  const essayRoute = ESSAY_ROUTES[program.universityId];

  const handleTrack = () => {
    if (tracked) {
      removeApplication(program.universityId);
    } else {
      addApplication(program.universityId, program.name);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={ED.ink} />
        </Pressable>
        <Text style={styles.topBarLabel} numberOfLines={1}>{program.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          {uni && (
            <View style={[styles.uniBadge, { backgroundColor: uni.color }]}>
              <Text style={styles.uniInitials}>{uni.shortName.slice(0, 2).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.heroInfo}>
            <Text style={styles.heroUni}>{uni?.shortName ?? program.universityId} · {uni?.location}</Text>
            <Text style={styles.heroProgram}>{program.name}</Text>
            <Text style={styles.heroMeta}>{program.faculty} · {program.degree} · {program.duration}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Cutoff</Text>
            <Text style={styles.statVal}>{cutoff}%</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Your avg</Text>
            <Text style={[styles.statVal, { color: userAvg >= cutoff ? ED.success : ED.warn }]}>
              {userAvg}%
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tier</Text>
            <View style={[styles.tierPill, { backgroundColor: tc.bg }]}>
              <Text style={[styles.tierPillText, { color: tc.color }]}>{tc.label}</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tuition</Text>
            <Text style={styles.statVal} numberOfLines={1}>{program.tuition}</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgesRow}>
          {program.hasCoOp && (
            <View style={styles.badge}>
              <Feather name="briefcase" size={11} color={ED.softInk} />
              <Text style={styles.badgeText}>Co-op available</Text>
            </View>
          )}
          {program.suppRequired && (
            <View style={[styles.badge, { borderColor: '#fca5a5', backgroundColor: ED.warnBg }]}>
              <Feather name="file-text" size={11} color="#9a3412" />
              <Text style={[styles.badgeText, { color: '#9a3412' }]}>Supp. required</Text>
            </View>
          )}
          {program.intakeSize && (
            <View style={styles.badge}>
              <Feather name="users" size={11} color={ED.softInk} />
              <Text style={styles.badgeText}>{program.intakeSize} intake</Text>
            </View>
          )}
          <View style={styles.badge}>
            <Feather name="hash" size={11} color={ED.softInk} />
            <Text style={styles.badgeText}>{program.ouacCode}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this program</Text>
          <Text style={styles.bodyText}>{program.description}</Text>
        </View>

        {/* Supp warning */}
        {program.suppRequired && program.suppDescription && (
          <View style={styles.suppBox}>
            <View style={styles.suppBoxHeader}>
              <Feather name="alert-circle" size={14} color="#9a3412" />
              <Text style={styles.suppBoxTitle}>Supplementary application required</Text>
            </View>
            <Text style={styles.suppBoxBody}>{program.suppDescription}</Text>
            {essayRoute && (
              <Pressable
                style={styles.essayShortcut}
                onPress={() => router.push({ pathname: '/essay/[id]', params: { id: essayRoute } })}
              >
                <Feather name="edit-3" size={13} color={ED.ink} />
                <Text style={styles.essayShortcutText}>Draft your response in oHub</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Required courses */}
        {program.requiredCourses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Grade 12 courses</Text>
            <View style={styles.chipRow}>
              {program.requiredCourses.map(c => (
                <View key={c} style={styles.chip}>
                  <Feather name="check" size={10} color={ED.success} />
                  <Text style={styles.chipText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notable features */}
        {program.notableFeatures && program.notableFeatures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notable features</Text>
            {program.notableFeatures.map((f, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>◆</Text>
                <Text style={styles.bulletText}>{f}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Career paths */}
        {program.careerPaths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Career paths</Text>
            <View style={styles.chipRow}>
              {program.careerPaths.map(c => (
                <View key={c} style={[styles.chip, { borderColor: '#86efac', backgroundColor: ED.successBg }]}>
                  <Text style={[styles.chipText, { color: ED.success }]}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Essay shortcut (if no supp required) */}
        {essayRoute && !program.suppRequired && (
          <View style={styles.section}>
            <Pressable
              style={styles.essayCard}
              onPress={() => router.push({ pathname: '/essay/[id]', params: { id: essayRoute } })}
            >
              <View>
                <Text style={styles.essayCardTitle}>Draft your essay</Text>
                <Text style={styles.essayCardSub}>Open the essay editor for {uni?.shortName ?? program.universityId}</Text>
              </View>
              <Feather name="arrow-right" size={16} color={ED.ink} />
            </Pressable>
          </View>
        )}

        {/* OUAC apply link */}
        <View style={styles.section}>
          <Pressable
            style={styles.ouacBtn}
            onPress={() => Linking.openURL('https://www.ouac.on.ca')}
          >
            <Feather name="external-link" size={14} color={ED.paper} />
            <Text style={styles.ouacBtnText}>Apply via OUAC</Text>
          </Pressable>
        </View>

        {/* Supplementary advice cards */}
        {adviceCards.length > 0 && (
          <View style={[styles.section, { marginTop: 4 }]}>
            <Text style={styles.sectionTitle}>Insider advice</Text>
            <Text style={styles.adviceSubtitle}>From alumni, coaching platforms, and official sources.</Text>
            {adviceCards.map(card => {
              const srcCfg = SOURCE_TYPE_CONFIG[card.sourceType];
              const isOpen = expandedAdvice === card.id;
              return (
                <Pressable
                  key={card.id}
                  style={styles.adviceCard}
                  onPress={() => setExpandedAdvice(isOpen ? null : card.id)}
                >
                  <View style={styles.adviceCardTop}>
                    <View style={[styles.srcBadge, { backgroundColor: srcCfg.color + '18' }]}>
                      <Feather name={srcCfg.icon as any} size={11} color={srcCfg.color} />
                      <Text style={[styles.srcBadgeText, { color: srcCfg.color }]}>{srcCfg.label}</Text>
                    </View>
                    <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={15} color={ED.muted} />
                  </View>
                  <Text style={styles.adviceCardTitle}>{card.title}</Text>
                  {isOpen && (
                    <>
                      <Text style={styles.adviceCardBody}>{card.content}</Text>
                      <View style={styles.adviceSource}>
                        <Feather name="link" size={11} color={ED.muted} />
                        <Text style={styles.adviceSourceText} numberOfLines={1}>{card.source}</Text>
                        {card.sourceUrl && (
                          <Pressable onPress={() => Linking.openURL(card.sourceUrl!)}>
                            <Text style={styles.adviceOpenLink}>Open →</Text>
                          </Pressable>
                        )}
                      </View>
                      <View style={styles.tagRow}>
                        {card.tags.map(t => (
                          <View key={t} style={styles.tag}>
                            <Text style={styles.tagText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.cta, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.ctaBtn, tracked && styles.ctaBtnTracked]}
          onPress={handleTrack}
        >
          <Feather
            name={tracked ? 'check' : 'plus'}
            size={16}
            color={tracked ? ED.ink : ED.paper}
          />
          <Text style={[styles.ctaBtnText, tracked && styles.ctaBtnTextTracked]}>
            {tracked
              ? `Tracking · ${application ? application.status.replace('_', ' ') : 'Shortlisted'}`
              : 'Track this program'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f1e8' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0cf',
  },
  backBtn: { padding: 4, width: 36 },
  topBarLabel: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1a1612',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  notFoundText: { fontFamily: 'Fraunces_500Medium', fontSize: 18, color: '#1a1612' },
  content: { paddingBottom: 60 },
  hero: {
    flexDirection: 'row',
    gap: 16,
    padding: 24,
    alignItems: 'flex-start',
  },
  uniBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  uniInitials: { fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#fff' },
  heroInfo: { flex: 1 },
  heroUni: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  heroProgram: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    color: '#1a1612',
    lineHeight: 26,
    marginBottom: 4,
  },
  heroMeta: { fontSize: 12, color: '#5c4a2f', fontFamily: 'Inter_400Regular' },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  statVal: { fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#1a1612' },
  statDivider: { width: 1, height: 30, backgroundColor: '#e8e0cf' },
  tierPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tierPillText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 24, marginBottom: 16 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4c9b0',
    backgroundColor: '#fbf8f1',
  },
  badgeText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#5c4a2f' },
  divider: { height: 1, backgroundColor: '#e8e0cf', marginHorizontal: 24, marginBottom: 20 },
  section: { paddingHorizontal: 24, marginBottom: 20 },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#8b7e62',
    fontFamily: 'Inter_500Medium',
    marginBottom: 10,
  },
  bodyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#1a1612', lineHeight: 22 },
  suppBox: {
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef3e2',
    padding: 16,
    marginBottom: 20,
  },
  suppBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  suppBoxTitle: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#9a3412' },
  suppBoxBody: { fontSize: 13, color: '#7c4a03', fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 12 },
  essayShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#d4c9b0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  essayShortcutText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#1a1612' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#d4c9b0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fbf8f1',
  },
  chipText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#5c4a2f' },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  bulletDot: { fontSize: 7, color: '#8b7e62', marginTop: 7 },
  bulletText: { flex: 1, fontSize: 14, color: '#1a1612', fontFamily: 'Inter_400Regular', lineHeight: 22 },
  essayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 12,
    padding: 16,
  },
  essayCardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1a1612', marginBottom: 2 },
  essayCardSub: { fontSize: 11, color: '#8b7e62', fontFamily: 'Inter_400Regular' },
  ouacBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1612',
    borderRadius: 999,
    paddingVertical: 13,
  },
  ouacBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#f5f1e8' },
  adviceSubtitle: { fontSize: 12, color: '#8b7e62', fontFamily: 'Inter_400Regular', marginBottom: 12, marginTop: -4 },
  adviceCard: {
    backgroundColor: '#fbf8f1',
    borderWidth: 1,
    borderColor: '#e8e0cf',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  adviceCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  srcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  srcBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  adviceCardTitle: { fontFamily: 'Fraunces_500Medium', fontSize: 15, color: '#1a1612', lineHeight: 20 },
  adviceCardBody: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#5c4a2f',
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 10,
  },
  adviceSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f1e8',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  adviceSourceText: { flex: 1, fontSize: 11, fontFamily: 'Inter_400Regular', color: '#8b7e62' },
  adviceOpenLink: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#1a1612', flexShrink: 0 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#d4c9b0',
    backgroundColor: '#f5f1e8',
  },
  tagText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#8b7e62' },
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#f5f1e8',
    borderTopWidth: 1,
    borderTopColor: '#e8e0cf',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1612',
    borderRadius: 999,
    paddingVertical: 14,
  },
  ctaBtnTracked: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1a1612',
  },
  ctaBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#f5f1e8' },
  ctaBtnTextTracked: { color: '#1a1612' },
});
