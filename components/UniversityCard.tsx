import Feather from "@expo/vector-icons/Feather";
import type { Palette } from "@/constants/theme";
import { useThemedStyles } from "@/lib/useThemedStyles";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { University } from "@/data/universities";

interface UniversityCardProps {
  university: University;
  compact?: boolean;
}

export function UniversityCard({ university, compact = false }: UniversityCardProps) {
  const styles = useThemedStyles(makeStyles);
  const { isSubscribed, toggleSubscription } = useSubscriptions();
  const subscribed = isSubscribed(university.id);

  const handleSubscribe = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSubscription(university.id);
  };

  const handlePress = () => {
    router.push({ pathname: "/university/[id]", params: { id: university.id } });
  };

  if (compact) {
    return (
      <Pressable
        style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${university.name}, ${university.location}${subscribed ? ", followed" : ""}`}
        accessibilityHint="Opens the university page"
      >
        <View style={[styles.compactColor, { backgroundColor: university.color }]}>
          <Text style={styles.compactEmoji}>{university.logo}</Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{university.shortName}</Text>
          <Text style={styles.compactLocation} numberOfLines={1}>{university.location}</Text>
        </View>
        {subscribed && (
          <View style={styles.subscribedDot} />
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${university.name}, ${university.location}`}
      accessibilityHint="Opens the university page"
    >
      <View style={[styles.colorBar, { backgroundColor: university.color }]} />
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: university.color + "20" }]}>
            <Text style={styles.logo}>{university.logo}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{university.name}</Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={11} color={Colors.light.textMuted} />
              <Text style={styles.location}>{university.location}</Text>
            </View>
          </View>
          <Pressable
            style={[
              styles.subscribeBtn,
              subscribed && [styles.subscribedBtn, { borderColor: university.color }],
            ]}
            onPress={handleSubscribe}
            accessibilityRole="button"
            accessibilityState={{ selected: subscribed }}
            accessibilityLabel={
              subscribed
                ? `Unfollow ${university.shortName}`
                : `Follow ${university.shortName}`
            }
          >
            <Text
              style={[
                styles.subscribeBtnText,
                subscribed && { color: university.color },
              ]}
            >
              {subscribed ? "Joined" : "Join"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {university.description}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {university.enrollment.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{university.established}</Text>
            <Text style={styles.statLabel}>Founded</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{university.faculties.length}</Text>
            <Text style={styles.statLabel}>Faculties</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
  },
  pressed: {
    opacity: 0.95,
  },
  colorBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  location: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  subscribeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
  },
  subscribedBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  subscribeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 10,
    padding: 10,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.light.border,
  },
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  compactColor: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  compactEmoji: {
    fontSize: 18,
  },
  compactInfo: {
    flex: 1,
    gap: 2,
  },
  compactName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  compactLocation: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  subscribedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.success,
  },
});
