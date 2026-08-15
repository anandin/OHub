import { Tabs } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePalette } from "@/context/ThemeContext";


/**
 * `/` belongs to the static marketing page, so the app's home tab lives at
 * `/today` rather than at the group index. Expo Router needs to be told which
 * route to open when the group itself is entered.
 */
export const unstable_settings = { initialRouteName: "today" };

export default function TabLayout() {
  const c = usePalette();
  const safeAreaInsets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.ink,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_500Medium",
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopWidth: 1,
          borderTopColor: c.rule,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: safeAreaInsets.bottom,
          paddingTop: 8,
          height: 56 + safeAreaInsets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: c.card }]} />
        ),
      }}
    >
      <Tabs.Screen
        name="today"
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
