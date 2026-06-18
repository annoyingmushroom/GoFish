import { fontStyle } from "@/lib/theme";
import { StyleSheet } from "react-native";

// Styles shared between the Login and Signup screens.
export const authStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4478e6" },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 36, fontWeight: "800", color: "#fff", letterSpacing: 0.5, ...fontStyle },
  sub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
    marginBottom: 20,
    ...fontStyle,
  },
  errorBox: {
    width: "100%",
    backgroundColor: "rgba(255,80,80,0.2)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,100,100,0.4)",
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#ffaaaa", fontSize: 14, textAlign: "center", ...fontStyle },
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    marginBottom: 16,
  },
  button: {
    width: "100%",
    height: 52,
    backgroundColor: "#f4b183",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonPressed: { opacity: 0.8 as const },
  buttonDisabled: { opacity: 0.5 as const },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "700", ...fontStyle },
  switchLink: { padding: 8 },
  switchText: { color: "rgba(255,255,255,0.55)", fontSize: 14, ...fontStyle },
  switchBold: { color: "#f4b183", fontWeight: "700" },
});
