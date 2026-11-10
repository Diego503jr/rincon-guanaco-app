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
import { COLORS, SPACING, RADIUS, FONTS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { getVisitedDestinations } from "../api/services/reviewsService";
import DropDownPicker from "react-native-dropdown-picker";

export default function CreateReviewModal({ visible, onClose, onSuccess }) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  // Estado para controlar los pasos: 'form' (crear) o 'success' (tarjeta de éxito)
  const [step, setStep] = useState('form');

  // Obtener la fecha actual en formato local
  const currentDate = new Date().toLocaleDateString("es-ES");

  useEffect(() => {
    if (visible) {
      setStep('form');
      fetchDestinations();
      setRating(0);
      setComment('');
      setSelectedDestination(null);
    }
  }, [visible]);

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
      console.log("No se pudieron cargar los destinos", error);
    } finally {
      setLoadingDestinations(false);
    }
  };

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

   const handleSubmit = async () => {
    if (rating === 0 || !selectedDestination || comment.trim() === '') {
      alert("Por favor completa todos los campos.");
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const reviewData = {
      destination_id: parseInt(selectedDestination),
      rating: rating,
      comment: comment,
      travel_date: formattedDate,
    };

    try {
      await onSuccess(reviewData);
      setStep('success');
    } catch (error) {
    }
  };

  const handleCloseAll = () => {
    setStep('form');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseAll}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          {step === 'form' ? (
            // --- FORMULARIO DE RESEÑA ---
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
                    handleCloseAll();
                  }}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!selectedDestination || rating === 0) && styles.disabledButton,
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
          ) : (
            // --- TARJETA DE CONFIRMACIÓN DE ÉXITO ---
            <View style={styles.modalContainer}>
              <Text style={styles.successTitle}>¡Reseña Registrada!</Text>

              <View style={styles.successBox}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={50} 
                  color={colors.secondary || colors.primary} 
                  style={{ marginBottom: SPACING.sm }} 
                />
                <Text style={styles.successText}>
                  Gracias, tu reseña se ha registrado exitosamente.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.successButton}
                onPress={handleCloseAll}
              >
                <Text style={styles.submitText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          )}
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
    successTitle: {
      fontFamily: FONTS.heading,
      fontSize: 22,
      color: colors.text,
      textAlign: "center",
      marginBottom: SPACING.md,
      fontWeight: "bold",
    },
    successBox: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: RADIUS.md,
      padding: SPACING.lg,
      marginBottom: SPACING.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    successText: {
      fontFamily: FONTS.body,
      fontSize: 15,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
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
    successButton: {
      backgroundColor: colors.accent,
      paddingVertical: 12,
      borderRadius: RADIUS.md,
      alignItems: "center",
      width: "100%",
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
