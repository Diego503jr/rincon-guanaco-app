import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { activityService } from "../api/services/activityService";
import { accommodationService } from "../api/services/accommodationService";

export default function DestinationDetailScreen({ route, navigation }) {
  const { destination } = route.params || {};
  const [activeTab, setActiveTab] = useState("actividades");

  // Estado que controla si hay una selección previa para desbloquear el tercer tab
  const [hasSelection, setHasSelection] = useState(false);

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
          // Lógica o servicio para cuando haya selecciones
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
      {/* BARRA SUPERIOR AZUL CORPORATIVA */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
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
            <Ionicons name="location" size={20} color="#2A9D8F" />
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
              color="#2A9D8F"
              style={{ flex: 1, padding: 15 }}
            />
          ) : (
            <>
              <View style={styles.weatherLeft}>
                <Ionicons name="sunny" size={32} color="#F59E0B" />
                <View style={{ marginLeft: 10 }}>
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
                    color="#2A9D8F"
                  />
                  <Text style={styles.weatherInfoText}>
                    Sensación:{" "}
                    {weather ? `${weather.temperature + 2}° C` : "--"}
                  </Text>
                </View>
                <View style={styles.weatherInfoRow}>
                  <Ionicons name="water" size={16} color="#2A9D8F" />
                  <Text style={styles.weatherInfoText}>
                    Humedad: {weather ? `${weather.humidity}%` : "--"}
                  </Text>
                </View>
                <View style={styles.weatherInfoRow}>
                  <FontAwesome5 name="wind" size={14} color="#2A9D8F" />
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
              Selecciones
            </Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DINÁMICA DE ELEMENTOS */}
        {loadingItems ? (
          <ActivityIndicator
            size="large"
            color="#0D2A4D"
            style={{ marginVertical: 20 }}
          />
        ) : itemsList.length === 0 ? (
          <Text style={styles.noDataText}>
            No hay registros disponibles para esta categoría.
          </Text>
        ) : (
          itemsList.map((item) => {
            const isActivity = activeTab === "actividades";

            return (
              <View
                key={item.id}
                style={isActivity ? styles.activityCard : styles.itemCard}
              >
                {/* SI ES ALOJAMIENTO MUESTRA IMAGEN */}
                {!isActivity && (
                  <Image
                    source={{ uri: item.image_url || destination?.image_url }}
                    style={styles.itemImage}
                  />
                )}

                <View style={styles.itemContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.itemTitle}>
                      {item.name || item.activity_name}
                    </Text>

                    {/* PRECIO DESTACADO EN ACTIVIDADES */}
                    {isActivity && item.price !== undefined && (
                      <Text style={styles.activityPrice}>
                        ${Number(item.price).toFixed(2)}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.notes ||
                      item.address ||
                      item.description ||
                      "Sin notas adicionales."}
                  </Text>

                  {/* METADATOS EXTRAS DE ACTIVIDADES (Personas y Duración) */}
                  {isActivity && (
                    <View style={styles.activityMetaRow}>
                      <View style={styles.metaBadge}>
                        <Ionicons name="people-outline" size={14} color="#2A9D8F" />
                        <Text style={styles.metaText}>
                          {item.people || 1} pers.
                        </Text>
                      </View>

                      <View style={styles.metaBadge}>
                        <Ionicons name="time-outline" size={14} color="#2A9D8F" />
                        <Text style={styles.metaText}>
                          {item.duracion || "N/D"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0D2A4D",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 12,
    backgroundColor: "#0D2A4D",
  },
  backButton: {
    backgroundColor: "#F26419",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 12,
  },
  scrollContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  heroContainer: {
    position: "relative",
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
  },
  mapPinBadge: {
    position: "absolute",
    top: "80%",
    alignSelf: "center",
    backgroundColor: "#ffffff9f",
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  destinationTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D2A4D",
    textAlign: "center",
    marginTop: 12,
  },
  destinationSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  weatherCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  weatherDesc: {
    fontSize: 11,
    color: "#4B5563",
    marginTop: 2,
  },
  weatherDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#BFDBFE",
    marginHorizontal: 10,
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
    fontSize: 12,
    color: "#374151",
    marginLeft: 6,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#2A9D8F",
  },
  tabDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    opacity: 0.5,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabTextDisabled: {
    color: "#9CA3AF",
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 90,
    height: 80,
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0D2A4D",
    flex: 1,
    marginRight: 8,
  },
  itemDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
  activityPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2A9D8F",
  },
  activityMetaRow: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  metaText: {
    fontSize: 12,
    color: "#4B5563",
    marginLeft: 4,
    fontWeight: "500",
  },
  noDataText: {
    textAlign: "center",
    color: "#6B7280",
    marginVertical: 20,
    fontSize: 14,
  },
});