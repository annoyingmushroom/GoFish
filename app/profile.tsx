import FormField from "@/components/FormField";
import { useProfile } from "@/contexts/ProfileContext";
import { COLORS, fontStyle } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, loading, updateProfile } = useProfile();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Seed the form once the profile loads.
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled) return;
    const compressed = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 512 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    ).catch(() => ({ uri: result.assets[0].uri }));
    setAvatarUri(compressed.uri);
  };

  const onSave = async () => {
    setSaving(true);
    const ok = await updateProfile({
      username,
      displayName,
      ...(avatarUri ? { avatarUri } : {}),
    });
    setSaving(false);
    if (ok) router.back();
  };

  const shownAvatar = avatarUri ?? profile?.avatarUrl ?? "";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.topTitle}>Edit Profile</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Pressable style={styles.avatarWrap} onPress={pickAvatar}>
            {shownAvatar ? (
              <Image source={{ uri: shownAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarEmpty]}>
                <Ionicons name="person" size={44} color="rgba(255,255,255,0.5)" />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={15} color="#7a531a" />
            </View>
          </Pressable>

          <Text style={styles.label}>USERNAME</Text>
          <FormField
            icon="at"
            placeholder="username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Lowercase, no spaces. This is how friends find you.
          </Text>

          <Text style={styles.label}>DISPLAY NAME</Text>
          <FormField
            icon="user"
            placeholder="Your name"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              saving && styles.buttonDisabled,
            ]}
            onPress={onSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
            )}
          </Pressable>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 16 : 24,
    paddingBottom: 12,
  },
  topTitle: { color: "#fff", fontSize: 18, fontWeight: "700", ...fontStyle },
  scroll: { paddingHorizontal: 24, paddingBottom: 48, alignItems: "stretch" },

  avatarWrap: { alignSelf: "center", marginTop: 8, marginBottom: 28 },
  avatar: { width: 104, height: 104, borderRadius: 52, backgroundColor: COLORS.card },
  avatarEmpty: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatarBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.bg,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accent,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 2,
    ...fontStyle,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: -2,
    marginBottom: 18,
    marginLeft: 2,
    ...fontStyle,
  },
  button: {
    height: 52,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "700", ...fontStyle },
});
