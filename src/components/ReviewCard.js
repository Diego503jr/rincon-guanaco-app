import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, RADIUS, SHADOWS, FONTS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";

export default function ReviewCard({ review, onReportPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const datePart = dateString.split("T")[0];
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.card}>
      {/* Header con el Autor (Izquierda) y Distancia (Derecha) */}
      <View style={styles.header}>
        <Text style={styles.author}>{review.user?.name || "Usuario"}</Text>

        {review.distance !== undefined && review.distance !== null && (
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={12} color="#2A9D8F" />
            <Text style={styles.distanceText}>
              {parseFloat(review.distance).toFixed(1)} km
            </Text>
          </View>
        )}
      </View>

      {/* Meta: Destino (Izquierda) - Fecha y Bandera (Derecha) */}
      <View style={styles.metaContainer}>
        <View style={styles.destinationGroup}>
          <Ionicons name="location-outline" size={14} color={colors.secondary} />
          <Text style={styles.destinationName}>
            {" "}{review.destination?.name || "Destino general"}
          </Text>
        </View>

        <View style={styles.dateAndReportRow}>
          <Text style={styles.dateText}>{formatDate(review.created_at)}</Text>
          <TouchableOpacity onPress={() => onReportPress(review.id)} style={styles.reportBtn}>
            <Ionicons name="flag" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.text}>{review.comment}</Text>

      {/* Footer con calificación */}
      <View style={styles.footer}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{review.rating}</Text>
          <Ionicons name="star" size={16} color={colors.onAccent} />
        </View>
      </View>
    </View>
  );
}

const createStyles = ({ colors, isDark }) => {
  const softGreen = isDark ? colors.secondarySoft : "#E6F7F3";

  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.card,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.xs,
    },
    author: {
      fontFamily: FONTS.heading,
      fontSize: 16,
      color: colors.primaryText,
      fontWeight: "bold",
      flex: 1,
    },
    // CÁPSULAS DE DISTANCIA
    distanceBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: softGreen,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: RADIUS.pill,
      marginLeft: SPACING.sm,
    },
    distanceText: {
      fontSize: 12,
      color: colors.secondary,
      fontWeight: "bold",
      marginLeft: 4,
      fontFamily: FONTS.body,
    },
    metaContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: SPACING.sm,
    },
    destinationGroup: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    destinationName: {
      fontFamily: FONTS.heading,
      fontSize: 13,
      color: colors.secondary,
    },
    dateAndReportRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateText: {
      fontFamily: FONTS.body,
      fontSize: 12,
      color: colors.textMuted,
    },
    reportBtn: {
      marginLeft: 12,
      padding: 4,
    },
    text: {
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: SPACING.md,
    },
    footer: {
      alignItems: "flex-end",
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.secondary,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: RADIUS.pill,
    },
    ratingText: {
      color: colors.onAccent,
      fontWeight: "bold",
      marginRight: 4,
      fontSize: 14,
    },
  });
};