import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

// Mirrors components/Alert.tsx's translucent styling. The text color goes
// through accentRedText/accentGreenText (not a fixed light-on-dark tint) —
// same fix web needed on 2026-08-22, since the pure tint only clears WCAG
// contrast against a dark tinted background, not light theme's near-white one.
export default function Alert({ type, message }) {
  const { colors } = useTheme();
  if (!message) return null;

  const isError = type === "error";
  const color = isError ? colors.accentRedText : colors.accentGreenText;
  const bg = isError ? "rgba(255, 7, 58, 0.1)" : "rgba(57, 255, 20, 0.1)";
  const border = isError ? "rgba(255, 7, 58, 0.4)" : "rgba(57, 255, 20, 0.4)";

  return (
    <View style={[styles.box, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});
