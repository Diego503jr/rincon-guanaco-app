import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  SIZES,
  FONTS,
} from "../constants/theme";

/* ------------------------------------------------------------------ */
/*  Catálogo de guías (en producción esto vendría de Firebase / API)   */
/*  Al "descargar", el contenido se guarda en SQLite para uso offline. */
/* ------------------------------------------------------------------ */
const CATALOG = [
  {
    id: "santa-ana",
    name: "Volcán de Santa Ana",
    region: "Santa Ana",
    category: "Montañas",
    icon: "triangle",
    sizeMB: 2.4,
    summary:
      "Ilamatepec, el volcán más alto del país, con laguna turquesa en el cráter.",
    content: {
      comoLlegar:
        "Desde San Salvador, bus 201 a Santa Ana y luego bus 248 hacia Parque Nacional Cerro Verde.",
      horario:
        "Martes a domingo. Salidas guiadas a las 11:00 a. m. y 1:00 p. m.",
      costo:
        "Entrada aprox. $3 extranjeros / $1 salvadoreños. Guía incluida en el tour oficial.",
      consejos: [
        "Llevá agua y gorra",
        "Usá calzado cerrado",
        "Llevá una chumpa, arriba hace frío",
        "Seguí siempre al guía",
      ],
      emergencia: "Policía de Turismo: 2264-4348 · Emergencias: 911",
    },
  },
  {
    id: "ruta-flores",
    name: "Ruta de las Flores",
    region: "Sonsonate / Ahuachapán",
    category: "Pueblos",
    icon: "flower",
    sizeMB: 3.1,
    summary:
      "Pueblos coloridos como Juayúa, Apaneca, Ataco y Concepción de Ataco.",
    content: {
      comoLlegar:
        "Desde San Salvador por la CA-8 hacia Sonsonate y luego la carretera a Juayúa (aprox. 2 h).",
      horario: "Feria gastronómica de Juayúa: sábados y domingos.",
      costo: "Entrada libre. Plato típico desde $4.",
      consejos: [
        "Probá el café de altura",
        "Llevá efectivo, hay pocos cajeros",
        "Visitá los murales de Ataco",
        "Madrugá para evitar tráfico",
      ],
      emergencia: "Policía de Turismo: 2264-4348 · Emergencias: 911",
    },
  },
  {
    id: "el-tunco",
    name: "Playa El Tunco",
    region: "La Libertad",
    category: "Playas",
    icon: "sunny",
    sizeMB: 1.8,
    summary: "Surf, atardeceres y vida nocturna en la Costa del Bálsamo.",
    content: {
      comoLlegar:
        "Desde San Salvador, bus 102 hacia La Libertad y luego bus 192 / 80 hacia El Tunco (aprox. 1 h).",
      horario: "Playa abierta todo el día. Mejor luz: 5:00–6:00 p. m.",
      costo: "Acceso libre. Clases de surf desde $20.",
      consejos: [
        "Cuidado con las corrientes",
        "Usá protector solar",
        "No dejés pertenencias en la arena",
        "Reservá hospedaje en feriados",
      ],
      emergencia: "Policía de Turismo: 2264-4348 · Cruz Roja: 2222-5155",
    },
  },
  {
    id: "suchitoto",
    name: "Suchitoto",
    region: "Cuscatlán",
    category: "Cultura",
    icon: "business",
    sizeMB: 2.0,
    summary:
      "Ciudad colonial de calles empedradas, arte y vista al lago Suchitlán.",
    content: {
      comoLlegar:
        "Desde San Salvador, bus 129 desde la Terminal de Oriente (aprox. 1 h 30 min).",
      horario: "Museos y galerías de 9:00 a. m. a 5:00 p. m.",
      costo: "Entrada libre a la ciudad. Paseo en lancha desde $5 por persona.",
      consejos: [
        "Caminá con calzado cómodo",
        "Visitá la Iglesia Santa Lucía",
        "Probá las pupusas de queso con loroco",
      ],
      emergencia: "Policía de Turismo: 2264-4348 · Emergencias: 911",
    },
  },
  {
    id: "joya-ceren",
    name: "Joya de Cerén",
    region: "La Libertad",
    category: "Cultura",
    icon: "earth",
    sizeMB: 1.5,
    summary:
      'Sitio arqueológico Patrimonio de la Humanidad, el "Pompeya de América".',
    content: {
      comoLlegar:
        "Desde San Salvador, bus 108 hacia San Juan Opico (aprox. 45 min).",
      horario: "Martes a domingo, 9:00 a. m. a 4:00 p. m.",
      costo: "Aprox. $3 extranjeros / $1 salvadoreños.",
      consejos: [
        "Contratá guía en la entrada",
        "Llevá agua",
        "Visitá el museo de sitio",
      ],
      emergencia: "Policía de Turismo: 2264-4348 · Emergencias: 911",
    },
  },
  {
    id: "coatepeque",
    name: "Lago de Coatepeque",
    region: "Santa Ana",
    category: "Lagos",
    icon: "water",
    sizeMB: 1.9,
    summary: "Lago volcánico de aguas azul turquesa, ideal para relajarse.",
    content: {
      comoLlegar:
        "Desde Santa Ana, bus 220 hacia Congo y luego hacia el lago (aprox. 40 min).",
      horario: "Restaurantes y muelles de 8:00 a. m. a 6:00 p. m.",
      costo: "Acceso libre. Paseo en lancha desde $10.",
      consejos: [
        "Pedí precio antes de subir a la lancha",
        "Probá la mojarra frita",
        "Llevá ropa de baño",
      ],
      emergencia: "Policía de Turismo: 2264-4348 · Emergencias: 911",
    },
  },
];

