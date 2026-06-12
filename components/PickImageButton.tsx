import { notify } from "@/lib/notify";
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet } from "react-native";

type Props = {
  uris: string[];
  setUris: React.Dispatch<React.SetStateAction<string[]>>;
};

// Resize down to max 1080px wide and re-encode as JPEG to keep uploads small
// (full-res phone photos are several MB; this trims them ~10×).
async function compress(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );
    return result.uri;
  } catch {
    return uri; // fall back to the original if manipulation fails
  }
}

async function requestAndPick(source: "camera" | "library"): Promise<string | null> {
  if (source === "camera") {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      notify("Camera access needed", "Enable camera access in Settings.");
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
    });
    return result.canceled ? null : await compress(result.assets[0].uri);
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      notify("Photo library access needed", "Enable photo access in Settings.");
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    return result.canceled ? null : await compress(result.assets[0].uri);
  }
}

export default function PickImageButton({ uris, setUris }: Props) {
  const addUri = (uri: string) => setUris((prev) => [...prev, uri]);

  const pick = () => {
    if (Platform.OS === "web") {
      // Browser file picker handles camera + library; no action sheet needed
      requestAndPick("library").then((uri) => {
        if (uri) addUri(uri);
      });
    } else if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        async (idx) => {
          if (idx === 1) {
            const uri = await requestAndPick("camera");
            if (uri) addUri(uri);
          } else if (idx === 2) {
            const uri = await requestAndPick("library");
            if (uri) addUri(uri);
          }
        },
      );
    } else {
      Alert.alert("Add Photo", "", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Take Photo",
          onPress: async () => {
            const uri = await requestAndPick("camera");
            if (uri) addUri(uri);
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const uri = await requestAndPick("library");
            if (uri) addUri(uri);
          },
        },
      ]);
    }
  };

  return (
    <Pressable style={styles.button} onPress={pick}>
      <Ionicons name="camera-outline" size={26} color="#6b7280" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
});
