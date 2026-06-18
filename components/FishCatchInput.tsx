import CountPicker from "@/components/CountPicker";
import { fieldStyles } from "@/components/FormField";
import SuggestionChips from "@/components/SuggestionChips";
import { FishEntry } from "@/lib/fish";
import { COLORS, fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  entries: FishEntry[];
  setEntries: (entries: FishEntry[]) => void;
  suggestions: string[];
};

export default function FishCatchInput({ entries, setEntries, suggestions }: Props) {
  const updateEntry = (index: number, patch: Partial<FishEntry>) => {
    setEntries(entries.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const addEntry = (species = "") => {
    setEntries([...entries, { species, count: 1 }]);
  };

  const availableSuggestions = suggestions.filter(
    (s) => !entries.some((e) => e.species.trim().toLowerCase() === s.toLowerCase()),
  );

  return (
    <View>
      {entries.map((entry, index) => (
        <View key={index} style={styles.entry}>
          <View style={[fieldStyles.well, styles.speciesWell]}>
            <FontAwesome name="trophy" size={16} color={COLORS.accent} style={fieldStyles.icon} />
            <TextInput
              style={fieldStyles.input}
              placeholder="Species (e.g. Tilapia)"
              placeholderTextColor={COLORS.placeholder}
              value={entry.species}
              onChangeText={(species) => updateEntry(index, { species })}
              selectionColor={COLORS.accent}
            />
            <Pressable onPress={() => removeEntry(index)} hitSlop={10} style={styles.removeBtn}>
              <FontAwesome name="times-circle" size={18} color="rgba(255,255,255,0.4)" />
            </Pressable>
          </View>
          <View style={styles.countWrap}>
            <Text style={styles.countLabel}>Qty</Text>
            <CountPicker value={entry.count} onChange={(count) => updateEntry(index, { count })} />
          </View>
        </View>
      ))}

      <SuggestionChips suggestions={availableSuggestions} onSelect={addEntry} />

      <Pressable style={styles.addBtn} onPress={() => addEntry()}>
        <FontAwesome name="plus-circle" size={15} color={COLORS.accent} />
        <Text style={styles.addBtnText}>Add fish</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: { marginBottom: 14 },
  speciesWell: { marginBottom: 0 },
  removeBtn: { paddingLeft: 8 },
  countWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 4,
  },
  countLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    marginRight: 8,
    width: 24,
    ...fontStyle,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    marginTop: 4,
  },
  addBtnText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: "600",
    ...fontStyle,
  },
});
