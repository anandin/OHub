import Feather from "@expo/vector-icons/Feather";
import type { Palette } from "@/constants/theme";
import { usePalette } from "@/context/ThemeContext";
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

import { legibleBrand, readableOn } from "@/lib/contrast";
import { openExternalUrl } from "@/lib/safeLink";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PostCard } from "@/components/PostCard";
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
  const c = usePalette();
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

  // Twenty brand colours, chosen by twenty marketing departments. White on
  // Waterloo's #FFC72C measures 1.60:1 — a school name a student cannot read.
  // The foreground is measured rather than assumed. See lib/contrast.ts.
  const onBrand = readableOn(university.color);
  const onBrandMuted = `${onBrand}bf`;
  // Once following, the pill is card-coloured and the brand becomes the
  // text. Nine of the twenty brand colours are too dark to read there.
  const brandOnCard = legibleBrand(university.color, c.card, c.ink);

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
          <Pressable
            style={[styles.backBtn, { backgroundColor: `${onBrand}33` }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={20} color={onBrand} />
          </Pressable>
          <View style={styles.topBarRight}>
            <Pressable
              style={[
                styles.subscribeHeroBtn,
                { backgroundColor: `${onBrand}33` },
                subscribed && styles.subscribedHeroBtn,
              ]}
              onPress={handleSubscribe}
            >
              <Feather
                name={subscribed ? "check" : "rss"}
                size={15}
                color={subscribed ? brandOnCard : onBrand}
              />
              <Text style={[styles.subscribeHeroBtnText, { color: subscribed ? brandOnCard : onBrand }]}>
                {subscribed ? "Following" : "Follow"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.heroContent}>
          <View style={[styles.uniLogoCircle, { backgroundColor: `${onBrand}26` }]}>
            <Text style={styles.uniLogo}>{university.logo}</Text>
          </View>
          <Text style={[styles.heroName, { color: onBrand }]}>{university.name}</Text>
          <View style={styles.heroMeta}>
            <Feather name="map-pin" size={13} color={onBrandMuted} />
            <Text style={[styles.heroMetaText, { color: onBrandMuted }]}>{university.location}</Text>
            <Text style={[styles.heroDot, { color: onBrandMuted }]}>·</Text>
            <Text style={[styles.heroMetaText, { color: onBrandMuted }]}>Est. {university.established}</Text>
          </View>

          <View style={[styles.heroStats, { backgroundColor: `${onBrand}26` }]}>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: onBrand }]}>
                {(university.enrollment / 1000).toFixed(0)}K+
              </Text>
              <Text style={[styles.heroStatLabel, { color: onBrandMuted }]}>Students</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: `${onBrand}40` }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: onBrand }]}>{university.faculties.length}</Text>
              <Text style={[styles.heroStatLabel, { color: onBrandMuted }]}>Faculties</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: `${onBrand}40` }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: onBrand }]}>{uniPrograms.length || "–"}</Text>
              <Text style={[styles.heroStatLabel, { color: onBrandMuted }]}>Programs</Text>
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
            color={tracked ? APP_STATUS_CONFIG[application!.status].color : c.ink}
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
              <Feather name="trash-2" size={13} color={c.muted} />
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
              <Feather name="inbox" size={36} color={c.muted} />
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
                <Feather name="book-open" size={36} color={c.muted} />
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
                      <Text style={[styles.progBadgeText, prog.hasCoOp && { color: c.success }]}>
                        {prog.hasCoOp ? "Co-op ✓" : "Regular"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.programDesc}>{prog.description}</Text>
                  <View style={styles.progStats}>
                    <View style={styles.progStat}>
                      <Feather name="trending-up" size={12} color={c.ink} />
                      <Text style={styles.progStatText}>{prog.averageGrade} avg</Text>
                    </View>
                    <View style={styles.progStat}>
                      <Feather name="clock" size={12} color={c.ink} />
                      <Text style={styles.progStatText}>{prog.duration}</Text>
                    </View>
                    <View style={styles.progStat}>
                      <Feather name="dollar-sign" size={12} color={c.ink} />
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
                    <Feather name="calendar" size={13} color={c.muted} />
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
                <Feather name="send" size={16} color={c.ink} />
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
                <Feather name="external-link" size={14} color={c.paper} />
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
                        <Text style={[styles.admissionProgItemValue, { color: prog.hasCoOp ? c.success : c.muted }]}>
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
                      <Feather name="calendar" size={12} color={c.muted} />
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
                            { color: days <= 14 ? c.error : c.ink },
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
              <Feather name="file-text" size={16} color={c.amberBorder} />
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
              <Feather name="external-link" size={16} color={onBrand} />
              <Text style={[styles.websiteBtnText, { color: onBrand }]}>Visit Official Website</Text>
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
                    <Feather name="users" size={14} color={c.ink} />
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
    backgroundColor: c.paper,
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
    color: c.ink,
  },
  backLink: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: c.ink,
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
    // Colour comes from `onBrand` at the render site — it depends on the
    // university's brand colour, which a static sheet cannot see.
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeHeroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    // Colour comes from `onBrand` at the render site — it depends on the
    // university's brand colour, which a static sheet cannot see.
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribedHeroBtn: {
    backgroundColor: c.card,
  },
  subscribeHeroBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
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
  },
  heroDot: {},
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  heroStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
  },
  trackSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: c.card,
    borderBottomWidth: 1,
    borderBottomColor: c.rule,
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: c.warnBg,
    borderWidth: 1,
    borderColor: c.ink + "33",
  },
  trackBtnText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.ink,
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
    backgroundColor: c.paperAlt,
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
    backgroundColor: c.paperAlt,
  },
  removeTrackText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.muted,
  },
  tabsBar: {
    backgroundColor: c.card,
    borderBottomWidth: 1,
    borderBottomColor: c.rule,
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
    color: c.muted,
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
    color: c.muted,
  },
  programCard: {
    backgroundColor: c.card,
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
    color: c.ink,
  },
  programFaculty: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.muted,
  },
  progBadge: {
    backgroundColor: c.warnBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coOpBadge: {
    backgroundColor: c.success + "15",
  },
  progBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: c.ink,
  },
  programDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.softInk,
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
    color: c.ink,
  },
  reqCoursesSection: {
    gap: 6,
  },
  reqCoursesLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: c.softInk,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  reqCoursesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  reqCourse: {
    backgroundColor: c.paperAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reqCourseText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.softInk,
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
    color: c.muted,
    flex: 1,
  },
  ouacCode: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: c.ink,
    backgroundColor: c.warnBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  // Admissions tab styles
  admissionInfoCard: {
    backgroundColor: c.card,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: c.ink,
  },
  admissionInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  admissionInfoTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: c.ink,
  },
  admissionInfoBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.softInk,
    lineHeight: 21,
  },
  admissionLink: {
    fontFamily: "Inter_600SemiBold",
    color: c.ink,
  },
  ouacApplyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: c.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  ouacApplyBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: c.paper,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: c.softInk,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  admissionProgCard: {
    backgroundColor: c.card,
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
    color: c.ink,
  },
  admissionProgFaculty: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.muted,
  },
  admissionAvgBadge: {
    backgroundColor: c.warnBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  admissionAvgText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: c.ink,
  },
  admissionAvgLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: c.ink,
  },
  admissionProgGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  admissionProgItem: {
    width: "47%",
    backgroundColor: c.paperAlt,
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  admissionProgItemLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: c.muted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  admissionProgItemValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: c.ink,
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
    color: c.muted,
    flex: 1,
  },
  ouacCodeBadge: {
    backgroundColor: c.warnBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ouacCodeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: c.ink,
  },
  deadlineCard: {
    flexDirection: "row",
    backgroundColor: c.card,
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
    color: c.ink,
  },
  deadlineCardDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.softInk,
    lineHeight: 17,
  },
  deadlineCardDate: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: c.muted,
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
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: c.muted,
  },
  suppCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: c.amber,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: c.amberBorder,
  },
  suppTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: c.amberText,
    marginBottom: 4,
  },
  suppBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.amberText,
    lineHeight: 19,
  },
  suppLink: {
    marginTop: 8,
  },
  suppLinkText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: c.ink,
  },
  careerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  careerChip: {
    backgroundColor: c.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: c.rule,
  },
  careerChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.softInk,
  },
  // About tab
  facultyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: c.card,
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
    color: c.ink,
  },
  affiliatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: c.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  affiliatedName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: c.ink,
  },
  aboutCard: {
    backgroundColor: c.card,
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
    color: c.ink,
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
  },
  infoGrid: {
    backgroundColor: c.card,
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
    borderBottomColor: c.paperAlt,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.muted,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.ink,
    maxWidth: "60%",
    textAlign: "right",
  },
});
