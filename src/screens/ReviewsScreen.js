import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MainLayout from "../components/MainLayout";
import ReviewCard from "../components/ReviewCard";
import { getReviews } from "../api/services/reviewsService";
import { SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import CreateReviewModal from "../components/CreateReviewModal";
import { postReview } from "../api/services/reviewsService";
import ReportReviewModal from "../components/ReportReviewModal";

export default function ReviewsScreen() {
  const { colors } = useTheme(); // para íconos y colores en línea
  const styles = useThemedStyles(createStyles); // para los estilos
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Texto escrito en tiempo real en la barra de búsqueda
  const [inputText, setInputText] = useState("");

  // Consulta de búsqueda confirmada (aplicada con retraso)
  const [searchQuery, setSearchQuery] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  // Envía una nueva reseña, cierra el modal, recarga la lista y avisa al usuario
  const handleCreateReview = async (reviewData) => {
    try {
      await postReview(reviewData);
      setModalVisible(false);
      fetchReviews();
      alert("¡Reseña publicada con éxito!");
    } catch (error) {
      alert(
        "Error: " +
          JSON.stringify(error.response?.data?.errors || error.message),
      );
    }
  };

  // Abre el modal de reporte guardando el ID de la reseña seleccionada
  const handleOpenReport = (reviewId) => {
    setSelectedReviewId(reviewId);
    setReportModalVisible(true);
  };

  // Efecto Debounce: Espera 500ms después de que el usuario deja de escribir para actualizar la búsqueda
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(inputText);
    }, 500);

    // Limpiamos el temporizador si el usuario sigue escribiendo
    return () => clearTimeout(delayDebounce);
  }, [inputText]);

  // Obtiene las reseñas de la API cada vez que cambia el filtro de búsqueda
  useEffect(() => {
    fetchReviews();
  }, [searchQuery]);

  // Función para obtener las reseñas desde el servicio
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviews(searchQuery);
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Reseñas">
      <View style={styles.container}>
        {/* Barra de Búsqueda con debounce */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Buscar destino o autor..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Lista de Reseñas o indicador de carga */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.accent}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            // Pasamos la función onReportPress a cada ReviewCard
            renderItem={({ item }) => (
              <ReviewCard review={item} onReportPress={handleOpenReport} />
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {inputText.length > 0
                  ? "No se encontraron reseñas para tu búsqueda."
                  : "Aún no hay reseñas disponibles."}
              </Text>
            }
          />
        )}

        {/* Botón Flotante para Agregar Reseña */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={30} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Modal para Crear Reseña */}
        <CreateReviewModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleCreateReview}
        />

        {/* Modal para Reportar Reseña */}
        <ReportReviewModal
          visible={reportModalVisible}
          reviewId={selectedReviewId}
          onClose={() => setReportModalVisible(false)}
        />
      </View>
    </MainLayout>
  );
}

const createStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: RADIUS.pill,
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.lg,
      marginBottom: SPACING.md,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      height: 48,
    },
    searchIcon: {
      marginRight: SPACING.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    listContainer: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: 80,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 50,
      color: colors.textMuted,
      fontSize: 15,
    },
    fab: {
      position: "absolute",
      bottom: SPACING.lg,
      right: SPACING.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      ...SHADOWS.card,
      zIndex: 999,
      elevation: 10,
    },
  });
