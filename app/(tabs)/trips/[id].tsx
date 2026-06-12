import BaitInput from "@/components/BaitInput";
import DateTimePickerField from "@/components/DateTimePicker";
import FishCatchInput from "@/components/FishCatchInput";
import FormField from "@/components/FormField";
import PickImageButton from "@/components/PickImageButton";
import { useTrips } from "@/contexts/TripsContext";
import { knownBaits } from "@/lib/bait";
import { parseTripDate, toISODate } from "@/lib/date";
import { FishEntry, knownSpecies, parseFish, serializeFish } from "@/lib/fish";
import { fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function parseStoredTime(s: string): Date | null {
  if (!s) return null;
  const match = s.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const d = new Date();
  d.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
  return d;
}

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

  // Populate the form once the trip is available. This also handles async load
  // on direct navigation / hard refresh, where `trip` is undefined on first
  // render and only becomes available after trips finish loading.
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

  const removePhoto = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ScrollView
      style={styles.bg}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>TRIP DETAILS</Text>
        <DateTimePickerField
          icon="calendar"
          placeholder="Date"
          mode="date"
          value={tripDate}
          onChange={setTripDate}
          displayValue={tripDate ? formatDate(tripDate) : ""}
        />
        <DateTimePickerField
          icon="clock-o"
          placeholder="Time"
          mode="time"
          value={tripTime}
          onChange={setTripTime}
          displayValue={tripTime ? formatTime(tripTime) : ""}
        />
        <FormField icon="map-marker" placeholder="Location" value={location} onChangeText={setLocation} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>BAIT / LURE</Text>
        <BaitInput value={bait} onChangeText={setBait} suggestions={baitSuggestions} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>FISH CAUGHT</Text>
        <FishCatchInput
          entries={fishEntries}
          setEntries={setFishEntries}
          suggestions={speciesSuggestions}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>NOTES</Text>
        <FormField
          icon="pencil"
          placeholder="Conditions, observations…"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>PHOTOS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosContent}
        >
          <PickImageButton uris={imageUris} setUris={setImageUris} />
          {imageUris.map((uri, i) => (
            <View key={i} style={styles.photoWrap}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <Pressable style={styles.photoRemove} onPress={() => removePhoto(i)} hitSlop={4}>
                <FontAwesome name="times-circle" size={18} color="#fff" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.saveButtonPressed,
          saving && styles.saveButtonDisabled,
        ]}
        onPress={onSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <FontAwesome name="check" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const CARD_BG = "rgba(255,255,255,0.10)";

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#4478e6" },
  scroll: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 48 },
  notFound: { flex: 1, backgroundColor: "#4478e6", justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#f4b183",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 2,
    ...fontStyle,
  },

  photosContent: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  photoWrap: { position: "relative" },
  photoThumb: { width: 72, height: 72, borderRadius: 10 },
  photoRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
  },

  saveButton: {
    flexDirection: "row",
    backgroundColor: "#f4b183",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: "#fff", fontSize: 17, fontWeight: "700", ...fontStyle },
});
