import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { FONTS, RADIUS, SIZES, SPACING } from "../constants/theme";

const OPTIONS = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = mode === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => setMode(opt.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = ({ colors }) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      overflow: "hidden",
      backgroundColor: colors.surface,
    },
    option: { flex: 1, paddingVertical: SPACING.md, alignItems: "center" },
    optionActive: { backgroundColor: colors.primary },
    label: { fontFamily: FONTS.body, fontSize: SIZES.body, color: colors.text },
    labelActive: { color: "#FFFFFF", fontFamily: FONTS.heading },
  });