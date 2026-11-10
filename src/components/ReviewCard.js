import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, RADIUS, SHADOWS, FONTS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";

export default function ReviewCard({ review, onReportPress }) {
  const { colors } = useTheme(); // para íconos y colores en línea
  const styles = useThemedStyles(createStyles); // para los estilos

  // Formatea la fecha de la API (YYYY-MM-DDTHH:mm:ss) a un formato legible (YYYY/MM/DD)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const datePart = dateString.split("T")[0];
    return datePart.replace(/-/g, "/");
  };

  return (
    <View style={styles.card}>
      {/* Header con el autor de la reseña y botón para reportar */}
      <View style={styles.header}>
        <Text style={styles.author}>{review.user?.name || "Usuario"}</Text>
        <TouchableOpacity onPress={() => onReportPress(review.id)}>
          <Ionicons name="flag" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Destino y fecha de creación */}
      <View style={styles.metaContainer}>
        <Text style={styles.destinationName}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.secondary}
          />{" "}
          {review.destination?.name || "Destino general"}
        </Text>
        <Text style={styles.dateText}>{formatDate(review.created_at)}</Text>
      </View>

      {/* Comentario de la reseña */}
      <Text style={styles.text}>{review.comment}</Text>

      {/* Pie de tarjeta con la insignia de calificación */}
      <View style={styles.footer}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{review.rating}</Text>
          <Ionicons name="star" size={16} color={colors.onAccent} />
        </View>
      </View>
    </View>
  );
}

const createStyles = ({ colors }) =>
  StyleSheet.create({
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
    destinationName: {
      fontFamily: FONTS.heading,
      fontSize: 13,
      color: colors.secondary,
    },
    dateText: {
      fontFamily: FONTS.body,
      fontSize: 12,
      color: colors.textMuted,
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