const FILTERS = [
  "Todas",
  "Descargadas",
  "Playas",
  "Montañas",
  "Pueblos",
  "Cultura",
  "Lagos",
];

/* ------------------------------------------------------------------ */
/*  SQLite (requiere expo-sqlite SDK 51+)                              */
/*  Se usan consultas parametrizadas (?) para evitar inyección SQL.    */
/* ------------------------------------------------------------------ */
const db = SQLite.openDatabaseSync("rincon_guanaco.db");

const initDb = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS offline_guides (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      region TEXT,
      category TEXT,
      summary TEXT,
      content TEXT NOT NULL,
      size_mb REAL,
      downloaded_at TEXT NOT NULL
    );
  `);
};

const getDownloadedIds = () =>
  db.getAllSync("SELECT id FROM offline_guides").map((r) => r.id);

const saveGuide = (g) =>
  db.runSync(
    `INSERT OR REPLACE INTO offline_guides
     (id, name, region, category, summary, content, size_mb, downloaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      g.id,
      g.name,
      g.region,
      g.category,
      g.summary,
      JSON.stringify(g.content),
      g.sizeMB,
      new Date().toISOString(),
    ],
  );

const removeGuide = (id) =>
  db.runSync("DELETE FROM offline_guides WHERE id = ?", [id]);

const readGuide = (id) => {
  const row = db.getFirstSync("SELECT * FROM offline_guides WHERE id = ?", [
    id,
  ]);
  return row ? { ...row, content: JSON.parse(row.content) } : null;
};

