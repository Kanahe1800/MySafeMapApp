import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';

import CurrentLocationPin from '../components/CurrentLocationPin';
import SafeBuildingPin from '../components/SafeBuildingPin';

MapboxGL.setAccessToken('foobar');

type SafeBuilding = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  risks?: Array<{
    hazard_type: string;
    description_code?: string;
    rank?: number;
  }>;
};

const MapScreen: React.FC = () => {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [safeBuildings, setSafeBuildings] = useState<SafeBuilding[]>([]);
  const mapRef = useRef<MapboxGL.MapView>(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          setLocation([longitude, latitude]);
        },
        (err) => console.warn(err.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (!location) return;

    const ws = new WebSocket('ws://localhost:8000/ws/buildings');
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          latitude: location[1],
          longitude: location[0],
          radius_km: 0.6,
        })
      );
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.buildings) {
          setSafeBuildings(data.buildings);
        } else if (data.error) {
          console.warn('Error from backend:', data.error);
        }
      } catch (e) {
        console.warn('Failed to parse WebSocket message', e);
      }
    };
    ws.onerror = (event) => console.warn('WebSocket error:', event);
    ws.onclose = () => console.log('WebSocket closed');

    return () => ws.close();
  }, [location]);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL="https://raw.githubusercontent.com/Kanahe1800/MySafeMapApp/main/src/assets/styles/bw_style.json"
        logoEnabled={false}
        compassEnabled={true}
      >
        {location && (
          <>
            <MapboxGL.Camera zoomLevel={16} centerCoordinate={location} />
            <CurrentLocationPin coordinate={location} />
          </>
        )}

        {safeBuildings.map((b) => (
          <SafeBuildingPin
            key={`safe-building-${b.id}`}
            id={`safe-building-${b.id}`}
            coordinate={[b.longitude, b.latitude]}
            name={b.name}
            risks={b.risks}
          />
        ))}
      </MapboxGL.MapView>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
