import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Fonts are imported per weight rather than through the package barrel. The
// barrel re-exports all 18 weights of each family, and Metro bundles every
// asset it can reach — that alone was ~3 MB of unused .ttf in the web build.
import { Fraunces_400Regular } from "@expo-google-fonts/fraunces/400Regular";
import { Fraunces_500Medium } from "@expo-google-fonts/fraunces/500Medium";
import { Fraunces_600SemiBold } from "@expo-google-fonts/fraunces/600SemiBold";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono/400Regular";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono/500Medium";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ED } from "@/constants/colors";
import { ThemeProvider, usePalette } from "@/context/ThemeContext";
import { ApplicationsProvider } from "@/context/ApplicationsContext";
import { SavedPostsProvider } from "@/context/SavedPostsContext";
import { SubscriptionsProvider } from "@/context/SubscriptionsContext";
import { UserProvider } from "@/context/UserContext";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Not fatal — the splash screen may already be hidden on fast reloads.
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Shown while fonts load. Web has no native splash screen, so without this the
 * first paint is a blank white rectangle on the app's paper-coloured shell.
 */
function AppLoading() {
  const c = usePalette();
  return (
    <View
      style={[styles.loading, { backgroundColor: c.paper }]}
      accessibilityRole="progressbar"
    >
      <Text style={[styles.loadingMark, { color: c.ink }]}>oHub</Text>
      <ActivityIndicator color={c.muted} accessibilityLabel="Loading oHub" />
    </View>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ title: "oHub" }} />
      <Stack.Screen name="university/[id]" options={{ title: "University" }} />
      <Stack.Screen name="post/[id]" options={{ title: "Post" }} />
      <Stack.Screen name="program/[id]" options={{ title: "Program" }} />
      <Stack.Screen name="scholarships" options={{ title: "Scholarships" }} />
      <Stack.Screen name="scholarship/[id]" options={{ title: "Scholarship" }} />
      <Stack.Screen name="essay/[id]" options={{ title: "Essay" }} />
      <Stack.Screen name="settings" options={{ title: "Settings & privacy" }} />
    </Stack>
  );
}

function ThemedApp() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const ready = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  // A font failure must not block the app. System fonts are an acceptable
  // degradation; an unreachable app is not.
  if (!ready) return <AppLoading />;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <SubscriptionsProvider>
            <SavedPostsProvider>
              <ApplicationsProvider>
                <GestureHandlerRootView style={styles.root}>
                  <KeyboardProvider>
                    <RootLayoutNav />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </ApplicationsProvider>
            </SavedPostsProvider>
          </SubscriptionsProvider>
        </UserProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

/**
 * `ThemeProvider` sits above everything that reads the palette — including the
 * font-loading screen, which is the very first thing painted and would
 * otherwise flash a light background at a student in dark mode.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: ED.paper,
  },
  loadingMark: {
    fontSize: 28,
    letterSpacing: -0.5,
    color: ED.ink,
  },
});
