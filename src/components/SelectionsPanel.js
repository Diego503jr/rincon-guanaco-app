import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from "../constants/theme";
import {
  useSelections,
  updateSelection,
  removeSelection,
  getSelectionsTotal,
} from "../store/selectionStore";
import { itineraryService } from "../api/services/itineraryService";
import { getErrorMessage } from "../api/errors";
import { formatLongDate, formatTime } from "../utils/dates";
import ActivityReserveModal from "./ActivityReserveModal";
import AccommodationReserveModal from "./AccommodationReserveModal";
import ItineraryFormModal from "./ItineraryFormModal";

export default function SelectionsPanel({ suggestedTitle = "", onConfirmed }) {
  const navigation = useNavigation();
  const selections = useSelections();
  const total = getSelectionsTotal(selections);

  const [editing, setEditing] = useState(null); // selección que se está editando
  const [naming, setNaming] = useState(false);  // modal para ponerle nombre al viaje
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // ===== Editar (abre el mismo modal de reserva en modo "Actualizar") =====
  const saveEdit = (data) => {
    updateSelection(editing.key, data);
    setEditing(null);
  };

  // ===== Quitar =====
  const confirmRemove = (item) => {
    Alert.alert("¿Quitar de tus selecciones?", `Se quitará "${item.name}".`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Quitar", style: "destructive", onPress: () => removeSelection(item.key) },
    ]);
  };

  // ===== Confirmar Itinerario =====
  // 1) Crea el itinerario  2) Agrega cada actividad y alojamiento  3) Limpia lo que se guardó
  const confirmItinerary = async (title) => {
    setSaving(true);
    setFormError(null);

    let itinerary;
    try {
      const response = await itineraryService.create({ title });
      itinerary = response.itinerary;
    } catch (err) {
      setFormError(getErrorMessage(err));
      setSaving(false);
      return;
    }

    const failed = [];
    for (const item of selections) {
      try {
        if (item.type === "activity") {
          await itineraryService.addActivity(itinerary.id, {
            activity_id: item.refId,
            date_time: item.date_time,
            people: item.people,
          });
        } else {
          await itineraryService.addAccommodation(itinerary.id, {
            accommodation_id: item.refId,
            check_in: item.check_in,
            check_out: item.check_out,
            guests: item.guests,
          });
        }
        removeSelection(item.key); // lo que ya se guardó sale de Selecciones
      } catch (err) {
        failed.push(`• ${item.name}: ${getErrorMessage(err)}`);
      }
    }

    setSaving(false);
    setNaming(false);

    if (failed.length) {
      Alert.alert(
        "Itinerario creado con observaciones",
        `"${title}" se creó, pero no se pudo agregar:\n\n${failed.join("\n")}\n\nLo que falló sigue en tus Selecciones.`,
      );
    } else {
      Alert.alert("¡Itinerario confirmado!", `"${title}" ya está en Mi Itinerario.`);
    }

    if (onConfirmed) onConfirmed(itinerary);
    else navigation.navigate("Itineraries");
  };

  // ===== Datos que se muestran en cada tarjeta =====
  const details = (item) => {
    if (item.type === "activity") {
      return [
        { icon: "calendar-outline", text: formatLongDate(item.date_time) },
        { icon: "time-outline", text: formatTime(item.date_time) },
        { icon: "people-outline", text: `${item.people} ${item.people === 1 ? "persona" : "personas"}` },
      ];
    }
    return [
      { icon: "log-in-outline", text: formatLongDate(item.check_in) },
      { icon: "log-out-outline", text: formatLongDate(item.check_out) },
      {
        icon: "moon-outline",
        text: `${item.nights} ${item.nights === 1 ? "noche" : "noches"} · ${item.guests} ${item.guests === 1 ? "huésped" : "huéspedes"}`,
      },
    ];
  };

  const location = (destination) =>
    destination
      ? [destination.name, destination.municipality].filter(Boolean).join(" · ")
      : null;

  // ===== Sin selecciones =====
  if (selections.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="bookmarks-outline" size={44} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>Aún no has seleccionado actividades ni alojamientos.</Text>
        <Text style={styles.emptyText}>Toca una actividad o un alojamiento para agregarlo.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.heading}>Selecciones ({selections.length})</Text>

      {selections.map((item) => {
        const isActivity = item.type === "activity";
        return (
          <View key={item.key} style={styles.card}>
            <View style={[styles.iconCircle, !isActivity && { backgroundColor: COLORS.primary }]}>
              <Ionicons name={isActivity ? "compass-outline" : "bed-outline"} size={20} color={COLORS.white} />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.price}>${Number(item.subtotal || 0).toFixed(2)}</Text>
              </View>

              {location(item.destination) ? (
                <View style={styles.row}>
                  <Ionicons name="location-outline" size={14} color={COLORS.secondary} />
                  <Text style={styles.cardText} numberOfLines={1}>
                    {location(item.destination)}
                  </Text>
                </View>
              ) : null}

              {details(item).map((d) => (
                <View key={d.icon} style={styles.row}>
                  <Ionicons name={d.icon} size={14} color={COLORS.secondary} />
                  <Text style={styles.cardText}>{d.text}</Text>
                </View>
              ))}

              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => setEditing(item)} hitSlop={8}>
                  <Ionicons name="pencil-outline" size={22} color="#1E88E5" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmRemove(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={22} color="#F2A900" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}

      {/* Total y botón principal */}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total estimado</Text>
        <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, saving && { opacity: 0.7 }]}
        onPress={() => {
          setFormError(null);
          setNaming(true);
        }}
        disabled={saving}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={TYPOGRAPHY.button}>Confirmar Itinerario</Text>
        )}
      </TouchableOpacity>

      {/* Editar una actividad seleccionada */}
      <ActivityReserveModal
        visible={editing?.type === "activity"}
        mode="edit"
        activity={
          editing?.type === "activity"
            ? { id: editing.refId, name: editing.name, description: editing.description, price: editing.price }
            : null
        }
        initial={editing?.type === "activity" ? editing : null}
        onCancel={() => setEditing(null)}
        onSubmit={saveEdit}
      />

      {/* Editar un alojamiento seleccionado */}
      <AccommodationReserveModal
        visible={editing?.type === "accommodation"}
        mode="edit"
        accommodation={
          editing?.type === "accommodation"
            ? editing.source ?? { id: editing.refId, name: editing.name, address: editing.description, price: editing.price }
            : null
        }
        initial={editing?.type === "accommodation" ? editing : null}
        onCancel={() => setEditing(null)}
        onSubmit={saveEdit}
      />

      {/* Ponerle nombre al viaje antes de guardarlo */}
        <ItineraryFormModal
        visible={naming}
        mode="create"
        title="Confirmar Itinerario"
        submitLabel="Confirmar"
        initialTitle={suggestedTitle}
        loading={saving}
        error={formError}
        onCancel={() => !saving && setNaming(false)}
        onSubmit={confirmItinerary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: FONTS.heading, fontSize: SIZES.h3, color: COLORS.primary, marginBottom: SPACING.sm },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, marginLeft: SPACING.md },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: SPACING.sm },
  cardTitle: { flex: 1, fontFamily: FONTS.heading, fontSize: SIZES.body, color: COLORS.primary },
  price: { fontFamily: FONTS.heading, fontSize: SIZES.body, color: COLORS.secondary },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginTop: 4 },
  cardText: { ...TYPOGRAPHY.small, color: COLORS.text, flexShrink: 1 },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", gap: SPACING.md, marginTop: SPACING.xs },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
  },
  totalLabel: { fontFamily: FONTS.heading, fontSize: SIZES.body, color: COLORS.primary },
  totalAmount: { fontFamily: FONTS.heading, fontSize: SIZES.h2, color: COLORS.accent },
  confirmButton: {
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.md,
  },
  empty: { alignItems: "center", padding: SPACING.xl },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textMuted, textAlign: "center", marginTop: SPACING.sm },
});