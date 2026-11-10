import { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, SIZES, SPACING, RADIUS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { upcomingDays, formatTime, buildDateTime } from "../utils/dates";



// ===== Selector de día: fila horizontal con los próximos días =====
export function DaySelector({ value, onChange, days = 30, minDate = null }) {
  const styles = useThemedStyles(createStyles);
  const options = useMemo(() => upcomingDays(days), [days]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
      {options.map((d) => {
        const selected = d.key === value;
        const disabled = minDate ? d.key < minDate : false;
        return (
          <TouchableOpacity
            key={d.key}
            style={[styles.dayChip, selected && styles.dayChipActive, disabled && styles.disabled]}
            onPress={() => onChange(d.key)}
            disabled={disabled}
          >
            <Text style={[styles.dayWeek, selected && styles.textActive]}>{d.weekday}</Text>
            <Text style={[styles.dayNumber, selected && styles.textActive]}>{d.day}</Text>
            <Text style={[styles.dayMonth, selected && styles.textActive]}>{d.month}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ===== Selector de hora: botones − / + de 30 en 30 minutos (5:00 am a 10:00 pm) =====
const MIN_MINUTES = 5 * 60;
const MAX_MINUTES = 22 * 60;
const STEP = 30;

export function TimeSelector({ hour, minute, onChange }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const total = hour * 60 + minute;

  const move = (delta) => {
    const next = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, total + delta));
    onChange(Math.floor(next / 60), next % 60);
  };

  return (
    <View style={styles.stepper}>
      <TouchableOpacity style={styles.stepButton} onPress={() => move(-STEP)} disabled={total <= MIN_MINUTES}>
        <Ionicons name="remove" size={20} color={total <= MIN_MINUTES ? colors.border : colors.primaryText} />
      </TouchableOpacity>
      <View style={styles.stepValue}>
        <Ionicons name="time-outline" size={16} color={colors.secondary} />
        <Text style={styles.stepText}>{formatTime(buildDateTime("2000-01-01", hour, minute))}</Text>
      </View>
      <TouchableOpacity style={styles.stepButton} onPress={() => move(STEP)} disabled={total >= MAX_MINUTES}>
        <Ionicons name="add" size={20} color={total >= MAX_MINUTES ? colors.border : colors.primaryText} />
      </TouchableOpacity>
    </View>
  );
}

// ===== Contador (personas / huéspedes) =====
export function CounterField({ value, onChange, min = 1, max = 20, icon = "people-outline" }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.stepper}>
      <TouchableOpacity style={styles.stepButton} onPress={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <Ionicons name="remove" size={20} color={value <= min ? colors.border : colors.primaryText} />
      </TouchableOpacity>
      <View style={styles.stepValue}>
        <Ionicons name={icon} size={16} color={colors.secondary} />
        <Text style={styles.stepText}>{value}</Text>
      </View>
      <TouchableOpacity style={styles.stepButton} onPress={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        <Ionicons name="add" size={20} color={value >= max ? colors.border : colors.primaryText} />
      </TouchableOpacity>
    </View>
  );
}

// ===== Etiqueta de cada campo =====
export function FieldLabel({ children }) {
  const styles = useThemedStyles(createStyles);
  return <Text style={styles.label}>{children}</Text>;
}

// ===== Fila "Total a Pagar" =====
export function TotalRow({ label = "Total a Pagar", amount, detail }) {
  const { typography } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.totalBox}>
      <View>
        <Text style={styles.totalLabel}>{label}</Text>
        {detail ? <Text style={typography.small}>{detail}</Text> : null}
      </View>
      <Text style={styles.totalAmount}>${Number(amount || 0).toFixed(2)}</Text>
    </View>
  );
}

const createStyles = ({ colors, typography }) =>
  StyleSheet.create({
    label: { ...typography.body, fontFamily: FONTS.heading, color: colors.primaryText, marginTop: SPACING.md, marginBottom: SPACING.sm },
    dayRow: { gap: SPACING.sm, paddingVertical: 2 },
    dayChip: {
      width: 56,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
    },
    dayChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    dayWeek: { ...typography.small },
    dayNumber: { fontFamily: FONTS.heading, fontSize: SIZES.h3, color: colors.primaryText },
    dayMonth: { ...typography.small },
    textActive: { color: colors.onAccent },
    disabled: { opacity: 0.35 },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primaryText,
      borderRadius: RADIUS.md,
      height: 46,
      overflow: "hidden",
    },
    stepButton: { width: 48, height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceAlt },
    stepValue: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.xs },
    stepText: { fontFamily: FONTS.heading, fontSize: SIZES.h3, color: colors.primaryText },
    totalBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: SPACING.lg,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor: colors.surfaceAlt,
    },
    totalLabel: { fontFamily: FONTS.heading, fontSize: SIZES.body, color: colors.primaryText },
    totalAmount: { fontFamily: FONTS.heading, fontSize: SIZES.h2, color: colors.accent },
  });