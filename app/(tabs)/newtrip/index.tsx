import TripForm from "@/components/TripForm";
import { useTrips } from "@/contexts/TripsContext";
import { knownBaits } from "@/lib/bait";
import { formatTime, toISODate } from "@/lib/date";
import { FishEntry, knownSpecies, serializeFish } from "@/lib/fish";
import { fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";

export default function NewTripScreen() {
  const [tripDate, setTripDate] = useState<Date | null>(null);
  const [tripTime, setTripTime] = useState<Date | null>(null);
  const [location, setLocation] = useState("");
  const [fishEntries, setFishEntries] = useState<FishEntry[]>([]);
  const [bait, setBait] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { addTrip, trips } = useTrips();
  const speciesSuggestions = knownSpecies(trips.map((t) => t.fishGot));
  const baitSuggestions = knownBaits(trips.map((t) => t.bait));

  const hasAnyField =
    tripDate || tripTime || location || fishEntries.length > 0 || bait || notes || imageUris.length > 0;

  const onLogTrip = async () => {
    Keyboard.dismiss();
    setSaving(true);
    try {
      await addTrip(
        tripDate ? toISODate(tripDate) : "",
        tripTime ? formatTime(tripTime) : "",
        location,
        serializeFish(fishEntries),
        bait,
        notes,
        imageUris,
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTripDate(null);
      setTripTime(null);
      setLocation("");
      setFishEntries([]);
      setBait("");
      setNotes("");
      setImageUris([]);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2200);
    } catch {
      // addTrip already surfaces the error; keep the form intact so nothing is lost
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🎣</Text>
          <Text style={styles.headerTitle}>Log a Trip</Text>
          <Text style={styles.headerSub}>What&apos;d you catch today?</Text>
        </View>

        <TripForm
          tripDate={tripDate} setTripDate={setTripDate}
          tripTime={tripTime} setTripTime={setTripTime}
          location={location} setLocation={setLocation}
          fishEntries={fishEntries} setFishEntries={setFishEntries}
          bait={bait} setBait={setBait}
          notes={notes} setNotes={setNotes}
          imageUris={imageUris} setImageUris={setImageUris}
          speciesSuggestions={speciesSuggestions}
          baitSuggestions={baitSuggestions}
          onSave={onLogTrip}
          saving={saving}
          submitLabel="Save Trip"
          submitDisabled={!hasAnyField || saving}
        />
      </ScrollView>

      {showToast && (
        <View style={styles.toast} pointerEvents="none">
          <FontAwesome name="check-circle" size={16} color="#fff" />
          <Text style={styles.toastText}>Trip saved</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#4478e6" },
  scroll: { paddingHorizontal: 18, paddingBottom: 48 },
  header: { alignItems: "center", paddingTop: 32, paddingBottom: 24 },
  headerEmoji: { fontSize: 44, marginBottom: 6 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: 0.3, ...fontStyle },
  headerSub: { fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 4, ...fontStyle },
  toast: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(20,40,80,0.95)",
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: { color: "#fff", fontSize: 14, fontWeight: "600", ...fontStyle },
});
