import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SIZES,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
} from "../constants/theme";

// Color del botón "Cancelar" de los modales del Figma
const CANCEL_COLOR = "#F47C7C";

// Modal para crear o renombrar un itinerario (solo pide el título)
export default function ItineraryFormModal({
  visible,
  initialTitle = "",
  mode = "create", // "create" | "edit"
  title: customTitle = null, // opcional: título del modal
  submitLabel: customLabel = null, // opcional: texto del botón principal
  loading = false,
  error = null,
  onCancel,
  onSubmit,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [localError, setLocalError] = useState(null);

  // Cada vez que se abre, carga el título actual (o vacío)
  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setLocalError(null);
    }
  }, [visible, initialTitle]);

  const submit = () => {
    if (!title.trim()) {
      setLocalError("Escribe un nombre para tu itinerario.");
      return;
    }
    onSubmit(title.trim());
  };

  const isEdit = mode === "edit";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <TouchableOpacity
            style={styles.close}
            onPress={onCancel}
            hitSlop={10}
          >
            <Ionicons name="close" size={22} color={COLORS.accent} />
          </TouchableOpacity>

          <Text style={styles.title}>
            {customTitle ?? (isEdit ? "Editar Itinerario" : "Nuevo Itinerario")}
          </Text>

          <Text style={styles.label}>Nombre del viaje</Text>
          <TextInput
            style={[styles.input, (localError || error) && styles.inputError]}
            placeholder="Ej. Itinerario Playa"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setLocalError(null);
            }}
            maxLength={150}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          {(localError || error) && (
            <Text style={styles.errorText}>{localError || error}</Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: CANCEL_COLOR }]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={TYPOGRAPHY.button}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: COLORS.accent },
                loading && styles.disabled,
              ]}
              onPress={submit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={TYPOGRAPHY.button}>
                  {customLabel ?? (isEdit ? "Actualizar" : "Agregar")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  close: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  label: { ...TYPOGRAPHY.body, marginBottom: SPACING.sm },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  inputError: { borderColor: COLORS.accent },
  errorText: {
    ...TYPOGRAPHY.small,
    color: COLORS.accent,
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.7 },
});
