import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MainLayout from '../components/MainLayout';
import ReviewCard from '../components/ReviewCard';
import { getReviews } from '../api/services/reviewsService';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../constants/theme';
import CreateReviewModal from '../components/CreateReviewModal';
import { postReview } from '../api/services/reviewsService';
import ReportReviewModal from '../components/ReportReviewModal';

export default function ReviewsScreen() {
    const route = useRoute();

    const destinationParam = route.params?.destination?.name || '';

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Texto escrito en tiempo real en la barra de búsqueda
    const [inputText, setInputText] = useState(destinationParam);

    // Consulta de búsqueda confirmada (aplicada con retraso)
    const [searchQuery, setSearchQuery] = useState('');

    const [modalVisible, setModalVisible] = useState(false);

    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);

    // Envía una nueva reseña, cierra el modal, recarga la lista y avisa al usuario
    const handleCreateReview = async (reviewData) => {
        try {
            await postReview(reviewData);
            fetchReviews(); // Actualiza la lista en segundo plano de manera limpia
        } catch (error) {
            console.log("Error al crear reseña:", error.response?.data);
            alert("Hubo un error al publicar tu reseña.");
            throw error; // Evita que avance a la pantalla de éxito si falla la API
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
                    <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Buscar destino o autor..."
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>

                {/* Lista de Reseñas o indicador de carga */}
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
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
                                        <Ionicons name="close-circle-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
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
                    <Ionicons name="add" size={30} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Modal para Crear Reseña */}
                <CreateReviewModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSuccess={handleCreateReview}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: RADIUS.pill,
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 48,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    listContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 80,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: COLORS.textMuted,
        fontSize: 15
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.lg,
        right: SPACING.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.card,
        zIndex: 999,
        elevation: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: SPACING.lg,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: 15,
        marginBottom: SPACING.md,
    },
    clearFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.pill,
        ...SHADOWS.card,
    },
    clearFilterText: {
        color: COLORS.white,
        fontFamily: FONTS.heading,
        fontSize: 14,
        fontWeight: 'bold',
    }
});