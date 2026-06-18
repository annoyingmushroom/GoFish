import { useEffect } from "react";
import { Platform } from "react-native";

// Injects a <style> tag on web to keep browser autofill boxes matching the
// app's dark theme. Has no effect on native.
export default function WebAutofillStyles() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;

    const id = "gofish-autofill-styles";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      textarea:-webkit-autofill,
      textarea:-webkit-autofill:hover,
      textarea:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.18) inset !important;
        -webkit-text-fill-color: #fff !important;
        caret-color: #fff !important;
        transition: background-color 9999s ease-out 0s;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
}
