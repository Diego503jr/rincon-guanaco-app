import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  FONTS,
  SIZES,
} from "../constants/theme";
import { COUNTRY_OPTIONS, TRAVELER_TYPES } from "../constants/options_cmb";
import SelectField from "../components/SelectField";
import { useUser } from "../context/UserContext";
import { getErrorMessage } from "../api/errors";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Campo del backend → campo de esta pantalla (para mostrar errores 422 donde corresponde)
const FIELD_MAP = {
  name: "nombre",
  email: "email",
  password: "password",
  traveler_type: "tipoViajero",
  country_of_origin: "pais",
};

const pad = (n) => String(n).padStart(2, "0");
const toDisplay = (d) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const toISODate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const RegisterScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { register } = useUser();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [pais, setPais] = useState("");
  const [tipoViajero, setTipoViajero] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));

  const validate = () => {
    const e = {};

    if (!nombre.trim()) e.nombre = "Ingresa tu nombre.";
    if (!apellido.trim()) e.apellido = "Ingresa tu apellido.";
    if (!pais) e.pais = "Selecciona tu país.";
    if (!tipoViajero) e.tipoViajero = "Selecciona tu tipo de viajero.";

    if (!email.trim()) e.email = "Ingresa tu correo.";
    else if (!EMAIL_REGEX.test(email.trim()))
      e.email = "El correo no es válido.";

    if (!password) e.password = "Ingresa tu contraseña.";
    else if (password.length < 8) e.password = "Mínimo 8 caracteres.";

    if (!passwordConfirm) e.passwordConfirm = "Confirma tu contraseña.";
    else if (password !== passwordConfirm)
      e.passwordConfirm = "Las contraseñas no coinciden.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChangeDate = (event, selected) => {
    setShowDatePicker(false);
    if (event.type === "dismissed" || !selected) return;
    setFechaNac(selected);
    clearError("fechaNac");
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const newUser = await register({
        name: `${nombre.trim()} ${apellido.trim()}`,
        email: email.trim(),
        password,
        password_confirmation: passwordConfirm,
        traveler_type: tipoViajero,
        country_of_origin: pais,
      });

      // Solo navega si realmente llegó un usuario (objeto con id)
      if (newUser && typeof newUser === "object" && newUser.id) {
        navigation.replace("Login");
      } else {
        setErrors({
          general: "No se pudo completar el registro. Intenta de nuevo.",
        });
      }
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        Object.entries(serverErrors).forEach(([key, messages]) => {
          mapped[FIELD_MAP[key] ?? "general"] = messages[0];
        });
        setErrors(mapped);
      } else {
        setErrors({ general: getErrorMessage(error) });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header azul */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
          <Text style={styles.headerText}>
            Rincón <Text style={styles.accentText}>Guanaco</Text>
          </Text>
        </View>

        <View style={styles.content}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Nombres */}
          <Text style={styles.label}>Nombres</Text>
          <TextInput
            style={[styles.input, errors.nombre && styles.inputError]}
            value={nombre}
            onChangeText={(t) => {
              setNombre(t);
              clearError("nombre");
            }}
            autoCapitalize="words"
          />
          {errors.nombre && (
            <Text style={styles.errorText}>{errors.nombre}</Text>
          )}

          {/* Apellidos */}
          <Text style={[styles.label, styles.labelSpaced]}>Apellidos</Text>
          <TextInput
            style={[styles.input, errors.apellido && styles.inputError]}
            value={apellido}
            onChangeText={(t) => {
              setApellido(t);
              clearError("apellido");
            }}
            autoCapitalize="words"
          />
          {errors.apellido && (
            <Text style={styles.errorText}>{errors.apellido}</Text>
          )}

          {/* País */}
          <Text style={[styles.label, styles.labelSpaced]}>País de origen</Text>
          <SelectField
            title="Selecciona tu país"
            placeholder="Selecciona tu país"
            options={COUNTRY_OPTIONS}
            value={pais}
            onChange={(v) => {
              setPais(v);
              clearError("pais");
            }}
            searchable
            hasError={!!errors.pais}
          />
          {errors.pais && <Text style={styles.errorText}>{errors.pais}</Text>}

          {/* Tipo de viajero */}
          <Text style={[styles.label, styles.labelSpaced]}>
            Tipo de viajero
          </Text>
          <SelectField
            title="Tipo de viajero"
            placeholder="Selecciona una opción"
            options={TRAVELER_TYPES}
            value={tipoViajero}
            onChange={(v) => {
              setTipoViajero(v);
              clearError("tipoViajero");
            }}
            hasError={!!errors.tipoViajero}
          />
          {errors.tipoViajero && (
            <Text style={styles.errorText}>{errors.tipoViajero}</Text>
          )}

          {/* Correo */}
          <Text style={[styles.label, styles.labelSpaced]}>Correo</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              clearError("email");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Contraseña */}
          <Text style={[styles.label, styles.labelSpaced]}>Contraseña</Text>
          <View>
            <TextInput
              style={[
                styles.input,
                styles.inputPassword,
                errors.password && styles.inputError,
              ]}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clearError("password");
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
            />
            <TouchableOpacity
              style={styles.eye}
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Confirmar contraseña */}
          <Text style={[styles.label, styles.labelSpaced]}>
            Confirmar contraseña
          </Text>
          <TextInput
            style={[styles.input, errors.passwordConfirm && styles.inputError]}
            value={passwordConfirm}
            onChangeText={(t) => {
              setPasswordConfirm(t);
              clearError("passwordConfirm");
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
          />
          {errors.passwordConfirm && (
            <Text style={styles.errorText}>{errors.passwordConfirm}</Text>
          )}

          {/* Error del servidor */}
          {errors.general && (
            <Text style={[styles.errorText, styles.generalError]}>
              {errors.general}
            </Text>
          )}

          {/* Botón */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={TYPOGRAPHY.button}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Ir a login */}
          <View style={styles.footer}>
            <Text style={TYPOGRAPHY.body}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text style={styles.link}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  header: {
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING.lg,
    alignItems: "center",
  },
  headerText: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.white,
  },
  accentText: { color: COLORS.accent },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  logo: { width: 40, height: 60, alignSelf: "center" },

  label: { ...TYPOGRAPHY.body, marginBottom: SPACING.sm },
  labelSpaced: { marginTop: SPACING.md },

  input: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  inputPassword: { paddingRight: 44 },
  inputError: { borderColor: COLORS.accent },

  eye: {
    position: "absolute",
    right: SPACING.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  errorText: {
    ...TYPOGRAPHY.small,
    color: COLORS.accent,
    marginTop: SPACING.xs,
  },
  generalError: { textAlign: "center", marginTop: SPACING.md },

  button: {
    height: 48,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.xl,
  },
  buttonDisabled: { opacity: 0.7 },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  link: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.body,
    color: COLORS.primary,
  },
});

export default RegisterScreen;
