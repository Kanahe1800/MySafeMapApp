import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';

type Props = {
  id: string;
  coordinate: [number, number];
  name: string;
  risks?: Array<{
    hazard_type: string;
    description_code?: string;
    rank?: number;
  }>;
};

const SafeBuildingPin: React.FC<Props> = ({ id, coordinate, name, risks }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(false); // ← track Mapbox selection state

  const hasRisks = Array.isArray(risks) && risks.length > 0;

  const handleSelect = () => {
    if (!modalVisible) {
      setModalVisible(true);
    }
    setSelected(true); // ← mark selected
  };

  const handleDeselect = () => {
    setSelected(false); // ← reset selection flag
  };

  const handleClose = () => {
    setModalVisible(false);
    if (selected) {
      const map = (MapboxGL as any)._mapRef?.current;
      map?.deselectAnnotation?.(id); // ← this helps on some platforms
    }
  };

  return (
    <>
      <MapboxGL.PointAnnotation
        id={id}
        coordinate={coordinate}
        onSelected={handleSelect}
        onDeselected={handleDeselect}
      >
        <View style={styles.marker} />
      </MapboxGL.PointAnnotation>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        presentationStyle="overFullScreen"
      >
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={handleClose}
          activeOpacity={1}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.title}>{name || 'Safe Building'}</Text>
              {hasRisks ? (
                risks.map((risk, i) => (
                  <View key={i} style={styles.riskItem}>
                    <Text>Hazard: {risk.hazard_type}</Text>
                    {risk.description_code && (
                      <Text>Description: {risk.description_code}</Text>
                    )}
                    {risk.rank !== undefined && <Text>Rank: {risk.rank}</Text>}
                  </View>
                ))
              ) : (
                <Text>No hazard risks reported.</Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default SafeBuildingPin;

const styles = StyleSheet.create({
  marker: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: 'green',
    borderColor: 'white',
    borderWidth: 2,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    maxHeight: '80%',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  riskItem: {
    marginBottom: 8,
  },
});
