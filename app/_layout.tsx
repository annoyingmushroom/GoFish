import WebAutofillStyles from "@/components/WebAutofillStyles";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TripsProvider } from "@/contexts/TripsContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, LogBox, StyleSheet, Text, View } from "react-native";

LogBox.ignoreAllLogs(true);

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <Text style={styles.emoji}>🎣</Text>
      <ActivityIndicator color="#f4b183" />
    </View>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = (segments[0] as string) === "(auth)";
    if (!user && !inAuth) {
      router.replace("/(auth)/login");
    } else if (user && inAuth) {
      router.replace("/(tabs)/newtrip");
    }
  }, [user, loading, segments, router]);

  if (loading) return <LoadingScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TripsProvider>
        <WebAutofillStyles />
        <RootNavigator />
      </TripsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#4478e6",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emoji: { fontSize: 56 },
});
