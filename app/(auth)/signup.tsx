import FormField from "@/components/FormField";
import { authStyles } from "@/lib/authStyles";
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

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSignup = async () => {
    setError("");
    setSuccess("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else if (data.session) {
      // email confirmation off — AuthGate will redirect automatically
    } else {
      setSuccess(`Confirmation email sent to ${email}. Click the link, then sign in.\n\nTo skip this: Supabase → Authentication → Providers → Email → turn off "Confirm email".`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={authStyles.inner}>
        <Text style={authStyles.emoji}>🎣</Text>
        <Text style={authStyles.title}>GoFish</Text>
        <Text style={authStyles.sub}>Create a free account</Text>

        {!!error && (
          <View style={authStyles.errorBox}>
            <Text style={authStyles.errorText}>{error}</Text>
          </View>
        )}
        {!!success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        <View style={authStyles.card}>
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
          <FormField
            icon="lock"
            placeholder="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <Pressable
          style={({ pressed }) => [authStyles.button, pressed && authStyles.buttonPressed, loading && authStyles.buttonDisabled]}
          onPress={onSignup}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={authStyles.buttonText}>Create Account</Text>
          }
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable style={authStyles.switchLink}>
            <Text style={authStyles.switchText}>
              Already have an account? <Text style={authStyles.switchBold}>Sign in</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

// Only the success banner is unique to this screen; everything else is in authStyles.
const styles = StyleSheet.create({
  successBox: {
    width: "100%",
    backgroundColor: "rgba(80,200,120,0.2)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(80,200,120,0.4)",
    padding: 12,
    marginBottom: 12,
  },
  successText: { color: "#aaffcc", fontSize: 14, textAlign: "center", ...fontStyle },
});
