import BaitInput from "@/components/BaitInput";
import DateTimePickerField from "@/components/DateTimePicker";
import FishCatchInput from "@/components/FishCatchInput";
import FormField from "@/components/FormField";
import PickImageButton from "@/components/PickImageButton";
import { formatDate, formatTime } from "@/lib/date";
import { FishEntry } from "@/lib/fish";
import { COLORS, fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import { type Dispatch, type SetStateAction } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  tripDate: Date | null;
  setTripDate: (d: Date | null) => void;
  tripTime: Date | null;
  setTripTime: (d: Date | null) => void;
  location: string;
  setLocation: (s: string) => void;
  fishEntries: FishEntry[];
  setFishEntries: (e: FishEntry[]) => void;
  bait: string;
  setBait: (s: string) => void;
  notes: string;
  setNotes: (s: string) => void;
  imageUris: string[];
  setImageUris: Dispatch<SetStateAction<string[]>>;
  speciesSuggestions: string[];
  baitSuggestions: string[];
  onSave: () => void;
  saving: boolean;
  submitLabel: string;
  submitDisabled: boolean;
};

// Shared form body used by both the New Trip and Edit Trip screens.
// All state lives in the parent; this component only renders.
export default function TripForm({
  tripDate,
  setTripDate,
  tripTime,
  setTripTime,
  location,
  setLocation,
  fishEntries,
  setFishEntries,
  bait,
  setBait,
  notes,
  setNotes,
  imageUris,
  setImageUris,
  speciesSuggestions,
  baitSuggestions,
  onSave,
  saving,
  submitLabel,
  submitDisabled,
}: Props) {
  const removePhoto = (index: number) =>
    setImageUris((prev) => prev.filter((_, i) => i !== index));

  return (
    <>
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
        <FormField
          icon="map-marker"
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
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
          placeholder="Conditions, what worked, anything worth remembering…"
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
          styles.submitBtn,
          submitDisabled && styles.submitBtnDisabled,
          pressed && styles.submitBtnPressed,
        ]}
        onPress={onSave}
        disabled={submitDisabled}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <FontAwesome name="check" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>{submitLabel}</Text>
          </>
        )}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.accent,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 2,
    ...fontStyle,
  },
  photosContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  photoWrap: { position: "relative" },
  photoThumb: { width: 72, height: 72, borderRadius: 10 },
  photoRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
  },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.accent,
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
  submitBtnPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { color: "#fff", fontSize: 17, fontWeight: "700", ...fontStyle },
});
