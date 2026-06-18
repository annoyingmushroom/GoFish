import FormField from "@/components/FormField";
import SuggestionChips from "@/components/SuggestionChips";
import { View } from "react-native";

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
      <SuggestionChips suggestions={availableSuggestions} onSelect={onChangeText} />
    </View>
  );
}
