import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { getVisitedDestinations } from '../api/services/reviewsService';

export default function CreateReviewModal({ visible, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  // Estados para el Dropdown
  const [open, setOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  // Estado para controlar los pasos: 'form' (crear) o 'success' (tarjeta de éxito)
  const [step, setStep] = useState('form');

  const currentDate = new Date().toLocaleDateString('es-ES');

  useEffect(() => {
    if (visible) {
      setStep('form'); 
      fetchDestinations();
      setRating(0);
      setComment('');
      setSelectedDestination(null);
    }
  }, [visible]);

  const fetchDestinations = async () => {
    setLoadingDestinations(true);
    try {
      const data = await getVisitedDestinations();
      const formattedItems = data.map(dest => ({
        label: dest.name,
        value: dest.id.toString()
      }));
      setItems(formattedItems);
      
      if (formattedItems.length > 0) {
        setSelectedDestination(formattedItems[0].value);
      }
    } catch (error) {
      console.log("No se pudieron cargar los destinos");
    } finally {
      setLoadingDestinations(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons 
              name="star" 
              size={36} 
              color={star <= rating ? COLORS.secondary : '#D1D5DB'} 
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (rating === 0 || !selectedDestination || comment.trim() === '') {
      alert("Por favor completa todos los campos.");
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const reviewData = {
      destination_id: parseInt(selectedDestination),
      rating: rating,
      comment: comment,
      travel_date: formattedDate,
    };

    try {
      await onSuccess(reviewData);
      setStep('success');
    } catch (error) {
    }
  };

  const handleCloseAll = () => {
    setStep('form');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseAll}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          {step === 'form' ? (
            // --- FORMULARIO DE RESEÑA ---
            <View style={styles.modalContainer}>
              <Text style={styles.title}>Reseña</Text>
              
              {renderStars()}

              {/* Selector de Destinos */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Destino:</Text>
                {loadingDestinations ? (
                  <ActivityIndicator size="small" color={COLORS.secondary} />
                ) : items.length === 0 ? (
                   <Text style={styles.emptyText}>No tienes destinos visitados aún.</Text>
                ) : (
                  <DropDownPicker
                    open={open}
                    value={selectedDestination}
                    items={items}
                    setOpen={setOpen}
                    setValue={setSelectedDestination}
                    setItems={setItems}
                    listMode="SCROLLVIEW"
                    placeholder="Selecciona un destino"
                    style={{
                      backgroundColor: '#E5E7EB',
                      borderWidth: 0,
                      borderRadius: RADIUS.md,
                      height: 50,
                    }}
                    dropDownContainerStyle={{
                      backgroundColor: '#E5E7EB',
                      borderWidth: 0,
                      borderRadius: RADIUS.md,
                    }}
                    textStyle={{
                      fontSize: 16,
                      color: COLORS.text,
                    }}
                    zIndex={3000}
                    zIndexInverse={1000}
                  />
                )}
              </View>

              {/* Fecha Actual */}
              <View style={[styles.fieldContainer, styles.dateContainer]}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.dateText}>Fecha: {currentDate}</Text>
              </View>

              {/* Comentario */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Comentario:</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Escribe tu experiencia aquí..."
                  placeholderTextColor={COLORS.textMuted}
                  textAlignVertical="top"
                />
              </View>

              {/* Botones */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => { Keyboard.dismiss(); handleCloseAll(); }}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.submitButton, (!selectedDestination || rating === 0) && styles.disabledButton]} 
                  onPress={() => { Keyboard.dismiss(); handleSubmit(); }}
                  disabled={!selectedDestination || rating === 0}
                >
                  <Text style={styles.submitText}>Agregar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // --- TARJETA DE CONFIRMACIÓN DE ÉXITO ---
            <View style={styles.modalContainer}>
              <Text style={styles.title}>¡Reseña Registrada!</Text>
              
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  Gracias, tu reseña se ha registrado exitosamente.
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
    marginBottom: SPACING.md,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  starIcon: {
    marginHorizontal: SPACING.xs,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  textArea: {
    backgroundColor: '#E5E7EB',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    height: 100,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  cancelButton: {
    backgroundColor: '#FF7675',
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
  disabledButton: {
    opacity: 0.5,
  },
  submitText: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 16,
    fontWeight: 'bold',
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