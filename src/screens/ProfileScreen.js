import { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, SIZES, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { itineraryService } from "../api/services/itineraryService";
import MainLayout from "../components/MainLayout";
import ThemeToggle from "../components/ThemeToggle";

// Etiqueta e ícono de cada tipo de viajero
const TRAVELER = {
  mochilero: { label: "Mochilero", icon: "walk-outline" },
  familia: { label: "Familia", icon: "people-outline" },
  pareja: { label: "Pareja", icon: "heart-outline" },
};

// "Carlos Mendoza" -> "CM"
const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

// Pantalla "Mi Perfil": datos del usuario, resumen de viajes y opciones de la cuenta
export default function ProfileScreen({ navigation }) {
  const { user, logout } = useUser();
  const { colors } = useTheme();                 // para íconos y colores en línea
  const styles = useThemedStyles(createStyles);  // para los estilos
  const [stats, setStats] = useState({ total: 0, active: 0, done: 0 });

  // Resumen de viajes (se recalcula cada vez que se abre la pantalla)
  useFocusEffect(
    useCallback(() => {
      itineraryService
        .getAll()
        .then((list) => {
          const done = list.filter((i) => i.is_completed).length;
          setStats({ total: list.length, active: list.length - done, done });
        })
        .catch(() => {});
    }, []),
  );

  const confirmLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: logout },
    ]);
  };

  const traveler = TRAVELER[user?.traveler_type];

  const infoRows = [
    { icon: "mail-outline", label: "Correo", value: user?.email },
    { icon: "call-outline", label: "Teléfono", value: user?.phone || "Sin registrar" },
    { icon: "earth-outline", label: "País de origen", value: user?.country_of_origin || "Sin registrar" },
    { icon: traveler?.icon ?? "compass-outline", label: "Tipo de viajero", value: traveler?.label ?? "Sin especificar" },
  ];

  const options = [
    { icon: "create-outline", label: "Editar perfil", onPress: () => navigation.navigate("EditProfile") },
    {
      icon: "lock-closed-outline",
      label: "Cambiar contraseña",
      onPress: () => navigation.navigate("EditProfile", { section: "password" }),
    },
    { icon: "briefcase-outline", label: "Mis itinerarios", onPress: () => navigation.navigate("Itineraries") },
    { icon: "chatbubble-ellipses-outline", label: "Reseñas", onPress: () => navigation.navigate("Reviews") },
  ];

  return (
    <MainLayout title="Mi Perfil">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Tarjeta principal */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user?.name)}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {traveler && (
            <View style={styles.badge}>
              <Ionicons name={traveler.icon} size={14} color={colors.secondary} />
              <Text style={styles.badgeText}>{traveler.label}</Text>
            </View>
          )}
        </View>

        {/* Resumen de viajes */}
        <View style={styles.statsRow}>
          {[
            { value: stats.total, label: "Viajes", color: colors.primaryText },
            { value: stats.active, label: "En curso", color: colors.accent },
            { value: stats.done, label: "Completados", color: colors.secondary },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Información personal */}
        <Text style={styles.sectionTitle}>Información personal</Text>
        <View style={styles.card}>
          {infoRows.map((row, i) => (
            <View key={row.label} style={[styles.infoRow, i < infoRows.length - 1 && styles.rowDivider]}>
              <View style={styles.iconBox}>
                <Ionicons name={row.icon} size={18} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Apariencia */}
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <View style={[styles.card, styles.appearanceCard]}>
          <Text style={styles.appearanceHint}>Elige cómo se ve la app</Text>
          <ThemeToggle />
        </View>

        {/* Opciones de la cuenta */}
        <Text style={styles.sectionTitle}>Mi cuenta</Text>
        <View style={styles.card}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.optionRow, i < options.length - 1 && styles.rowDivider]}
              onPress={opt.onPress}
              activeOpacity={0.7}
            >
              <Ionicons name={opt.icon} size={20} color={colors.primaryText} />
              <Text style={styles.optionText}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.logout} onPress={confirmLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={colors.accent} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Rincón Guanaco · v1.0</Text>
      </ScrollView>
    </MainLayout>
  );
}

const createStyles = ({ colors, typography, isDark }) => {
  // En oscuro las sombras casi no se ven: la tarjeta se define con un borde
  const cardShadow = isDark
    ? { borderWidth: 1, borderColor: colors.border }
    : SHADOWS.card;

  return StyleSheet.create({
    scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },

    hero: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.md,
      ...cardShadow,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 4,
      borderColor: colors.accentSoft,
    },
    avatarText: { fontFamily: FONTS.heading, fontSize: 30, color: colors.onAccent },
    name: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.h2,
      color: colors.primaryText,
      marginTop: SPACING.sm,
      textAlign: "center",
    },
    email: { ...typography.body, color: colors.textMuted },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: SPACING.sm,
      paddingVertical: 4,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.secondarySoft,
    },
    badgeText: { fontFamily: FONTS.heading, fontSize: SIZES.small, color: colors.secondary },

    statsRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md },
    statCard: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.md,
      ...cardShadow,
    },
    statValue: { fontFamily: FONTS.heading, fontSize: SIZES.h1 },
    statLabel: { ...typography.small },

    sectionTitle: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.h3,
      color: colors.primaryText,
      marginTop: SPACING.lg,
      marginBottom: SPACING.sm,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      ...cardShadow,
    },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },

    infoRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingVertical: SPACING.md },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.secondarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    infoLabel: { ...typography.small },
    infoValue: { ...typography.body, color: colors.text },

    appearanceCard: { paddingVertical: SPACING.md },
    appearanceHint: { ...typography.small, marginBottom: SPACING.sm },

    optionRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingVertical: SPACING.md },
    optionText: { flex: 1, ...typography.body, color: colors.text },

    logout: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.sm,
      height: 48,
      marginTop: SPACING.lg,
      borderRadius: RADIUS.md,
      borderWidth: 1.5,
      borderColor: colors.accent,
      backgroundColor: colors.surface,
    },
    logoutText: { fontFamily: FONTS.heading, fontSize: SIZES.body, color: colors.accent },
    version: { ...typography.small, textAlign: "center", marginTop: SPACING.md },
  });
};