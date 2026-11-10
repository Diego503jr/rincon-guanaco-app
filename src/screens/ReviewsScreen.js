import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MainLayout from '../components/MainLayout';
import ReviewCard from '../components/ReviewCard';
import { getReviews, postReview } from '../api/services/reviewsService';
import { SPACING, RADIUS, SHADOWS, FONTS } from '../constants/theme';
import CreateReviewModal from '../components/CreateReviewModal';
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
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para filtros
  const [isNearbyActive, setIsNearbyActive] = useState(false);
  const [travelerType, setTravelerType] = useState('Todos');
  const categories = ['Todos', 'Mochilero', 'Pareja', 'Familia'];

  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  // Efecto Debounce para la búsqueda
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(inputText);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [inputText]);

  // Efecto para cargar reseñas cuando cambia la búsqueda o los filtros
  useEffect(() => {
    fetchReviews();
  }, [searchQuery, isNearbyActive, travelerType]);

  // Función para obtener las reseñas desde el servicio
  const fetchReviews = async () => {
    setLoading(true);
    try {
      let lat = null;
      let lng = null;

      // Obtener ubicación si el filtro de cercanía está activo
      if (isNearbyActive) {
        let { status } = await Location.requestForegroundPermissionsAsync();

        // Coordenadas por defecto (San Salvador)
        lat = 13.6929;
        lng = -89.2182;

        if (status === 'granted') {
          try {
            let currentLocation = await Promise.race([
              Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout GPS')), 4000))
            ]);
            lat = currentLocation.coords.latitude;
            lng = currentLocation.coords.longitude;
          } catch (locationError) {
            console.log("No se pudo obtener el GPS, usando ubicación por defecto.");
          }
        }
      }

      // Envío de parámetros a getReviews
      const data = await getReviews(searchQuery, travelerType, isNearbyActive, lat, lng);
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenReport = (reviewId) => {
    setSelectedReviewId(reviewId);
    setReportModalVisible(true);
  };

  const clearAllFilters = () => {
    setInputText('');
    setIsNearbyActive(false);
    setTravelerType('Todos');
  };
  // Manejar la activación/desactivación del modo cercano con alerta
  const handleToggleNearby = () => {
    // Si ya está activo, simplemente lo apagamos
    if (isNearbyActive) {
      setIsNearbyActive(false);
      return;
    }

    // Si está apagado, le preguntamos al usuario si desea encenderlo
    Alert.alert(
      "Buscar reseñas cercanas",
      "¿Deseas ordenar los destinos basándose en tu ubicación GPS actual?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí, buscar",
          onPress: () => {
            // Al cambiar el estado a true se pedirá los permisos GPS, obtendrá 
            // las coordenadas y ejecutará la búsqueda en Laravel.
            setIsNearbyActive(true);
          },
        },
      ]
    );
  };

  return (
    <MainLayout title="Reseñas">
      <View style={styles.container}>

        {/* Barra de Búsqueda y Botón de Ubicación */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar destino o autor..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
            />

            {/* Botón x para limpiar búsqueda */}
            {inputText.length > 0 && (
              <TouchableOpacity
                onPress={() => setInputText('')}
                style={styles.clearIconContainer}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.locationButton,
              isNearbyActive && styles.locationButtonActive,
            ]}
            onPress={handleToggleNearby}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isNearbyActive ? "location" : "location-outline"}
              size={22}
              color={isNearbyActive ? colors.onAccent : colors.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Filtros de Tipo de Viajero (Cápsulas) */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pill,
                  travelerType === cat && styles.pillActive
                ]}
                onPress={() => setTravelerType(cat)}
              >
                <Text style={[
                  styles.pillText,
                  travelerType === cat && styles.pillTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Banner de Cercanía */}
        {isNearbyActive && (
          <View style={styles.activeNearbyBanner}>
            <Text style={styles.activeNearbyText}>
              Mostrando reseñas ordenadas por cercanía a tu ubicación
            </Text>
            <TouchableOpacity onPress={() => setIsNearbyActive(false)}>
              <Text style={styles.clearNearbyText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
        )}

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
                  {inputText.length > 0 || travelerType !== 'Todos' || isNearbyActive
                    ? 'No se encontraron reseñas para tu búsqueda.'
                    : 'Aún no hay reseñas disponibles.'}
                </Text>

                {/* Botón para limpiar cualquier filtro activo */}
                {(inputText.length > 0 || travelerType !== 'Todos' || isNearbyActive) && (
                  <TouchableOpacity
                    style={styles.clearFilterButton}
                    onPress={clearAllFilters}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.clearFilterText}>Limpiar filtros</Text>
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

        {/* Modales */}
        <CreateReviewModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={handleCreateReview}
          isDark={isDark}
          colors={colors}
        />
        <ReportReviewModal
          visible={reportModalVisible}
          reviewId={selectedReviewId}
          onClose={() => setReportModalVisible(false)}
        />
      </View>
    </MainLayout>
  );
}

const createStyles = ({ colors, isDark }) => {
  const softGreen = isDark ? colors.secondarySoft : "#E2F9F1";
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
    },
    // BÚSQUEDA Y BOTÓN DE PIN
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.lg,
      marginBottom: SPACING.md,
    },
    searchContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: '#F4F6F8',
      borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.md,
      height: 48,
      marginRight: SPACING.sm,
    },
    searchIcon: {
      marginRight: SPACING.sm,
    },
    searchInput: {
      flex: 1,
      fontFamily: FONTS.body,
      fontSize: 16,
      color: isDark ? '#1F2937' : colors.text,
    },
    // ESTILO PARA LA "X" 
    clearIconContainer: {
      padding: 4,
      marginRight: SPACING.xs,
      justifyContent: 'center',
    },
    locationButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: softGreen,
      justifyContent: "center",
      alignItems: "center",
    },
    locationButtonActive: {
      backgroundColor: colors.secondary,
    },
    // ESTILOS DE FILTROS TIPO VIAJERO (Pills) 
    filtersContainer: {
      marginBottom: SPACING.sm,
    },
    filtersScroll: {
      paddingHorizontal: SPACING.lg,
    },
    pill: {
      backgroundColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 25,
      marginRight: SPACING.sm,
    },
    pillActive: {
      backgroundColor: colors.secondary,
    },
    pillText: {
      color: colors.textMuted,
      fontFamily: FONTS.body,
      fontSize: 14,
      fontWeight: '600',
    },
    pillTextActive: {
      color: colors.onAccent,
    },
    // BANNER "MOSTRANDO RESEÑAS"
    activeNearbyBanner: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: softGreen,
      paddingHorizontal: SPACING.md,
      paddingVertical: 12,
      marginHorizontal: SPACING.lg,
      borderRadius: RADIUS.sm,
      marginBottom: SPACING.sm,
    },
    activeNearbyText: {
      fontFamily: FONTS.body,
      fontSize: 13,
      color: isDark ? colors.text : "#1F4E47",
      flex: 1,
      lineHeight: 18,
    },
    clearNearbyText: {
      fontFamily: FONTS.heading,
      fontSize: 13,
      color: colors.secondary,
      fontWeight: 'bold',
      marginLeft: SPACING.md,
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
};
