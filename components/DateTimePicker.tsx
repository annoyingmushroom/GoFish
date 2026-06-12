import { fieldStyles } from "@/components/FormField";
import { COLORS, fontStyle, FONT } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

// Lazy-load the native picker only on native platforms to avoid web import errors
let NativePicker: React.ComponentType<{
  value: Date;
  mode: "date" | "time";
  onChange: (e: unknown, d?: Date) => void;
  display?: string;
  style?: object;
}> | null = null;

if (Platform.OS !== "web") {
  // Conditional require: the native picker module must not be bundled on web
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  NativePicker = require("@react-native-community/datetimepicker").default;
}

type Props = {
  icon: keyof typeof FontAwesome.glyphMap;
  placeholder: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  mode: "date" | "time";
  displayValue: string;
};

function WebPicker({ icon, placeholder, value, onChange, mode, displayValue }: Props) {
  const htmlValue = value
    ? mode === "date"
      ? value.toISOString().split("T")[0]            // yyyy-mm-dd
      : `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!v) { onChange(null); return; }
    if (mode === "date") {
      onChange(new Date(v + "T00:00:00"));
    } else {
      const [h, m] = v.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      onChange(d);
    }
  };

  return (
    <View style={fieldStyles.well}>
      <FontAwesome name={icon} size={16} color={COLORS.accent} style={fieldStyles.icon} />
      <input
        type={mode === "date" ? "date" : "time"}
        value={htmlValue}
        onChange={handleChange}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: value ? "#fff" : "rgba(255,255,255,0.4)",
          fontSize: 16,
          fontFamily: FONT,
          cursor: "pointer",
          colorScheme: "dark",
          // Forces the browser's native "dd/mm/yyyy" placeholder fields to render
          // in uppercase (DD/MM/YYYY). text-transform cascades into the shadow DOM.
          textTransform: "uppercase",
        }}
      />
      {value && (
        <Pressable onPress={() => onChange(null)} hitSlop={12}>
          <FontAwesome name="times-circle" size={14} color="rgba(255,255,255,0.35)" />
        </Pressable>
      )}
    </View>
  );
}

export default function DateTimePickerField(props: Props) {
  // Pure dispatcher — no hooks here, so the early return is safe
  if (Platform.OS === "web") return <WebPicker {...props} />;
  return <NativePickerField {...props} />;
}

function NativePickerField({ icon, placeholder, value, onChange, mode, displayValue }: Props) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const handleOpen = () => {
    setTempDate(value ?? new Date());
    setOpen(true);
  };

  const handleChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
      if (selected) onChange(selected);
    } else {
      if (selected) setTempDate(selected);
    }
  };

  const confirm = () => {
    onChange(tempDate);
    setOpen(false);
  };

  return (
    <>
      <Pressable style={fieldStyles.well} onPress={handleOpen}>
        <FontAwesome name={icon} size={16} color={COLORS.accent} style={fieldStyles.icon} />
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? displayValue : placeholder}
        </Text>
        {value && (
          <Pressable onPress={() => onChange(null)} hitSlop={12}>
            <FontAwesome name="times-circle" size={14} color="rgba(255,255,255,0.35)" />
          </Pressable>
        )}
      </Pressable>

      {open && Platform.OS === "android" && NativePicker && (
        <NativePicker value={tempDate} mode={mode} onChange={handleChange} display="default" />
      )}

      {Platform.OS === "ios" && (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <View style={styles.modalBg}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setOpen(false)}>
                  <Text style={styles.sheetCancel}>Cancel</Text>
                </Pressable>
                <Pressable onPress={confirm}>
                  <Text style={styles.sheetDone}>Done</Text>
                </Pressable>
              </View>
              {NativePicker && (
                <NativePicker
                  value={tempDate}
                  mode={mode}
                  onChange={handleChange}
                  display="spinner"
                  style={styles.picker}
                />
              )}
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  text: { flex: 1, fontSize: 16, color: "#fff", ...fontStyle },
  placeholder: { color: "rgba(255,255,255,0.4)" },
  modalBg: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: "#1c2d52",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  sheetCancel: { color: "rgba(255,255,255,0.5)", fontSize: 16 },
  sheetDone: { color: "#f4b183", fontSize: 16, fontWeight: "700" },
  picker: { backgroundColor: "#1c2d52" },
});
