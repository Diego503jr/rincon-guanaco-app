import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking, Platform, Alert,} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5,} from "@expo/vector-icons";
import { activityService } from "../api/services/activityService";
import { accommodationService } from "../api/services/accommodationService";
import SelectionsPanel from "../components/SelectionsPanel";
import { useSelections } from "../store/selectionStore";
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS, TYPOGRAPHY,} from "../constants/theme";

export default function DestinationDetailScreen({ route, navigation }) {
  const { destination } = route.params || {};
  const [activeTab, setActiveTab] = useState("actividades");

  // Estado que controla si hay una selección previa para desbloquear el tercer tab
  const [hasSelection, setHasSelection] = useState(false);

  // Selecciones: la pestaña se habilita cuando hay algo seleccionado
  const selections = useSelections();
  useEffect(() => {
    setHasSelection(selections.length > 0);
    if (selections.length === 0 && activeTab === "selecciones")
      setActiveTab("actividades");
  }, [selections.length]);

  // Estados para el clima real
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Estados para las listas
  const [itemsList, setItemsList] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Función para abrir Google Maps / Mapa nativo
  const openMap = () => {
    const lat = destination?.latitude || 13.4924;
    const lon = destination?.longitude || -89.3878;
    const label = destination?.name || "Destino";

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lon}`,
      android: `geo:0,0?q=${lat},${lon}(${label})`,
    });

    Linking.openURL(url).catch((err) =>
      console.error("Error al abrir el mapa:", err),
    );
  };

  // Obtener clima real con latitud y longitud
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const lat = destination?.latitude || 13.4924;
        const lon = destination?.longitude || -89.3878;

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`,
        );
        const data = await response.json();

        if (data && data.current) {
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
          });
        }
      } catch (error) {
        console.log("Error al obtener el clima:", error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [destination]);

  // Cargar actividades o alojamientos según la pestaña seleccionada
  useEffect(() => {
    const fetchData = async () => {
      if (!destination?.id) return;
      setLoadingItems(true);
      try {
        if (activeTab === "actividades") {
          const data = await activityService.getByDestination(destination.id);
          setItemsList(data?.data ?? data ?? []);
        } else if (activeTab === "alojamiento") {
          const data = await accommodationService.getByDestination(
            destination.id,
          );
          setItemsList(data?.data ?? data ?? []);
        } else if (activeTab === "selecciones") {
          setItemsList([]);
        }
      } catch (error) {
        console.log("Error al cargar elementos de la pestaña:", error);
        setItemsList([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchData();
  }, [activeTab, destination]);

  const handleTabPress = (tabName) => {
    if (tabName === "selecciones" && !hasSelection) {
      Alert.alert(
        "Acceso restringido",
        "Debes realizar una selección previa (o cumplir el requisito) para acceder a este apartado.",
      );
      return;
    }
    setActiveTab(tabName);
  };

  return (
    <View style={styles.mainContainer}>
      {/* BARRA SUPERIOR AZUL */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Destino Seleccionado</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* IMAGEN Y PIN INTERACTIVO DE MAPA */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri:
                destination?.image_url ||
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            }}
            style={styles.heroImage}
          />
          <TouchableOpacity style={styles.mapPinBadge} onPress={openMap}>
            <Ionicons name="location" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.destinationTitle}>
          {destination?.name || "El Tunco"}
        </Text>
        <Text style={styles.destinationSubtitle}>
          {destination?.municipality || "San Jacinto"},{" "}
          {destination?.department || "San Salvador"}
        </Text>

        {/* WIDGET DE CLIMA */}
        <View style={styles.weatherCard}>
          {loadingWeather ? (
            <ActivityIndicator
              size="small"
              color={COLORS.secondary}
              style={{ flex: 1, padding: 15 }}
            />
          ) : (
            <>
              <View style={styles.weatherLeft}>
                <Ionicons name="sunny" size={32} color="#F59E0B" />
                <View style={{ marginLeft: SPACING.sm }}>
                  <Text style={styles.tempText}>
                    {weather ? `${weather.temperature}°C` : "--°C"}
                  </Text>
                  <Text style={styles.weatherDesc}>Datos en tiempo real</Text>
                </View>
              </View>
              <View style={styles.weatherDivider} />
              <View style={styles.weatherRight}>
                <View style={styles.weatherInfoRow}>
                  <MaterialCommunityIcons
                    name="thermometer"
                    size={16}
                    color={COLORS.secondary}
                  />
                  <Text style={styles.weatherInfoText}>
                    Sensación:{" "}
                    {weather ? `${weather.temperature + 2}° C` : "--"}
                  </Text>
                </View>
                <View style={styles.weatherInfoRow}>
                  <Ionicons name="water" size={16} color={COLORS.secondary} />
                  <Text style={styles.weatherInfoText}>
                    Humedad: {weather ? `${weather.humidity}%` : "--"}
                  </Text>
                </View>
                <View style={styles.weatherInfoRow}>
                  <FontAwesome5 name="wind" size={14} color={COLORS.secondary} />
                  <Text style={styles.weatherInfoText}>
                    Viento: {weather ? `${weather.windSpeed} km/h` : "--"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* PESTAÑAS / FILTROS INTERNOS */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "actividades" && styles.tabActive,
            ]}
            onPress={() => handleTabPress("actividades")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "actividades" && styles.tabTextActive,
              ]}
            >
              Actividades
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "alojamiento" && styles.tabActive,
            ]}
            onPress={() => handleTabPress("alojamiento")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "alojamiento" && styles.tabTextActive,
              ]}
            >
              Alojamiento
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "selecciones" && styles.tabActive,
              !hasSelection && styles.tabDisabled,
            ]}
            onPress={() => handleTabPress("selecciones")}
            disabled={!hasSelection}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "selecciones" && styles.tabTextActive,
                !hasSelection && styles.tabTextDisabled,
              ]}
            >
              Selecciones{selections.length ? ` (${selections.length})` : ""}
            </Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DINÁMICA DE ELEMENTOS */}
        {activeTab === "selecciones" ? (
          <SelectionsPanel
            suggestedTitle={`Viaje a ${destination?.name ?? ""}`}
          />
        ) : loadingItems ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginVertical: SPACING.lg }}
          />
        ) : itemsList.length === 0 ? (
          <Text style={styles.noDataText}>
            No hay registros disponibles para esta categoría.
          </Text>
        ) : (
          itemsList.map((item) => {
            const isActivity = activeTab === "actividades";
            const isAccommodation = activeTab === "alojamiento";

            const handleItemPress = () => {
              if (isAccommodation) {
                navigation.navigate("AccommodationModal", {
                  accommodation: item,
                  destination,
                });
              } else if (isActivity) {
                navigation.navigate("ActivityModal", {
                  activity: item,
                  destination,
                });
              }
            };

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={handleItemPress}
                style={isActivity ? styles.activityCard : styles.itemCard}
              >
                {isAccommodation && item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.itemImage}
                  />
                ) : null}

                <View style={styles.itemContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.itemTitle}>{item.name}</Text>

                    {item.price !== undefined && (
                      <Text style={styles.activityPrice}>
                        ${Number(item.price).toFixed(2)}
                        {isAccommodation && (
                          <Text style={styles.nightText}> / noche</Text>
                        )}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.address || item.description || "Sin descripción."}
                  </Text>

                  {isAccommodation && (
                    <View style={styles.accommodationMetaContainer}>
                      {(item.check_in || item.check_out) && (
                        <View style={styles.metaRow}>
                          <Ionicons
                            name="time-outline"
                            size={13}
                            color={COLORS.textMuted}
                          />
                          <Text style={styles.metaText}>
                            Entrada:{" "}
                            {item.check_in
                              ? item.check_in.substring(0, 5)
                              : "--"}{" "}
                            | Salida:{" "}
                            {item.check_out
                              ? item.check_out.substring(0, 5)
                              : "--"}
                          </Text>
                        </View>
                      )}

                      {item.contact_phone && (
                        <View style={styles.metaRow}>
                          <Ionicons
                            name="call-outline"
                            size={13}
                            color={COLORS.secondary}
                          />
                          <Text
                            style={[
                              styles.metaText,
                              { color: COLORS.secondary, fontWeight: "600" },
                            ]}
                          >
                            {item.contact_phone}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: 45,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    backgroundColor: COLORS.accent,
    width: 32,
    height: 32,
    borderRadius: RADIUS.pill,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: SIZES.h3,
    marginLeft: SPACING.sm,
  },
  scrollContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  heroContainer: {
    position: "relative",
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: RADIUS.md,
  },
  mapPinBadge: {
    position: "absolute",
    top: "80%",
    alignSelf: "center",
    backgroundColor: "#ffffff9f",
    padding: 10,
    borderRadius: RADIUS.pill,
    ...SHADOWS.card,
  },
  destinationTitle: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h1,
    color: COLORS.primary,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  destinationSubtitle: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  weatherCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    minHeight: 85,
  },
  weatherLeft: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
  },
  tempText: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.text,
  },
  weatherDesc: {
    fontFamily: FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  weatherDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#BFDBFE",
    marginHorizontal: SPACING.sm,
  },
  weatherRight: {
    flex: 1,
    justifyContent: "center",
  },
  weatherInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  weatherInfoText: {
    fontFamily: FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.text,
    marginLeft: 6,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    marginHorizontal: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.secondary,
  },
  tabDisabled: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    opacity: 0.5,
  },
  tabText: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabTextDisabled: {
    color: COLORS.textMuted,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  itemImage: {
    width: 90,
    height: 80,
    borderRadius: RADIUS.sm,
  },
  itemContent: {
    flex: 1,
    marginLeft: SPACING.sm,
    justifyContent: "center",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.body,
    color: COLORS.primary,
    flex: 1,
    marginRight: SPACING.xs,
  },
  itemDescription: {
    fontFamily: FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  activityPrice: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.body,
    color: COLORS.secondary,
  },
  metaText: {
    fontFamily: FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.text,
    marginLeft: 4,
  },
  noDataText: {
    fontFamily: FONTS.body,
    textAlign: "center",
    color: COLORS.textMuted,
    marginVertical: SPACING.lg,
    fontSize: SIZES.body,
  },
  nightText: {
    fontFamily: FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  accommodationMetaContainer: {
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
});