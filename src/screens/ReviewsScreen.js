import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Text, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MainLayout from '../components/MainLayout';
import ReviewCard from '../components/ReviewCard';
import { getReviews } from '../api/services/reviewsService';
import { SPACING, RADIUS, SHADOWS, FONTS } from '../constants/theme';
import CreateReviewModal from '../components/CreateReviewModal';
import { postReview } from '../api/services/reviewsService';
import ReportReviewModal from '../components/ReportReviewModal';
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";

export default function ReviewsScreen() {
  const route = useRoute();
  const destinationParam = route.params?.destination?.name || '';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Texto escrito en tiempo real en la barra de búsqueda
  const [inputText, setInputText] = useState(destinationParam);

  const { colors, isDark } = useTheme(); // Soportes de color y modo oscuro
  const styles = useThemedStyles(createStyles);

  // Consulta de búsqueda confirmada (aplicada con retraso)
  const [searchQuery, setSearchQuery] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  // Efecto Debounce: Espera 500ms después de que el usuario deja de escribir para actualizar la búsqueda
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(inputText);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [inputText]);

  // Efecto para cargar reseñas cuando cambia la query de búsqueda
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

  // Envía una nueva reseña, recarga la lista y avisa al usuario
  const handleCreateReview = async (reviewData) => {
    try {
      await postReview(reviewData);
      fetchReviews(); 
    } catch (error) {
      console.log("Error al crear reseña:", error.response?.data);
      alert("Hubo un error al publicar tu reseña.");
      throw error; 
    }
  };

  // Abre el modal de reporte guardando el ID de la reseña seleccionada
  const handleOpenReport = (reviewId) => {
    setSelectedReviewId(reviewId);
    setReportModalVisible(true);
  };

  return (
    <MainLayout title="Reseñas">
      <View style={styles.container}>
        {/* Barra de Búsqueda con debounce */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
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
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            renderItem={({ item }) => (
              <ReviewCard review={item} onReportPress={handleOpenReport} />
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {inputText.length > 0
                    ? 'No se encontraron reseñas para tu búsqueda.'
                    : 'Aún no hay reseñas disponibles.'}
                </Text>

                {/* Botón para limpiar filtro cuando hay texto escrito */}
                {inputText.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearFilterButton}
                    onPress={() => setInputText('')}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.clearFilterText}>Limpiar filtro</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}

        {/* Botón Flotante para Agregar Reseña */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={30} color={colors.text} />
        </TouchableOpacity>

        {/* Modal para Crear Reseña */}
        <CreateReviewModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={handleCreateReview}
          isDark={isDark}
          colors={colors}
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
    emptyContainer: {
      alignItems: 'center',
      marginTop: 50,
      paddingHorizontal: SPACING.lg,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 15,
      marginBottom: SPACING.md,
    },
    fab: {
      position: 'absolute',
      bottom: SPACING.lg,
      right: SPACING.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.card,
      zIndex: 999,
      elevation: 10,
    },
    clearFilterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.pill,
      ...SHADOWS.card,
    },
    clearFilterText: {
      color: colors.white,
      fontFamily: FONTS.heading,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });