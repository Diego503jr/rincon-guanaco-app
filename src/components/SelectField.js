import { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, RADIUS, FONTS, SIZES } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";

export default function SelectField({
  value,
  options,
  onChange,
  placeholder = "Selecciona una opción",
  title,
  searchable = false,
  hasError = false,
}) {
  const { colors } = useTheme(); // para íconos y colores en línea
  const styles = useThemedStyles(createStyles); // para los estilos

  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const close = () => {
    setVisible(false);
    setQuery("");
  };

  const select = (option) => {
    onChange(option.value);
    close();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.field, hasError && styles.fieldError]}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.fieldText, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title ?? placeholder}</Text>
              <TouchableOpacity
                onPress={close}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {searchable && (
              <TextInput
                style={styles.search}
                placeholder="Buscar..."
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
              />
            )}

            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.value)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.empty}>Sin resultados</Text>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => select(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primaryText}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = ({ colors }) =>
  StyleSheet.create({
    field: {
      height: 40,
      borderWidth: 1,
      borderColor: colors.primaryText,
      borderRadius: RADIUS.md,
      backgroundColor: colors.surface,
      paddingHorizontal: SPACING.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    fieldError: { borderColor: colors.accent },
    fieldText: {
      flex: 1,
      fontFamily: FONTS.body,
      fontSize: SIZES.body,
      color: colors.text,
    },
    placeholder: { color: colors.textMuted },

    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    sheet: {
      maxHeight: "70%",
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: SPACING.lg,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: SPACING.lg,
    },
    sheetTitle: {
      fontFamily: FONTS.heading,
      fontSize: SIZES.h3,
      color: colors.primaryText,
    },
    search: {
      height: 40,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.primaryText,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      fontFamily: FONTS.body,
      fontSize: SIZES.body,
      color: colors.text,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
    },
    optionText: {
      fontFamily: FONTS.body,
      fontSize: SIZES.body,
      color: colors.text,
    },
    optionSelected: { fontFamily: FONTS.heading, color: colors.primaryText },
    empty: {
      textAlign: "center",
      padding: SPACING.lg,
      fontFamily: FONTS.body,
      color: colors.textMuted,
    },
  });
