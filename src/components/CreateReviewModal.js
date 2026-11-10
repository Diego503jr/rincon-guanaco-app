// src/components/CreateReviewModal.js
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, RADIUS, FONTS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { getVisitedDestinations } from "../api/services/reviewsService";
import DropDownPicker from "react-native-dropdown-picker";

export default function CreateReviewModal({ visible, onClose, onSubmit }) {
  const { colors, isDark } = useTheme(); // para íconos y colores en línea
  const styles = useThemedStyles(createStyles); // para los estilos

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  // Obtener la fecha actual en formato local (ej: 03/11/2026)
  const currentDate = new Date().toLocaleDateString("es-ES");

  // Reinicia los campos y carga los destinos al abrir el modal
  useEffect(() => {
    if (visible) {
      fetchDestinations();
      setRating(0);
      setComment("");
      setSelectedDestination("");
    }
  }, [visible]);

  // Obtiene los destinos visitados desde la API y los formatea para el selector
  const fetchDestinations = async () => {
    setLoadingDestinations(true);
    try {
      const data = await getVisitedDestinations();
      const formattedItems = data.map((dest) => ({
        label: dest.name,
        value: dest.id.toString(),
      }));
      setItems(formattedItems);

      if (formattedItems.length > 0) {
        setSelectedDestination(formattedItems[0].value);
      }
    } catch (error) {
      console.log("No se pudieron cargar los destinos");
    } finally {
      setLoadingDestinations(false);
    }
  };

  // Renderiza las estrellas interactivas de calificación
  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons
              name="star"
              size={36}
              color={
                star <= rating
                  ? colors.secondary
                  : isDark
                    ? colors.border
                    : "#D1D5DB"
              }
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Valida los campos y envía la reseña con la fecha actual formateada (YYYY-MM-DD)
  const handleSubmit = () => {
    if (rating === 0 || !selectedDestination || comment.trim() === "") {
      alert("Por favor completa todos los campos.");
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    const reviewData = {
      destination_id: parseInt(selectedDestination),
      rating: rating,
      comment: comment,
      travel_date: formattedDate,
    };

    onSubmit(reviewData);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Al tocar fuera del contenido del modal o en espacios libres, se oculta el teclado */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Reseña</Text>

            {renderStars()}

            {/* Selector de Destinos */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Destino:</Text>
              {loadingDestinations ? (
                <ActivityIndicator size="small" color={colors.secondary} />
              ) : items.length === 0 ? (
                <Text style={styles.emptyText}>
                  No tienes destinos visitados aún.
                </Text>
              ) : (
                <DropDownPicker
                  open={open}
                  value={selectedDestination}
                  items={items}
                  setOpen={setOpen}
                  setValue={setSelectedDestination}
                  setItems={setItems}
                  listMode="SCROLLVIEW"
                  placeholder="Selecciona un destino"
                  theme={isDark ? "DARK" : "LIGHT"}
                  style={{
                    backgroundColor: colors.border,
                    borderWidth: 0,
                    borderRadius: RADIUS.md,
                    height: 50,
                  }}
                  dropDownContainerStyle={{
                    backgroundColor: colors.border,
                    borderWidth: 0,
                    borderRadius: RADIUS.md,
                  }}
                  textStyle={{
                    fontSize: 16,
                    color: colors.text,
                  }}
                  placeholderStyle={{ color: colors.textMuted }}
                  zIndex={3000}
                  zIndexInverse={1000}
                />
              )}
            </View>

            {/* Fecha Actual (solo lectura) */}
            <View style={[styles.fieldContainer, styles.dateContainer]}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.secondary}
              />
              <Text style={styles.dateText}>Fecha: {currentDate}</Text>
            </View>

            {/* Comentario */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Comentario:</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                placeholder="Escribe tu experiencia aquí..."
                placeholderTextColor={colors.textMuted}
                textAlignVertical="top"
              />
            </View>

            {/* Botones */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  Keyboard.dismiss();
                  onClose();
                }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedDestination || rating === 0) &&
                    styles.disabledButton,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  handleSubmit();
                }}
                disabled={!selectedDestination || rating === 0}
              >
                <Text style={styles.submitText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = ({ colors }) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(33, 37, 41, 0.8)", // Fondo oscuro semitransparente
      justifyContent: "center",
      alignItems: "center",
      padding: SPACING.lg,
    },
    modalContainer: {
      backgroundColor: colors.surface,
      width: "100%",
      borderRadius: RADIUS.lg,
      padding: SPACING.xl,
    },
    title: {
      fontFamily: FONTS.heading,
      fontSize: 22,
      color: colors.primaryText,
      textAlign: "center",
      marginBottom: SPACING.md,
      fontWeight: "bold",
    },
    starsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: SPACING.xl,
    },
    starIcon: {
      marginHorizontal: SPACING.xs,
    },
    fieldContainer: {
      marginBottom: SPACING.lg,
    },
    label: {
      fontFamily: FONTS.body,
      fontSize: 16,
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    emptyText: {
      color: colors.textMuted,
      fontStyle: "italic",
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    dateText: {
      fontFamily: FONTS.body,
      fontSize: 16,
      color: colors.text,
      marginLeft: SPACING.sm,
    },
    textArea: {
      backgroundColor: colors.border,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      height: 100,
      fontFamily: FONTS.body,
      fontSize: 14,
      color: colors.text,
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: SPACING.md,
    },
    cancelButton: {
      backgroundColor: colors.btnCancelar,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: RADIUS.md,
      flex: 0.48,
      alignItems: "center",
    },
    cancelText: {
      color: colors.onAccent,
      fontFamily: FONTS.heading,
      fontSize: 16,
      fontWeight: "bold",
    },
    submitButton: {
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: RADIUS.md,
      flex: 0.48,
      alignItems: "center",
    },
    disabledButton: {
      opacity: 0.5,
    },
    submitText: {
      color: colors.onAccent,
      fontFamily: FONTS.heading,
      fontSize: 16,
      fontWeight: "bold",
    },
  });
