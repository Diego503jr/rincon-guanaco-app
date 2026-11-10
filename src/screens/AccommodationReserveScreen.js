import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, SIZES, SPACING, RADIUS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import {
  DaySelector,
  CounterField,
  FieldLabel,
  TotalRow,
} from "../components/ReservationFields";
import {
  formatTime,
  nightsBetween,
  parseDateTime,
  toDateKey,
} from "../utils/dates";
import { addSelection } from "../store/selectionStore";

// Color del botón "Cancelar" (igual que los modales del equipo)
const CANCEL_COLOR = "#F47C7C";

// "2026-12-05" + 1 -> "2026-12-06"
const addDays = (dateKey, days) => {
  const d = parseDateTime(dateKey);
  return toDateKey(new Date(d.year, d.month - 1, d.day + days));
};

// "14:00:00" -> "2:00 pm"
const hourLabel = (time) => (time ? formatTime(`2000-01-01 ${time}`) : "--");

export default function AccommodationReserveScreen({ route, navigation }) {
  const { accommodation, destination } = route.params || {};
  const { colors, typography } = useTheme(); // para íconos y estilos en línea
  const styles = useThemedStyles(createStyles); // para los estilos

  const today = toDateKey(new Date());
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(addDays(today, 1));
  const [guests, setGuests] = useState(1);

  // Si la entrada queda igual o después de la salida, la salida pasa al día siguiente
  const changeCheckIn = (value) => {
    setCheckIn(value);
    if (checkOut <= value) setCheckOut(addDays(value, 1));
  };

  const price = Number(accommodation?.price || 0);
  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = price * nights;
  const image = accommodation?.image_url || destination?.image_url;

  const add = () => {
    addSelection({
      type: "accommodation",
      refId: accommodation.id,
      name: accommodation.name,
      description: accommodation.address,
      price,
      destination,
      source: accommodation,
      check_in: checkIn,
      check_out: checkOut,
      guests,
      nights,
      subtotal,
    });
    Alert.alert("Agregado", "El alojamiento se agregó a tus Selecciones.");
    navigation.goBack();
  };

  return (
    <View style={styles.mainContainer}>
      {/* BARRA SUPERIOR (igual que el detalle del destino) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.onAccent} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Detalles de Reserva</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {!accommodation ? (
          <Text style={styles.emptyText}>No se encontró el alojamiento.</Text>
        ) : (
          <>
            {/* Imagen del alojamiento (o del destino) */}
            {image ? (
              <Image source={{ uri: image }} style={styles.hero} />
            ) : (
              <View style={[styles.hero, styles.heroPlaceholder]}>
                <Ionicons
                  name="bed-outline"
                  size={48}
                  color={colors.secondary}
                />
              </View>
            )}

            <View style={styles.titleRow}>
              <Text style={styles.title}>{accommodation.name}</Text>
              <Text style={styles.price}>${price.toFixed(2)}</Text>
            </View>
            <Text style={styles.perNight}>
              por noche{accommodation.type ? ` · ${accommodation.type}` : ""}
            </Text>

            {accommodation.address ? (
              <View style={styles.row}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.secondary}
                />
                <Text style={styles.place}>{accommodation.address}</Text>
              </View>
            ) : null}
            <View style={styles.row}>
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.secondary}
              />
              <Text style={styles.place}>
                Entrada {hourLabel(accommodation.check_in)} · Salida{" "}
                {hourLabel(accommodation.check_out)}
              </Text>
            </View>
            {accommodation.contact_phone ? (
              <View style={styles.row}>
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={colors.secondary}
                />
                <Text style={styles.place}>{accommodation.contact_phone}</Text>
              </View>
            ) : null}

            <View style={styles.divider} />

            <FieldLabel>Fecha de entrada</FieldLabel>
            <DaySelector value={checkIn} onChange={changeCheckIn} />

            <FieldLabel>Fecha de salida</FieldLabel>
            <DaySelector
              value={checkOut}
              onChange={setCheckOut}
              days={45}
              minDate={addDays(checkIn, 1)}
            />

            <FieldLabel>Huéspedes</FieldLabel>
            <CounterField
              value={guests}
              onChange={setGuests}
              min={1}
              max={20}
            />

            <TotalRow
              amount={subtotal}
              detail={`${nights} ${nights === 1 ? "noche" : "noches"} × $${price.toFixed(2)}`}
            />

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: CANCEL_COLOR }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={typography.button}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.accent },
                  nights < 1 && { opacity: 0.6 },
                ]}
                onPress={add}
                disabled={nights < 1}
              >
                <Text style={typography.button}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = ({ colors, typography }) =>
  StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: colors.primary },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 45,
      paddingBottom: 12,
    },
    backButton: {
      backgroundColor: colors.accent,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    topBarTitle: {
      color: colors.onAccent,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 12,
    },
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    hero: { width: "100%", height: 180, borderRadius: 16 },
    heroPlaceholder: {
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: SPACING.sm,
      marginTop: SPACING.md,
    },
    title: {
      flex: 1,
      fontFamily: FONTS.heading,
      fontSize: SIZES.h2,
      color: colors.primaryText,
    },
    price: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.h2,
      color: colors.secondary,
    },
    perNight: { ...typography.small, textAlign: "right" },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginTop: SPACING.xs,
    },
    place: { ...typography.body, color: colors.textMuted, flexShrink: 1 },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginTop: SPACING.md,
    },
    actions: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
    button: {
      flex: 1,
      height: 46,
      borderRadius: RADIUS.md,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: SPACING.xl,
    },
  });
