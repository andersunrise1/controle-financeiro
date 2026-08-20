import { useState } from "react";
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from "react-native";
import FlagIcon from "./FlagIcon";
import { REGIONS, REGION_LABELS } from "../lib/regions";
import { colors } from "../theme";

// Reusable region/currency picker — a modal list (the mobile-native
// equivalent of the web LanguageSwitcher/RegionSelect's click-outside
// dropdown, which doesn't map to touch). Used both as the header's app-wide
// language switcher and as CurrencyConverter's local From/To pickers.
export default function RegionPicker({ value, onChange, compact = false }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={[styles.trigger, compact && styles.triggerCompact]} onPress={() => setOpen(true)}>
        <FlagIcon country={value} size={20} />
        {!compact && <Text style={styles.triggerLabel}>{REGION_LABELS[value]}</Text>}
      </Pressable>

      {open && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <FlatList
                data={REGIONS}
                keyExtractor={(r) => r}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.option}
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                  >
                    <FlagIcon country={item} size={22} />
                    <Text style={[styles.optionLabel, item === value && styles.optionLabelActive]}>
                      {REGION_LABELS[item]}
                    </Text>
                  </Pressable>
                )}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  triggerCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  triggerLabel: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "600",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    maxHeight: "70%",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  optionLabel: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  optionLabelActive: {
    color: colors.neonGreen,
    fontWeight: "700",
  },
});
