import React from 'react';
import { useState, useEffect, useCallback } from '../react-hooks';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Obra } from '../types';
import ApiService from '../services/ApiService';
type ObrasScreenNavigationProp = any;
type ObrasScreenRouteProp = any;
interface Props {
  navigation: ObrasScreenNavigationProp;
  route: ObrasScreenRouteProp;
}
const ObrasScreen = ({ navigation, route }: Props) => {
  const { jefeId, jefeNombre, usuario } = route.params;
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);  const [refreshing, setRefreshing] = useState(false);
  const loadObras = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 ObrasScreen: Iniciando carga de obras para jefe:', jefeId);
      const data = await ApiService.getObrasPorJefe(jefeId);
      console.log('✅ ObrasScreen: Obras recibidas:', data);
      setObras(data);
    } catch (error) {
      console.error('❌ ObrasScreen: Error cargando obras:', error);
      Alert.alert(
        'Error de Conexión',
        'No se pudieron cargar las obras. Verifique su conexión a internet y vuelva a intentar.',        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reintentar', onPress: loadObras },
        ]);
    } finally {
      setLoading(false);
    }
  }, [jefeId]);
  useEffect(() => {
    navigation.setOptions({
      title: `Obras - ${jefeNombre}`,
    });
    loadObras();
  }, [jefeId, jefeNombre, navigation, loadObras]);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadObras();
    setRefreshing(false);
  };  const handleObraPress = (obra: Obra) => {
    console.log('🔍 DEBUG ObrasScreen - Obra seleccionada:', {
      id: obra.id,
      nombre: obra.nombre,
      spreadsheetId: obra.spreadsheetId,
      obraIdToPass: obra.id, // Use technical ID for API calls
    });
    navigation.navigate('InstalacionesScreen', {
      obraId: obra.id, // Pass technical ID (e.g., ObraID001M) for API calls
      obraNombre: obra.nombre,
      jefeNombre: jefeNombre,
      usuario: usuario,
    });
  };
  const renderObra = ({ item }: { item: Obra }) => {
    if (!item || !item.nombre) {
      return null;
    }
    return (
      <TouchableOpacity
        style={styles.obraCard}
        onPress={() => handleObraPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.obraInfo}>
          <Text style={styles.obraNombre}>{item.nombre}</Text>
          {item.ubicacion && (
            <View style={styles.obraUbicacionContainer}>
              <Text style={styles.emojiIcon}>📍</Text>
              <Text style={styles.obraUbicacion}>{item.ubicacion}</Text>
            </View>
          )}
          {item.estado && (
            <View style={[styles.estadoBadge, getEstadoStyle(item.estado)]}>
              <Text style={styles.estadoText}>{item.estado}</Text>
            </View>
          )}
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    );
  };  const getEstadoStyle = (estado: string) => {
    // Handle percentage display
    if (estado.includes('%')) {
      const percentage = parseInt(estado.match(/(\d+)%/)?.[1] || '0', 10);
      if (percentage >= 80) {
        return styles.estadoCompletado;
      }
      if (percentage >= 50) {
        return styles.estadoEnProgreso;
      }
      if (percentage >= 20) {
        return styles.estadoActivo;
      }
      return styles.estadoInicio;
    }
      // Fallback for text states
    switch (estado.toLowerCase()) {
      case 'activo':
      case 'en progreso':
        return styles.estadoActivo;
      case 'completado':
      case 'finalizado':
        return styles.estadoCompletado;
      case 'pausado':
      case 'suspendido':
        return styles.estadoPausado;
      default:
        return styles.estadoDefault;
    }
  };
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando obras...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>      <FlatList
        data={obras || []}
        renderItem={renderObra}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay obras asignadas a {jefeNombre}
            </Text>
          </View>
        }
      />
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
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  obraCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  obraInfo: {
    flex: 1,
  },
  obraNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  obraUbicacion: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  obraUbicacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },  estadoActivo: {
    backgroundColor: '#34C759',
  },
  estadoEnProgreso: {
    backgroundColor: '#FF9500',
  },
  estadoInicio: {
    backgroundColor: '#FF3B30',
  },
  estadoCompletado: {
    backgroundColor: '#007AFF',
  },
  estadoPausado: {
    backgroundColor: '#FF9500',
  },
  estadoDefault: {
    backgroundColor: '#8E8E93',
  },
  arrow: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
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
  emojiIcon: {
    fontSize: 16,
    color: '#666',
    marginRight: 4,
  },
});
export default ObrasScreen;
