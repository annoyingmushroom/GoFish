import { COLORS, fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from "react-native";

type Props = {
  icon: keyof typeof FontAwesome.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export default function FormField({
  icon,
  placeholder,
  value,
  onChangeText,
  multiline,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: Props) {
  return (
    <View style={[fieldStyles.well, multiline && fieldStyles.wellMultiline]}>
      <FontAwesome
        name={icon}
        size={16}
        color={COLORS.accent}
        style={[fieldStyles.icon, multiline && fieldStyles.iconMultiline]}
      />
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        selectionColor={COLORS.accent}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

// Shared input "well" styling — used by FormField, the date/time picker, and the
// fish species input so every text box across the app looks identical.
export const fieldStyles = StyleSheet.create({
  well: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputWell,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    marginBottom: 10,
  },
  wellMultiline: {
    alignItems: "flex-start",
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 88,
  },
  icon: {
    width: 22,
    textAlign: "center",
    marginRight: 10,
  },
  iconMultiline: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingVertical: 0,
    ...fontStyle,
  },
  inputMultiline: {
    lineHeight: 22,
    textAlignVertical: "top",
    minHeight: 60,
  },
});
