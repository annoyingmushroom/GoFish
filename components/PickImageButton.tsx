import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  uri: string | null;
  setUri: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function PickImageButton({ uri, setUri }: Props) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // no permission
    if (status !== "granted") {
      Alert.alert("Permission needed");
      return;
    }

    // permission granted, access library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setUri(selectedUri);
    }
  };

  return (
    <View>
      {uri && (
        <Image
          source={{ uri }}
          style={{ width: 200, height: 200, borderRadius: 1 }}
        />
      )}
      <Pressable style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Add some pics!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,

    // subtle border (matches your card look)
    borderWidth: 2,
    borderColor: "#e3cfa8",

    alignItems: "center",

    // soft shadow (iOS + Android)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937", // soft dark, not pure black
    letterSpacing: 0.3,
  },
});
