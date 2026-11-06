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
import { COLORS, FONTS, SIZES, SPACING, RADIUS, TYPOGRAPHY } from "../constants/theme";
import { DaySelector, CounterField, FieldLabel, TotalRow } from "./ReservationFields";
import { formatTime, nightsBetween, parseDateTime, toDateKey } from "../utils/dates";

// Color del botón "Cancelar" de los modales del Figma (igual que ItineraryFormModal)
const CANCEL_COLOR = "#F47C7C";

// "2026-12-05" + 1 -> "2026-12-06"
const addDays = (dateKey, days) => {
  const d = parseDateTime(dateKey);
  return toDateKey(new Date(d.year, d.month - 1, d.day + days));
};

// "14:00:00" -> "2:00 pm"
const hourLabel = (time) => (time ? formatTime(`2000-01-01 ${time}`) : null);


export default function AccommodationReserveModal({
  visible,
  accommodation,
  initial = null,
  mode = "add",
  loading = false,
  error = null,
  onCancel,
  onSubmit,
}) {
  const today = toDateKey(new Date());
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(addDays(today, 1));
  const [guests, setGuests] = useState(1);

  // Cada vez que se abre, carga los datos actuales (editar) o valores por defecto (agregar)
  useEffect(() => {
    if (!visible) return;
    const start = initial?.check_in ? initial.check_in.split(" ")[0] : today;
    const end = initial?.check_out ? initial.check_out.split(" ")[0] : addDays(start, 1);
    setCheckIn(start);
    setCheckOut(end);
    setGuests(initial?.guests ?? 1);
  }, [visible, initial]);

  if (!accommodation) return null;

  // Si la entrada queda igual o después de la salida, la salida se mueve al día siguiente
  const changeCheckIn = (value) => {
    setCheckIn(value);
    if (checkOut <= value) setCheckOut(addDays(value, 1));
  };

  const price = Number(accommodation.price || 0);
  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = price * nights;
  const isEdit = mode === "edit";

  const schedule = [
    hourLabel(accommodation.check_in) && `Entrada ${hourLabel(accommodation.check_in)}`,
    hourLabel(accommodation.check_out) && `Salida ${hourLabel(accommodation.check_out)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const submit = () => {
    onSubmit({ check_in: checkIn, check_out: checkOut, guests, nights, subtotal });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <TouchableOpacity style={styles.close} onPress={onCancel} hitSlop={10}>
            <Ionicons name="close" size={22} color={COLORS.accent} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Detalles de Reserva</Text>

            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="bed-outline" size={22} color={COLORS.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{accommodation.name || "Alojamiento"}</Text>
                <Text style={TYPOGRAPHY.small}>
                  ${price.toFixed(2)} por noche{accommodation.type ? ` · ${accommodation.type}` : ""}
                </Text>
              </View>
            </View>
            {accommodation.address ? <Text style={styles.description}>{accommodation.address}</Text> : null}
            {schedule ? <Text style={styles.schedule}>{schedule}</Text> : null}

            <FieldLabel>Fecha de entrada</FieldLabel>
            <DaySelector value={checkIn} onChange={changeCheckIn} />

            <FieldLabel>Fecha de salida</FieldLabel>
            <DaySelector value={checkOut} onChange={setCheckOut} days={45} minDate={addDays(checkIn, 1)} />

            <FieldLabel>Huéspedes</FieldLabel>
            <CounterField value={guests} onChange={setGuests} min={1} max={20} />

            <TotalRow
              amount={subtotal}
              detail={`${nights} ${nights === 1 ? "noche" : "noches"} × $${price.toFixed(2)}`}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: CANCEL_COLOR }]}
                onPress={onCancel}
                disabled={loading}
              >
                <Text style={TYPOGRAPHY.button}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: COLORS.accent }, (loading || nights < 1) && styles.disabled]}
                onPress={submit}
                disabled={loading || nights < 1}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={TYPOGRAPHY.button}>{isEdit ? "Actualizar" : "Agregar"}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    maxHeight: "90%",
  },
  close: { position: "absolute", top: SPACING.md, right: SPACING.md, zIndex: 1 },
  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  header: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontFamily: FONTS.heading, fontSize: SIZES.h3, color: COLORS.primary },
  description: { ...TYPOGRAPHY.body, color: COLORS.textMuted, marginTop: SPACING.sm },
  schedule: { ...TYPOGRAPHY.small, color: COLORS.secondary, marginTop: SPACING.xs },
  errorText: { ...TYPOGRAPHY.small, color: COLORS.accent, marginTop: SPACING.sm, textAlign: "center" },
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
  disabled: { opacity: 0.6 },
});