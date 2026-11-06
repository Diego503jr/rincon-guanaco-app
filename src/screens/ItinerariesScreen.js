import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "../constants/theme";
import useApi from "../hooks/useApi";
import { itineraryService } from "../api/services/itineraryService";
import { getErrorMessage } from "../api/errors";
import MainLayout from "../components/MainLayout";
import ItineraryFormModal from "../components/ItineraryFormModal";
import ItineraryDetailModal from "../components/ItineraryDetailModal";
import { formatRange } from "../utils/dates";

// Pantalla "Mi Itinerario" (Dev 4): lista de viajes del usuario.
// Usa el MainLayout del equipo (encabezado + barra inferior, pestaña de la maleta).
export default function ItinerariesScreen() {

  const { data, loading, error, execute } = useApi(itineraryService.getAll);
  const itineraries = data ?? [];

  const [tab, setTab] = useState("activities"); // "activities" | "accommodations"
  const [refreshing, setRefreshing] = useState(false);

  // Modal de crear / renombrar
  const [form, setForm] = useState({ visible: false, mode: "create", item: null });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Modal de detalle: { id, tab } del itinerario abierto
  const [detail, setDetail] = useState(null);

  // Recarga la lista cada vez que la pantalla vuelve a mostrarse
  useFocusEffect(
    useCallback(() => {
      execute();
    }, [execute]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await execute();
    setRefreshing(false);
  };

  // ===== Crear / renombrar =====
  const openCreate = () => {
    setFormError(null);
    setForm({ visible: true, mode: "create", item: null });
  };

  const openEdit = (item) => {
    setFormError(null);
    setForm({ visible: true, mode: "edit", item });
  };

  const closeForm = () => setForm((f) => ({ ...f, visible: false }));

  const submitForm = async (title) => {
    setSaving(true);
    setFormError(null);
    try {
      if (form.mode === "edit") {
        await itineraryService.update(form.item.id, { title });
      } else {
        await itineraryService.create({ title });
      }
      closeForm();
      await execute();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ===== Completar / reabrir =====
  const toggleCompleted = (item) => {
    const completing = !item.is_completed;

    Alert.alert(
      completing ? "¿Marcar como completado?" : "¿Marcar como en curso?",
      completing
        ? `"${item.title}" pasará a tus viajes completados.`
        : `"${item.title}" volverá a tus viajes en curso.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              await itineraryService.update(item.id, { is_completed: completing });
              await execute();
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

  // ===== Eliminar =====
  const confirmDelete = (item) => {
    Alert.alert(
      "¿Eliminar itinerario?",
      `Se eliminará "${item.title}" con todas sus actividades y alojamientos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await itineraryService.remove(item.id);
              await execute();
            } catch (err) {
              Alert.alert("Error", getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  // ===== Tarjeta de cada itinerario =====
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, item.is_completed && styles.cardCompleted]}
      onPress={() => setDetail({ id: item.id, tab })}
      activeOpacity={0.85}
    >
      {item.cover_image ? (
        <Image source={{ uri: item.cover_image }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.imagePlaceholder]}>
          <Ionicons name="map-outline" size={32} color={COLORS.secondary} />
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={() => toggleCompleted(item)} hitSlop={10}>
            <Ionicons
              name={item.is_completed ? "checkbox" : "square-outline"}
              size={22}
              color={COLORS.secondary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardText}>{formatRange(item.start_date, item.end_date)}</Text>
        <Text style={styles.cardText} numberOfLines={1}>
          {item.location ?? "Agrega actividades a tu viaje"}
        </Text>
        <Text style={styles.cardText}>
          {item.activities_count} {item.activities_count === 1 ? "actividad" : "actividades"}
          {item.accommodations_count > 0 &&
            ` · ${item.accommodations_count} ${item.accommodations_count === 1 ? "alojamiento" : "alojamientos"}`}
          {` · $${Number(item.total_price).toFixed(2)}`}
        </Text>

        <View style={styles.cardActions}>
          {item.is_completed && <Text style={styles.badge}>Completado</Text>}
          <TouchableOpacity onPress={() => openEdit(item)} hitSlop={8}>
            <Ionicons name="pencil-outline" size={22} color="#1E88E5" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color="#F2A900" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading) return <ActivityIndicator style={styles.empty} color={COLORS.primary} />;
    if (error) return <Text style={[styles.emptyText, { color: COLORS.accent }]}>{error}</Text>;
    if (tab === "accommodations") {
      return (
        <View style={styles.empty}>
          <Ionicons name="bed-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Aún no tienes viajes con alojamiento.</Text>
          <Text style={styles.emptyText}>Reserva uno desde el detalle de un destino.</Text>
        </View>
      );
    }
    return (
      <View style={styles.empty}>
        <Ionicons name="briefcase-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>Aún no tienes itinerarios.</Text>
        <Text style={styles.emptyText}>Crea tu primer viaje con el botón +</Text>
      </View>
    );
  };

  return (
    <MainLayout title="Mi Itinerario">
      {/* Pestañas */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "activities" && styles.tabActive]}
          onPress={() => setTab("activities")}
        >
          <Text style={[styles.tabText, tab === "activities" && styles.tabTextActive]}>
            Actividades
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "accommodations" && styles.tabActive]}
          onPress={() => setTab("accommodations")}
        >
          <Text style={[styles.tabText, tab === "accommodations" && styles.tabTextActive]}>
            Alojamiento
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actividades: todos los viajes · Alojamiento: solo los viajes con alojamiento */}
      <FlatList
        data={
          tab === "accommodations"
            ? itineraries.filter((i) => i.accommodations_count > 0)
            : itineraries
        }
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      />

      {/* Botón flotante: nuevo itinerario */}
      {tab === "activities" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={openCreate}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      )}

      <ItineraryFormModal
        visible={form.visible}
        mode={form.mode}
        initialTitle={form.item?.title ?? ""}
        loading={saving}
        error={formError}
        onCancel={closeForm}
        onSubmit={submitForm}
      />

      {/* Detalle del itinerario (ver, editar, quitar y finalizar) */}
      <ItineraryDetailModal
        itineraryId={detail?.id ?? null}
        initialTab={detail?.tab ?? "activities"}
        onClose={() => setDetail(null)}
        onChanged={execute}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: COLORS.secondary },
  tabText: { fontFamily: FONTS.body, fontSize: SIZES.body, color: COLORS.text },
  tabTextActive: { color: COLORS.white, fontFamily: FONTS.heading },

  list: { padding: SPACING.md, paddingBottom: 96, gap: SPACING.md, flexGrow: 1 },

  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    ...SHADOWS.card,
  },
  cardCompleted: { opacity: 0.75 },
  cardImage: { width: 120, height: 90, borderRadius: RADIUS.sm },
  imagePlaceholder: {
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, marginLeft: SPACING.md },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { flex: 1, fontFamily: FONTS.heading, fontSize: SIZES.h3, color: COLORS.primary },
  cardText: { ...TYPOGRAPHY.small, color: COLORS.text, marginTop: 2 },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  badge: {
    ...TYPOGRAPHY.small,
    color: COLORS.secondary,
    fontFamily: FONTS.heading,
    marginRight: "auto",
  },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textMuted, textAlign: "center", marginTop: SPACING.sm },

  fab: {
    position: "absolute",
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.card,
  },
});