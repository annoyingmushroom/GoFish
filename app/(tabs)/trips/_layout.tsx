import { Stack } from "expo-router";

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2a5abf" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#4478e6" },
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: "My Trips" }} />
      <Stack.Screen
        name="[id]"
        options={{ headerTitle: "Edit Trip", headerBackTitle: "Trips" }}
      />
    </Stack>
  );
}
