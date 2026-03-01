// Trips page
// List of trips

import { useTrips } from "@/app/TripsContext";
import { FontAwesome } from "@expo/vector-icons";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
export default function Index() {
  // Creates state for component (screen / container)
  const { trips, removeTrip } = useTrips();

  const deletePress = (id: string) =>
    Alert.alert("Delete Trip", "Are you sure?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          removeTrip(id);
        },
      },
    ]);

  // Array of trips
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {trips.map((trip) => {
          return (
            <View key={trip.id} style={styles.card}>
              <Pressable
                style={styles.deleteIcon}
                onPress={() => deletePress(trip.id)}
                hitSlop={10}
              >
                <FontAwesome name="trash" size={18} color="#827979" />
              </Pressable>
              <Text style={styles.date}>Date: {trip.date}</Text>
              <Text style={styles.title}>Location: {trip.location}</Text>
              <Text style={styles.title}>Time: {trip.time}</Text>
              <Text style={styles.title}>Fish Caught: {trip.fishGot}</Text>
              {trip.imageUri && (
                <Image
                  source={{ uri: trip.imageUri }}
                  style={styles.tripImage}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#4478e6ff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#000",
    fontSize: 18,
  },
  date: {
    color: "#000",
  },
  card: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingRight: 56,
    borderRadius: 14,
    borderTopWidth: 12,
    borderTopColor: "#dbb276",
    width: "100%",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    position: "relative",
  },
  deleteIcon: {
    position: "absolute",
    top: 8,
    right: 8,

    width: 40,
    height: 40,
    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    padding: 16,
    alignItems: "center",
  },
  tripImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 10,
    resizeMode: "cover",
  },
});
