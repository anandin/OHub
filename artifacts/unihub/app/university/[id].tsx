import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryFilter } from "@/components/CategoryFilter";
import { PostCard } from "@/components/PostCard";
import Colors from "@/constants/colors";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { PostCategory, SAMPLE_POSTS } from "@/data/feed";
import { SAMPLE_PROGRAMS } from "@/data/programs";
import { getUniversityById } from "@/data/universities";

type DetailTab = "feed" | "programs" | "faculties" | "about";

export default function UniversityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { isSubscribed, toggleSubscription } = useSubscriptions();
  const [activeTab, setActiveTab] = useState<DetailTab>("feed");
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(null);

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
  const uniPosts = SAMPLE_POSTS.filter((p) => p.universityId === university.id);
  const uniPrograms = SAMPLE_PROGRAMS.filter((p) => p.universityId === university.id);

  const filteredPosts = selectedCategory
    ? uniPosts.filter((p) => p.category === selectedCategory)
    : uniPosts;

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSubscription(university.id);
  };

  const DETAIL_TABS: { id: DetailTab; label: string }[] = [
    { id: "feed", label: "Feed" },
    { id: "programs", label: "Programs" },
    { id: "faculties", label: "Faculties" },
    { id: "about", label: "About" },
  ];

  const renderHeader = () => (
    <>
      <View style={[styles.heroSection, { backgroundColor: university.color }]}>
        <View style={[styles.topBar, { paddingTop: topInset }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <Pressable
            style={[styles.subscribeHeroBtn, subscribed && styles.subscribedHeroBtn]}
            onPress={handleSubscribe}
          >
            <Feather
              name={subscribed ? "check" : "plus"}
              size={16}
              color={subscribed ? university.color : "#fff"}
            />
            <Text
              style={[
                styles.subscribeHeroBtnText,
                subscribed && { color: university.color },
              ]}
            >
              {subscribed ? "Joined" : "Join"}
            </Text>
          </Pressable>
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
              <Text style={styles.heroStatValue}>{uniPosts.length}</Text>
              <Text style={styles.heroStatLabel}>Posts</Text>
            </View>
          </View>
        </View>
      </View>

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
        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
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
          scrollEnabled={!!filteredPosts.length}
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
                        {prog.hasCoOp ? "Co-op" : "Regular"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.programDesc}>{prog.description}</Text>
                  <View style={styles.progStats}>
                    <View style={styles.progStat}>
                      <Feather name="trending-up" size={12} color={Colors.light.primary} />
                      <Text style={styles.progStatText}>{prog.averageGrade}</Text>
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
                    <Text style={styles.deadlineText}>
                      Deadline: {prog.applicationDeadline}
                    </Text>
                    <Text style={styles.ouacCode}>OUAC: {prog.ouacCode}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "faculties" && (
          <View style={styles.section}>
            {university.faculties.map((faculty, index) => (
              <View key={index} style={styles.facultyRow}>
                <View
                  style={[styles.facultyDot, { backgroundColor: university.color }]}
                />
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

        {activeTab === "about" && (
          <View style={styles.section}>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutDescription}>{university.description}</Text>
            </View>

            <Pressable
              style={[styles.websiteBtn, { backgroundColor: university.color }]}
              onPress={() => Linking.openURL(university.website)}
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
                <Text style={styles.infoLabel}>Website</Text>
                <Text style={[styles.infoValue, { color: Colors.light.primary }]}>
                  {university.website.replace("https://", "")}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Data Sources</Text>
            <View style={styles.sourceCard}>
              <View style={styles.sourceRow}>
                <Feather name="globe" size={14} color={Colors.light.primary} />
                <Text style={styles.sourceText}>OUInfo.ca — Ontario Universities Info</Text>
              </View>
              <View style={styles.sourceRow}>
                <Feather name="globe" size={14} color={Colors.light.primary} />
                <Text style={styles.sourceText}>{university.website}</Text>
              </View>
              {university.affiliated.map((org, i) => (
                <View key={i} style={styles.sourceRow}>
                  <Feather name="users" size={14} color={Colors.light.textMuted} />
                  <Text style={styles.sourceText}>{org}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 16,
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
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 8,
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
  sourceCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sourceText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
});
