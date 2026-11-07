import { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from "../constants/theme";
import { useUser } from "../context/UserContext";
import { itineraryService } from "../api/services/itineraryService";
import MainLayout from "../components/MainLayout";

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
              <Ionicons name={traveler.icon} size={14} color={COLORS.secondary} />
              <Text style={styles.badgeText}>{traveler.label}</Text>
            </View>
          )}
        </View>

        {/* Resumen de viajes */}
        <View style={styles.statsRow}>
          {[
            { value: stats.total, label: "Viajes", color: COLORS.primary },
            { value: stats.active, label: "En curso", color: COLORS.accent },
            { value: stats.done, label: "Completados", color: COLORS.secondary },
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
                <Ionicons name={row.icon} size={18} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
              </View>
            </View>
          ))}
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
              <Ionicons name={opt.icon} size={20} color={COLORS.primary} />
              <Text style={styles.optionText}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.logout} onPress={confirmLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.accent} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Rincón Guanaco · v1.0</Text>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },

  hero: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.card,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FDE3D3",
  },
  avatarText: { fontFamily: FONTS.heading, fontSize: 30, color: COLORS.white },
  name: { fontFamily: FONTS.heading, fontSize: SIZES.h2, color: COLORS.primary, marginTop: SPACING.sm, textAlign: "center" },
  email: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: SPACING.sm,
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    backgroundColor: "#E6F4F2",
  },
  badgeText: { fontFamily: FONTS.heading, fontSize: SIZES.small, color: COLORS.secondary },

  statsRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    ...SHADOWS.card,
  },
  statValue: { fontFamily: FONTS.heading, fontSize: SIZES.h1 },
  statLabel: { ...TYPOGRAPHY.small },

  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h3,
    color: COLORS.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, ...SHADOWS.card },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.border },

  infoRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingVertical: SPACING.md },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E6F4F2",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { ...TYPOGRAPHY.small },
  infoValue: { ...TYPOGRAPHY.body, color: COLORS.text },

  optionRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingVertical: SPACING.md },
  optionText: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.text },

  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    height: 48,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.white,
  },
  logoutText: { fontFamily: FONTS.heading, fontSize: SIZES.body, color: COLORS.accent },
  version: { ...TYPOGRAPHY.small, textAlign: "center", marginTop: SPACING.md },
});