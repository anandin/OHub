import Feather from "@expo/vector-icons/Feather";
import type { Palette } from "@/constants/theme";
import { useThemedStyles } from "@/lib/useThemedStyles";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { openExternalUrl } from "@/lib/safeLink";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PostCard } from "@/components/PostCard";
import Colors from "@/constants/colors";
import {
  APP_STATUS_CONFIG,
  APP_STATUS_ORDER,
  AppStatus,
  useApplications,
} from "@/context/ApplicationsContext";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { PostCategory, SAMPLE_POSTS } from "@/data/feed";
import { SAMPLE_PROGRAMS } from "@/data/programs";
import { ONTARIO_DEADLINES } from "@/data/deadlines";
import { getUniversityById } from "@/data/universities";

type DetailTab = "feed" | "programs" | "admissions" | "about";

export default function UniversityDetailScreen() {
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { isSubscribed, toggleSubscription } = useSubscriptions();
  const { isTracked, addApplication, getApplication, updateStatus, removeApplication } = useApplications();
  const [activeTab, setActiveTab] = useState<DetailTab>("feed");
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const university = getUniversityById(id);

  if (!university) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>University not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const subscribed = isSubscribed(university.id);
  const tracked = isTracked(university.id);
  const application = getApplication(university.id);
  const uniPosts = SAMPLE_POSTS.filter((p) => p.universityId === university.id);
  const uniPrograms = SAMPLE_PROGRAMS.filter((p) => p.universityId === university.id);
  const uniDeadlines = ONTARIO_DEADLINES.filter((d) => d.universityId === university.id);

  const filteredPosts = selectedCategory
    ? uniPosts.filter((p) => p.category === selectedCategory)
    : uniPosts;

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSubscription(university.id);
  };

  const handleTrack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (tracked) {
      setShowStatusPicker((s) => !s);
    } else {
      addApplication(university.id);
    }
  };

  const DETAIL_TABS: { id: DetailTab; label: string }[] = [
    { id: "feed", label: "Feed" },
    { id: "programs", label: "Programs" },
    { id: "admissions", label: "Admissions" },
    { id: "about", label: "About" },
  ];

  const renderHeader = () => (
    <>
      <View style={[styles.heroSection, { backgroundColor: university.color }]}>
        <View style={[styles.topBar, { paddingTop: topInset }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={styles.topBarRight}>
            <Pressable
              style={[styles.subscribeHeroBtn, subscribed && styles.subscribedHeroBtn]}
              onPress={handleSubscribe}
            >
              <Feather
                name={subscribed ? "check" : "rss"}
                size={15}
                color={subscribed ? university.color : "#fff"}
              />
              <Text style={[styles.subscribeHeroBtnText, subscribed && { color: university.color }]}>
                {subscribed ? "Following" : "Follow"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.uniLogoCircle}>
            <Text style={styles.uniLogo}>{university.logo}</Text>
          </View>
          <Text style={styles.heroName}>{university.name}</Text>
          <View style={styles.heroMeta}>
            <Feather name="map-pin" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroMetaText}>{university.location}</Text>
            <Text style={styles.heroDot}>·</Text>
            <Text style={styles.heroMetaText}>Est. {university.established}</Text>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {(university.enrollment / 1000).toFixed(0)}K+
              </Text>
              <Text style={styles.heroStatLabel}>Students</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{university.faculties.length}</Text>
              <Text style={styles.heroStatLabel}>Faculties</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{uniPrograms.length || "–"}</Text>
              <Text style={styles.heroStatLabel}>Programs</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Track Application button */}
      <View style={styles.trackSection}>
        <Pressable
          style={[
            styles.trackBtn,
            tracked && {
              backgroundColor: APP_STATUS_CONFIG[application!.status].bg,
              borderColor: APP_STATUS_CONFIG[application!.status].color + "44",
            },
          ]}
          onPress={handleTrack}
        >
          <Feather
            name={tracked ? (APP_STATUS_CONFIG[application!.status].icon as any) : "clipboard"}
            size={16}
            color={tracked ? APP_STATUS_CONFIG[application!.status].color : Colors.light.primary}
          />
          <Text
            style={[
              styles.trackBtnText,
              tracked && { color: APP_STATUS_CONFIG[application!.status].color },
            ]}
          >
            {tracked
              ? `${APP_STATUS_CONFIG[application!.status].label} — tap to update`
              : "Track My Application"}
          </Text>
          {tracked && (
            <Feather
              name="chevron-down"
              size={14}
              color={APP_STATUS_CONFIG[application!.status].color}
            />
          )}
        </Pressable>

        {showStatusPicker && tracked && (
          <View style={styles.statusPicker}>
            {APP_STATUS_ORDER.map((s) => {
              const cfg = APP_STATUS_CONFIG[s];
              return (
                <Pressable
                  key={s}
                  style={[
                    styles.statusOption,
                    application?.status === s && { backgroundColor: cfg.bg },
                  ]}
                  onPress={() => {
                    updateStatus(university.id, s as AppStatus);
                    setShowStatusPicker(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Feather name={cfg.icon as any} size={14} color={cfg.color} />
                  <Text style={[styles.statusOptionText, { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              style={styles.removeTrackBtn}
              onPress={() => {
                removeApplication(university.id);
                setShowStatusPicker(false);
              }}
            >
              <Feather name="trash-2" size={13} color={Colors.light.textMuted} />
              <Text style={styles.removeTrackText}>Remove from tracker</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
        style={styles.tabsBar}
      >
        {DETAIL_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && [styles.tabTextActive, { color: university.color }],
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.id && (
              <View style={[styles.tabIndicator, { backgroundColor: university.color }]} />
            )}
          </Pressable>
        ))}
      </ScrollView>

      {activeTab === "feed" && (
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      )}
    </>
  );

  const renderContent = () => {
    if (activeTab === "feed") {
      return (
        <FlatList
          data={filteredPosts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <PostCard post={item} showUniversity={false} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[
            styles.listContent,
            Platform.OS === "web" && { paddingBottom: 34 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled
          ListEmptyComponent={
            <View style={styles.emptySection}>
              <Feather name="inbox" size={36} color={Colors.light.textMuted} />
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          }
        />
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
      >
        {renderHeader()}

        {/* ── PROGRAMS TAB ── */}
        {activeTab === "programs" && (
          <View style={styles.section}>
            {uniPrograms.length === 0 ? (
              <View style={styles.emptySection}>
                <Feather name="book-open" size={36} color={Colors.light.textMuted} />
                <Text style={styles.emptyText}>No programs listed yet</Text>
              </View>
            ) : (
              uniPrograms.map((prog) => (
                <View key={prog.id} style={styles.programCard}>
                  <View style={styles.programHeader}>
                    <View style={styles.programInfo}>
                      <Text style={styles.programName}>{prog.name}</Text>
                      <Text style={styles.programFaculty}>{prog.faculty} · {prog.degree}</Text>
                    </View>
                    <View style={[styles.progBadge, prog.hasCoOp && styles.coOpBadge]}>
                      <Text style={[styles.progBadgeText, prog.hasCoOp && { color: Colors.light.success }]}>
                        {prog.hasCoOp ? "Co-op ✓" : "Regular"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.programDesc}>{prog.description}</Text>
                  <View style={styles.progStats}>
                    <View style={styles.progStat}>
                      <Feather name="trending-up" size={12} color={Colors.light.primary} />
                      <Text style={styles.progStatText}>{prog.averageGrade} avg</Text>
                    </View>
                    <View style={styles.progStat}>
                      <Feather name="clock" size={12} color={Colors.light.primary} />
                      <Text style={styles.progStatText}>{prog.duration}</Text>
                    </View>
                    <View style={styles.progStat}>
                      <Feather name="dollar-sign" size={12} color={Colors.light.primary} />
                      <Text style={styles.progStatText}>{prog.tuition}</Text>
                    </View>
                  </View>
                  <View style={styles.reqCoursesSection}>
                    <Text style={styles.reqCoursesLabel}>Required Courses</Text>
                    <View style={styles.reqCoursesList}>
                      {prog.requiredCourses.map((c) => (
                        <View key={c} style={styles.reqCourse}>
                          <Text style={styles.reqCourseText}>{c}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.deadlineRow}>
                    <Feather name="calendar" size={13} color={Colors.light.textMuted} />
                    <Text style={styles.deadlineText}>Deadline: {prog.applicationDeadline}</Text>
                    <Text style={styles.ouacCode}>OUAC: {prog.ouacCode}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── ADMISSIONS TAB ── */}
        {activeTab === "admissions" && (
          <View style={styles.section}>

            {/* OUAC info card */}
            <View style={styles.admissionInfoCard}>
              <View style={styles.admissionInfoHeader}>
                <Feather name="send" size={16} color={Colors.light.primary} />
                <Text style={styles.admissionInfoTitle}>How to Apply</Text>
              </View>
              <Text style={styles.admissionInfoBody}>
                Apply to {university.shortName} through the Ontario Universities&rsquo; Application Centre (OUAC) at{" "}
                <Text style={styles.admissionLink}>ouac.on.ca</Text>
                . The main deadline is <Text style={{ fontFamily: "Inter_600SemiBold" }}>January 15</Text> for
                most Ontario universities.
              </Text>
              <Pressable
                style={styles.ouacApplyBtn}
                onPress={() => void openExternalUrl("https://www.ouac.on.ca")}
                accessibilityRole="link"
                accessibilityLabel="Apply via OUAC"
                accessibilityHint="Opens ouac.on.ca in a new tab"
              >
                <Feather name="external-link" size={14} color="#fff" />
                <Text style={styles.ouacApplyBtnText}>Open OUAC Portal</Text>
              </Pressable>
            </View>

            {/* Program admission requirements */}
            {uniPrograms.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Admission Requirements by Program</Text>
                {uniPrograms.map((prog) => (
                  <View key={prog.id} style={styles.admissionProgCard}>
                    <View style={styles.admissionProgHeader}>
                      <View style={styles.admissionProgLeft}>
                        <Text style={styles.admissionProgName}>{prog.name}</Text>
                        <Text style={styles.admissionProgFaculty}>{prog.faculty}</Text>
                      </View>
                      <View style={styles.admissionAvgBadge}>
                        <Text style={styles.admissionAvgText}>{prog.averageGrade}</Text>
                        <Text style={styles.admissionAvgLabel}>avg</Text>
                      </View>
                    </View>

                    <View style={styles.admissionProgGrid}>
                      <View style={styles.admissionProgItem}>
                        <Text style={styles.admissionProgItemLabel}>Degree</Text>
                        <Text style={styles.admissionProgItemValue}>{prog.degree}</Text>
                      </View>
                      <View style={styles.admissionProgItem}>
                        <Text style={styles.admissionProgItemLabel}>Duration</Text>
                        <Text style={styles.admissionProgItemValue}>{prog.duration}</Text>
                      </View>
                      <View style={styles.admissionProgItem}>
                        <Text style={styles.admissionProgItemLabel}>Tuition</Text>
                        <Text style={styles.admissionProgItemValue}>{prog.tuition}</Text>
                      </View>
                      <View style={styles.admissionProgItem}>
                        <Text style={styles.admissionProgItemLabel}>Co-op</Text>
                        <Text style={[styles.admissionProgItemValue, { color: prog.hasCoOp ? Colors.light.success : Colors.light.textMuted }]}>
                          {prog.hasCoOp ? "Available ✓" : "No"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.reqCoursesSection}>
                      <Text style={styles.reqCoursesLabel}>Required 4U/4M Courses</Text>
                      <View style={styles.reqCoursesList}>
                        {prog.requiredCourses.map((c) => (
                          <View key={c} style={styles.reqCourse}>
                            <Text style={styles.reqCourseText}>{c}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.admissionProgDeadline}>
                      <Feather name="calendar" size={12} color={Colors.light.textMuted} />
                      <Text style={styles.admissionProgDeadlineText}>
                        Deadline: {prog.applicationDeadline}
                      </Text>
                      <View style={styles.ouacCodeBadge}>
                        <Text style={styles.ouacCodeText}>{prog.ouacCode}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* University-specific deadlines */}
            {uniDeadlines.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Key Deadlines</Text>
                {uniDeadlines.map((d) => {
                  const now = new Date();
                  const target = new Date(d.date);
                  const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <View key={d.id} style={styles.deadlineCard}>
                      <View style={styles.deadlineCardLeft}>
                        <Text style={styles.deadlineCardTitle}>{d.title}</Text>
                        <Text style={styles.deadlineCardDesc}>{d.description}</Text>
                        <Text style={styles.deadlineCardDate}>{d.date}</Text>
                      </View>
                      <View style={styles.deadlineCardDays}>
                        <Text
                          style={[
                            styles.deadlineCardDaysNum,
                            { color: days <= 14 ? "#EF4444" : Colors.light.primary },
                          ]}
                        >
                          {days < 0 ? "–" : days === 0 ? "Today" : days}
                        </Text>
                        {days > 0 && (
                          <Text style={styles.deadlineCardDaysLabel}>days</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {/* Supplementary app info */}
            <View style={styles.suppCard}>
              <Feather name="file-text" size={16} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.suppTitle}>Supplementary Applications</Text>
                <Text style={styles.suppBody}>
                  Many competitive programs at {university.shortName} require a supplementary
                  application or essay beyond the OUAC form. Check the program&rsquo;s official page
                  for requirements and deadlines — these are separate from OUAC.
                </Text>
                <Pressable
                  style={styles.suppLink}
                  onPress={() => void openExternalUrl(university.website)}
                  accessibilityRole="link"
                  accessibilityLabel={`Visit ${university.name} website`}
                  accessibilityHint="Opens in a new tab"
                >
                  <Text style={styles.suppLinkText}>Check {university.shortName} website →</Text>
                </Pressable>
              </View>
            </View>

            {/* Career paths from programs */}
            {uniPrograms.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Career Paths</Text>
                <View style={styles.careerGrid}>
                  {[...new Set(uniPrograms.flatMap((p) => p.careerPaths))].map((c) => (
                    <View key={c} style={styles.careerChip}>
                      <Text style={styles.careerChipText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* ── ABOUT TAB ── */}
        {activeTab === "about" && (
          <View style={styles.section}>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutDescription}>{university.description}</Text>
            </View>

            <Pressable
              style={[styles.websiteBtn, { backgroundColor: university.color }]}
              onPress={() => void openExternalUrl(university.website)}
                  accessibilityRole="link"
                  accessibilityLabel={`Visit ${university.name} website`}
                  accessibilityHint="Opens in a new tab"
            >
              <Feather name="external-link" size={16} color="#fff" />
              <Text style={styles.websiteBtnText}>Visit Official Website</Text>
            </Pressable>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Established</Text>
                <Text style={styles.infoValue}>{university.established}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Enrollment</Text>
                <Text style={styles.infoValue}>
                  {university.enrollment.toLocaleString()} students
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{university.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Faculties</Text>
                <Text style={styles.infoValue}>{university.faculties.length} faculties</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Faculties</Text>
            {university.faculties.map((faculty, index) => (
              <View key={index} style={styles.facultyRow}>
                <View style={[styles.facultyDot, { backgroundColor: university.color }]} />
                <Text style={styles.facultyName}>{faculty}</Text>
              </View>
            ))}

            {university.affiliated.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Affiliated Organizations</Text>
                {university.affiliated.map((org, index) => (
                  <View key={index} style={styles.affiliatedRow}>
                    <Feather name="users" size={14} color={Colors.light.primary} />
                    <Text style={styles.affiliatedName}>{org}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const makeStyles = (c: Palette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
  heroSection: {
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarRight: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeHeroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribedHeroBtn: {
    backgroundColor: "#fff",
  },
  subscribeHeroBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  heroContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  uniLogoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  uniLogo: {
    fontSize: 36,
  },
  heroName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroMetaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
  },
  heroDot: {
    color: "rgba(255,255,255,0.5)",
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 16,
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  heroStatValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  heroStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  trackSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: Colors.light.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.light.primary + "33",
  },
  trackBtnText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  statusPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: 2,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  statusOptionText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  removeTrackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  removeTrackText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  tabsBar: {
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tabsScroll: {
    paddingHorizontal: 12,
    flexDirection: "row",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: "relative",
  },
  tabActive: {},
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  tabTextActive: {
    fontFamily: "Inter_700Bold",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 2.5,
    borderRadius: 2,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    padding: 12,
    gap: 10,
  },
  emptySection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  programCard: {
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
  programHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  programInfo: {
    flex: 1,
    gap: 2,
  },
  programName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  programFaculty: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  progBadge: {
    backgroundColor: Colors.light.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coOpBadge: {
    backgroundColor: Colors.light.success + "15",
  },
  progBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  programDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  progStats: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
  },
  progStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  progStatText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  reqCoursesSection: {
    gap: 6,
  },
  reqCoursesLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  reqCoursesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  reqCourse: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reqCourseText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  deadlineText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    flex: 1,
  },
  ouacCode: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
    backgroundColor: Colors.light.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  // Admissions tab styles
  admissionInfoCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  admissionInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  admissionInfoTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  admissionInfoBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 21,
  },
  admissionLink: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  ouacApplyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  ouacApplyBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  admissionProgCard: {
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
  admissionProgHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  admissionProgLeft: {
    flex: 1,
    gap: 2,
  },
  admissionProgName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  admissionProgFaculty: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  admissionAvgBadge: {
    backgroundColor: Colors.light.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  admissionAvgText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.primary,
  },
  admissionAvgLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.light.primary,
  },
  admissionProgGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  admissionProgItem: {
    width: "47%",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  admissionProgItemLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  admissionProgItemValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  admissionProgDeadline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  admissionProgDeadlineText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    flex: 1,
  },
  ouacCodeBadge: {
    backgroundColor: Colors.light.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ouacCodeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  deadlineCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  deadlineCardLeft: {
    flex: 1,
    gap: 3,
  },
  deadlineCardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  deadlineCardDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 17,
  },
  deadlineCardDate: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  deadlineCardDays: {
    alignItems: "center",
    minWidth: 40,
  },
  deadlineCardDaysNum: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  deadlineCardDaysLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  suppCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F59E0B33",
  },
  suppTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#92400E",
    marginBottom: 4,
  },
  suppBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#78350F",
    lineHeight: 19,
  },
  suppLink: {
    marginTop: 8,
  },
  suppLinkText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.primary,
  },
  careerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  careerChip: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  careerChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  // About tab
  facultyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  facultyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  facultyName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  affiliatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  affiliatedName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  aboutCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  aboutDescription: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    lineHeight: 24,
  },
  websiteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  websiteBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  infoGrid: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    maxWidth: "60%",
    textAlign: "right",
  },
});
