import { COLORS, fontStyle } from "@/lib/theme";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  url?: string;
  name?: string;
  size?: number;
};

// Round profile picture with an initial-letter fallback when there's no avatar.
export default function Avatar({ url, name, size = 44 }: Props) {
  const dim = { width: size, height: size, borderRadius: size / 2 };
  const initial = (name?.trim()?.[0] ?? "🎣").toUpperCase();

  if (url) {
    return <Image source={{ uri: url }} style={[styles.base, dim]} />;
  }
  return (
    <View style={[styles.base, styles.fallback, dim]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: COLORS.card },
  fallback: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  initial: { color: "#fff", fontWeight: "800", ...fontStyle },
});
