import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to GoFish!.</Text>
      <Link href={"/about"} style={styles.button}>
        Go to About screen
      </Link>
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
    fontSize: 18,
    color: "#edededff",
  },
  button: {
    fontSize: 12,
    textDecorationLine: "underline",
    color: "#fff",
  },
})

