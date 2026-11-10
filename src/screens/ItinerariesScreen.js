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
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, SIZES, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import useApi from "../hooks/useApi";
import { itineraryService } from "../api/services/itineraryService";
import { getErrorMessage } from "../api/errors";
import MainLayout from "../components/MainLayout";
import ItineraryFormModal from "../components/ItineraryFormModal";
import ItineraryDetailModal from "../components/ItineraryDetailModal";
import { formatRange } from "../utils/dates";

export default function ItinerariesScreen() {
  const { colors } = useTheme(); // para íconos y colores en línea
  const styles = useThemedStyles(createStyles); // para los estilos
  const { data, loading, error, execute } = useApi(itineraryService.getAll);
  const itineraries = data ?? [];

  const [tab, setTab] = useState("activities"); // "activities" | "accommodations"
  const [refreshing, setRefreshing] = useState(false);

  // Estado para el ordenamiento ("recent" | "oldest")
  const [sortBy, setSortBy] = useState("recent");

  // Modal de crear / renombrar
  const [form, setForm] = useState({
    visible: false,
    mode: "create",
    item: null,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Modal de detalle
  const [detail, setDetail] = useState(null);

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

  // ===== Lógica de Ordenamiento =====
  const getSortedItineraries = () => {
    const baseList =
      tab === "accommodations"
        ? itineraries.filter((i) => i.accommodations_count > 0)
        : itineraries;

    return [...baseList].sort((a, b) => {
      const dateA = new Date(a.start_date ?? a.created_at ?? 0);
      const dateB = new Date(b.start_date ?? b.created_at ?? 0);

      if (sortBy === "recent") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  };

  const openCreate = () => {
    setFormError(null);
    setForm({ visible: true, mode: "create", item: null });
  };

  const openEdit = (item) => {
    if (item.is_completed) return;
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
              await itineraryService.update(item.id, {
                is_completed: completing,
              });
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

  const confirmDelete = (item) => {
    if (item.is_completed) return;
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

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.is_completed && styles.cardCompleted]}>
      {/* 1. ENCABEZADO: Si está completado, el botón del checkbox está deshabilitado */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => toggleCompleted(item)}
          hitSlop={10}
          disabled={item.is_completed} // <-- Desactiva el clic en el checkbox si ya está completado
        >
          <Ionicons
            name={item.is_completed ? "checkbox" : "square-outline"}
            size={22}
            color={item.is_completed ? colors.textMuted : colors.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* 2. CONTENIDO INFERIOR */}
      <View style={styles.cardBodyContainer}>
        {item.cover_image ? (
          <Image source={{ uri: item.cover_image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.imagePlaceholder]}>
            <Ionicons name="map-outline" size={32} color={colors.secondary} />
          </View>
        )}

        <View style={styles.cardBody}>
          <Text style={styles.cardText}>
            {formatRange(item.start_date, item.end_date)}
          </Text>
          <Text style={styles.cardText} numberOfLines={1}>
            {item.location ?? "Agrega actividades a tu viaje"}
          </Text>
          <Text style={styles.cardText}>
            {item.activities_count}{" "}
            {item.activities_count === 1 ? "actividad" : "actividades"}
            {item.accommodations_count > 0 &&
              ` · ${item.accommodations_count} ${item.accommodations_count === 1 ? "alojamiento" : "alojamientos"}`}
            {` · $${Number(item.total_price).toFixed(2)}`}
          </Text>

          <View style={styles.cardActions}>
            {item.is_completed && <Text style={styles.badge}>Completado</Text>}

            {/* Si está completado, se ocultan por completo los botones de editar y eliminar */}
            {!item.is_completed && (
              <>
                <TouchableOpacity
                  onPress={() => setDetail({ id: item.id, tab })}
                  hitSlop={8}
                >
                  <Ionicons name="pencil-outline" size={22} color="#1E88E5" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmDelete(item)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={22} color="#F2A900" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading)
      return <ActivityIndicator style={styles.empty} color={colors.accent} />;
    if (error)
      return (
        <Text style={[styles.emptyText, { color: colors.accent }]}>
          {error}
        </Text>
      );
    if (tab === "accommodations") {
      return (
        <View style={styles.empty}>
          <Ionicons name="bed-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            Aún no tienes viajes con alojamiento.
          </Text>
          <Text style={styles.emptyText}>
            Reserva uno desde el detalle de un destino.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.empty}>
        <Ionicons name="briefcase-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyText}>Aún no tienes itinerarios.</Text>
      </View>
    );
  };

  return (
    <MainLayout title="Mi Itinerario">
      {/* Barra de Filtros de Orden */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              sortBy === "recent" && styles.filterChipActive,
            ]}
            onPress={() => setSortBy("recent")}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={sortBy === "recent" ? colors.onAccent : colors.text}
            />
            <Text
              style={[
                styles.filterText,
                sortBy === "recent" && styles.filterTextActive,
              ]}
            >
              Más recientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              sortBy === "oldest" && styles.filterChipActive,
            ]}
            onPress={() => setSortBy("oldest")}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={sortBy === "oldest" ? colors.onAccent : colors.text}
            />
            <Text
              style={[
                styles.filterText,
                sortBy === "oldest" && styles.filterTextActive,
              ]}
            >
              Más antiguos
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={getSortedItineraries()}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
          />
        }
      />

      <ItineraryFormModal
        visible={form.visible}
        mode={form.mode}
        initialTitle={form.item?.title ?? ""}
        loading={saving}
        error={formError}
        onCancel={closeForm}
        onSubmit={submitForm}
      />

      <ItineraryDetailModal
        itineraryId={detail?.id ?? null}
        initialTab={detail?.tab ?? "activities"}
        onClose={() => setDetail(null)}
        onChanged={execute}
      />
    </MainLayout>
  );
}

const createStyles = ({ colors, typography }) =>
  StyleSheet.create({
    filterContainer: {
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    filterScroll: {
      paddingHorizontal: SPACING.md,
      gap: SPACING.sm,
      alignItems: "center",
    },
    filterChip: {
      flexDirection: "row",
      gap: 6,
      paddingHorizontal: 35,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    filterText: {
      fontFamily: FONTS.body,
      fontSize: SIZES.small,
      color: colors.text,
    },
    filterTextActive: {
      color: colors.onAccent,
      fontFamily: FONTS.heading,
    },
    list: {
      padding: SPACING.md,
      paddingBottom: 96,
      gap: SPACING.md,
      flexGrow: 1,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.card,
    },
    cardCompleted: { opacity: 0.6 },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: SPACING.sm,
    },
    cardTitle: {
      flex: 1,
      fontFamily: FONTS.heading,
      fontSize: SIZES.h3,
      color: colors.primaryText,
      marginRight: SPACING.xs,
    },
    cardBodyContainer: {
      flexDirection: "row",
    },
    cardImage: {
      width: 110,
      height: 95,
      borderRadius: RADIUS.sm,
    },
    imagePlaceholder: {
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: {
      flex: 1,
      marginLeft: SPACING.sm,
      justifyContent: "space-between",
    },
    cardText: {
      ...typography.small,
      color: colors.text,
      marginTop: 2,
    },
    cardActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: SPACING.md,
      marginTop: SPACING.xs,
    },
    badge: {
      ...typography.small,
      color: colors.secondary,
      fontFamily: FONTS.heading,
      marginRight: "auto",
    },
    empty: {
      flex: 1,
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
  });
