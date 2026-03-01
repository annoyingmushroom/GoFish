import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ButtonTheme = "confirm" | "delete";

type Props = {
  label: string;
  theme?: ButtonTheme;
  onPress?: () => void;
};

export default function Button({ label, theme, onPress }: Props) {
  const logPress = () => {
    alert("Trip logged.");
    onPress?.();
  };

  if (theme === "confirm") {
    return (
      <View
        style={[
          styles.buttonContainer,
          { borderWidth: 3, borderColor: "#ffa600", borderRadius: 18 },
        ]}
      >
        <Pressable
          style={[styles.button, { backgroundColor: "#fff" }]}
          onPress={logPress}
        >
          <FontAwesome
            name="clipboard"
            size={18}
            color="#25292e"
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonLabel, { color: "#25292e" }]}>
            {label}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={() => alert("You are gay.")}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 300,
    height: 60,
    marginHorizontal: 20,
    marginVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  button: {
    borderRadius: 18,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
  },
  buttonIcon: {
    paddingRight: 8,
  },
});
