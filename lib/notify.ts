import { Alert, Platform } from "react-native";

// React Native's Alert is a no-op on web. This helper falls back to the
// browser's native alert so errors are actually visible everywhere.
export function notify(title: string, message?: string) {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

// Cross-platform yes/no confirmation. Resolves true if the user confirms.
export function confirm(
  title: string,
  message: string,
  confirmLabel = "OK",
  destructive = false,
): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? "destructive" : "default",
        onPress: () => resolve(true),
      },
    ]);
  });
}
