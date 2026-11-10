import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';

export default function AboutModal({ visible, onClose }) {
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

                <Text style={[styles.contentText, { marginTop: 10, fontSize: 13, fontStyle: 'italic', color: '#6B7280' }]}>
                  Desarrollado con pasión y talento salvadoreño para impulsar la cultura de nuestro país.
                </Text>

                <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 }} />

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 37, 41, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    width: '100%',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontWeight: 'bold',
  },
  contentBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  contentText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  versionText: {
    fontFamily: FONTS.heading,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  acceptText: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 16,
    fontWeight: 'bold',
  }
});