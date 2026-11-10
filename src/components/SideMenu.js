import { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, SIZES, SPACING, RADIUS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { useUser } from "../context/UserContext";

const WIDTH = Math.min(300, Dimensions.get("window").width * 0.8);

// "Carlos Mendoza" -> "CM"
const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

// Menú lateral (botón ☰ del encabezado).
// Reúne la navegación principal + opciones que no caben en la barra inferior.
export default function SideMenu({ visible, onClose }) {
  const { colors, isDark } = useTheme(); // para íconos y colores en línea
  const styles = useThemedStyles(createStyles); // para los estilos

  const navigation = useNavigation();
  const route = useRoute();
  const { user, logout } = useUser();
  const slide = useRef(new Animated.Value(-WIDTH)).current;

  // Animación: entra desde la izquierda
  useEffect(() => {
    if (visible) {
      slide.setValue(-WIDTH);
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slide]);

  const go = (screen) => {
    onClose();
    if (route.name !== screen) navigation.navigate(screen);
  };

  const showAbout = () => {
    onClose();
    Alert.alert(
      "Rincón Guanaco",
      "Descubre los destinos de El Salvador, reserva actividades y alojamientos, y arma tu propio itinerario.\n\nVersión 1.0 · ITCA-FEPADE",
    );
  };

  const showHelp = () => {
    onClose();
    Alert.alert(
      "Ayuda",
      '1. Explora un destino y toca una actividad o un alojamiento.\n2. Elige fecha y personas, y toca Agregar.\n3. En la pestaña Selecciones toca "Confirmar Itinerario".\n4. Revisa tus viajes en Mi Itinerario.',
    );
  };

  const confirmLogout = () => {
    onClose();
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: logout },
    ]);
  };

  const mainItems = [
    { icon: "search", label: "Explorar destinos", screen: "Explorer" },
    {
      icon: "briefcase-outline",
      label: "Mi Itinerario",
      screen: "Itineraries",
    },
    {
      icon: "chatbubble-ellipses-outline",
      label: "Reseñas",
      screen: "Reviews",
    },
    { icon: "person-outline", label: "Mi Perfil", screen: "Profile" },
  ];

  const extraItems = [
    {
      icon: "help-circle-outline",
      label: "¿Cómo reservar?",
      onPress: showHelp,
    },
    {
      icon: "information-circle-outline",
      label: "Acerca de",
      onPress: showAbout,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[styles.panel, { transform: [{ translateX: slide }] }]}
        >
          <Pressable style={{ flex: 1 }} onPress={() => {}}>
            {/* Encabezado con el usuario */}
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(user?.name)}</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {user?.name}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {user?.email}
              </Text>
            </View>

            {/* Navegación principal */}
            <View style={styles.section}>
              {mainItems.map((item) => {
                const active = route.name === item.screen;
                return (
                  <TouchableOpacity
                    key={item.screen}
                    style={[styles.item, active && styles.itemActive]}
                    onPress={() => go(item.screen)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={active ? colors.accent : colors.primaryText}
                    />
                    <Text
                      style={[styles.itemText, active && styles.itemTextActive]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* Información */}
            <View style={styles.section}>
              {extraItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.item}
                  onPress={item.onPress}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={colors.primaryText}
                  />
                  <Text style={styles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cerrar sesión (abajo) */}
            <TouchableOpacity style={styles.logout} onPress={confirmLogout}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.accent}
              />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const createStyles = ({ colors, typography, isDark }) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
    panel: {
      width: WIDTH,
      height: "100%",
      backgroundColor: colors.surface,
      borderTopRightRadius: 24,
      borderBottomRightRadius: 24,
      overflow: "hidden",
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: 56,
      paddingBottom: SPACING.lg,
      paddingHorizontal: SPACING.lg,
    },
    avatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: SPACING.sm,
    },
    avatarText: {
      fontFamily: FONTS.heading,
      fontSize: 22,
      color: colors.onAccent,
    },
    name: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.h3,
      color: colors.onAccent,
    },
    email: { ...typography.small, color: "#C9D3DF" },
    section: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      paddingVertical: 12,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.md,
    },
    // El durazno claro fijo se ve mal en oscuro: ahí usa surfaceAlt
    itemActive: { backgroundColor: isDark ? colors.surfaceAlt : "#FDEEE5" },
    itemText: { ...typography.body, color: colors.text },
    itemTextActive: { fontFamily: FONTS.heading, color: colors.accent },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: SPACING.lg,
    },
    logout: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      marginTop: "auto",
      marginBottom: SPACING.xl,
      marginHorizontal: SPACING.sm,
      paddingVertical: 12,
      paddingHorizontal: SPACING.md,
    },
    logoutText: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.body,
      color: colors.accent,
    },
  });
