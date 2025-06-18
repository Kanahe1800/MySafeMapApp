import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

type Props = {
  coordinate: [number, number];
};

const CurrentLocationPin: React.FC<Props> = ({ coordinate }) => {
  return (
    <MapboxGL.PointAnnotation id="current-location" coordinate={coordinate}>
      <View style={styles.marker} />
    </MapboxGL.PointAnnotation>
  );
};

export default CurrentLocationPin;

const styles = StyleSheet.create({
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E90FF', // DodgerBlue
    borderColor: 'white',
    borderWidth: 2,
  },
});
