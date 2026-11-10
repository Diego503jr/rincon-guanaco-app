import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, SIZES, SPACING, RADIUS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import {
  DaySelector,
  TimeSelector,
  CounterField,
  FieldLabel,
  TotalRow,
} from "./ReservationFields";
import { buildDateTime, parseDateTime, toDateKey } from "../utils/dates";

// Color del botón "Cancelar" de los modales del Figma (igual que ItineraryFormModal)
const CANCEL_COLOR = "#F47C7C";

export default function ActivityReserveModal({
  visible,
  activity,
  initial = null,
  mode = "add",
  loading = false,
  error = null,
  onCancel,
  onSubmit,
}) {
  const { colors, typography } = useTheme(); // para íconos y estilos en línea
  const styles = useThemedStyles(createStyles); // para los estilos

  const [dateKey, setDateKey] = useState(toDateKey(new Date()));
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [people, setPeople] = useState(1);

  // Cada vez que se abre, carga los datos actuales (editar) o valores por defecto (agregar)
  useEffect(() => {
    if (!visible) return;
    const d = parseDateTime(initial?.date_time);
    if (d) {
      setDateKey(initial.date_time.split(" ")[0]);
      setHour(d.hour);
      setMinute(d.minute);
    } else {
      setDateKey(toDateKey(new Date()));
      setHour(8);
      setMinute(0);
    }
    setPeople(initial?.people ?? 1);
  }, [visible, initial]);

  if (!activity) return null;

  const name = activity.name || activity.activity_name || "Actividad";
  const description =
    activity.description || activity.notes || "Sin notas adicionales.";
  const price = Number(activity.price || 0);
  const subtotal = price * people;
  const isEdit = mode === "edit";

  const submit = () => {
    onSubmit({
      date_time: buildDateTime(dateKey, hour, minute),
      people,
      subtotal,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <TouchableOpacity
            style={styles.close}
            onPress={onCancel}
            hitSlop={10}
          >
            <Ionicons name="close" size={22} color={colors.accent} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Detalles de Reserva</Text>

            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="compass-outline"
                  size={22}
                  color={colors.onAccent}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{name}</Text>
                <Text style={typography.small}>
                  ${price.toFixed(2)} por persona
                </Text>
              </View>
            </View>
            <Text style={styles.description}>{description}</Text>

            <FieldLabel>Fecha</FieldLabel>
            <DaySelector value={dateKey} onChange={setDateKey} />

            <FieldLabel>Hora</FieldLabel>
            <TimeSelector
              hour={hour}
              minute={minute}
              onChange={(h, m) => {
                setHour(h);
                setMinute(m);
              }}
            />

            <FieldLabel>Personas</FieldLabel>
            <CounterField
              value={people}
              onChange={setPeople}
              min={1}
              max={50}
            />

            <TotalRow
              amount={subtotal}
              detail={`${people} × $${price.toFixed(2)}`}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: CANCEL_COLOR }]}
                onPress={onCancel}
                disabled={loading}
              >
                <Text style={typography.button}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.accent },
                  loading && styles.disabled,
                ]}
                onPress={submit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.onAccent} />
                ) : (
                  <Text style={typography.button}>
                    {isEdit ? "Actualizar" : "Agregar"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = ({ colors, typography }) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      padding: SPACING.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      maxHeight: "90%",
    },
    close: {
      position: "absolute",
      top: SPACING.md,
      right: SPACING.md,
      zIndex: 1,
    },
    title: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.h2,
      color: colors.primaryText,
      textAlign: "center",
      marginBottom: SPACING.md,
    },
    header: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.h3,
      color: colors.primaryText,
    },
    description: {
      ...typography.body,
      color: colors.textMuted,
      marginTop: SPACING.sm,
    },
    errorText: {
      ...typography.small,
      color: colors.accent,
      marginTop: SPACING.sm,
      textAlign: "center",
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: SPACING.md,
      marginTop: SPACING.lg,
    },
    button: {
      flex: 1,
      height: 44,
      borderRadius: RADIUS.md,
      alignItems: "center",
      justifyContent: "center",
    },
    disabled: { opacity: 0.7 },
  });
