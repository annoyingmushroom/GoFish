import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TripsProvider } from "../TripsContext";

export default function TabsLayout() {
  return (
    <TripsProvider>
      <Tabs // Tab Design
        screenOptions={{
          tabBarActiveTintColor: "#000000",
          headerStyle: {
            backgroundColor: '#b0d3fd',
          },
          headerShadowVisible: false,
          headerTintColor: '#ffffff',
          tabBarStyle: {
            backgroundColor: '#b0d3fd',
          },  
        }}
      >
        <Tabs.Screen 
          name = "newtrip/index" 
          options={{
            headerTitle: "New Trip",
            title: "New Trip",
            tabBarIcon: ({focused, color}) => 
              <Ionicons
                name={focused ? "add-sharp" : "add-outline"}
                color={color}
                size={30}
              />
          }}
        />
        
        <Tabs.Screen
          name = "trips/index" 
          options={{
            headerTitle: "Trips",
            title: "Trips",
            tabBarIcon: ({focused, color}) => 
            <Ionicons 
              name={focused ? "fish-sharp" : "fish-outline"}
              color={color}
              size={30}
            />,
          }}
        />

      </Tabs>
    </TripsProvider>
  );
}
