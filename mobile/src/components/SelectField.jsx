import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../context/ThemeContext";

// Mirrors the web's .input-dark <select> styling. Android/iOS render the
// native Picker very differently (Android: inline dropdown; iOS: wheel via
// itemStyle) — this wrapper just makes both look like the same dark field.
export default function SelectField({ label, value, onValueChange, options }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor={colors.textPrimary}
        >
          {options.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} color={Platform.OS === "ios" ? colors.textPrimary : undefined} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    wrapper: {
      marginBottom: 4,
    },
    label: {
      marginBottom: 6,
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    pickerBox: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      overflow: "hidden",
      justifyContent: "center",
    },
    picker: {
      // On web Picker renders as a plain <select>, opaque by default — the
      // wrapping pickerBox's dark background doesn't show through it, so the
      // fill has to go here too, not just on the wrapper.
      color: colors.textPrimary,
      backgroundColor: colors.inputBg,
    },
    pickerItem: {
      color: colors.textPrimary,
    },
  });
}
