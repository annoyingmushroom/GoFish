import { Stack } from "expo-router";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name = "(tabs)" 
        options={{
          headerTitle: "Go Fish",
          headerLeft: () => <></>,
          headerShown: false,
        }}
      />
      <Stack.Screen name="+not-found" options={{}} />
    </Stack>
  );
}
