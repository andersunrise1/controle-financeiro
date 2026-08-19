import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";

// Mirrors components/Button3D.tsx's three variants and its "lifted" look
// (solid color + a darker bottom edge standing in for the web's box-shadow).
const VARIANTS = {
  primary: { bg: "#3b82f6", edge: "#1d4ed8", text: "#ffffff" },
  secondary: { bg: "#6b7280", edge: "#374151", text: "#ffffff" },
  danger: { bg: "#ef4444", edge: "#b91c1c", text: "#ffffff" },
};

export default function Button3D({
  children,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
}) {
  const v = VARIANTS[variant];

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderBottomColor: v.edge,
          borderBottomWidth: pressed ? 1 : 4,
          marginTop: pressed ? 3 : 0,
        },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text style={[styles.text, { color: v.text }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
    fontSize: 15,
  },
});
