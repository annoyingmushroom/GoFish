import FormField from "@/components/FormField";
import { supabase } from "@/lib/supabase";
import { fontStyle } from "@/lib/theme";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError(err.message);
    // on success AuthGate redirects automatically
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.emoji}>🎣</Text>
        <Text style={styles.title}>GoFish</Text>
        <Text style={styles.sub}>Sign in to your account</Text>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.card}>
          <FormField
            icon="envelope"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            icon="lock"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
          onPress={onLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Sign In</Text>
          }
        </Pressable>

        <Link href="/(auth)/signup" asChild>
          <Pressable style={styles.switchLink}>
            <Text style={styles.switchText}>
              Don&apos;t have an account? <Text style={styles.switchBold}>Sign up</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4478e6" },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 36, fontWeight: "800", color: "#fff", letterSpacing: 0.5, ...fontStyle },
  sub: { fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 4, marginBottom: 20, ...fontStyle },

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
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "700", ...fontStyle },

  switchLink: { padding: 8 },
  switchText: { color: "rgba(255,255,255,0.55)", fontSize: 14, ...fontStyle },
  switchBold: { color: "#f4b183", fontWeight: "700" },
});
