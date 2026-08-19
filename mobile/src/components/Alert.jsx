import { View, Text, StyleSheet } from "react-native";

// Mirrors components/Alert.tsx's dark-theme translucent styling exactly
// (fixed on web on 2026-08-19 after it originally used near-white colors
// that clashed with the dark theme) — mobile gets the corrected version
// from day one, no equivalent bug to repeat.
export default function Alert({ type, message }) {
  if (!message) return null;

  const isError = type === "error";
  const color = isError ? "#ff6b85" : "#7cff5c";
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
