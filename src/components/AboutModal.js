import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { SPACING, RADIUS, FONTS } from '../constants/theme';
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";

export default function AboutModal({ visible, onClose }) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              <Text style={styles.title}>Rincón Guanaco</Text>
              
              <View style={styles.contentBox}>
                <Text style={styles.contentText}>
                  Tu compañero digital para descubrir la magia del "Pulgarcito de América".
                </Text>

                <Text style={styles.subtext}>
                  Desarrollado con pasión y talento salvadoreño para impulsar la cultura de nuestro país.
                </Text>

                <View style={styles.divider} />

                <Text style={styles.versionText}>
                  Versión 1.0.0
                </Text>
                <Text style={[styles.versionText, { marginTop: 4, fontSize: 11 }]}>
                  © 2026 Proyecto Académico · ITCA-FEPADE
                </Text>
                <Text style={[styles.versionText, { fontSize: 11 }]}>
                  Todos los derechos reservados.
                </Text>
              </View>

              <TouchableOpacity style={styles.acceptButton} onPress={onClose}>
                <Text style={styles.acceptText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = ({ colors }) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(33, 37, 41, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    modalContainer: {
      backgroundColor: colors.surface,
      width: '100%',
      borderRadius: RADIUS.lg,
      padding: SPACING.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontFamily: FONTS.heading,
      fontSize: 22,
      color: colors.primaryText,
      textAlign: 'center',
      marginBottom: SPACING.md,
      fontWeight: 'bold',
    },
    contentBox: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      padding: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    contentText: {
      fontFamily: FONTS.body,
      fontSize: 15,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: SPACING.md,
    },
    subtext: {
      fontFamily: FONTS.body,
      fontSize: 13,
      fontStyle: 'italic',
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 10,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    versionText: {
      fontFamily: FONTS.heading,
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },
    acceptButton: {
      backgroundColor: colors.accent,
      paddingVertical: 12,
      borderRadius: RADIUS.md,
      alignItems: 'center',
    },
    acceptText: {
      color: colors.onAccent || '#FFFFFF',
      fontFamily: FONTS.heading,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });