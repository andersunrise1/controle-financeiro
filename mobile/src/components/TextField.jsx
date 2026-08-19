import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "../theme";

// Mirrors the web's .input-dark class exactly (same background/border/text).
export default function TextField({ label, ...inputProps }) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textFaint}
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#d1d5db",
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
  },
});
