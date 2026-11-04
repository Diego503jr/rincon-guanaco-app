import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../constants/theme';

export default function ReviewCard({ review, onReportPress }) {

    // Formatea la fecha de la API (YYYY-MM-DDTHH:mm:ss) a un formato legible (YYYY/MM/DD)
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const datePart = dateString.split('T')[0];
        return datePart.replace(/-/g, '/');
    };

    return (
        <View style={styles.card}>
            {/* Header con el autor de la reseña y botón para reportar */}
            <View style={styles.header}>
                <Text style={styles.author}>{review.user?.name || 'Usuario'}</Text>
                <TouchableOpacity onPress={() => onReportPress(review.id)}>
                    <Ionicons name="flag" size={20} color="#FF6B6B" />
                </TouchableOpacity>
            </View>

            {/* Destino y fecha de creación */}
            <View style={styles.metaContainer}>
                <Text style={styles.destinationName}>
                    <Ionicons name="location-outline" size={14} color={COLORS.secondary} /> {review.destination?.name || 'Destino general'}
                </Text>
                <Text style={styles.dateText}>{formatDate(review.created_at)}</Text>
            </View>

            {/* Comentario de la reseña */}
            <Text style={styles.text}>{review.comment}</Text>

            {/* Pie de tarjeta con la insignia de calificación */}
            <View style={styles.footer}>
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{review.rating}</Text>
                    <Ionicons name="star" size={16} color={COLORS.white} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.card,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    author: {
        fontFamily: FONTS.heading,
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: SPACING.sm,
    },
    destinationName: {
        fontFamily: FONTS.heading,
        fontSize: 13,
        color: COLORS.secondary,
    },
    dateText: {
        fontFamily: FONTS.body,
        fontSize: 12,
        color: COLORS.textMuted,
    },
    text: {
        fontFamily: FONTS.body,
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
        marginBottom: SPACING.md,
    },
    footer: {
        alignItems: 'flex-end',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: RADIUS.pill,
    },
    ratingText: {
        color: COLORS.white,
        fontWeight: 'bold',
        marginRight: 4,
        fontSize: 14,
    }
});