import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';
import * as Location from 'expo-location';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.14:8000/api";

export default function NearbyScreen() {
  const [places, setPlaces] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchNearbyPlaces = async () => {
    setErrorMsg(null);
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    let latitude = 13.6929;   // Coordenada por defecto (San Salvador)
    let longitude = -89.2182;

    if (status === 'granted') {
      try {
        // Intentamos obtener la ubicación real del emulador con un tiempo límite de espera
        let currentLocation = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout GPS')), 4000))
        ]);
        
        latitude = currentLocation.coords.latitude;
        longitude = currentLocation.coords.longitude;
      } catch (locationError) {
        console.log("No se pudo obtener el GPS del emulador, usando ubicación por defecto.");
      }
    } else {
      setErrorMsg('Permiso de ubicación denegado. Usando ubicación por defecto.');
    }

    try {
      const response = await fetch(`${BASE_URL}/destinations/nearby?latitude=${latitude}&longitude=${longitude}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener los lugares cercanos');
      }

      setPlaces(data);
    } catch (error) {
      console.error("Error de red con el servidor:", error);
      setErrorMsg('No se pudo conectar con el servidor Laravel.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Buscar lugares cercanos" onPress={fetchNearbyPlaces} />
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      <FlatList
        data={places}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>Distancia: {item.distance ? parseFloat(item.distance).toFixed(2) : '0.00'} km</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  item: { padding: 15, marginVertical: 8, backgroundColor: '#f9f9f9', borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold' },
  error: { color: 'red', marginTop: 10, textAlign: 'center' }
});