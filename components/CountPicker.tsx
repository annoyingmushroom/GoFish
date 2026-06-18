import { COLORS, fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

// The quick-pick bar shows pills 1..MAX_PILL. Counts beyond that are entered
// with the "10+" stepper, which starts at PLUS_START.
const MAX_PILL = 10;
const PLUS_START = MAX_PILL + 1;

type Props = {
  value: number;
  onChange: (n: number) => void;
};

// A picker for how many fish of a species were caught. Tapping a number 1–10
// selects it directly; "10+" reveals a stepper for larger counts. The pills
// wrap onto additional rows on narrow screens so none are pushed off-screen.
export default function CountPicker({ value, onChange }: Props) {
  const isPlus = value > MAX_PILL;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {Array.from({ length: MAX_PILL }, (_, i) => i + 1).map((n) => (
          <NumberPill key={n} label={n} active={value === n} onPress={() => onChange(n)} />
        ))}

        {/* "10+" switches to the stepper below for counts beyond the pills. */}
        <Pressable
          onPress={() => onChange(isPlus ? value : PLUS_START)}
          style={[styles.pillWide, isPlus && styles.pillActive]}
        >
          <Text style={[styles.text, isPlus && styles.textActive]}>10+</Text>
        </Pressable>
      </View>

      {isPlus && (
        <Stepper
          value={value}
          onDecrement={() => onChange(Math.max(PLUS_START, value - 1))}
          onIncrement={() => onChange(value + 1)}
        />
      )}
    </View>
  );
}

// A single tappable number in the quick-pick bar.
function NumberPill({
  label,
  active,
  onPress,
}: {
  label: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

// Minus / value / plus control shown once the count goes past the pills.
function Stepper({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onDecrement} style={styles.stepBtn} hitSlop={6}>
        <FontAwesome name="minus" size={12} color={COLORS.accent} />
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable onPress={onIncrement} style={styles.stepBtn} hitSlop={6}>
        <FontAwesome name="plus" size={12} color={COLORS.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // flex: 1 lets the picker fill the width left after the "Qty" label, which
  // gives the wrapping row below a real width limit to wrap against.
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  pillWide: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    ...fontStyle,
  },
  textActive: {
    color: "#25292e",
    fontWeight: "800",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 10,
    marginLeft: 32,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(244,177,131,0.12)",
    borderWidth: 1,
    borderColor: "rgba(244,177,131,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    minWidth: 32,
    textAlign: "center",
    ...fontStyle,
  },
});
