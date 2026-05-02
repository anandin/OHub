import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import {
  APP_STATUS_CONFIG,
  APP_STATUS_ORDER,
  AppStatus,
  useApplications,
} from "@/context/ApplicationsContext";
import {
  DEADLINE_CATEGORY_CONFIG,
  getUpcomingDeadlines,
} from "@/data/deadlines";
import { SAMPLE_PROGRAMS } from "@/data/programs";
import {
  SOURCE_TYPE_CONFIG,
  getAllFeaturedAdvice,
  getAdviceForProgram,
} from "@/data/suppAdvice";
import { getUniversityById } from "@/data/universities";

// ── Grade Calculator ──────────────────────────────────────────────────────────
function GradeCalculator() {
  const [grades, setGrades] = useState<string[]>(["", "", "", "", "", ""]);
  const [expanded, setExpanded] = useState(false);

  const parsedGrades = grades.map((g) => parseFloat(g)).filter((g) => !isNaN(g) && g > 0);
  const average =
    parsedGrades.length > 0
      ? parsedGrades.reduce((a, b) => a + b, 0) / parsedGrades.length
      : null;

  const qualifyingPrograms = average
    ? SAMPLE_PROGRAMS.map((p) => {
        const req = parseFloat(p.averageGrade.replace("%+", "").replace("%", ""));
        const diff = average - req;
        return { ...p, req, diff };
      }).sort((a, b) => a.diff - b.diff)
    : [];

  return (
    <View style={styles.calculatorCard}>
      <Pressable
        style={styles.calculatorHeader}
        onPress={() => setExpanded((e) => !e)}
      >
        <View style={styles.calculatorTitleRow}>
          <View style={styles.calcIconBox}>
            <Feather name="percent" size={16} color="#fff" />
          </View>
          <View>
            <Text style={styles.calculatorTitle}>Grade Average Calculator</Text>
            <Text style={styles.calculatorSubtitle}>
              {average !== null
                ? `Your average: ${average.toFixed(1)}%`
                : "Enter your top 6 marks"}
            </Text>
          </View>
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.light.textSecondary}
        />
      </Pressable>

      {expanded && (
        <>
          <View style={styles.gradeInputsGrid}>
            {grades.map((g, i) => (
              <View key={i} style={styles.gradeInputWrapper}>
                <Text style={styles.gradeInputLabel}>Course {i + 1}</Text>
                <TextInput
                  style={styles.gradeInput}
                  value={g}
                  onChangeText={(v) => {
                    const next = [...grades];
                    next[i] = v;
                    setGrades(next);
                  }}
                  placeholder="00"
                  placeholderTextColor={Colors.light.textMuted}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
              </View>
            ))}
          </View>

          {average !== null && (
            <View style={styles.averageResult}>
              <Text style={styles.averageLabel}>Your Calculated Average</Text>
              <Text style={styles.averageValue}>{average.toFixed(1)}%</Text>
              <Text style={styles.averageNote}>
                Based on {parsedGrades.length} course{parsedGrades.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {qualifyingPrograms.length > 0 && (
            <View style={styles.programMatchesSection}>
              <Text style={styles.programMatchesTitle}>Program Eligibility</Text>
              {qualifyingPrograms.map((p) => {
                const uni = getUniversityById(p.universityId);
                const status =
                  p.diff >= 0 ? "qualify" : p.diff >= -3 ? "close" : "below";
                const statusColor =
                  status === "qualify" ? "#10B981" : status === "close" ? "#F59E0B" : "#EF4444";
                const statusLabel =
                  status === "qualify" ? "Eligible" : status === "close" ? "Close" : "Below";
                return (
                  <Pressable
                    key={p.id}
                    style={styles.programMatchRow}
                    onPress={() =>
                      router.push({ pathname: "/university/[id]", params: { id: p.universityId } })
                    }
                  >
                    <View style={styles.programMatchLeft}>
                      <Text style={styles.programMatchName}>{p.name}</Text>
                      <Text style={styles.programMatchUni}>
                        {uni?.shortName} · Avg: {p.averageGrade}
                      </Text>
                    </View>
                    <View style={[styles.programMatchBadge, { backgroundColor: statusColor + "18" }]}>
                      <Text style={[styles.programMatchBadgeText, { color: statusColor }]}>
                        {statusLabel}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ── Deadline Strip ─────────────────────────────────────────────────────────────
function DeadlineStrip() {
  const deadlines = getUpcomingDeadlines(4);
  if (deadlines.length === 0) return null;

  return (
    <View style={styles.deadlineSection}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
        <Feather name="clock" size={14} color={Colors.light.textSecondary} />
      </View>
      {deadlines.map((d) => {
        const cfg = DEADLINE_CATEGORY_CONFIG[d.category];
        const urgent = d.daysUntil <= 14;
        const passed = d.daysUntil < 0;
        return (
          <View
            key={d.id}
            style={[styles.deadlineCard, urgent && styles.deadlineCardUrgent]}
          >
            <View style={[styles.deadlineDot, { backgroundColor: cfg.color }]} />
            <View style={styles.deadlineInfo}>
              <Text style={styles.deadlineTitle} numberOfLines={1}>
                {d.title}
              </Text>
              <Text style={styles.deadlineDesc} numberOfLines={2}>
                {d.description}
              </Text>
              <View style={[styles.deadlineCatBadge, { backgroundColor: cfg.color + "18" }]}>
                <Text style={[styles.deadlineCatText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </View>
            <View style={styles.deadlineCountdown}>
              <Text
                style={[
                  styles.deadlineDays,
                  { color: urgent ? "#EF4444" : Colors.light.primary },
                ]}
              >
                {passed ? "Passed" : d.daysUntil === 0 ? "Today" : `${d.daysUntil}d`}
              </Text>
              <Text style={styles.deadlineDaysLabel}>
                {passed || d.daysUntil === 0 ? "" : "left"}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Application Card ───────────────────────────────────────────────────────────
function ApplicationCard({ universityId }: { universityId: string }) {
  const { getApplication, updateStatus, removeApplication, updateNote } = useApplications();
  const app = getApplication(universityId);
  const uni = getUniversityById(universityId);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(app?.note ?? "");
  const [showStatuses, setShowStatuses] = useState(false);

  if (!app || !uni) return null;

  const statusCfg = APP_STATUS_CONFIG[app.status];

  const handleStatusChange = (s: AppStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateStatus(universityId, s);
    setShowStatuses(false);
  };

  const handleSaveNote = () => {
    updateNote(universityId, noteText);
    setEditingNote(false);
  };

  return (
    <View style={[styles.appCard, { borderLeftColor: uni.color }]}>
      <Pressable
        style={styles.appCardHeader}
        onPress={() =>
          router.push({ pathname: "/university/[id]", params: { id: uni.id } })
        }
      >
        <Text style={styles.appCardEmoji}>{uni.logo}</Text>
        <View style={styles.appCardInfo}>
          <Text style={styles.appCardName}>{uni.shortName}</Text>
          {app.programName && (
            <Text style={styles.appCardProgram}>{app.programName}</Text>
          )}
        </View>
        <Pressable
          style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}
          onPress={() => setShowStatuses((s) => !s)}
        >
          <Feather name={statusCfg.icon as any} size={12} color={statusCfg.color} />
          <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
          <Feather name="chevron-down" size={11} color={statusCfg.color} />
        </Pressable>
      </Pressable>

      {showStatuses && (
        <View style={styles.statusPicker}>
          {APP_STATUS_ORDER.map((s) => {
            const cfg = APP_STATUS_CONFIG[s];
            return (
              <Pressable
                key={s}
                style={[
                  styles.statusOption,
                  app.status === s && { backgroundColor: cfg.bg },
                ]}
                onPress={() => handleStatusChange(s)}
              >
                <Feather name={cfg.icon as any} size={14} color={cfg.color} />
                <Text style={[styles.statusOptionText, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {editingNote ? (
        <View style={styles.noteEditor}>
          <TextInput
            style={styles.noteInput}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Add notes (interview date, requirements, etc.)"
            placeholderTextColor={Colors.light.textMuted}
            multiline
            autoFocus
          />
          <View style={styles.noteEditorActions}>
            <Pressable style={styles.noteSaveBtn} onPress={handleSaveNote}>
              <Text style={styles.noteSaveBtnText}>Save</Text>
            </Pressable>
            <Pressable onPress={() => setEditingNote(false)}>
              <Text style={styles.noteCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.noteRow} onPress={() => setEditingNote(true)}>
          <Feather
            name="edit-3"
            size={13}
            color={app.note ? Colors.light.primary : Colors.light.textMuted}
          />
          <Text
            style={[
              styles.noteText,
              app.note ? styles.noteTextFilled : styles.noteTextEmpty,
            ]}
            numberOfLines={2}
          >
            {app.note || "Tap to add notes…"}
          </Text>
        </Pressable>
      )}

      <Pressable
        style={styles.removeBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          removeApplication(universityId);
        }}
      >
        <Feather name="trash-2" size={13} color={Colors.light.textMuted} />
      </Pressable>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function ApplyScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { applications } = useApplications();

  const counts = APP_STATUS_ORDER.reduce(
    (acc, s) => {
      acc[s] = applications.filter((a) => a.status === s).length;
      return acc;
    },
    {} as Record<AppStatus, number>
  );

  const progress = applications.length
    ? applications.filter((a) => ["applied", "supp_sent", "offer", "accepted"].includes(a.status)).length /
      applications.length
    : 0;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topInset }]}
      contentContainerStyle={[
        styles.scrollContent,
        Platform.OS === "web" && { paddingBottom: 34 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Applications</Text>
          <Text style={styles.subtitle}>
            {applications.length === 0
              ? "Track your Ontario university applications"
              : `${applications.length} universit${applications.length === 1 ? "y" : "ies"} tracked`}
          </Text>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push("/(tabs)/universities")}
        >
          <Feather name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      {/* Progress overview */}
      {applications.length > 0 && (
        <View style={styles.progressCard}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressStats}>
            {(["shortlisted", "applied", "supp_sent", "offer", "accepted"] as AppStatus[]).map(
              (s) =>
                counts[s] > 0 ? (
                  <View key={s} style={styles.progressStat}>
                    <View
                      style={[
                        styles.progressDot,
                        { backgroundColor: APP_STATUS_CONFIG[s].color },
                      ]}
                    />
                    <Text style={styles.progressStatText}>
                      {counts[s]} {APP_STATUS_CONFIG[s].label}
                    </Text>
                  </View>
                ) : null
            )}
          </View>
        </View>
      )}

      {/* Grade Calculator */}
      <GradeCalculator />

      {/* Deadlines */}
      <DeadlineStrip />

      {/* Applications list */}
      <View style={styles.applicationsSection}>
        <Text style={styles.sectionTitle}>
          {applications.length > 0 ? "Tracked Universities" : ""}
        </Text>
        {applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="clipboard" size={48} color={Colors.light.primary} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptySubtitle}>
              Go to the Universities tab, open a university, and tap "Track Application" to start.
            </Text>
            <Pressable
              style={styles.emptyBtn}
              onPress={() => router.push("/(tabs)/universities")}
            >
              <Feather name="grid" size={16} color="#fff" />
              <Text style={styles.emptyBtnText}>Browse Universities</Text>
            </Pressable>
          </View>
        ) : (
          applications.map((app) => (
            <ApplicationCard key={app.universityId} universityId={app.universityId} />
          ))
        )}
      </View>

      {applications.length > 0 && (
        <View style={styles.ouacReminder}>
          <Feather name="alert-circle" size={14} color="#F59E0B" />
          <Text style={styles.ouacReminderText}>
            Apply through{" "}
            <Text style={styles.ouacLink}>OUAC (ouac.on.ca)</Text>
            {" "}— UniHub tracks your progress but does not submit applications.
          </Text>
        </View>
      )}

      {/* Supplementary Application Advice */}
      <SuppAdviceSection />
    </ScrollView>
  );
}

// ── Supplementary Advice Section ──────────────────────────────────────────────
function SuppAdviceSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const featuredAdvice = getAllFeaturedAdvice();
  const programGroups = featuredAdvice.reduce<Record<string, string>>((acc, card) => {
    acc[card.programId] = card.programDisplay;
    return acc;
  }, {});
  const programKeys = Object.keys(programGroups);

  const displayedAdvice = selectedProgram
    ? getAdviceForProgram(selectedProgram)
    : featuredAdvice;

  return (
    <View style={styles.adviceSection}>
      <View style={styles.adviceSectionHeaderRow}>
        <View style={styles.adviceIconBox}>
          <Feather name="message-circle" size={16} color="#fff" />
        </View>
        <View>
          <Text style={styles.adviceSectionTitle}>Supplementary App Advice</Text>
          <Text style={styles.adviceSectionSub}>
            From alumni, official sources, Youthfully & Grantme
          </Text>
        </View>
      </View>

      {/* Program filter */}
      <FlatList
        horizontal
        data={[null, ...programKeys] as (string | null)[]}
        keyExtractor={(k) => k ?? "all"}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.adviceFilterRow}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.adviceFilterPill,
              selectedProgram === item && styles.adviceFilterPillActive,
            ]}
            onPress={() => setSelectedProgram(item)}
          >
            <Text
              style={[
                styles.adviceFilterText,
                selectedProgram === item && styles.adviceFilterTextActive,
              ]}
              numberOfLines={1}
            >
              {item ? programGroups[item] : "All Programs"}
            </Text>
          </Pressable>
        )}
      />

      {/* Advice cards */}
      {displayedAdvice.map((card) => {
        const srcCfg = SOURCE_TYPE_CONFIG[card.sourceType];
        const isOpen = expandedId === card.id;
        return (
          <Pressable
            key={card.id}
            style={styles.adviceCard}
            onPress={() => setExpandedId(isOpen ? null : card.id)}
          >
            <View style={styles.adviceCardTopRow}>
              <View style={[styles.adviceSrcBadge, { backgroundColor: srcCfg.color + "18" }]}>
                <Feather name={srcCfg.icon as any} size={11} color={srcCfg.color} />
                <Text style={[styles.adviceSrcText, { color: srcCfg.color }]}>{srcCfg.label}</Text>
              </View>
              <Text style={styles.adviceProgLabel} numberOfLines={1}>
                {card.programDisplay}
              </Text>
              <Feather
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={15}
                color={Colors.light.textMuted}
              />
            </View>
            <Text style={styles.adviceCardTitle}>{card.title}</Text>
            {isOpen && (
              <>
                <Text style={styles.adviceCardBody}>{card.content}</Text>
                <View style={styles.adviceSourceRow}>
                  <Feather name="link" size={11} color={Colors.light.textMuted} />
                  <Text style={styles.adviceSourceText} numberOfLines={1}>
                    {card.source}
                  </Text>
                  {card.sourceUrl && (
                    <Pressable onPress={() => Linking.openURL(card.sourceUrl!)}>
                      <Text style={styles.adviceOpenLink}>Open →</Text>
                    </Pressable>
                  )}
                </View>
                <View style={styles.adviceTagRow}>
                  {card.tags.slice(0, 4).map((t) => (
                    <View key={t} style={styles.adviceTag}>
                      <Text style={styles.adviceTagText}>{t}</Text>
                    </View>
                  ))}
                </View>
                <Pressable
                  style={styles.viewProgramBtn}
                  onPress={() =>
                    router.push({ pathname: "/program/[id]", params: { id: card.programId } })
                  }
                >
                  <Text style={styles.viewProgramBtnText}>View Full Program Details</Text>
                  <Feather name="arrow-right" size={13} color={Colors.light.primary} />
                </Pressable>
              </>
            )}
          </Pressable>
        );
      })}

      <Pressable
        style={styles.viewAllPrograms}
        onPress={() => router.push("/(tabs)/programs")}
      >
        <Feather name="book-open" size={14} color={Colors.light.primary} />
        <Text style={styles.viewAllProgramsText}>Browse All Programs</Text>
        <Feather name="arrow-right" size={14} color={Colors.light.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.backgroundSecondary,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
  },
  progressStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  progressStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressStatText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  calculatorCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  calculatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  calculatorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  calcIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  calculatorTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  calculatorSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 1,
  },
  gradeInputsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  gradeInputWrapper: {
    width: "30%",
    gap: 4,
  },
  gradeInputLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  gradeInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
    textAlign: "center",
  },
  averageResult: {
    alignItems: "center",
    paddingVertical: 14,
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.primaryMuted,
  },
  averageLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.primary,
  },
  averageValue: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.light.primary,
  },
  averageNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  programMatchesSection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 6,
  },
  programMatchesTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.light.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  programMatchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  programMatchLeft: {
    flex: 1,
    gap: 1,
  },
  programMatchName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  programMatchUni: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  programMatchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8,
  },
  programMatchBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  deadlineSection: {
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  deadlineCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "flex-start",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  deadlineCardUrgent: {
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  deadlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
    flexShrink: 0,
  },
  deadlineInfo: {
    flex: 1,
    gap: 3,
  },
  deadlineTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  deadlineDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 17,
  },
  deadlineCatBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 3,
  },
  deadlineCatText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  deadlineCountdown: {
    alignItems: "center",
    minWidth: 36,
  },
  deadlineDays: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  deadlineDaysLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  applicationsSection: {
    marginHorizontal: 16,
    gap: 10,
  },
  appCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  appCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  appCardEmoji: {
    fontSize: 24,
  },
  appCardInfo: {
    flex: 1,
    gap: 1,
  },
  appCardName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  appCardProgram: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statusPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: 4,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  statusOptionText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    padding: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  noteTextFilled: {
    color: Colors.light.text,
  },
  noteTextEmpty: {
    color: Colors.light.textMuted,
  },
  noteEditor: {
    gap: 8,
  },
  noteInput: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    minHeight: 72,
    textAlignVertical: "top",
  },
  noteEditorActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  noteSaveBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
  },
  noteSaveBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  noteCancelText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 24,
  },
  emptyBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  ouacReminder: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#F59E0B33",
  },
  ouacReminderText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#92400E",
    lineHeight: 18,
  },
  ouacLink: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  // ── Supplementary Advice Section ──
  adviceSection: {
    marginHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  adviceSectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },
  adviceIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  adviceSectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  adviceSectionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    marginTop: 1,
  },
  adviceFilterRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  adviceFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    maxWidth: 160,
  },
  adviceFilterPillActive: {
    backgroundColor: "#7C3AED18",
    borderColor: "#7C3AED",
  },
  adviceFilterText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  adviceFilterTextActive: {
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
  },
  adviceCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  adviceCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  adviceSrcBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    flexShrink: 0,
  },
  adviceSrcText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  adviceProgLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  adviceCardTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    lineHeight: 20,
  },
  adviceCardBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  adviceSourceRow: {
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
  adviceOpenLink: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
    flexShrink: 0,
  },
  adviceTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  adviceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  adviceTagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  viewProgramBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.light.primary + "33",
  },
  viewProgramBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  viewAllPrograms: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.primary + "44",
    marginTop: 4,
    marginBottom: 20,
  },
  viewAllProgramsText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
});
