import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, SIZES, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: '¡Hola, Guanaco!',
    description: 'En El Salvador nos llamamos así con orgullo. Esta app está diseñada por locales para ayudarte a explorar nuestro país.',
    image: require('../../assets/onboarding-volcan.png'),
  },
  {
    id: '2',
    title: 'Tu Guía Virtual',
    description: 'Si venís de fuera, estás en el lugar correcto. Descubrí playas, montañas y pueblos con filtros avanzados por clima y presupuesto.',
    image: require('../../assets/onboarding-iglesia.png'),
  },
  {
    id: '3',
    title: 'Armá tu Itinerario',
    description: 'Organizá tus paradas por días, lee reseñas reales y guardá tus rincones favoritos. ¡El viaje empieza hoy!',
    image: require('../../assets/onboarding-plaza.png'),
  }
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@has_seen_onboarding', 'true');
      navigation.replace('Home');
    } catch (error) {
      console.error("Error guardando el estado:", error);
      navigation.replace('Home');
    }
  };

  const PaginationDots = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.dot, 
            currentIndex === index && styles.activeDot
          ]} 
        />
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundBlob} />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
      
      <View style={styles.footerContainer}>
        {currentIndex === slides.length - 1 ? (
          <View style={styles.lastSlideFooter}>
            <PaginationDots />
            <TouchableOpacity 
              style={styles.startButton} 
              onPress={completeOnboarding}
              activeOpacity={0.85}
            >
              <Text style={styles.startText}>Empezar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.navRow}>
            <TouchableOpacity onPress={completeOnboarding} style={styles.skipButton}>
              <Text style={styles.skipText}>Omitir</Text>
            </TouchableOpacity>
            
            <View style={styles.dotsWrapper}>
               <PaginationDots />
            </View>
            
            <View style={styles.nextButtonWrapper}>
              <TouchableOpacity 
                activeOpacity={0.85}
                style={styles.nextButton}
                onPress={() => flatListRef.current.scrollToIndex({ index: currentIndex + 1 })}
              >
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  backgroundBlob: {
    position: 'absolute',
    top: -height * 0.15,
    left: -width * 0.2,
    width: width * 1.5,
    height: width * 1.4,
    backgroundColor: '#E2F1E9',
    borderBottomRightRadius: width * 0.8,
    borderBottomLeftRadius: width * 0.5,
  },
  slide: { 
    width, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: SPACING.xl 
  },
  card: { 
    backgroundColor: COLORS.white, 
    borderRadius: RADIUS.lg, 
    padding: SPACING.lg, 
    width: '100%', 
    alignItems: 'center', 
    ...SHADOWS.card,
    elevation: 5
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.md,
    overflow: 'hidden'
  },
  image: { 
    width: '100%', 
    height: '100%', 
  },
  title: { 
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm, 
    textAlign: 'center' 
  },
  description: { 
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted, 
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.xs
  },
  footerContainer: { 
    paddingHorizontal: SPACING.xl, 
    paddingBottom: SPACING.xl + SPACING.lg,
    minHeight: 120,
    justifyContent: 'flex-end'
  },
  navRow: { 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  skipButton: {
    flex: 1,
    alignItems: 'flex-start'
  },
  skipText: { 
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted 
  },
  dotsWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  pagination: { 
    flexDirection: 'row', 
  },
  dot: { 
    width: 6, 
    height: 6, 
    borderRadius: RADIUS.pill, 
    backgroundColor: '#D9D9D9', 
    marginHorizontal: 4 
  },
  activeDot: { 
    backgroundColor: COLORS.accent,
  },
  nextButtonWrapper: {
    flex: 1,
    alignItems: 'flex-end',
  },
  nextButton: { 
    backgroundColor: COLORS.accent, 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: { 
    backgroundColor: COLORS.accent, 
    width: '100%', 
    paddingVertical: 15, 
    borderRadius: RADIUS.md, 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md
  },
  startText: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.body,
    color: COLORS.white
  },
  lastSlideFooter: {
    alignItems: 'center',
    width: '100%'
  }
});