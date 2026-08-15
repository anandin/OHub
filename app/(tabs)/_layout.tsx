import { Tabs } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ED = {
  paper: '#f5f1e8',
  card: '#fbf8f1',
  ink: '#1a1612',
  muted: '#8b7e62',
  rule: '#e8e0cf',
};

export default function TabLayout() {
  const safeAreaInsets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ED.ink,
        tabBarInactiveTintColor: ED.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_500Medium",
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: ED.card,
          borderTopWidth: 1,
          borderTopColor: ED.rule,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: safeAreaInsets.bottom,
          paddingTop: 8,
          height: 56 + safeAreaInsets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: ED.card }]} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => (
            <Feather name="sun" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: "Programs",
          tabBarIcon: ({ color }) => (
            <Feather name="book-open" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="apply"
        options={{
          title: "Apply",
          tabBarIcon: ({ color }) => (
            <Feather name="check-square" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="universities"
        options={{
          title: "Pulse",
          tabBarIcon: ({ color }) => (
            <Feather name="activity" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "You",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{ href: null }}
      />
    </Tabs>
  );
}
