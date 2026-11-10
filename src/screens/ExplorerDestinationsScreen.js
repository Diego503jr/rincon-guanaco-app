import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import useApi from "../hooks/useApi";
import { Ionicons } from "@expo/vector-icons";
import { destinationService } from "../api/services/destinationService";
import MainLayout from "../components/MainLayout";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FONTS, SIZES, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";

const CATEGORIES = [
  { id: "todos", label: "Todos" },
  { id: "playa", label: "Playa" },
  { id: "montaña", label: "Montaña" },
  { id: "cultural", label: "Cultural" },
  { id: "gastronomico", label: "Gastronómico" },
  { id: "aventura", label: "Aventura" },
  { id: "relax", label: "Relax" },
];

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.14:8000/api";

export default function ExplorerDestinationsScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // para íconos y colores en línea
  const styles = useThemedStyles(createStyles); // para los estilos
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNearbyActive, setIsNearbyActive] = useState(false);
  const [nearbyData, setNearbyData] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  const { data, loading, error, execute } = useApi(destinationService.getAll);

  useEffect(() => {
    if (!isNearbyActive) {
      const params =
        selectedCategory === "todos" ? {} : { category: selectedCategory };
      execute(params);
    }
  }, [selectedCategory, execute, isNearbyActive]);

  // Manejar la activación/desactivación del modo cercano con token y respaldo GPS
  const handleToggleNearby = () => {
    if (isNearbyActive) {
      setIsNearbyActive(false);
      setNearbyData([]);
      return;
    }

    Alert.alert(
      "Buscar lugares cercanos",
      "¿Deseas ordenar los destinos basándose en tu ubicación GPS actual?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí, buscar",
          onPress: async () => {
            try {
              setLoadingNearby(true);
              let { status } =
                await Location.requestForegroundPermissionsAsync();

              let latitude = 13.6929; // Coordenada por defecto (San Salvador)
              let longitude = -89.2182;

              if (status === "granted") {
                try {
                  let currentLocation = await Promise.race([
                    Location.getCurrentPositionAsync({
                      accuracy: Location.Accuracy.Balanced,
                    }),
                    new Promise((_, reject) =>
                      setTimeout(() => reject(new Error("Timeout GPS")), 4000),
                    ),
                  ]);
                  latitude = currentLocation.coords.latitude;
                  longitude = currentLocation.coords.longitude;
                } catch (gpsErr) {
                  console.log(
                    "No se pudo obtener el GPS del emulador, usando ubicación por defecto.",
                  );
                }
              }

              const token = await AsyncStorage.getItem("token");
              const targetUrl = `${BASE_URL}/destinations/nearby?latitude=${latitude}&longitude=${longitude}`;

              const response = await fetch(targetUrl, {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: token ? `Bearer ${token}` : "",
                },
              });

              const responseData = await response.json();
              if (!response.ok) {
                throw new Error(
                  responseData.message ||
                    "Error al obtener los lugares cercanos",
                );
              }

              const listResult = Array.isArray(responseData)
                ? responseData
                : (responseData.data ?? []);
              setNearbyData(listResult);
              setIsNearbyActive(true);
            } catch (err) {
              Alert.alert(
                "Error",
                "No se pudo conectar con el servidor para buscar cercanos.",
              );
            } finally {
              setLoadingNearby(false);
            }
          },
        },
      ],
    );
  };

  const baseList = isNearbyActive ? nearbyData : (data?.data ?? data ?? []);

  const filteredDestinations = baseList.filter((item) => {
    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "todos" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderDestinationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("DestinationDetail", { destination: item })
      }
      activeOpacity={0.9}
    >
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.distance !== undefined && item.distance !== null && (
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={10} color={colors.secondary} />
            <Text style={styles.distanceText}>
              {parseFloat(item.distance).toFixed(1)} km
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardBodyContainer}>
        <Image
          source={{
            uri:
              item.image_url ||
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
          }}
          style={styles.cardImage}
        />
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            {item.category && (
              <View style={styles.miniBadge}>
                <Ionicons
                  name="compass-outline"
                  size={12}
                  color={colors.secondary}
                />
                <Text style={styles.miniBadgeText}>{item.category}</Text>
              </View>
            )}
            {item.traveler_type && (
              <View
                style={[
                  styles.miniBadge,
                  { backgroundColor: isDark ? colors.surfaceAlt : "#EFF6FF" },
                ]}
              >
                <Ionicons name="people-outline" size={12} color="#3B82F6" />
                <Text style={[styles.miniBadgeText, { color: "#3B82F6" }]}>
                  {item.traveler_type}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() =>
              navigation.navigate("Reviews", { destination: item })
            }
          >
            <Text style={styles.reviewButtonText}>Reseñas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const isLoadingScreen = loading || loadingNearby;

  return (
    <MainLayout title="Explora El Salvador">
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[
              styles.locationButton,
              isNearbyActive && styles.locationButtonActive,
            ]}
            onPress={handleToggleNearby}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isNearbyActive ? "location" : "location-outline"}
              size={20}
              color={isNearbyActive ? colors.onAccent : colors.secondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.pill,
                    isSelected ? styles.pillSelected : styles.pillUnselected,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected
                        ? styles.pillTextSelected
                        : styles.pillTextUnselected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isNearbyActive && (
          <View style={styles.activeNearbyBanner}>
            <Text style={styles.activeNearbyText}>
              ✨ Mostrando lugares ordenados por cercanía a tu ubicación
            </Text>
            <TouchableOpacity onPress={() => setIsNearbyActive(false)}>
              <Text style={styles.clearNearbyText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoadingScreen ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>
              Error al cargar los destinos: {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredDestinations}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderDestinationItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>
                  No se encontraron destinos.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </MainLayout>
  );
}

const createStyles = ({ colors, isDark }) => {
  // Verdes claros fijos: en oscuro se usan los colores suaves del tema
  const softGreen = isDark ? colors.secondarySoft : "#E2F9F1";

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.md,
      height: 46,
      marginBottom: SPACING.sm,
    },
    searchIcon: {
      marginRight: SPACING.sm,
    },
    searchInput: {
      flex: 1,
      fontFamily: FONTS.body,
      fontSize: SIZES.body,
      color: colors.text,
    },
    locationButton: {
      padding: 6,
      borderRadius: RADIUS.pill,
      backgroundColor: softGreen,
      marginLeft: SPACING.xs,
      justifyContent: "center",
      alignItems: "center",
    },
    locationButtonActive: {
      backgroundColor: colors.secondary,
    },
    categoriesWrapper: {
      height: 50,
      marginBottom: SPACING.xs,
    },
    categoriesContainer: {
      alignItems: "center",
      paddingRight: SPACING.md,
    },
    pill: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.pill,
      marginRight: SPACING.sm,
      elevation: 1,
      height: 38,
      justifyContent: "center",
    },
    pillSelected: {
      backgroundColor: colors.secondary,
    },
    pillUnselected: {
      backgroundColor: colors.border,
    },
    pillText: {
      fontFamily: FONTS.body,
      fontSize: SIZES.body,
      fontWeight: "600",
    },
    pillTextSelected: {
      color: colors.onAccent,
    },
    pillTextUnselected: {
      color: colors.textMuted,
    },
    activeNearbyBanner: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: softGreen,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.sm,
      marginBottom: SPACING.sm,
    },
    activeNearbyText: {
      fontFamily: FONTS.body,
      fontSize: SIZES.small,
      color: isDark ? colors.text : "#1F4E47",
      flex: 1,
    },
    clearNearbyText: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.small,
      color: colors.secondary,
      marginLeft: SPACING.sm,
    },
    listContainer: {
      paddingBottom: SPACING.xl,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.card,
    },
    cardHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    cardTitle: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.h3,
      color: colors.primaryText,
      flex: 1,
      marginRight: SPACING.xs,
    },
    distanceBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: softGreen,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
    },
    distanceText: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.small,
      color: colors.secondary,
      marginLeft: 2,
    },
    cardBodyContainer: {
      flexDirection: "row",
    },
    cardImage: {
      width: 100,
      height: 95,
      borderRadius: RADIUS.sm,
      backgroundColor: colors.surfaceAlt,
    },
    cardInfo: {
      flex: 1,
      marginLeft: SPACING.sm,
      justifyContent: "space-between",
    },
    cardDescription: {
      fontFamily: FONTS.body,
      fontSize: SIZES.small,
      color: colors.textMuted,
      marginVertical: 4,
    },
    reviewButton: {
      backgroundColor: colors.secondary,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: RADIUS.pill,
      alignSelf: "flex-end",
    },
    reviewButtonText: {
      fontFamily: FONTS.heading,
      color: colors.onAccent,
      fontSize: SIZES.small,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: SPACING.xl,
    },
    errorText: {
      fontFamily: FONTS.body,
      color: colors.btnCancelar,
      textAlign: "center",
    },
    emptyText: {
      fontFamily: FONTS.body,
      color: colors.textMuted,
      textAlign: "center",
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 2,
    },
    miniBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: softGreen,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
      marginRight: SPACING.xs,
      marginBottom: 2,
    },
    miniBadgeText: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.small,
      color: colors.secondary,
      marginLeft: 3,
    },
  });
};
