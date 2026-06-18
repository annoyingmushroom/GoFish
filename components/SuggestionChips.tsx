import { COLORS, fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

type Props = {
  suggestions: string[];
  onSelect: (s: string) => void;
};

// Horizontal row of tappable chips for quick-adding known suggestions.
export default function SuggestionChips({ suggestions, onSelect }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {suggestions.map((s) => (
        <Pressable key={s} style={styles.chip} onPress={() => onSelect(s)}>
          <FontAwesome name="plus" size={9} color={COLORS.accent} />
          <Text style={styles.chipText}>{s}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
    paddingRight: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "rgba(244,177,131,0.12)",
    borderWidth: 1,
    borderColor: "rgba(244,177,131,0.3)",
  },
  chipText: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: "600",
    ...fontStyle,
  },
});
