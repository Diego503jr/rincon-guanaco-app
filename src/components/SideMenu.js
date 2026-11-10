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
import { COLORS, FONTS, SIZES, SPACING, RADIUS, TYPOGRAPHY } from "../constants/theme";
import { useUser } from "../context/UserContext";

const WIDTH = Math.min(300, Dimensions.get("window").width * 0.8);

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

export default function SideMenu({ visible, onClose, onOpenAbout }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, logout } = useUser();
  const slide = useRef(new Animated.Value(-WIDTH)).current;

  useEffect(() => {
    if (visible) {
      slide.setValue(-WIDTH);
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible, slide]);

  const go = (screen) => {
    onClose();
    if (route.name !== screen) navigation.navigate(screen);
  };

  const confirmLogout = () => {
    onClose();
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: logout },
    ]);
  };

  const extraItems = [
    {
      icon: "help-buoy-outline",
      label: "Soporte y Ayuda",
      onPress: () => {
        onClose();
        navigation.navigate("Support");
      }
    },
    {
      icon: "information-circle-outline",
      label: "Acerca de",
      onPress: () => {
        onClose(); // Obligatorio cerrar el menú lateral primero
        if (onOpenAbout) onOpenAbout(); // Luego abrimos la tarjeta
      }
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.panel, { transform: [{ translateX: slide }] }]}>
          <Pressable style={{ flex: 1 }} onPress={() => { }}>
            {/* Encabezado con el usuario */}
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(user?.name)}</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>{user?.name}</Text>
              <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
            </View>

            {/* Información */}
            <View style={styles.section}>
              {extraItems.map((item) => (
                <TouchableOpacity key={item.label} style={styles.item} onPress={item.onPress}>
                  <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                  <Text style={styles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cerrar sesión (abajo) */}
            <TouchableOpacity style={styles.logout} onPress={confirmLogout}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.accent} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  panel: {
    width: WIDTH,
    height: "100%",
    backgroundColor: COLORS.white,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 56,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  avatarText: { fontFamily: FONTS.heading, fontSize: 22, color: COLORS.white },
  name: { fontFamily: FONTS.heading, fontSize: SIZES.h3, color: COLORS.white },
  email: { ...TYPOGRAPHY.small, color: "#C9D3DF" },
  section: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  itemActive: { backgroundColor: "#FDEEE5" },
  itemText: { ...TYPOGRAPHY.body, color: COLORS.text },
  itemTextActive: { fontFamily: FONTS.heading, color: COLORS.accent },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg },
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
  logoutText: { fontFamily: FONTS.heading, fontSize: SIZES.body, color: COLORS.accent },
});