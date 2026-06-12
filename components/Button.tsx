import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  theme?: "confirm" | "delete";
  onPress?: () => void;
};

export default function Button({ label, theme, onPress }: Props) {
  if (theme === "confirm") {
    return (
      <View style={[styles.container, styles.confirmBorder]}>
        <Pressable style={[styles.button, styles.confirmBg]} onPress={onPress}>
          <FontAwesome name="clipboard" size={18} color="#25292e" style={styles.icon} />
          <Text style={[styles.label, { color: "#25292e" }]}>{label}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 60,
    marginHorizontal: 20,
    marginVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  confirmBorder: {
    borderWidth: 3,
    borderColor: "#ffa600",
    borderRadius: 18,
  },
  confirmBg: {
    backgroundColor: "#fff",
  },
  button: {
    borderRadius: 18,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  label: {
    color: "#fff",
    fontSize: 16,
  },
  icon: {
    paddingRight: 8,
  },
});
