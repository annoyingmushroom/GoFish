import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TripsProvider } from "@/contexts/TripsContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, LogBox, Platform, StyleSheet, Text, View } from "react-native";

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

function WebAutofillStyles() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;

    const id = "gofish-autofill-styles";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      textarea:-webkit-autofill,
      textarea:-webkit-autofill:hover,
      textarea:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.18) inset !important;
        -webkit-text-fill-color: #fff !important;
        caret-color: #fff !important;
        transition: background-color 9999s ease-out 0s;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
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
