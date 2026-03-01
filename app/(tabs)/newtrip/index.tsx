// New Trip Page
// Add a new trip to array of trips

import { useTrips } from "@/app/TripsContext";
import Button from "@/components/Button";
import PickImageButton from "@/components/PickImageButton";
import { useState } from "react";
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [fishGot, setFishGot] = useState("");
  const [imageUris, setImageUris] = useState<string[]>([]);

  // Adding trip
  const { addTrip } = useTrips();

  const onLogTrip = () => {
    Keyboard.dismiss();
    addTrip(date, time, location, fishGot, imageUris);
    setDate("");
    setLocation("");
    setTime("");
    setFishGot("");
    setImageUris([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}> What&apos;d you catch today?! </Text>

        <View style={styles.row}>
          <Text style={styles.label}> Date: </Text>
          <TextInput
            selectionColor="#f4b183"
            style={[
              styles.input,
              {
                fontStyle: date ? "normal" : "italic",
                opacity: date ? 1 : 0.5,
              },
            ]}
            onChangeText={setDate}
            value={date}
            placeholder="DD/MM/YYYY"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}> Location: </Text>
          <TextInput
            selectionColor="#f4b183"
            style={[
              styles.input,
              {
                fontStyle: location ? "normal" : "italic",
                opacity: location ? 1 : 0.5,
              },
            ]}
            onChangeText={setLocation}
            value={location}
            placeholder="Macritchie Resevoir"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}> Time: </Text>
          <TextInput
            selectionColor="#f4b183"
            style={[
              styles.input,
              {
                fontStyle: time ? "normal" : "italic",
                opacity: time ? 1 : 0.5,
              },
            ]}
            onChangeText={setTime}
            value={time}
            placeholder="3-5pm"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}> Fish Caught: </Text>
          <TextInput
            selectionColor="#f4b183"
            style={[
              styles.input,
              {
                fontStyle: fishGot ? "normal" : "italic",
                opacity: fishGot ? 1 : 0.5,
              },
            ]}
            onChangeText={setFishGot}
            value={fishGot}
            placeholder="Peacock Bass x1, Tilapia x1"
          />
        </View>

        <View style={styles.photosSection}>
          <View style={styles.photosContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosContent}
            >
              <PickImageButton uris={imageUris} setUris={setImageUris} />
              {imageUris.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photoThumb} />
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <Button label="Log Trip" theme="confirm" onPress={onLogTrip} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#4478e6ff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    width: "100%",
  },
  label: {
    color: "#333",
    fontSize: 18,
    height: 20,
    lineHeight: 20,
  },
  text: {
    fontSize: 30,
    fontWeight: "700",
    color: "#f4b183",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  input: {
    color: "#ffffff",
    fontStyle: "italic",
    fontSize: 18,
    flex: 1,
    height: 20,
    lineHeight: 20,
  },
  buttonWrapper: {
    alignItems: "center",
    marginTop: 10,
  },
  photosSection: {
    marginTop: 12,
  },
  photosContainer: {
    height: 96,
    width: "100%",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#f7c4a2",
    borderRadius: 14,
    backgroundColor: "#4478e6ff",
    justifyContent: "center",
    overflow: "hidden",
  },
  photosContent: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
  },
  photoThumb: {
    width: 74,
    height: 74,
    borderRadius: 12,
    resizeMode: "none",
  },
  content: {
    width: "100%",
    maxWidth: 420,
  },
});
