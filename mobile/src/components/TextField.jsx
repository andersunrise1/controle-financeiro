import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

function EyeIcon({ open, color }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <Circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <Path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <Line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </Svg>
  );
}

// Mirrors the web's .input-dark class exactly (same background/border/text).
// When secureTextEntry is passed, adds the same show/hide password toggle
// the web app has (a real client request: users mistyping a password had
// no way to check what they'd actually typed).
export default function TextField({ label, secureTextEntry, ...inputProps }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [visible, setVisible] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.textFaint}
          style={[styles.input, isPassword && styles.inputWithToggle]}
          secureTextEntry={isPassword && !visible}
          {...inputProps}
        />
        {isPassword && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            style={styles.toggle}
            hitSlop={10}
          >
            <EyeIcon open={!visible} color={colors.textMuted} />
          </Pressable>
        )}
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
    inputRow: {
      position: "relative",
      justifyContent: "center",
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
    inputWithToggle: {
      paddingRight: 48,
    },
    toggle: {
      position: "absolute",
      right: 14,
    },
  });
}
