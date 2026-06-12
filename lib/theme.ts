import { Platform, TextStyle } from "react-native";

// Standard font stack used across the app. On web we set it explicitly so that
// native HTML controls (like the date/time inputs) match React Native text;
// on native we leave it undefined to use the platform system font.
export const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const fontStyle: TextStyle =
  Platform.OS === "web" ? { fontFamily: FONT } : {};

export const COLORS = {
  bg: "#4478e6",
  accent: "#f4b183",
  card: "rgba(255,255,255,0.10)",
  cardBorder: "rgba(255,255,255,0.15)",
  inputWell: "rgba(0,0,0,0.18)",
  inputBorder: "rgba(255,255,255,0.08)",
  placeholder: "rgba(255,255,255,0.4)",
  textMuted: "rgba(255,255,255,0.55)",
};
