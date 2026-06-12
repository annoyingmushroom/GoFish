import FormField from "@/components/FormField";
import { fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  suggestions: string[];
};

export default function BaitInput({ value, onChangeText, suggestions }: Props) {
  const current = value.trim().toLowerCase();
  const availableSuggestions = suggestions.filter((s) => s.toLowerCase() !== current);

  return (
    <View>
      <FormField
        icon="leaf"
        placeholder="Bait / lure used"
        value={value}
        onChangeText={onChangeText}
      />

      {availableSuggestions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {availableSuggestions.map((bait) => (
            <Pressable key={bait} style={styles.chip} onPress={() => onChangeText(bait)}>
              <FontAwesome name="plus" size={9} color="#f4b183" />
              <Text style={styles.chipText}>{bait}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    gap: 8,
    paddingBottom: 8,
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
    color: "#f4b183",
    fontWeight: "600",
    ...fontStyle,
  },
});
