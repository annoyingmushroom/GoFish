import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name = "index" 
        options={{
          headerTitle: "Go Fish",
          headerLeft: () => <></>,
        }}
      />
      <Stack.Screen 
        name = "about" 
        options={{
          headerTitle: "About",
        }}
      />
      <Stack.Screen
        name="+not-found"
        options={{}} />
    </Stack>
  );
}
