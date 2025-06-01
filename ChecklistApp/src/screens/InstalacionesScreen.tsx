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
import { Instalacion } from '../types';
import ApiService from '../services/ApiService';
type InstalacionesScreenNavigationProp = any;
type InstalacionesScreenRouteProp = any;
interface Props {
  navigation: InstalacionesScreenNavigationProp;
  route: InstalacionesScreenRouteProp;
}
const InstalacionesScreen = ({ navigation, route }: Props) => {
  const { obraId, obraNombre, jefeNombre, usuario } = route.params;
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Estado para almacenar el spreadsheetId real resuelto
  const [realSpreadsheetId, setRealSpreadsheetId] = useState<string | null>(null);
  const loadInstalaciones = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando instalaciones para obra:', { jefeNombre, obraNombre, obraId });
      // 1. Resolver el realSpreadsheetId primero
      const resolvedSpreadsheetId = await ApiService.mapToRealSpreadsheetId(obraId);
      console.log('🔑 realSpreadsheetId resuelto:', resolvedSpreadsheetId);
      if (!resolvedSpreadsheetId) {
        console.error('❌ Error: No se pudo resolver el realSpreadsheetId para la obra:', obraId);
        Alert.alert(
          'Error de Configuración',
          'No se pudo encontrar el ID de la hoja de cálculo para esta obra. Contacte al administrador.'
        );
        setInstalaciones([]); // Limpiar instalaciones si no hay ID
        setLoading(false);
        return;
      }
      setRealSpreadsheetId(resolvedSpreadsheetId); // Guardar para usar en handleInstalacionPress
      // 2. Usar el resolvedSpreadsheetId para obtener las instalaciones
      const data = await ApiService.getInstalacionesDeObra(resolvedSpreadsheetId);
      console.log('✅ Instalaciones recibidas:', data);
      console.log('📊 Cantidad de instalaciones:', data?.length || 0);
      setInstalaciones(data || []); // Asegurar que sea un array
    } catch (error) {
      console.error('❌ Error cargando instalaciones:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las instalaciones. Verifique su conexión a internet.',
        [{ text: 'Reintentar', onPress: loadInstalaciones }]
      );
      setInstalaciones([]); // Limpiar en caso de error
    } finally {
      setLoading(false);
    }
  }, [obraId, obraNombre, jefeNombre]); // Dependencias actualizadas
  useEffect(() => {
    navigation.setOptions({
      title: `Instalaciones - ${obraNombre}`,
    });
    loadInstalaciones();
  }, [obraId, obraNombre, navigation, loadInstalaciones]); // loadInstalaciones ahora tiene obraId en sus dependencias indirectas
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInstalaciones();
    setRefreshing(false);
  };
  const handleInstalacionPress = async (instalacion: Instalacion) => {
    // realSpreadsheetId ya debería estar resuelto y en el estado
    if (!realSpreadsheetId) {
      console.error('Error: realSpreadsheetId no está disponible al presionar instalación.');
      Alert.alert('Error', 'No se pudo determinar la hoja de cálculo para esta obra.');
      return;
    }
    console.log('🔍 DEBUG InstalacionesScreen - Navegando al checklist:', {
      instalacionId: instalacion.id,
      instalacionNombre: instalacion.nombre,
      obraIdInterno: obraId, // Este es el ID técnico de la obra, ej: ObraID001M
      spreadsheetIdReal: realSpreadsheetId, // Este es el ID de la hoja de Google
      obraNombre: obraNombre,
    });
    navigation.navigate('ChecklistScreen', {
      instalacionId: instalacion.id,
      instalacionNombre: instalacion.nombre,
      spreadsheetId: realSpreadsheetId, // Pasar el ID real de la hoja
      usuario: usuario,
      obraNombre: obraNombre,
    });
  };
  const renderInstalacion = ({ item }: { item: Instalacion }) => {
    console.log('🔄 Renderizando instalación:', item);
    if (!item || !item.nombre) {
      console.log('⚠️ Instalación inválida, no se renderiza:', item);
      return null;
    }
    return (
      <TouchableOpacity
        style={styles.instalacionCard}
        onPress={() => handleInstalacionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.instalacionInfo}>
          <Text style={styles.instalacionNombre}>{item.nombre}</Text>
          {item.tipo && (
            <View style={styles.instalacionTipoContainer}>
              <Text style={styles.emojiIcon}>🔧</Text>
              <Text style={styles.instalacionTipo}>{item.tipo}</Text>
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
  };
  const getEstadoStyle = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completo':
      case 'completado':
        return styles.estadoCompleto;
      case 'pendiente':
      case 'en proceso':
        return styles.estadoPendiente;
      case 'revision':
      case 'revisión':
        return styles.estadoRevision;
      default:
        return styles.estadoDefault;
    }
  };
  if (loading) {
    console.log('⏳ InstalacionesScreen: Cargando...');
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando instalaciones...</Text>
      </View>
    );
  }
  console.log('🎯 InstalacionesScreen: Renderizando con instalaciones:', instalaciones?.length || 0);
  return (
    <View style={styles.container}>
      <FlatList
        data={instalaciones || []}
        renderItem={renderInstalacion}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay instalaciones en {obraNombre}
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
  instalacionCard: {
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
  instalacionInfo: {
    flex: 1,
  },
  instalacionNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  instalacionTipo: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  instalacionTipoContainer: {
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
  },
  estadoCompleto: {
    backgroundColor: '#34C759',
  },
  estadoPendiente: {
    backgroundColor: '#FF9500',
  },
  estadoRevision: {
    backgroundColor: '#007AFF',
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
export default InstalacionesScreen;