/* ------------------------------------------------------------------ */
/*  Pantalla                                                           */
/* ------------------------------------------------------------------ */
export default function OfflineGuideScreen({ navigation }) {
  const netInfo = useNetInfo();
  // null mientras se determina; solo consideramos offline si es false explícito
  const isOffline = netInfo.isConnected === false;

  const [downloaded, setDownloaded] = useState([]);
  const [downloading, setDownloading] = useState(null); // id en descarga
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    try {
      initDb();
      setDownloaded(getDownloadedIds());
    } catch (e) {
      console.error("Error iniciando SQLite:", e);
      Alert.alert("Error", "No se pudo abrir el almacenamiento local.");
    }
  }, []);

  const handleDownload = useCallback(
    async (guide) => {
      if (isOffline) {
        Alert.alert(
          "Sin conexión",
          "Necesitás internet para descargar esta guía.",
        );
        return;
      }
      try {
        setDownloading(guide.id);
        // Simula la descarga desde el servidor (reemplazá por fetch a Firebase/API)
        await new Promise((r) => setTimeout(r, 900));
        saveGuide(guide);
        setDownloaded(getDownloadedIds());
        Alert.alert(
          "¡Listo!",
          `"${guide.name}" ya está disponible sin conexión.`,
        );
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "No se pudo descargar la guía. Intentá de nuevo.");
      } finally {
        setDownloading(null);
      }
    },
    [isOffline],
  );

  const handleDelete = (guide) => {
    Alert.alert(
      "Eliminar guía",
      `¿Querés borrar "${guide.name}" de tu dispositivo?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            removeGuide(guide.id);
            setDownloaded(getDownloadedIds());
          },
        },
      ],
    );
  };

  const handleOpen = (guide) => {
    if (!downloaded.includes(guide.id)) {
      Alert.alert(
        "Guía no descargada",
        isOffline
          ? "Esta guía no está guardada y no tenés conexión."
          : "Descargá la guía para consultarla sin internet.",
      );
      return;
    }
    const data = readGuide(guide.id);
    if (data) setSelected(data);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATALOG.filter((g) => {
      const matchText =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.region.toLowerCase().includes(q);
      const matchFilter =
        filter === "Todas" ||
        (filter === "Descargadas"
          ? downloaded.includes(g.id)
          : g.category === filter);
      return matchText && matchFilter;
    });
  }, [search, filter, downloaded]);

  const totalMB = CATALOG.filter((g) => downloaded.includes(g.id))
    .reduce((acc, g) => acc + g.sizeMB, 0)
    .toFixed(1);

  const renderItem = ({ item }) => {
    const isDown = downloaded.includes(item.id);
    const isLoading = downloading === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => handleOpen(item)}
      >
        <View style={styles.cardIcon}>
          <Ionicons name={item.icon} size={24} color={COLORS.accent} />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardRegion}>
            <Ionicons name="location-outline" size={12} /> {item.region} ·{" "}
            {item.sizeMB} MB
          </Text>
          <Text style={styles.cardSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        </View>

        <View style={styles.cardAction}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.accent} />
          ) : isDown ? (
            <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={10}>
              <Ionicons
                name="checkmark-circle"
                size={28}
                color={COLORS.accent}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => handleDownload(item)}
              hitSlop={10}
              disabled={isOffline}
            >
              <Ionicons
                name="cloud-download-outline"
                size={28}
                color={isOffline ? "#BDBDBD" : COLORS.accent}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundBlob} />

      {/* Header */}
      <View style={styles.header}>
        {navigation?.canGoBack?.() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Guía Offline</Text>
          <Text style={styles.headerSub}>
            Llevá Guanaco en tu bolsillo, sin internet
          </Text>
        </View>
      </View>

      {/* Estado de conexión */}
      <View
        style={[
          styles.statusBanner,
          isOffline ? styles.statusOffline : styles.statusOnline,
        ]}
      >
        <Ionicons
          name={isOffline ? "cloud-offline-outline" : "wifi-outline"}
          size={18}
          color={isOffline ? "#B3261E" : COLORS.accent}
        />
        <Text
          style={[
            styles.statusText,
            { color: isOffline ? "#B3261E" : COLORS.accent },
          ]}
        >
          {isOffline
            ? "Sin conexión: solo podés ver guías ya descargadas"
            : "Conectado: podés descargar guías"}
        </Text>
      </View>

      {/* Resumen de almacenamiento */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {downloaded.length}/{CATALOG.length}
          </Text>
          <Text style={styles.summaryLabel}>Guías guardadas</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{totalMB} MB</Text>
          <Text style={styles.summaryLabel}>Espacio usado</Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar destino o región"
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          maxLength={40}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      <View>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f) => f}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              style={[styles.chip, filter === item && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={(g) => g.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="map-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              {filter === "Descargadas"
                ? "Aún no descargaste ninguna guía."
                : "No encontramos destinos con ese criterio."}
            </Text>
          </View>
        }
      />

      {/* Detalle de la guía (funciona 100% offline, lee de SQLite) */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <SafeAreaView style={styles.container}>
          {selected && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setSelected(null)}
                  style={styles.backBtn}
                >
                  <Ionicons name="close" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    {selected.name}
                  </Text>
                  <Text style={styles.headerSub}>{selected.region}</Text>
                </View>
                <View style={styles.offlineBadge}>
                  <Ionicons name="download" size={12} color={COLORS.white} />
                  <Text style={styles.offlineBadgeText}>Offline</Text>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={styles.detail}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.detailSummary}>{selected.summary}</Text>

                <InfoBlock
                  icon="bus-outline"
                  title="Cómo llegar"
                  text={selected.content.comoLlegar}
                />
                <InfoBlock
                  icon="time-outline"
                  title="Horarios"
                  text={selected.content.horario}
                />
                <InfoBlock
                  icon="cash-outline"
                  title="Costos"
                  text={selected.content.costo}
                />

                <View style={styles.infoBlock}>
                  <View style={styles.infoHeader}>
                    <Ionicons
                      name="bulb-outline"
                      size={20}
                      color={COLORS.accent}
                    />
                    <Text style={styles.infoTitle}>Consejos</Text>
                  </View>
                  {selected.content.consejos.map((c, i) => (
                    <Text key={i} style={styles.tip}>
                      • {c}
                    </Text>
                  ))}
                </View>

                <InfoBlock
                  icon="medkit-outline"
                  title="Emergencias"
                  text={selected.content.emergencia}
                />

                <Text style={styles.savedAt}>
                  Guardada el{" "}
                  {new Date(selected.downloaded_at).toLocaleDateString("es-SV")}
                </Text>
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const InfoBlock = ({ icon, title, text }) => (
  <View style={styles.infoBlock}>
    <View style={styles.infoHeader}>
      <Ionicons name={icon} size={20} color={COLORS.accent} />
      <Text style={styles.infoTitle}>{title}</Text>
    </View>
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  backgroundBlob: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 420,
    height: 320,
    backgroundColor: "#E2F1E9",
    borderBottomRightRadius: 260,
    borderBottomLeftRadius: 160,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    ...SHADOWS.card,
    elevation: 3,
  },
  headerTitle: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.text,
  },
  headerSub: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
  },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  statusOnline: { backgroundColor: "#E2F1E9" },
  statusOffline: { backgroundColor: "#FDECEA" },
  statusText: { fontFamily: FONTS.body, fontSize: 13, marginLeft: 8, flex: 1 },

  summaryCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.card,
    elevation: 4,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNumber: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.accent,
  },
  summaryLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  summaryDivider: { width: 1, backgroundColor: "#E5E5E5" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    height: 46,
    ...SHADOWS.card,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.text,
  },

  chips: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted },
  chipTextActive: { color: COLORS.white },

  list: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
    elevation: 4,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: "#E2F1E9",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, marginHorizontal: SPACING.md },
  cardTitle: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  cardRegion: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardSummary: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  cardAction: { width: 32, alignItems: "center" },

  empty: { alignItems: "center", marginTop: SPACING.xl * 2 },
  emptyText: {
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    textAlign: "center",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  offlineBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    marginLeft: 4,
    fontFamily: FONTS.body,
  },
  detail: { padding: SPACING.xl },
  detailSummary: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  infoBlock: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
    elevation: 3,
  },
  infoHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoTitle: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.body,
    color: COLORS.text,
    marginLeft: 8,
  },
  infoText: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  tip: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  savedAt: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: SPACING.md,
    fontFamily: FONTS.body,
  },
});
