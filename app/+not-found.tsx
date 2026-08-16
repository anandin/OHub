import { Link, Stack } from "expo-router";
import type { Palette } from "@/constants/theme";
import { useThemedStyles } from "@/lib/useThemedStyles";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  const styles = useThemedStyles(makeStyles);
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>

        <Link href="/today" style={styles.link}>
          <Text style={styles.linkText}>Go to Today</Text>
        </Link>
      </View>
    </>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: c.warnText,
  },
});
