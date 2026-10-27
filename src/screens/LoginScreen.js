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
import {useNavigation} from "@react-navigation/native"
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

const LoginScreen = () => {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // navigation.replace('Home');
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

          <Text style={styles.title}>
            Encuentra Tu <Text style={styles.accentText}>Rincón Guanaco</Text>
          </Text>

          {/* Correo */}
          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={setEmail}
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
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    marginTop: 25
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

export default LoginScreen;
