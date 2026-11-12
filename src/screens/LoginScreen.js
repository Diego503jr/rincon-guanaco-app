import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  Keyboard,
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
import { useUser } from "../context/UserContext";
import { getErrorMessage } from "../api/errors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Alto del teclado: se suma como relleno inferior para poder deslizar
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Sube el contenido para dejar a la vista los campos y el botón
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Ingresa tu correo.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = "El correo no es válido.";
    }

    if (!password) {
      newErrors.password = "Ingresa tu contraseña.";
    }

    setErrors(newErrors);

    // Lleva el cursor al primer campo con error
    if (newErrors.email) emailRef.current?.focus();
    else if (newErrors.password) passwordRef.current?.focus();

    return Object.keys(newErrors).length === 0;
  };

  // Quita el error de un campo (y el del servidor) cuando el usuario escribe
  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await login(email.trim(), password);

      // Onboarding por usuario único
      const userIdentifier = email.trim().toLowerCase();
      const storageKey = `@onboarding_${userIdentifier}`;

      const hasSeenOnboarding = await AsyncStorage.getItem(storageKey);

      if (hasSeenOnboarding === "true") {
        navigation.replace("Explorer");
      } else {
        // Pasamos el identificador a la pantalla de Onboarding mediante los parámetros
        navigation.replace("Onboarding", { userId: userIdentifier });
      }
    } catch (error) {
      setErrors({ general: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: keyboardHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
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

          <Text style={styles.title}>
            Encuentra Tu <Text style={styles.accentText}>Rincón Guanaco</Text>
          </Text>

          {/* Correo */}
          <Text style={styles.label}>Correo</Text>
          <TextInput
            ref={emailRef}
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearError("email");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Contraseña */}
          <Text style={[styles.label, styles.labelSpaced]}>Contraseña</Text>
          <View>
            <TextInput
              ref={passwordRef}
              style={[
                styles.input,
                styles.inputPassword,
                errors.password && styles.inputError,
              ]}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError("password");
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
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

          {/* Error del servidor (credenciales incorrectas, sin conexión, usuario inactivo...) */}
          {errors.general && (
            <Text style={[styles.errorText, styles.generalError]}>
              {errors.general}
            </Text>
          )}

          {/* Botón */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={TYPOGRAPHY.button}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Registro */}
          <View style={styles.footer}>
            <Text style={TYPOGRAPHY.body}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.replace("Register")}>
              <Text style={styles.link}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + SPACING.lg }]}
        onPress={() => navigation.navigate("Guide")}
        activeOpacity={0.85}
        accessibilityLabel="Abrir guía de viaje offline"
      >
        <Ionicons
          name="cloud-download-outline"
          size={22}
          color={COLORS.white}
        />
        <Text style={styles.fabText}>Guía offline</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 }, // NUEVO
  scroll: { flexGrow: 1 }, // NUEVO

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
    flexGrow: 1, // CAMBIA: antes era flex: 1
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    marginTop: 25,
  },
  logo: {
    width: 120,
    height: 140,
    alignSelf: "center",
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h3,
    color: COLORS.text,
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },

  label: { ...TYPOGRAPHY.body, marginBottom: SPACING.sm },
  labelSpaced: { marginTop: SPACING.lg },

  input: {
    height: 48,
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
  generalError: { textAlign: "center", marginTop: SPACING.md }, // NUEVO

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
  fab: {
    position: "absolute",
    right: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.body,
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default LoginScreen;
