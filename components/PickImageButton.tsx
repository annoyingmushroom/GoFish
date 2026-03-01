import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Alert, Pressable, StyleSheet } from "react-native";

type Props = {
  uris: string[];
  setUris: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function PickImageButton({ uris, setUris }: Props) {
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
      setUris((prev) => [...prev, selectedUri]);
    }
  };

  return (
    <Pressable style={styles.button} onPress={pickImage}>
      <Ionicons name="images-outline" size={24} color="#6b7280" />
      <Ionicons name="add-circle" size={16} color="#6b7280" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 74,
    height: 74,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#cfcfcf",
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  buttonText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: 0.2,
  },
});
