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
import { JefeDeGrupo } from '../types';
import ApiService from '../services/ApiService';
type JefesScreenNavigationProp = any;
type JefesScreenRouteProp = any;
interface Props {
  navigation: JefesScreenNavigationProp;
  route: JefesScreenRouteProp;
}
const JefesScreen = ({ navigation, route }: Props) => {
  const { usuario } = route.params;
  const [jefes, setJefes] = useState<JefeDeGrupo[]>([]);
  const [loading, setLoading] = useState(true);  const [refreshing, setRefreshing] = useState(false);
  const loadJefes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ApiService.getJefesDeGrupo();
      setJefes(data);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudieron cargar los jefes de grupo. Verifique su conexión a internet.',
        [{ text: 'Reintentar', onPress: loadJefes }]
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadJefes();
  }, [loadJefes]);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadJefes();
    setRefreshing(false);
  };  const handleJefePress = (jefe: JefeDeGrupo) => {
    navigation.navigate('ObrasScreen', {
      jefeId: jefe.nombre, // Usar nombre en lugar de id para Google Sheets
      jefeNombre: jefe.nombre,
      usuario: usuario,
    });
  };  const renderJefe = ({ item }: { item: JefeDeGrupo }) => {
    // Enhanced validation to prevent text rendering issues
    if (!item || !item.nombre || typeof item.nombre !== 'string') {
      console.log('⚠️ Invalid item in renderJefe:', item);
      return null;
    }
    const nombre = String(item.nombre || '').trim();
    const email = item.email ? String(item.email).trim() : '';
    if (!nombre) {
      console.log('⚠️ Empty nombre in renderJefe:', item);
      return null;
    }
    return (
      <TouchableOpacity
        style={styles.jefeCard}
        onPress={() => handleJefePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.jefeInfo}>
          <Text style={styles.jefeNombre}>{nombre}</Text>
          {email && (
            <Text style={styles.jefeEmail}>{email}</Text>
          )}
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    );
  };
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando jefes de grupo...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jefes de Grupo</Text>      <FlatList
        data={jefes || []}
        renderItem={renderJefe}
        keyExtractor={(item) => {
          const key = item?.id ? String(item.id) : `jefe-${Math.random()}`;
          return key;
        }}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay jefes de grupo disponibles</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  jefeCard: {
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
  jefeInfo: {
    flex: 1,
  },
  jefeNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  jefeEmail: {
    fontSize: 14,
    color: '#666',
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
});
export default JefesScreen;
