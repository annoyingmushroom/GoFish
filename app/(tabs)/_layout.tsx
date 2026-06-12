import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable } from "react-native";

export default function TabsLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f4b183",
        tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
        tabBarStyle: {
          backgroundColor: "#2a5abf",
          borderTopColor: "rgba(255,255,255,0.10)",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerStyle: { backgroundColor: "#2a5abf" },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        headerRight: () => (
          <Pressable onPress={signOut} style={{ paddingRight: 16 }} hitSlop={10}>
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.7)" />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="newtrip/index"
        options={{
          headerTitle: "New Trip",
          title: "New Trip",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "add-circle" : "add-circle-outline"} color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          headerShown: false,
          title: "My Trips",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "fish-sharp" : "fish-outline"} color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats/index"
        options={{
          headerTitle: "Stats",
          title: "Stats",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
