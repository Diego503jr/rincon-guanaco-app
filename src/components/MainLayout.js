import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import SideMenu from "./SideMenu";

export default function MainLayout({
  children,
  title = "Explora El Salvador",
}) {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme(); // para íconos y colores en línea
  const styles = useThemedStyles(createStyles); // para los estilos
  const [menuOpen, setMenuOpen] = useState(false); // menú lateral

  // función para saber si la ruta está activa
  const isActive = (routeName) => route.name === routeName;
  const activeColor = colors.accent;
  const inactiveColor = "#9CA3AF";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* HEADER SUPERIOR */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          style={styles.headerIconContainer}
        >
          <Ionicons
            name="menu"
            marginTop={35}
            size={26}
            color={colors.onAccent}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.headerIconContainer}
        >
          <Ionicons
            name="person-circle-outline"
            marginTop={35}
            size={30}
            color={colors.onAccent}
          />
        </TouchableOpacity>
      </View>

      {/* CONTENIDO DE LA PANTALLA */}
      <View style={styles.content}>{children}</View>

      {/* BARRA DE NAVEGACIÓN INFERIOR*/}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Explorer")}
        >
          <Ionicons
            name="search"
            size={26}
            color={isActive("Explorer") ? activeColor : inactiveColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Itineraries")}
        >
          <FontAwesome5
            name="suitcase-rolling"
            size={22}
            color={isActive("Itineraries") ? activeColor : inactiveColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Reviews")}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color={isActive("Reviews") ? activeColor : inactiveColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={isActive("Profile") ? activeColor : inactiveColor}
          />
        </TouchableOpacity>
      </View>
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const createStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      backgroundColor: colors.primary, // Azul añil
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      //marginTop:35,
      elevation: 4,
    },
    headerIconContainer: {
      padding: 4,
    },
    headerTitle: {
      color: colors.onAccent,
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      marginTop: 35,
      flex: 1,
    },
    content: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
    },
    bottomNav: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      height: 60,
      justifyContent: "space-around",
      alignItems: "center",
      paddingBottom: 4,
    },
    navItem: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      height: "100%",
    },
  });
