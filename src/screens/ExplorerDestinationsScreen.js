import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView,} from "react-native";
import useApi from "../hooks/useApi";
import { Ionicons } from "@expo/vector-icons";
import { destinationService } from "../api/services/destinationService";
import MainLayout from "../components/MainLayout";

const CATEGORIES = [
  { id: "todos", label: "Todos" },
  { id: "playa", label: "Playa" },
  { id: "montaña", label: "Montaña" },
  { id: "cultural", label: "Cultural" },
  { id: "gastronomico", label: "Gastronómico" },
  { id: "aventura", label: "Aventura" },
  { id: "relax", label: "Relax" },
];

export default function ExplorerDestinationsScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading, error, execute } = useApi(destinationService.getAll);

  useEffect(() => {
    const params =
      selectedCategory === "todos" ? {} : { category: selectedCategory };
    execute(params);
  }, [selectedCategory, execute]);

  const destinationsList = data?.data ?? data ?? [];

  // Filtrado por barra de búsqueda y categoría local
  const filteredDestinations = destinationsList.filter((item) => {
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
    >
      <Image
        source={{
          uri:
            item.image_url ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardInfo}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{item.name}</Text>
        </View>
        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <TouchableOpacity style={styles.reviewButton}>
          <Text style={styles.reviewButtonText}>Ver reseñas</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <MainLayout title="Explora El Salvador">
      <View style={styles.container}>
        {/* BARRA DE BÚSQUEDA */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#6C757D"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* FILTROS DE CATEGORÍA CON SCROLL HORIZONTAL */}
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

        {/* LISTA DE DESTINOS */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#F26419" />
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
          />
        )}
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 46,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#212529",
  },
  categoriesWrapper: {
    height: 50,
    marginBottom: 16,
  },
  categoriesContainer: {
    alignItems: "center",
    paddingRight: 16,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    elevation: 1,
    height: 38,
    justifyContent: "center",
  },
  pillSelected: {
    backgroundColor: "#2A9D8F",
  },
  pillUnselected: {
    backgroundColor: "#E5E7EB",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pillTextSelected: {
    color: "#FFFFFF",
  },
  pillTextUnselected: {
    color: "#4B5563",
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    padding: 12,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardImage: {
    width: 110,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#CCC",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D2A4D",
  },
  cardDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginVertical: 4,
  },
  reviewButton: {
    backgroundColor: "#2A9D8F",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignSelf: "flex-end",
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
});
