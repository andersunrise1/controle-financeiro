import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDateForRegion } from "../lib/currency";
import { useLocale } from "../context/LocaleContext";
import { useTheme } from "../context/ThemeContext";

// value/onChange use the same "YYYY-MM-DD" string shape the web app and the
// backend both use (see TransactionForm.tsx's date input, api routes).
export default function DateField({ label, value, onChange }) {
  const { region } = useLocale();
  const { theme, colors } = useTheme();
  const styles = getStyles(colors);
  const [showPicker, setShowPicker] = useState(false);
  const dateObj = new Date(`${value}T00:00:00`);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed" || !selectedDate) return;
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable style={styles.field} onPress={() => setShowPicker(true)}>
        <Text style={styles.value}>{formatDateForRegion(new Date(`${value}T00:00:00`), region)}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
          themeVariant={theme}
        />
      )}
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
    field: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    value: {
      color: colors.textPrimary,
      fontSize: 15,
    },
  });
}
