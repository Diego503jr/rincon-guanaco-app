import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import SideMenu from './SideMenu';
import AboutModal from './AboutModal';

export default function MainLayout({ children, title = "Explora El Salvador" }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [menuOpen, setMenuOpen] = useState(false); // menú lateral
  const [aboutVisible, setAboutVisible] = useState(false);

  // función para saber si la ruta está activa
  const isActive = (routeName) => route.name === routeName;
  const activeColor = "#F26419";
  const inactiveColor = "#9CA3AF";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0D2A4D" barStyle="light-content" />
      
      {/* HEADER SUPERIOR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.headerIconContainer}>
          <Ionicons name="menu" marginTop= {35} size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.headerIconContainer}>
          <Ionicons name="person-circle-outline" marginTop= {35}  size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* CONTENIDO DE LA PANTALLA */}
      <View style={styles.content}>
        {children}
      </View>

      {/* BARRA DE NAVEGACIÓN INFERIOR*/}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Explorer')}
        >
          <Ionicons 
            name="search" 
            size={26} 
            color={isActive('Explorer') ? activeColor : inactiveColor} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Itineraries')}
        >
          <FontAwesome5 
            name="suitcase-rolling" 
            size={22} 
            color={isActive('Itineraries') ? activeColor : inactiveColor} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Reviews')}
        >
          <Ionicons 
            name="chatbubble-ellipses-outline" 
            size={24} 
            color={isActive('Reviews') ? activeColor : inactiveColor} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons 
            name="person-outline" 
            size={24} 
            color={isActive('Profile') ? activeColor : inactiveColor} 
          />
        </TouchableOpacity>
      </View>
      <SideMenu 
        visible={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onOpenAbout={() => setAboutVisible(true)} 
      />

      {/* Modal "Acerca de" independiente y seguro */}
      <AboutModal 
        visible={aboutVisible} 
        onClose={() => setAboutVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#0D2A4D', // Azul añil
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    //marginTop:35,
    elevation: 4,
  },
  headerIconContainer: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 35,
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
});