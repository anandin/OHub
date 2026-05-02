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

import Colors from "@/constants/colors";
import { useApplications } from "@/context/ApplicationsContext";
import { APP_STATUS_CONFIG } from "@/context/ApplicationsContext";
import { getProgramById } from "@/data/programs";
import { getAdviceForProgram } from "@/data/suppAdvice";
import { SOURCE_TYPE_CONFIG } from "@/data/suppAdvice";
import { getUniversityById } from "@/data/universities";

const COMP_CONFIG = {
  moderate:  { label: "Moderate Competition",      color: "#6B7280", bg: "#F3F4F6" },
  high:      { label: "High Competition",          color: "#0EA5E9", bg: "#E0F2FE" },
  very_high: { label: "Very High Competition",     color: "#F59E0B", bg: "#FFFBEB" },
  extreme:   { label: "Extremely Competitive",     color: "#EF4444", bg: "#FEF2F2" },
};

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { isTracked, addApplication, getApplication } = useApplications();
  const [expandedAdvice, setExpandedAdvice] = useState<string | null>(null);

  const program = getProgramById(id);
  if (!program) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Program not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const uni = getUniversityById(program.universityId);
  const adviceCards = getAdviceForProgram(program.id);
  const comp = COMP_CONFIG[program.competitiveness];
  const tracked = isTracked(program.universityId);
  const application = getApplication(program.universityId);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topInset }]}
      contentContainerStyle={[
        styles.content,
        Platform.OS === "web" && { paddingBottom: 34 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.topBarLabel} numberOfLines={1}>{program.name}</Text>
        {uni && (
          <Pressable
            style={styles.uniBtn}
            onPress={() =>
              router.push({ pathname: "/university/[id]", params: { id: program.universityId } })
            }
          >
            <Text style={styles.uniBtnEmoji}>{uni.logo}</Text>
          </Pressable>
        )}
      </View>

      {/* Hero */}
      {uni && (
        <View style={[styles.hero, { backgroundColor: uni.color + "12" }]}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroEmoji}>{uni.logo}</Text>
            <View style={styles.heroText}>
              <Text style={styles.heroProgram}>{program.name}</Text>
              <Text style={styles.heroUni}>{uni.name}</Text>
              <Text style={styles.heroFaculty}>{program.faculty}</Text>
            </View>
          </View>
          <View style={[styles.heroAvgBox, { borderColor: uni.color + "44" }]}>
            <Text style={[styles.heroAvgNum, { color: uni.color }]}>{program.averageGrade}</Text>
            <Text style={styles.heroAvgLabel}>avg required</Text>
          </View>
        </View>
      )}

      {/* Competitiveness + Track button */}
      <View style={styles.actionRow}>
        <View style={[styles.compBadge, { backgroundColor: comp.bg }]}>
          <Text style={[styles.compBadgeText, { color: comp.color }]}>{comp.label}</Text>
        </View>
        <Pressable
          style={[
            styles.trackBtn,
            tracked && {
              backgroundColor: APP_STATUS_CONFIG[application!.status].bg,
              borderColor: APP_STATUS_CONFIG[application!.status].color + "44",
            },
          ]}
          onPress={() => {
            if (!tracked) addApplication(program.universityId, program.name);
            else
              router.push({
                pathname: "/university/[id]",
                params: { id: program.universityId },
              });
          }}
        >
          <Feather
            name={tracked ? (APP_STATUS_CONFIG[application!.status].icon as any) : "clipboard"}
            size={14}
            color={tracked ? APP_STATUS_CONFIG[application!.status].color : Colors.light.primary}
          />
          <Text
            style={[
              styles.trackBtnText,
              tracked && { color: APP_STATUS_CONFIG[application!.status].color },
            ]}
          >
            {tracked ? APP_STATUS_CONFIG[application!.status].label : "Track Application"}
          </Text>
        </Pressable>
      </View>

      {/* Quick stats grid */}
      <View style={styles.statsGrid}>
        {[
          { icon: "award", label: "Degree", value: program.degree },
          { icon: "clock", label: "Duration", value: program.duration },
          { icon: "dollar-sign", label: "Tuition", value: program.tuition },
          { icon: "users", label: "Intake", value: program.intakeSize ?? "Varies" },
          { icon: "calendar", label: "Deadline", value: program.applicationDeadline },
          { icon: "hash", label: "OUAC Code", value: program.ouacCode },
        ].map((s) => (
          <View key={s.label} style={styles.statCell}>
            <View style={styles.statIconRow}>
              <Feather name={s.icon as any} size={14} color={Colors.light.primary} />
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
            <Text style={styles.statValue} numberOfLines={2}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Co-op badge */}
      {program.hasCoOp && (
        <View style={styles.coopBanner}>
          <Feather name="briefcase" size={14} color={Colors.light.success} />
          <Text style={styles.coopBannerText}>
            Co-operative Education (Co-op) is available for this program — alternating academic and paid work terms.
          </Text>
        </View>
      )}

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Program</Text>
        <Text style={styles.description}>{program.description}</Text>
      </View>

      {/* Required Courses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Required Grade 12 Courses</Text>
        <View style={styles.courseGrid}>
          {program.requiredCourses.map((c) => (
            <View key={c} style={styles.courseChip}>
              <Feather name="check" size={12} color={Colors.light.primary} />
              <Text style={styles.courseText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Career Paths */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Career Paths</Text>
        <View style={styles.careerGrid}>
          {program.careerPaths.map((c) => (
            <View key={c} style={styles.careerChip}>
              <Feather name="arrow-right" size={12} color={Colors.light.primary} />
              <Text style={styles.careerText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Notable Features */}
      {program.notableFeatures && program.notableFeatures.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notable Features</Text>
          {program.notableFeatures.map((f) => (
            <View key={f} style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Supplementary App */}
      {program.suppRequired && program.suppDescription && (
        <View style={styles.suppBox}>
          <View style={styles.suppBoxHeader}>
            <Feather name="file-text" size={16} color="#B45309" />
            <Text style={styles.suppBoxTitle}>Supplementary Application Required</Text>
          </View>
          <Text style={styles.suppBoxDesc}>{program.suppDescription}</Text>
        </View>
      )}

      {/* Apply CTA */}
      <View style={styles.applyRow}>
        <Pressable
          style={styles.applyBtn}
          onPress={() => Linking.openURL("https://www.ouac.on.ca")}
        >
          <Feather name="external-link" size={15} color="#fff" />
          <Text style={styles.applyBtnText}>Apply via OUAC</Text>
        </Pressable>
        {uni && (
          <Pressable
            style={styles.uniPageBtn}
            onPress={() =>
              router.push({ pathname: "/university/[id]", params: { id: program.universityId } })
            }
          >
            <Text style={styles.uniPageBtnText}>{uni.shortName} Page</Text>
            <Feather name="chevron-right" size={15} color={Colors.light.primary} />
          </Pressable>
        )}
      </View>

      {/* Supplementary Application Advice */}
      {adviceCards.length > 0 && (
        <View style={styles.section}>
          <View style={styles.adviceSectionHeader}>
            <Feather name="message-circle" size={16} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Supplementary Application Advice</Text>
          </View>
          <Text style={styles.adviceSectionSubtitle}>
            From alumni, official sources, and coaching platforms like Youthfully and Grantme.
          </Text>
          {adviceCards.map((card) => {
            const srcCfg = SOURCE_TYPE_CONFIG[card.sourceType];
            const isOpen = expandedAdvice === card.id;
            return (
              <Pressable
                key={card.id}
                style={styles.adviceCard}
                onPress={() => setExpandedAdvice(isOpen ? null : card.id)}
              >
                <View style={styles.adviceCardHeader}>
                  <View style={[styles.srcBadge, { backgroundColor: srcCfg.color + "18" }]}>
                    <Feather name={srcCfg.icon as any} size={12} color={srcCfg.color} />
                    <Text style={[styles.srcBadgeText, { color: srcCfg.color }]}>{srcCfg.label}</Text>
                  </View>
                  <Feather
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={Colors.light.textMuted}
                  />
                </View>
                <Text style={styles.adviceCardTitle}>{card.title}</Text>
                {isOpen && (
                  <>
                    <Text style={styles.adviceCardContent}>{card.content}</Text>
                    <View style={styles.adviceSource}>
                      <Feather name="link" size={12} color={Colors.light.textMuted} />
                      <Text style={styles.adviceSourceText} numberOfLines={1}>
                        {card.source}
                      </Text>
                      {card.sourceUrl && (
                        <Pressable onPress={() => Linking.openURL(card.sourceUrl!)}>
                          <Text style={styles.openLink}>Open →</Text>
                        </Pressable>
                      )}
                    </View>
                    <View style={styles.tagRow}>
                      {card.tags.map((t) => (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingBottom: 100,
    gap: 14,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  backLink: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  topBarLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  uniBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  uniBtnEmoji: {
    fontSize: 18,
  },
  hero: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 12,
    borderRadius: 16,
    gap: 12,
  },
  heroLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  heroEmoji: {
    fontSize: 34,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  heroProgram: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  heroUni: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  heroFaculty: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  heroAvgBox: {
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 0,
  },
  heroAvgNum: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  heroAvgLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  compBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  compBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.light.primary + "44",
    marginLeft: "auto",
  },
  trackBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 12,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  statCell: {
    width: "50%",
    padding: 12,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 4,
  },
  statIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  coopBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.light.success + "12",
    borderWidth: 1,
    borderColor: Colors.light.success + "30",
  },
  coopBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.success,
    lineHeight: 19,
  },
  section: {
    paddingHorizontal: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  courseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  courseChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.light.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.light.primary + "30",
  },
  courseText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.primary,
  },
  careerGrid: {
    gap: 6,
  },
  careerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  careerText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
    marginTop: 7,
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 21,
  },
  suppBox: {
    marginHorizontal: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#F59E0B33",
    gap: 8,
  },
  suppBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  suppBoxTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#92400E",
  },
  suppBoxDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#78350F",
    lineHeight: 20,
  },
  applyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
  },
  applyBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  uniPageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.primary + "44",
  },
  uniPageBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  adviceSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  adviceSectionSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: -2,
    lineHeight: 18,
  },
  adviceCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  adviceCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  srcBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  srcBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  adviceCardTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  adviceCardContent: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  adviceSource: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    padding: 8,
  },
  adviceSourceText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  openLink: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
    flexShrink: 0,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
});
