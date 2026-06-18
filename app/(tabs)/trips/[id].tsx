import TripForm from "@/components/TripForm";
import { useTrips } from "@/contexts/TripsContext";
import { knownBaits } from "@/lib/bait";
import { formatTime, parseStoredTime, parseTripDate, toISODate } from "@/lib/date";
import { FishEntry, knownSpecies, parseFish, serializeFish } from "@/lib/fish";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, updateTrip } = useTrips();
  const router = useRouter();

  const trip = trips.find((t) => t.id === id);
  const speciesSuggestions = knownSpecies(trips.map((t) => t.fishGot));
  const baitSuggestions = knownBaits(trips.map((t) => t.bait));

  const [tripDate, setTripDate] = useState<Date | null>(null);
  const [tripTime, setTripTime] = useState<Date | null>(null);
  const [location, setLocation] = useState("");
  const [fishEntries, setFishEntries] = useState<FishEntry[]>([]);
  const [bait, setBait] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Populate the form once the trip is available. Also handles async load on
  // direct navigation / hard refresh where `trip` is undefined on first render.
  useEffect(() => {
    if (!trip) return;
    setTripDate(parseTripDate(trip.date));
    setTripTime(parseStoredTime(trip.time));
    setLocation(trip.location);
    setFishEntries(parseFish(trip.fishGot));
    setBait(trip.bait ?? "");
    setNotes(trip.notes ?? "");
    setImageUris(trip.imageUris ?? []);
  }, [trip]);

  if (!trip) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: "#fff", fontSize: 16 }}>Trip not found.</Text>
      </View>
    );
  }

  const onSave = async () => {
    Keyboard.dismiss();
    setSaving(true);
    try {
      await updateTrip(id, {
        date: tripDate ? toISODate(tripDate) : "",
        time: tripTime ? formatTime(tripTime) : "",
        location,
        fishGot: serializeFish(fishEntries),
        bait,
        notes,
        imageUris,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      // updateTrip already surfaces the error; keep the user on the edit form
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.bg}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
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
        onSave={onSave}
        saving={saving}
        submitLabel="Save Changes"
        submitDisabled={saving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#4478e6" },
  scroll: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 48 },
  notFound: { flex: 1, backgroundColor: "#4478e6", justifyContent: "center", alignItems: "center" },
});
