import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, SIZES, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { itineraryService } from "../api/services/itineraryService";
import { getErrorMessage } from "../api/errors";
import { formatLongDate, formatTime } from "../utils/dates";
import ActivityReserveModal from "./ActivityReserveModal";
import AccommodationReserveModal from "./AccommodationReserveModal";

// Modal "Detalle del Itinerario" (Figma: Itinerary Details) (Dev 4).
// Muestra las actividades (por día) y los alojamientos de un viaje, y permite
// editarlos, quitarlos y finalizar (o reabrir) el viaje.
//
// Props:
//  - itineraryId: id del itinerario a mostrar (null = cerrado)
//  - initialTab:  "activities" | "accommodations"
//  - onClose()
//  - onChanged(): se llama cuando algo cambió (para recargar la lista de Mi Itinerario)
export default function ItineraryDetailModal({
  itineraryId,
  initialTab = "activities",
  onClose,
  onChanged,
}) {
  const { colors, typography } = useTheme(); // para íconos y estilos en línea
  const styles = useThemedStyles(createStyles); // para los estilos

  const visible = itineraryId != null;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(initialTab);

  // Edición
  const [editing, setEditing] = useState(null); // { type: "activity" | "accommodation", item }
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const load = useCallback(async () => {
    if (itineraryId == null) return;
    setLoading(true);
    setError(null);
    try {
      setDetail(await itineraryService.getById(itineraryId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [itineraryId]);

  // Cada vez que se abre con otro itinerario, carga su detalle
  useEffect(() => {
    if (visible) {
      setDetail(null);
      setTab(initialTab);
      load();
    }
  }, [visible, itineraryId, initialTab, load]);

  // Después de cualquier cambio: recarga el detalle y avisa a la lista
  const refresh = async () => {
    await load();
    if (onChanged) onChanged();
  };

  // ===== Editar actividad / alojamiento =====
  const openEdit = (type, item) => {
    setEditError(null);
    setEditing({ type, item });
  };

  const saveEdit = async (data) => {
    setSaving(true);
    setEditError(null);
    try {
      if (editing.type === "activity") {
        await itineraryService.updateActivity(itineraryId, editing.item.id, {
          date_time: data.date_time,
          people: data.people,
        });
      } else {
        await itineraryService.updateAccommodation(
          itineraryId,
          editing.item.id,
          {
            check_in: data.check_in,
            check_out: data.check_out,
            guests: data.guests,
          },
        );
      }
      setEditing(null);
      await refresh();
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ===== Quitar actividad / alojamiento =====
  const confirmRemove = (type, item) => {
    const name = type === "activity" ? item.title : item.name;
    Alert.alert(
      "¿Quitar del itinerario?",
      `Se quitará "${name}" de este viaje.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar",
          style: "destructive",
          onPress: async () => {
            try {
              if (type === "activity")
                await itineraryService.removeActivity(itineraryId, item.id);
              else
                await itineraryService.removeAccommodation(
                  itineraryId,
                  item.id,
                );
              await refresh();
            } catch (err) {
              Alert.alert("Error", getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  // ===== Finalizar / reabrir viaje =====
  const toggleCompleted = () => {
    const completing = !detail.is_completed;
    Alert.alert(
      completing ? "¿Finalizar viaje?" : "¿Reabrir viaje?",
      completing
        ? `"${detail.title}" pasará a tus viajes completados.`
        : `"${detail.title}" volverá a tus viajes en curso.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              await itineraryService.update(itineraryId, {
                is_completed: completing,
              });
              await refresh();
              if (completing) {
                Alert.alert(
                  "Itinerario Completado",
                  "Esperamos hayas disfrutado de tus actividades.",
                );
              }
            } catch (err) {
              Alert.alert("Error", getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  const days = detail?.days ?? [];
  const stays = detail?.accommodations ?? [];
  const activitiesCount = days.reduce((sum, d) => sum + d.activities.length, 0);

  // ===== Tarjeta de una actividad =====
  const renderActivity = (item) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.timeBox}>
        <Text style={styles.timeText}>{formatTime(item.date_time)}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.price}>
            ${Number(item.subtotal || 0).toFixed(2)}
          </Text>
        </View>
        {item.location ? (
          <View style={styles.row}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.secondary}
            />
            <Text style={styles.cardText} numberOfLines={2}>
              {item.location}
            </Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Ionicons name="people-outline" size={14} color={colors.secondary} />
          <Text style={styles.cardText}>
            {item.people} {item.people === 1 ? "persona" : "personas"}
          </Text>
        </View>
        {!detail.is_completed && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => openEdit("activity", item)}
              hitSlop={8}
            >
              <Ionicons name="pencil-outline" size={22} color="#1E88E5" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmRemove("activity", item)}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={22} color="#F2A900" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  // ===== Tarjeta de un alojamiento =====
  const renderStay = (item) => (
    <View key={item.id} style={styles.card}>
      <View style={[styles.iconCircle]}>
        <Ionicons name="bed-outline" size={20} color={colors.onAccent} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>
            ${Number(item.total_price || 0).toFixed(2)}
          </Text>
        </View>
        {item.location ? (
          <View style={styles.row}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.secondary}
            />
            <Text style={styles.cardText} numberOfLines={2}>
              {item.location}
            </Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Ionicons name="log-in-outline" size={14} color={colors.secondary} />
          <Text style={styles.cardText}>
            {formatLongDate(item.check_in)} · {formatTime(item.check_in)}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="log-out-outline" size={14} color={colors.secondary} />
          <Text style={styles.cardText}>
            {formatLongDate(item.check_out)} · {formatTime(item.check_out)}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="moon-outline" size={14} color={colors.secondary} />
          <Text style={styles.cardText}>
            {item.nights} {item.nights === 1 ? "noche" : "noches"} ·{" "}
            {item.guests} {item.guests === 1 ? "huésped" : "huéspedes"}
          </Text>
        </View>
        {!detail.is_completed && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => openEdit("accommodation", item)}
              hitSlop={8}
            >
              <Ionicons name="pencil-outline" size={22} color="#1E88E5" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmRemove("accommodation", item)}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={22} color="#F2A900" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmpty = (icon, text) => (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={colors.textMuted} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={20} color={colors.onAccent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {detail?.title ?? "Detalle del Itinerario"}
          </Text>
        </View>

        <View style={styles.sheet}>
          {loading && !detail ? (
            <ActivityIndicator style={styles.empty} color={colors.accent} />
          ) : error ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.accent }]}>
                {error}
              </Text>
              <TouchableOpacity onPress={load}>
                <Text style={styles.link}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : detail ? (
            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Resumen */}
              <View style={styles.summary}>
                <View>
                  <Text style={typography.small}>Total del viaje</Text>
                  <Text style={styles.total}>
                    ${Number(detail.total_price || 0).toFixed(2)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.status,
                    detail.is_completed && styles.statusDone,
                  ]}
                >
                  <Ionicons
                    name={
                      detail.is_completed ? "checkmark-circle" : "time-outline"
                    }
                    size={16}
                    color={
                      detail.is_completed ? colors.onAccent : colors.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.statusText,
                      detail.is_completed && { color: colors.onAccent },
                    ]}
                  >
                    {detail.is_completed ? "Completado" : "En curso"}
                  </Text>
                </View>
              </View>

              {/* Pestañas */}
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[styles.tab, tab === "activities" && styles.tabActive]}
                  onPress={() => setTab("activities")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      tab === "activities" && styles.tabTextActive,
                    ]}
                  >
                    Actividades ({activitiesCount})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    tab === "accommodations" && styles.tabActive,
                  ]}
                  onPress={() => setTab("accommodations")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      tab === "accommodations" && styles.tabTextActive,
                    ]}
                  >
                    Alojamiento ({stays.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {tab === "activities"
                ? days.length === 0
                  ? renderEmpty(
                      "compass-outline",
                      "Este viaje aún no tiene actividades.",
                    )
                  : days.map((day) => (
                      <View key={day.date} style={styles.day}>
                        <Text style={styles.dayTitle}>
                          {day.label} ·{" "}
                          <Text style={styles.dayDate}>
                            {formatLongDate(day.date)}
                          </Text>
                        </Text>
                        {day.activities.map(renderActivity)}
                      </View>
                    ))
                : stays.length === 0
                  ? renderEmpty(
                      "bed-outline",
                      "Este viaje aún no tiene alojamientos.",
                    )
                  : stays.map(renderStay)}

              {/* Finalizar / reabrir */}
              <TouchableOpacity
                style={[
                  styles.mainButton,
                  detail.is_completed && styles.mainButtonOutline,
                ]}
                onPress={toggleCompleted}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={detail.is_completed ? "refresh" : "checkmark-done"}
                  size={20}
                  color={
                    detail.is_completed ? colors.secondary : colors.onAccent
                  }
                />
                <Text
                  style={[
                    typography.button,
                    detail.is_completed && { color: colors.secondary },
                  ]}
                >
                  {detail.is_completed ? "Reabrir viaje" : "Finalizar viaje"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : null}
        </View>

        {/* Editar actividad */}
        <ActivityReserveModal
          visible={editing?.type === "activity"}
          mode="edit"
          activity={
            editing?.type === "activity"
              ? {
                  id: editing.item.activity_id,
                  name: editing.item.title,
                  description: editing.item.activity?.notes,
                  price: editing.item.activity?.price,
                }
              : null
          }
          initial={editing?.type === "activity" ? editing.item : null}
          loading={saving}
          error={editError}
          onCancel={() => setEditing(null)}
          onSubmit={saveEdit}
        />

        {/* Editar alojamiento */}
        <AccommodationReserveModal
          visible={editing?.type === "accommodation"}
          mode="edit"
          accommodation={
            editing?.type === "accommodation"
              ? {
                  id: editing.item.accommodation_id,
                  name: editing.item.name,
                  type: editing.item.type,
                  address: editing.item.location,
                  price: editing.item.price_per_night,
                }
              : null
          }
          initial={editing?.type === "accommodation" ? editing.item : null}
          loading={saving}
          error={editError}
          onCancel={() => setEditing(null)}
          onSubmit={saveEdit}
        />
      </View>
    </Modal>
  );
}

const createStyles = ({ colors, typography }) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.md,
      paddingTop: 45,
      paddingBottom: SPACING.md,
    },
    backButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      marginLeft: SPACING.md,
      fontFamily: FONTS.heading,
      fontSize: SIZES.h3,
      color: colors.onAccent,
    },
    sheet: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: "hidden",
    },
    scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },

    summary: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      ...SHADOWS.card,
    },
    total: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.h1,
      color: colors.accent,
    },
    status: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      paddingVertical: 6,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    statusDone: { backgroundColor: colors.secondary },
    statusText: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.small,
      color: colors.secondary,
    },

    tabs: { flexDirection: "row", gap: SPACING.sm, marginVertical: SPACING.md },
    tab: {
      flex: 1,
      height: 36,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    tabActive: { backgroundColor: colors.secondary },
    tabText: {
      fontFamily: FONTS.body,
      fontSize: SIZES.body,
      color: colors.text,
    },
    tabTextActive: { color: colors.onAccent, fontFamily: FONTS.heading },

    day: { marginBottom: SPACING.sm },
    dayTitle: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.h3,
      color: colors.primaryText,
      marginBottom: SPACING.sm,
    },
    dayDate: {
      fontFamily: FONTS.body,
      fontSize: SIZES.body,
      color: colors.textMuted,
    },

    card: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.card,
    },
    timeBox: {
      minWidth: 64,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: RADIUS.sm,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      alignSelf: "flex-start",
    },
    timeText: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.small,
      color: colors.primaryText,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: { flex: 1, marginLeft: SPACING.md },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: SPACING.sm,
    },
    cardTitle: {
      flex: 1,
      fontFamily: FONTS.heading,
      fontSize: SIZES.body,
      color: colors.primaryText,
    },
    price: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.body,
      color: colors.secondary,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginTop: 4,
    },
    cardText: { ...typography.small, color: colors.text, flexShrink: 1 },
    cardActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: SPACING.md,
      marginTop: SPACING.xs,
    },

    mainButton: {
      flexDirection: "row",
      gap: SPACING.sm,
      height: 48,
      borderRadius: RADIUS.md,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: SPACING.md,
    },
    mainButtonOutline: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.secondary,
    },

    empty: {
      alignItems: "center",
      justifyContent: "center",
      padding: SPACING.xl,
    },
    emptyText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: SPACING.sm,
    },
    link: {
      fontFamily: FONTS.heading,
      color: colors.accent,
      marginTop: SPACING.md,
    },
  });
