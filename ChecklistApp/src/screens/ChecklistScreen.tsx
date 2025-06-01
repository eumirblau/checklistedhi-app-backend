import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { ChecklistItem } from '../types';
import ApiService from '../services/ApiService';
type ChecklistScreenNavigationProp = any;
type ChecklistScreenRouteProp = any;
interface Props {
  navigation: ChecklistScreenNavigationProp;
  route: ChecklistScreenRouteProp;
}
const ChecklistScreen = ({ navigation, route }: Props) => {
  const { instalacionId, instalacionNombre, spreadsheetId, usuario, obraNombre } = route.params; // Added obraNombre
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [observaciones, setObservaciones] = useState(''); // Existing observations (read-only display)
  const [newObservation, setNewObservation] = useState(''); // New observation being typed
  const loadChecklist = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 ChecklistScreen: Cargando checklist para:', { spreadsheetId, instalacionId, instalacionNombre });
      const data = await ApiService.getItemsDeChecklist(spreadsheetId, instalacionNombre);
      console.log('✅ ChecklistScreen: Items recibidos:', data?.length || 0);
      setItems(data);
    } catch (error) {
      console.error('❌ ChecklistScreen: Error detallado cargando checklist:', error);
      console.error('❌ ChecklistScreen: Error stack:', (error as Error).stack);      console.error('❌ ChecklistScreen: Parámetros:', { spreadsheetId, instalacionId });
      Alert.alert(
        'Error',
        `No se pudieron cargar los items del checklist.\n\nError: ${(error as Error).message || error}\n\nVerifique su conexión a internet.`,
        [{ text: 'Reintentar', onPress: loadChecklist }]
      );
    } finally {
      setLoading(false);
    }
  }, [instalacionId, instalacionNombre, spreadsheetId]);
  useEffect(() => {
    navigation.setOptions({
      title: `Checklist - ${instalacionNombre}`,
    });
    loadChecklist();
  }, [instalacionId, instalacionNombre, navigation, loadChecklist]);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadChecklist();
    setRefreshing(false);
  };
  const toggleItem = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              completado: !item.completado,
              fechaCompletado: !item.completado ? new Date().toISOString() : undefined,
            }
          : item
      )
    );
  };
  const openObservationsModal = (item: ChecklistItem) => {
    setSelectedItem(item);
    setObservaciones(item.observaciones || ''); // Show existing observations
    setNewObservation(''); // Clear new observation input
    setModalVisible(true);
  };
  const saveObservations = () => {
    if (selectedItem && newObservation.trim()) {
      // Create cumulative observation history
      const updatedObservations = formatObservationWithHistory(
        selectedItem.observaciones || '',
        newObservation,
        usuario.nombre
      );

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === selectedItem.id
            ? { ...item, observaciones: updatedObservations }
            : item
        )
      );
    }
    setModalVisible(false);
    setSelectedItem(null);
    setObservaciones('');
    setNewObservation('');
  };
  const saveChecklist = async () => {
    try {
      setSaving(true);
      // obraNombre is now available from route.params
      if (!obraNombre) {
        console.error('ChecklistScreen: obraNombre no está disponible en route.params.');
        Alert.alert('Error', 'Falta información de la obra para guardar. Contacta a soporte.');
        setSaving(false);
        return;
      }
      await ApiService.guardarChecks(spreadsheetId, instalacionNombre, items, usuario.nombre, usuario.cargo, obraNombre);
      Alert.alert('Éxito', 'Checklist guardado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el checklist. Inténtelo nuevamente.');
    } finally {
      setSaving(false);
    }
  };
  const renderItem = ({ item }: { item: ChecklistItem }) => {
    if (!item || !item.descripcion) {
      return null;
    }
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemDescription}>{item.descripcion}</Text>
            {item.unidad && item.cantidad && (
              <Text style={styles.itemDetails}>
                {item.cantidad} {item.unidad}
              </Text>
            )}
          </View>
          <Switch
            value={item.completado}
            onValueChange={() => toggleItem(item.id)}
            trackColor={{ false: '#767577', true: '#34C759' }}
            thumbColor={item.completado ? '#fff' : '#f4f3f4'}
          />
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.observationsButton}
            onPress={() => openObservationsModal(item)}
          >
            <View style={styles.observationsButtonContent}>
              <Text style={styles.emojiIcon}>{item.observaciones ? '👁️' : '💬'}</Text>
              <Text style={styles.observationsButtonText}>
                {item.observaciones ? ' Ver observaciones' : ' Agregar observaciones'}
              </Text>
            </View>
          </TouchableOpacity>
          {item.fechaCompletado && (
            <Text style={styles.completedDate}>
              Completado: {new Date(item.fechaCompletado).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    );
  };
  const completedCount = items.filter(item => item.completado).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando checklist...</Text>
      </View>
    );
  }

  // Helper function to format observations with cumulative history
  const formatObservationWithHistory = (existingObservations: string, newObservationText: string, userName: string): string => {
    if (!newObservationText.trim()) {
      return existingObservations;
    }

    const now = new Date();
    const timestamp = now.toLocaleDateString('es-ES') + ' ' + now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newEntry = `[${timestamp} - ${userName}]: ${newObservationText.trim()}`;

    if (!existingObservations.trim()) {
      return newEntry;
    }

    // Add new observation at the end, separated by a line break
    return `${existingObservations}\n${newEntry}`;
  };

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Progreso del Checklist</Text>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {completedCount} de {totalCount} completados ({progress.toFixed(0)}%)
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>      <FlatList
        data={items || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay items en este checklist
            </Text>
          </View>
        }
      />
      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={saveChecklist}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <View style={styles.saveButtonContent}>
            <Text style={styles.emojiIcon}>💾</Text>
            <Text style={styles.saveButtonText}>Guardar Checklist</Text>
          </View>
        )}
      </TouchableOpacity>
      {/* Observations Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Observaciones</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          {selectedItem && (
            <Text style={styles.modalItemTitle}>{selectedItem.descripcion}</Text>
          )}

          {/* Historial de observaciones existentes */}
          {observaciones && observaciones.trim() !== '' && (
            <View style={styles.observationsHistoryContainer}>
              <View style={styles.observationsHistoryTitleContainer}>
                <Text style={styles.emojiIcon}>📜</Text>
                <Text style={styles.observationsHistoryTitle}>Historial de observaciones:</Text>
              </View>
              <Text style={styles.observationsHistory}>{observaciones}</Text>
            </View>
          )}

          {/* Campo para nueva observación */}
          <View style={styles.newObservationContainer}>
            <View style={styles.newObservationTitleContainer}>
              <Text style={styles.emojiIcon}>✏️</Text>
              <Text style={styles.newObservationTitle}>Nueva observación:</Text>
            </View>
            <TextInput
              style={styles.observationsInput}
              value={newObservation}
              onChangeText={setNewObservation}
              placeholder="Escriba su nueva observación aquí..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={saveObservations}
            >
              <Text style={styles.modalSaveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  progressHeader: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  progressBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginLeft: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  observationsButton: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  observationsButtonText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  completedDate: {
    fontSize: 12,
    color: '#34C759',
    fontStyle: 'italic',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    fontSize: 20,
    color: '#666',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  observationsInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  modalCancelText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  modalSaveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  modalSaveText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  observationsHistoryContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  observationsHistoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  observationsHistory: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  newObservationContainer: {
    marginBottom: 16,
  },
  newObservationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  observationsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  observationsHistoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  newObservationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiIcon: {
    fontSize: 16,
    color: '#007AFF',
  },
});
export default ChecklistScreen;
