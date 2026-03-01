import { useTrips } from "@/app/TripsContext";
import Button from "@/components/Button";
import PickImageButton from "@/components/PickImageButton";
import { useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [fishGot, setFishGot] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Adding trip
  const { addTrip } = useTrips();

  const onLogTrip = () => {
    Keyboard.dismiss();
    addTrip(date, time, location, fishGot, imageUri);
    setDate("");
    setLocation("");
    setTime("");
    setFishGot("");
    setImageUri(null);
  };

  return (
    <View style={styles.container}>
      <View>
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
        <View>
          <PickImageButton uri={imageUri} setUri={setImageUri} />
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
    backgroundColor: "#4478e6ff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  label: {
    color: "#333",
    fontSize: 20,
    height: 20,
    lineHeight: 20,
  },
  text: {
    fontSize: 26,
    fontWeight: "700",
    color: "#f4b183",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  input: {
    color: "#fff",
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
});
