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
  TimeSelector,
  CounterField,
  FieldLabel,
  TotalRow,
} from "../components/ReservationFields";
import { buildDateTime, toDateKey } from "../utils/dates";
import { addSelection } from "../store/selectionStore";

// Color del botón "Cancelar"
const CANCEL_COLOR = "#F47C7C";

export default function ActivityReserveScreen({ route, navigation }) {
  const { activity, destination } = route.params || {};
  const { colors, typography } = useTheme(); // para íconos y estilos en línea
  const styles = useThemedStyles(createStyles); // para los estilos

  const [dateKey, setDateKey] = useState(toDateKey(new Date()));
  // Hora inicial: 8:00 am, o la siguiente hora en punto si ya pasaron las 8
  const [hour, setHour] = useState(
    Math.min(22, Math.max(8, new Date().getHours() + 1)),
  );
  const [minute, setMinute] = useState(0);
  const [people, setPeople] = useState(1);

  const name = activity?.name || activity?.activity_name || "Actividad";
  const description =
    activity?.description || activity?.notes || "Sin descripción.";
  const price = Number(activity?.price || 0);
  const subtotal = price * people;
  const image = destination?.image_url;
  const place = [destination?.name, destination?.municipality]
    .filter(Boolean)
    .join(" · ");

  const add = () => {
    // No se puede reservar en una fecha y hora que ya pasó
    const [y, m, d] = dateKey.split("-").map(Number);
    if (new Date(y, m - 1, d, hour, minute) < new Date()) {
      Alert.alert(
        "Hora no válida",
        "Elige una fecha y hora que aún no haya pasado.",
      );
      return;
    }

    addSelection({
      type: "activity",
      refId: activity.id,
      name,
      description,
      price,
      destination,
      date_time: buildDateTime(dateKey, hour, minute),
      people,
      subtotal,
    });
    Alert.alert("Agregado", "La actividad se agregó a tus Selecciones.");
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
        {!activity ? (
          <Text style={styles.emptyText}>No se encontró la actividad.</Text>
        ) : (
          <>
            {/* Imagen del destino */}
            {image ? (
              <Image source={{ uri: image }} style={styles.hero} />
            ) : (
              <View style={[styles.hero, styles.heroPlaceholder]}>
                <Ionicons
                  name="compass-outline"
                  size={48}
                  color={colors.secondary}
                />
              </View>
            )}

            <View style={styles.titleRow}>
              <Text style={styles.title}>{name}</Text>
              <Text style={styles.price}>${price.toFixed(2)}</Text>
            </View>
            <Text style={styles.perPerson}>por persona</Text>

            {place ? (
              <View style={styles.row}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.secondary}
                />
                <Text style={styles.place}>{place}</Text>
              </View>
            ) : null}

            <Text style={styles.description}>{description}</Text>

            <View style={styles.divider} />

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

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: CANCEL_COLOR }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={typography.button}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent }]}
                onPress={add}
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
    perPerson: { ...typography.small, textAlign: "right" },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginTop: SPACING.xs,
    },
    place: { ...typography.body, color: colors.textMuted },
    description: {
      ...typography.body,
      color: colors.text,
      marginTop: SPACING.sm,
    },
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
