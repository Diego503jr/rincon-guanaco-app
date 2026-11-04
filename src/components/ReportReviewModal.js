import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { reportReview } from '../api/services/reviewsService';

export default function ReportReviewModal({ visible, reviewId, onClose }) {
  const [selectedMotivo, setSelectedMotivo] = useState('Contenido ofensivo');
  const [step, setStep] = useState('select'); // Controla el paso actual: 'select' o 'success'

  // Opciones disponibles para reportar una reseña
  const motivos = [
    'Contenido ofensivo',
    'Información irrelevante',
    'Spam o publicidad',
    'Otro motivo'
  ];

  // Envía el reporte a la API y cambia al paso de éxito
  const handleSendReport = async () => {
    try {
      await reportReview({
        review_id: reviewId,
        nota: selectedMotivo,
        type_report: 'indebido'
      });
      setStep('success'); 
    } catch (error) {
      alert("Hubo un error al enviar el reporte.");
    }
  };

  // Restablece el estado del modal y lo cierra
  const handleCloseAll = () => {
    setStep('select');
    setSelectedMotivo('Contenido ofensivo');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseAll}
    >
      {/* Oculta el teclado al presionar fuera del contenido del modal */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          {step === 'select' ? (
            // --- MODAL 1: SELECCIONAR MOTIVO (Modal Report) ---
            <View style={styles.modalContainer}>
              <Text style={styles.title}>Reporte Reseña</Text>
              
              {motivos.map((motivo) => {
                const isSelected = selectedMotivo === motivo;
                return (
                  <TouchableOpacity
                    key={motivo}
                    style={[styles.optionButton, isSelected && styles.selectedOption]}
                    onPress={() => setSelectedMotivo(motivo)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {motivo}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCloseAll}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleSendReport}>
                  <Text style={styles.submitText}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // --- MODAL 2: REPORTE ENVIADO (Modal Report Send) ---
            <View style={styles.modalContainer}>
              <Text style={styles.title}>Reporte Enviado</Text>
              
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  Gracias, hemos recibido tu reporte y será revisado
                </Text>
              </View>

              <TouchableOpacity style={styles.acceptButton} onPress={handleCloseAll}>
                <Text style={styles.acceptText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          )}
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
    marginBottom: SPACING.lg,
    fontWeight: 'bold',
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  optionText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.text,
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  successBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  successText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  cancelButton: {
    backgroundColor: COLORS.btnCancelar,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    flex: 0.48,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    flex: 0.48,
    alignItems: 'center',
  },
  submitText: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 16,
    fontWeight: 'bold',
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