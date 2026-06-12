import { parseFish } from "@/lib/fish";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  fishGot: string;
  style?: object;
};

// Renders a trip's catch (stored as "Tilapia x2, Bass x1") as tan badges.
export default function FishBadges({ fishGot, style }: Props) {
  const fish = parseFish(fishGot);
  if (fish.length === 0) return null;

  return (
    <View style={[styles.row, style]}>
      {fish.map((f, i) => (
        <View key={i} style={styles.badge}>
          <FontAwesome name="trophy" size={10} color="#b9852f" />
          <Text style={styles.species}>{f.species}</Text>
          <Text style={styles.count}>×{f.count}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fbe6d4",
    borderRadius: 12,
    paddingVertical: 4,
    paddingLeft: 9,
    paddingRight: 10,
  },
  species: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7a531a",
  },
  count: {
    fontSize: 13,
    fontWeight: "800",
    color: "#b9852f",
  },
});
