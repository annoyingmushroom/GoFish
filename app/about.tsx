import { Text, View, StyleSheet } from "react-native";

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Did you know? I love bubz!</Text>
      <Text style={styles.text}>Did you know? I love bubz!</Text>
      <Text style={styles.text}>Did you know? I love bubz!</Text>
      <Text style={styles.text}>Did you know? I love bubz!</Text>
      <Text style={styles.text}>Did you know? I love bubz!</Text>
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

  text: {
    color: "#fff",
  },
})

