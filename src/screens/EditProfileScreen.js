import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, SIZES, SPACING, RADIUS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { useUser } from "../context/UserContext";
import { storage } from "../api/storage";
import { profileService } from "../api/services/profileService";
import { getErrorMessage } from "../api/errors";
import SelectField from "../components/SelectField";
import { COUNTRY_OPTIONS, TRAVELER_TYPES } from "../constants/options_cmb";

// Pantalla completa "Editar perfil" (mismo diseño que el detalle del destino).
// Tiene dos secciones: Datos personales y Cambiar contraseña.
// navigation.navigate("EditProfile", { section: "password" }) abre directo en contraseña.
export default function EditProfileScreen({ route, navigation }) {
  const { colors, typography } = useTheme(); // para íconos y estilos en línea
  const styles = useThemedStyles(createStyles); // para los estilos
  const { user, setUser } = useUser();
  const [section, setSection] = useState(route.params?.section ?? "data");

  // ===== Datos personales =====
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    country_of_origin: user?.country_of_origin ?? "",
    traveler_type: user?.traveler_type ?? "",
  });
  const [savingData, setSavingData] = useState(false);
  const [dataError, setDataError] = useState(null);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const saveData = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setDataError("El nombre y el correo son obligatorios.");
      return;
    }
    setSavingData(true);
    setDataError(null);
    try {
      const updated = await profileService.update({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        country_of_origin: form.country_of_origin || null,
        traveler_type: form.traveler_type || null,
      });
      await storage.setUser(updated); // la sesión guardada también se actualiza
      setUser(updated);
      Alert.alert(
        "Perfil actualizado",
        "Tus datos se guardaron correctamente.",
      );
      navigation.goBack();
    } catch (err) {
      setDataError(getErrorMessage(err));
    } finally {
      setSavingData(false);
    }
  };

  // ===== Contraseña =====
  const [pass, setPass] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [passError, setPassError] = useState(null);

  const savePassword = async () => {
    if (!pass.current || !pass.next || !pass.confirm) {
      setPassError("Completa los tres campos.");
      return;
    }
    if (pass.next.length < 8) {
      setPassError("La contraseña nueva debe tener al menos 8 caracteres.");
      return;
    }
    if (pass.next !== pass.confirm) {
      setPassError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setSavingPass(true);
    setPassError(null);
    try {
      await profileService.changePassword({
        current_password: pass.current,
        password: pass.next,
        password_confirmation: pass.confirm,
      });
      setPass({ current: "", next: "", confirm: "" });
      Alert.alert(
        "Contraseña actualizada",
        "Usa tu nueva contraseña la próxima vez que inicies sesión.",
      );
      navigation.goBack();
    } catch (err) {
      setPassError(getErrorMessage(err));
    } finally {
      setSavingPass(false);
    }
  };

  const passwordInput = (key, label) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1, borderWidth: 0 }]}
          value={pass[key]}
          onChangeText={(t) => setPass((p) => ({ ...p, [key]: t }))}
          secureTextEntry={!show}
          autoCapitalize="none"
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity onPress={() => setShow((s) => !s)} hitSlop={10}>
          <Ionicons
            name={show ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.mainContainer}>
      {/* BARRA SUPERIOR (igual que el detalle del destino) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.onAccent} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Editar perfil</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Pestañas */}
          <View style={styles.tabs}>
            {[
              { key: "data", label: "Datos personales" },
              { key: "password", label: "Contraseña" },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, section === t.key && styles.tabActive]}
                onPress={() => setSection(t.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    section === t.key && styles.tabTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {section === "data" ? (
            <>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(t) => setField("name", t)}
                autoCapitalize="words"
                maxLength={100}
              />

              <Text style={styles.label}>Correo</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(t) => setField("email", t)}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={150}
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(t) => setField("phone", t)}
                keyboardType="phone-pad"
                placeholder="Ej. 7000-0000"
                placeholderTextColor={colors.textMuted}
                maxLength={50}
              />

              <Text style={styles.label}>País de origen</Text>
              <SelectField
                title="Selecciona tu país"
                placeholder="Selecciona tu país"
                options={COUNTRY_OPTIONS}
                value={form.country_of_origin}
                onChange={(v) => setField("country_of_origin", v)}
                searchable
              />

              <Text style={styles.label}>Tipo de viajero</Text>
              <SelectField
                title="Tipo de viajero"
                placeholder="Selecciona una opción"
                options={TRAVELER_TYPES}
                value={form.traveler_type}
                onChange={(v) => setField("traveler_type", v)}
              />

              {dataError ? (
                <Text style={styles.errorText}>{dataError}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.mainButton, savingData && { opacity: 0.7 }]}
                onPress={saveData}
                disabled={savingData}
              >
                {savingData ? (
                  <ActivityIndicator color={colors.onAccent} />
                ) : (
                  <Text style={typography.button}>Guardar cambios</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.note}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={colors.secondary}
                />
                <Text style={styles.noteText}>
                  Al cambiarla, se cerrará tu sesión en los demás dispositivos.
                </Text>
              </View>

              {passwordInput("current", "Contraseña actual")}
              {passwordInput("next", "Contraseña nueva (mínimo 8 caracteres)")}
              {passwordInput("confirm", "Confirmar contraseña nueva")}

              {passError ? (
                <Text style={styles.errorText}>{passError}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.mainButton, savingPass && { opacity: 0.7 }]}
                onPress={savePassword}
                disabled={savingPass}
              >
                {savingPass ? (
                  <ActivityIndicator color={colors.onAccent} />
                ) : (
                  <Text style={typography.button}>Actualizar contraseña</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = ({ colors, typography }) =>
  StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: colors.primary },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 45,
      paddingBottom: 12,
    },
    backButton: {
      backgroundColor: colors.accent,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    topBarTitle: {
      color: colors.onAccent,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 12,
    },
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 16,
      paddingTop: 20,
    },

    tabs: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.sm },
    tab: {
      flex: 1,
      height: 38,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    tabActive: { backgroundColor: colors.secondary },
    tabText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
    tabTextActive: { color: colors.onAccent },

    label: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.body,
      color: colors.primaryText,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    input: {
      height: 46,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      backgroundColor: colors.surfaceAlt,
      fontFamily: FONTS.body,
      fontSize: SIZES.body,
      color: colors.text,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      paddingRight: SPACING.md,
      backgroundColor: colors.surfaceAlt,
    },
    note: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
      backgroundColor: colors.secondarySoft,
      marginTop: SPACING.xs,
    },
    noteText: { ...typography.small, color: colors.text, flex: 1 },
    errorText: {
      ...typography.small,
      color: colors.accent,
      marginTop: SPACING.md,
      textAlign: "center",
    },
    mainButton: {
      height: 48,
      borderRadius: RADIUS.md,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginTop: SPACING.lg,
    },
  });
