import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { FONTS, RADIUS, SIZES, SPACING } from "../constants/theme";

const OPTIONS = [
  { value: "system", label: "Sistema", icon: "cellphone" },
  { value: "light", label: "Claro", icon: "white-balance-sunny" },
  { value: "dark", label: "Oscuro", icon: "moon-waning-crescent" },
];

export default function SidebarThemeToggle() {
  const { mode, setMode } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apariencia</Text>

      <View style={styles.options}>
        {OPTIONS.map((opt) => {
          const active = mode === opt.value;

          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => setMode(opt.value)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={opt.icon}
                size={20}
                color={active ? "#FFFFFF" : styles.iconColor.color}
              />

              <Text style={[styles.label, active && styles.labelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
    },
    title: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.body,
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    options: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      overflow: "hidden",
      backgroundColor: colors.surface,
    },
    option: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING.sm,
      gap: 4,
    },
    optionActive: {
      backgroundColor: colors.primary,
    },
    label: {
      fontFamily: FONTS.body,
      fontSize: 11,
      color: colors.text,
    },
    labelActive: {
      color: "#FFFFFF",
      fontFamily: FONTS.heading,
    },
    iconColor: {
      color: colors.text,
    },
  });
