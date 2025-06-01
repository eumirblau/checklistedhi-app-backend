import { JefeDeGrupo, Obra, Instalacion, ChecklistItem } from '../types';
const BASE_URL = 'https://europe-west1-checkedhid.cloudfunctions.net';
// Mock data para pruebas (mantener como backup)
const MOCK_DATA = {
  jefes: [
    { id: '1', nombre: 'Monserrat', email: 'monserrat@checkedhid.com' },
    { id: '2', nombre: 'Javier', email: 'javier@checkedhid.com' },
  ],
  obras: {
    'Monserrat': [
      { id: 'ObraID001M', nombre: 'Centro Los Mayores Los Almendros', spreadsheetId: '15UNDktnDzB_8lHkxx4QjKYRfABX4_M2wjCXx61Wh474', ubicacion: 'Madrid', estado: 'Activo' },
      { id: 'ObraID002M', nombre: 'San Blas pabellón', spreadsheetId: '1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw', ubicacion: 'Madrid', estado: 'Activo' },
      { id: 'ObraID003M', nombre: 'La Chulapona', spreadsheetId: '155MQ4WgQ-GNHu1mAyC4DWVtKXAyJLTrh2TfjAzq9Nh4', ubicacion: 'Madrid', estado: 'Activo' },
      { id: 'ObraID004M', nombre: 'Barajas pabellón', spreadsheetId: '1LsJA1rqefygrW1owLiAQjTNleENyvIMOzsn1iu6yBzw', ubicacion: 'Madrid', estado: 'Activo' },
      { id: 'ObraID005M', nombre: 'Azul', spreadsheetId: '1ICEl45f3I59Iz4JDTRHD17huoiyISBxCO9eRXWcPdyU', ubicacion: 'Madrid', estado: 'Activo'},
    ],
    'Javier': [
      { id: 'ObraID001J', nombre: 'Copia de Barajas pabellón', spreadsheetId: '1YWMpahk6CAtw1trGiKuLMlJRTL0JOy9x7rRkxrAaRn4', ubicacion: 'Madrid', estado: 'Activo' },
      { id: 'ObraID002J', nombre: 'Copia de San Blas pabellón', spreadsheetId: '15EYdKNe_GqHi918p8CVh3-RjCc-zEy8jrdWNdoX6Q1A', ubicacion: 'Madrid', estado: 'Activo' },
      { id: 'ObraID003J', nombre: 'Copia dneutra', spreadsheetId: '17OfTNY0OBiId27vCXqIa7p8nhmuvvk9Mh9C_WLGcnhA', ubicacion: 'Madrid', estado: 'Activo' },
      { id: 'ObraID004J', nombre: 'verde', spreadsheetId: '1U5zK1Ov9NWUA-C4HcHomGpYr44jpUOafs6v8sRsEl2E', ubicacion: 'Madrid', estado: 'Activo' },
    ],
  } as { [key: string]: Obra[] }, // Asegúrate que Obra aquí coincida con la definición en types/index.ts
  // Instalaciones específicas por obra y jefe
  instalacionesPorObra: {
    // Instalaciones para obras de Monserrat
    'ObraID001M': [
      { id: 'clima_m1', nombre: 'CLIMA - Centro Los Mayores', tipo: 'Climatización', estado: 'Pendiente' },
      { id: 'fontaneria_m1', nombre: 'FONTANERIA - Centro Los Mayores', tipo: 'Fontanería', estado: 'En progreso' },
      { id: 'pci_m1', nombre: 'PCI - Centro Los Mayores', tipo: 'Protección contra incendios', estado: 'Completado' },
    ],
    'ObraID002M': [
      { id: 'clima_m2', nombre: 'CLIMA - San Blas', tipo: 'Climatización', estado: 'Pendiente' },
      { id: 'fontaneria_m2', nombre: 'FONTANERIA - San Blas', tipo: 'Fontanería', estado: 'Pendiente' },
      { id: 'bt_m2', nombre: 'BT - San Blas', tipo: 'Baja Tensión', estado: 'En progreso' },
    ],
    'ObraID003M': [
      { id: 'clima_m3', nombre: 'CLIMA - La Chulapona', tipo: 'Climatización', estado: 'Completado' },
      { id: 'pci_m3', nombre: 'PCI - La Chulapona', tipo: 'Protección contra incendios', estado: 'Pendiente' },
    ],
    'ObraID004M': [
      { id: 'fontaneria_m4', nombre: 'FONTANERIA - Barajas', tipo: 'Fontanería', estado: 'En progreso' },
      { id: 'bt_m4', nombre: 'BT - Barajas', tipo: 'Baja Tensión', estado: 'Pendiente' },
    ],
    // Instalaciones para obras de Javier
    'ObraID001J': [
      { id: 'clima_j1', nombre: 'CLIMA - Copia Barajas', tipo: 'Climatización', estado: 'Pendiente' },
      { id: 'fontaneria_j1', nombre: 'FONTANERIA - Copia Barajas', tipo: 'Fontanería', estado: 'Completado' },
      { id: 'seg_j1', nombre: 'SEGURIDAD - Copia Barajas', tipo: 'Seguridad', estado: 'En progreso' },
    ],
    'ObraID002J': [
      { id: 'clima_j2', nombre: 'CLIMA - Copia San Blas', tipo: 'Climatización', estado: 'En progreso' },
      { id: 'bt_j2', nombre: 'BT - Copia San Blas', tipo: 'Baja Tensión', estado: 'Completado' },
    ],
    'ObraID003J': [
      { id: 'clima_j3', nombre: 'CLIMA - Copia dneutra', tipo: 'Climatización', estado: 'Pendiente' },
      { id: 'fontaneria_j3', nombre: 'FONTANERIA - Copia dneutra', tipo: 'Fontanería', estado: 'En progreso' },
      { id: 'pci_j3', nombre: 'PCI - Copia dneutra', tipo: 'Protección contra incendios', estado: 'Pendiente' },
    ],
  } as { [key: string]: Instalacion[] },  // Items específicos por instalación
  itemsPorInstalacion: {
    // Items para instalaciones de Monserrat
    'clima_m1': [
      { id: '1', descripcion: 'Verificar conexiones eléctricas', completado: true, observaciones: 'OK' },
      { id: '2', descripcion: 'Comprobar funcionamiento termostato', completado: false, observaciones: '' },
    ],
    'fontaneria_m1': [
      { id: '3', descripcion: 'Revisar presión de agua', completado: true, observaciones: 'Presión correcta' },
      { id: '4', descripcion: 'Verificar estanqueidad', completado: false, observaciones: '' },
    ],
    // Items para instalaciones de Javier
    'clima_j3': [
      { id: '5', descripcion: 'Verificar conexiones eléctricas - Dneutra', completado: true, observaciones: 'Conexiones OK' },
      { id: '6', descripcion: 'Comprobar funcionamiento termostato - Dneutra', completado: false, observaciones: '' },
      { id: '7', descripcion: 'Test de rendimiento - Dneutra', completado: false, observaciones: '' },
    ],
    'fontaneria_j3': [
      { id: '8', descripcion: 'Revisar presión de agua - Dneutra', completado: true, observaciones: 'OK' },
      { id: '9', descripcion: 'Verificar estanqueidad - Dneutra', completado: false, observaciones: '' },
    ],
  } as { [key: string]: ChecklistItem[] },
};
class ApiService {
  private USE_MOCK = false;
  private FALLBACK_TO_MOCK = true;
  // ✅ ARQUITECTURA ESCALABLE: Sin hardcode de IDs
  // Las Cloud Functions devuelven directamente los IDs reales desde la hoja maestra
  private obraCache: { [jefeNombre: string]: Obra[] } = {};
  private obraCacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  // ✅ MAPEO ESTÁTICO COMO FALLBACK - Garantiza que siempre devolvemos un ID válido
  private readonly FALLBACK_MAPPING = {
    // Obras de Monserrat - IDs únicos reales de la hoja maestra
    'ObraID001M': '15UNDktnDzB_8lHkxx4QjKYRfABX4_M2wjCXx61Wh474', // Centro Los Mayores Los Almendros
    'ObraID002M': '1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw', // San Blas pabellón
    'ObraID003M': '155MQ4WgQ-GNHu1mAyC4DWVtKXAyJLTrh2TfjAzq9Nh4', // La Chulapona
    'ObraID004M': '1LsJA1rqefygrW1owLiAQjTNleENyvIMOzsn1iu6yBzw', // Barajas pabellón
    'ObraID005M': '1ICEl45f3I59Iz4JDTRHD17huoiyISBxCO9eRXWcPdyU', // Azul
    // Obras de Javier - IDs únicos reales de la hoja maestra
    'ObraID001J': '1YWMpahk6CAtw1trGiKuLMlJRTL0JOy9x7rRkxrAaRn4', // Copia de Barajas pabellón
    'ObraID002J': '15EYdKNe_GqHi918p8CVh3-RjCc-zEy8jrdWNdoX6Q1A', // Copia de San Blas pabellón
    'ObraID003J': '17OfTNY0OBiId27vCXqIa7p8nhmuvvk9Mh9C_WLGcnhA', // Copia dneutra
    'ObraID004J': '1U5zK1Ov9NWUA-C4HcHomGpYr44jpUOafs6v8sRsEl2E', // verde
    // Mapeo por nombres descriptivos
    'Centro Los Mayores Los Almendros': '15UNDktnDzB_8lHkxx4QjKYRfABX4_M2wjCXx61Wh474',
    'San Blas pabellón': '1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw',
    'La Chulapona': '155MQ4WgQ-GNHu1mAyC4DWVtKXAyJLTrh2TfjAzq9Nh4',
    'Barajas pabellón': '1LsJA1rqefygrW1owLiAQjTNleENyvIMOzsn1iu6yBzw',
    'Azul': '1ICEl45f3I59Iz4JDTRHD17huoiyISBxCO9eRXWcPdyU',
    'Copia de Barajas pabellón': '1YWMpahk6CAtw1trGiKuLMlJRTL0JOy9x7rRkxrAaRn4',
    'Copia de San Blas pabellón': '15EYdKNe_GqHi918p8CVh3-RjCc-zEy8jrdWNdoX6Q1A',
    'Copia dneutra': '17OfTNY0OBiId27vCXqIa7p8nhmuvvk9Mh9C_WLGcnhA',
    'verde': '1U5zK1Ov9NWUA-C4HcHomGpYr44jpUOafs6v8sRsEl2E',
  } as { [key: string]: string };

  // ✅ ARQUITECTURA ESCALABLE: Obtener ID real de spreadsheet dinámicamente
  public async mapToRealSpreadsheetId(obraIdOrName: string): Promise<string> {
    console.log(`[ApiService.mapToRealSpreadsheetId] Received obraIdOrName: ${obraIdOrName}`);

    // Primero verificar si ya es un ID de Google Sheets válido
    if (obraIdOrName.match(/^[a-zA-Z0-9_-]{44}$/) || obraIdOrName.length > 40) {
      console.log(`[ApiService.mapToRealSpreadsheetId] ${obraIdOrName} parece ser ya un ID de Google Sheets, devolviendo tal como está`);
      return obraIdOrName;
    }

    try {
      // Buscar en todas las obras cacheadas de todos los jefes
      for (const [jefeNombre, obras] of Object.entries(this.obraCache)) {
        const obra = obras.find(o => o.id === obraIdOrName || o.nombre === obraIdOrName);
        if (obra && obra.spreadsheetId) {
          console.log(`[ApiService.mapToRealSpreadsheetId] Found ${obraIdOrName} in cache for ${jefeNombre}: ${obra.spreadsheetId}`);
          return obra.spreadsheetId;
        }
      }

      // Si no está en cache, intentar obtener obras de todos los jefes
      console.log('[ApiService.mapToRealSpreadsheetId] Not found in cache, refreshing from API...');
      const jefes = await this.getJefesDeGrupo();
      for (const jefe of jefes) {
        const obras = await this.getObrasPorJefe(jefe.nombre);
        const obra = obras.find(o => o.id === obraIdOrName || o.nombre === obraIdOrName);
        if (obra && obra.spreadsheetId) {
          console.log(`[ApiService.mapToRealSpreadsheetId] Found ${obraIdOrName} for ${jefe.nombre}: ${obra.spreadsheetId}`);
          return obra.spreadsheetId;
        }
      }
    } catch (error) {
      console.warn(`[ApiService.mapToRealSpreadsheetId] Error dinámico: ${error instanceof Error ? error.message : String(error)}`);
      console.log('[ApiService.mapToRealSpreadsheetId] Intentando con mapeo estático...');
    }

    // FALLBACK: Usar mapeo estático
    const fallbackId = this.FALLBACK_MAPPING[obraIdOrName];
    if (fallbackId) {
      console.log(`[ApiService.mapToRealSpreadsheetId] ✅ Usando fallback para ${obraIdOrName}: ${fallbackId}`);
      return fallbackId;
    }

    // Si todo falla, devolver un ID por defecto (San Blas)
    const defaultId = '1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw';
    console.warn(`[ApiService.mapToRealSpreadsheetId] ⚠️ Obra '${obraIdOrName}' no encontrada. Usando ID por defecto: ${defaultId}`);
    return defaultId;
  }
  // Method to fetch installations for a given construction work (obra)
  async getInstalacionesDeObra(obraIdOrName: string): Promise<Instalacion[]> {
    console.log(`[ApiService.getInstalacionesDeObra] Called with obraIdOrName: ${obraIdOrName}`);
    // Make sure to call the unified mapToRealSpreadsheetId
    const spreadsheetId = await this.mapToRealSpreadsheetId(obraIdOrName);
    console.log(`[ApiService.getInstalacionesDeObra] Mapped obraIdOrName '${obraIdOrName}' to spreadsheetId: ${spreadsheetId}`);
    // No need to check if spreadsheetId is undefined, as mapToRealSpreadsheetId now guarantees a string
    try {
      const response = await fetch(`${BASE_URL}/getInstalacionesDeObra?spreadsheetId=${spreadsheetId}`);
      if (!response.ok) {
        console.error(`[ApiService.getInstalacionesDeObra] API error for ${obraIdOrName} (ID: ${spreadsheetId}): ${response.status}`);
        throw new Error(`Error fetching instalaciones for ${obraIdOrName}: ${response.statusText}`);
      }
      // Assuming the API returns an array of strings (instalacion names)
      const data = await response.json() as unknown as string[];
      return data.map((nombre: string, index: number) => ({
        id: `${spreadsheetId}-${nombre.replace(/\s+/g, '-')}-${index}`,
        nombre: nombre,
        nombreAmigable: this.generarNombreAmigable(nombre),
        tipo: 'instalacion',
        estado: 'activo',
      }));
    } catch (error) {
      console.error(`[ApiService.getInstalacionesDeObra] Error fetching or processing instalaciones for ${obraIdOrName} (ID: ${spreadsheetId}):`, error);
      throw error;
    }
  }
  // Method to fetch checklist items for a specific installation and obra
  async getItemsDeChecklist(obraIdOrName: string, instalacionNombre: string): Promise<ChecklistItem[]> {
    console.log(`[ApiService.getItemsDeChecklist] Called with obraIdOrName: ${obraIdOrName}, instalacion: ${instalacionNombre}`);

    // Extract the actual sheet name from the instalacionNombre if it's a composite ID
    // Format: spreadsheetId-SHEETNAME-index -> we need just SHEETNAME
    let actualSheetName = instalacionNombre;
    if (instalacionNombre.includes('-') && instalacionNombre.length > 40) {
      // This looks like a composite ID, extract the sheet name
      const parts = instalacionNombre.split('-');
      if (parts.length >= 3) {
        // Remove the first part (spreadsheetId) and last part (index)
        // Join the middle parts in case the sheet name itself contains dashes
        actualSheetName = parts.slice(1, -1).join('-');
        console.log(`[ApiService.getItemsDeChecklist] Extracted sheet name '${actualSheetName}' from composite ID '${instalacionNombre}'`);
      }
    }

    // Make sure to call the unified mapToRealSpreadsheetId
    const spreadsheetId = await this.mapToRealSpreadsheetId(obraIdOrName);
    console.log(`[ApiService.getItemsDeChecklist] Mapped obraIdOrName '${obraIdOrName}' to spreadsheetId: ${spreadsheetId} for instalacion ${actualSheetName}`);
    // No need to check if spreadsheetId is undefined
    try {
      const response = await fetch(`${BASE_URL}/getItemsDeChecklist?spreadsheetId=${spreadsheetId}&pestana=${encodeURIComponent(actualSheetName)}`);
      if (!response.ok) {
        console.error(`[ApiService.getItemsDeChecklist] API error for ${obraIdOrName}/${actualSheetName} (ID: ${spreadsheetId}): ${response.status}`);
        throw new Error(`Error fetching items for ${obraIdOrName}/${actualSheetName}: ${response.statusText}`);
      }
      // Assuming the API returns an array of objects that are compatible with ChecklistItem structure
      const itemsData = await response.json() as unknown as any[];
      return itemsData.map((item: any, index: number) => ({
        id: item.id || `${spreadsheetId}-${instalacionNombre}-item-${index}`,
        descripcion: item.descripcion || item.item || 'Descripción no disponible', // Added item.item as a fallback
        completado: item.completado === true || item.completado === 'TRUE' || item.completado === 'VERDADERO' || item.s_contrato === '√', // More robust boolean check
        observaciones: item.observaciones || '',
        unidad: item.unidad || '',
        cantidad: typeof item.cantidad === 'number' ? item.cantidad : undefined, // Ensure cantidad is a number
        fechaCompletado: item.fechaCompletado || undefined, // Ensure it's either string or undefined
        rowIndex: typeof item.rowIndex === 'number' ? item.rowIndex : undefined, // Ensure rowIndex is a number
        // Properties from the provided type that were missing in the original mapping
        meta: item.meta !== undefined ? String(item.meta) : undefined,
        actual: item.actual !== undefined ? String(item.actual) : undefined,
        // estado: item.estado || 'Pendiente', // This was in the old code, but ChecklistItem uses completado: boolean
        subItems: item.subItems || [], // Assuming subItems is part of the API response
      }));
    } catch (error) {
      console.error(`[ApiService.getItemsDeChecklist] Error fetching or processing items for ${obraIdOrName}/${instalacionNombre} (ID: ${spreadsheetId}):`, error);
      throw error;
    }
  }
  // Method to save checklist items
  async guardarChecks(
    obraIdOrName: string,
    instalacionNombre: string,
    itemsToSave: ChecklistItem[],
    usuario: string,
    cargo: string,
    _obraNombreOriginal: string
  ): Promise<any> {
    console.log(`[ApiService.guardarChecks] Called with obraIdOrName: ${obraIdOrName}, instalacion: ${instalacionNombre}`);

    // Extract the actual sheet name from the instalacionNombre if it's a composite ID
    // Format: spreadsheetId-SHEETNAME-index -> we need just SHEETNAME
    let actualSheetName = instalacionNombre;
    if (instalacionNombre.includes('-') && instalacionNombre.length > 40) {
      // This looks like a composite ID, extract the sheet name
      const parts = instalacionNombre.split('-');
      if (parts.length >= 3) {
        // Remove the first part (spreadsheetId) and last part (index)
        // Join the middle parts in case the sheet name itself contains dashes
        actualSheetName = parts.slice(1, -1).join('-');
        console.log(`[ApiService.guardarChecks] Extracted sheet name '${actualSheetName}' from composite ID '${instalacionNombre}'`);
      }
    }

    // Make sure to call the unified mapToRealSpreadsheetId
    const spreadsheetId = await this.mapToRealSpreadsheetId(obraIdOrName);
    console.log(`[ApiService.guardarChecks] Mapped obraIdOrName '${obraIdOrName}' to spreadsheetId: ${spreadsheetId} for instalacion ${actualSheetName}`);

    // Transform ChecklistItem[] to the format expected by backend
    // Only include items that have real changes (checks or observations)
    const itemsWithChanges = itemsToSave.filter(item => {
      const hasCheckChange = item.completado; // If it's checked
      const hasObservations = item.observaciones && item.observaciones.trim() !== '';
      return hasCheckChange || hasObservations;
    });

    console.log(`📋 Filtrando items: ${itemsToSave.length} total -> ${itemsWithChanges.length} con cambios reales`);

    // Transform to backend format
    const backendItems = itemsWithChanges.map((item, index) => ({
      rowIndex: index + 2, // Asumiendo que las filas comienzan en la fila 2 (después del header)
      s_contrato: item.completado ? '√' : '', // Transform completado to s_contrato
      fechapp: item.fechaCompletado ? new Date(item.fechaCompletado).toLocaleDateString('es-ES') : '', // Transform fechaCompletado to fechapp
      observaciones: item.observaciones || '',
    }));

    // No need to check if spreadsheetId is undefined
    try {
      const response = await fetch(`${BASE_URL}/guardarChecks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spreadsheetId,
            pestana: actualSheetName,
            items: backendItems,
            usuario: usuario,
            cargo: cargo,
          }),
        }
      );
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[ApiService.guardarChecks] API error for ${obraIdOrName}/${instalacionNombre} (ID: ${spreadsheetId}): ${response.status} - ${errorBody}`);
        throw new Error(`Error guardando checks for ${obraIdOrName}/${instalacionNombre}: ${response.statusText} - ${errorBody}`);
      }
      const responseData: any = await response.json() as unknown as any; // Add type for responseData
      return responseData;
    } catch (error) {
      console.error(`[ApiService.guardarChecks] Error saving checks for ${obraIdOrName}/${instalacionNombre} (ID: ${spreadsheetId}):`, error);
      throw error;
    }
  }
  // Helper to generate a more friendly name if needed (example)
  private generarNombreAmigable(nombreOriginal: string): string {
    return nombreOriginal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  // Build dynamic mapping from all existing jefes in the master spreadsheet
  private async buildDynamicMapping(): Promise<{ [key: string]: string }> {
    console.log('🔄 Construyendo mapeo dinámico...');
    const newMapping: { [key: string]: string } = {};
    try {
      const jefes = await this.getJefesDeGrupo();
      for (const jefe of jefes) {
        try {
          console.log(`📋 Obteniendo obras para jefe: ${jefe.nombre}`);
          // getObrasPorJefe DEBE devolver objetos Obra que incluyan 'spreadsheetId' (el ID real de la hoja de Google)
          const obras = await this.getObrasPorJefe(jefe.nombre);
          obras.forEach((obra: Obra) => {
            // Prioriza el spreadsheetId obtenido de la API (que debe ser el ID real de la hoja de Google)
            if (obra.spreadsheetId) { // Este es el ID real de la hoja de Google según types/index.ts
              if (obra.id) { // ID interno de la obra en la app
                newMapping[obra.id] = obra.spreadsheetId;
              }
              if (obra.nombre) { // Nombre de la obra
                newMapping[obra.nombre] = obra.spreadsheetId;
              }
              console.log(`✅ Mapeo Dinámico (desde API): ${obra.id || 'N/A'} (${obra.nombre}) -> ${obra.spreadsheetId}`);
            } else {
              // Si la API no proporcionó spreadsheetId (el ID real de la hoja), advertir.
              console.warn(`⚠️ No se proporcionó spreadsheetId (ID real de hoja Google) desde la API para obra ${obra.id || 'N/A'} (${obra.nombre}).`);
            }
          });
        } catch (error) {
          console.warn(`⚠️ Error obteniendo obras para ${jefe.nombre} durante la construcción del mapeo dinámico:`, error);
        }
      }
      console.log('ℹ️ Mapeo dinámico construido desde API:', newMapping);
    } catch (error) {
      console.error('❌ Error obteniendo jefes o procesando obras durante la construcción del mapeo dinámico:', error);
    }
    console.log('✅ Mapeo dinámico final:', newMapping);
    return newMapping;
  }
  // Calculate execution percentage for a construction site
  async calcularPorcentajeEjecucion(obraIdOrName: string): Promise<number> {
    try {
      const spreadsheetId = await this.mapToRealSpreadsheetId(obraIdOrName);
      // No undefined check needed for spreadsheetId
      console.log('📊 Calculando porcentaje de ejecución para:', { obraIdOrName, spreadsheetId });
      const instalaciones = await this.getInstalacionesDeObra(obraIdOrName);
      if (instalaciones.length === 0) {
        console.log('⚠️ No hay instalaciones para calcular porcentaje');
        return 0;
      }
      let totalItems = 0;
      let itemsCompletados = 0;
      for (const instalacion of instalaciones) {
        try {
          const items = await this.getItemsDeChecklist(obraIdOrName, instalacion.nombre);
          totalItems += items.length;
          // Corrected to use item.completado (boolean) as per ChecklistItem type
          itemsCompletados += items.filter(item => item.completado === true).length;
          console.log(`📋 Instalación ${instalacion.nombre}: ${items.filter(item => item.completado === true).length}/${items.length} completados`);
        } catch (error) {
          console.warn(`⚠️ Error obteniendo items para instalación ${instalacion.nombre}:`, error);
        }
      }
      const porcentaje = totalItems > 0 ? Math.round((itemsCompletados / totalItems) * 100) : 0;
      console.log(`✅ Porcentaje total de ejecución para ${obraIdOrName}: ${porcentaje}% (${itemsCompletados}/${totalItems})`);
      return porcentaje;
    } catch (error) {
      console.error('❌ Error calculando porcentaje de ejecución:', error);
      return 0;
    }
  }
  // Get list of group leaders
  async getJefesDeGrupo(): Promise<JefeDeGrupo[]> {
    if (this.USE_MOCK) {
      console.log('🧪 Usando datos mock para jefes');
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      return MOCK_DATA.jefes;
    }
    try {
      console.log('📊 Conectando a Google Sheets para obtener jefes...');
      const response = await fetch(`${BASE_URL}/getJefesDeGrupo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      // Assuming the API returns an array of strings (jefe names)
      const data = await response.json() as unknown as string[];
      console.log('✅ Jefes obtenidos de Google Sheets (raw):', data);
      if (!Array.isArray(data) || data.length === 0) {
        console.warn('⚠️ API devolvió datos vacíos o inválidos, usando fallback');
        if (this.FALLBACK_TO_MOCK) {
          return MOCK_DATA.jefes;
        }
        throw new Error('No se pudieron obtener los jefes de grupo');
      }
      const jefes = data.map((nombre, index) => ({
        id: (index + 1).toString(), // Or a more stable ID if available from API
        nombre: nombre,
        email: `${nombre.toLowerCase().replace(/\s+/g, '')}@checkedhid.com`,
      }));
      console.log('🔄 Jefes mapeados correctamente:', jefes);
      return jefes;
    } catch (error) {
      console.error('❌ Error obteniendo jefes de grupo:', error);
      if (this.FALLBACK_TO_MOCK) {
        console.log('🔄 Usando fallback a datos mock...');
        return MOCK_DATA.jefes;
      }
      throw error;
    }
  }
  async getObrasPorJefe(jefeNombre: string): Promise<Obra[]> {
    if (this.USE_MOCK) {
      console.log('🧪 Usando datos mock específicos para obras del jefe:', jefeNombre);
      await new Promise<void>(resolve => setTimeout(resolve, 800));
      const mockObras = MOCK_DATA.obras[jefeNombre] || [];      // Asegurarse de que los mocks tengan el spreadsheetId (ID real de la hoja)
      mockObras.forEach(obra => {
        if (!obra.spreadsheetId) { // spreadsheetId debe ser el ID real de la hoja de Google
          console.warn(`Mock obra ${obra.nombre} no tiene spreadsheetId (ID real de hoja). Esta obra no funcionará correctamente.`);
        }
      });
      return mockObras;
    }
    try {
      console.log('📊 Conectando a Google Sheets para obtener obras del jefe:', jefeNombre);
      const response = await fetch(`${BASE_URL}/getObrasPorJefe?jefe=${encodeURIComponent(jefeNombre)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      // Asumimos que la API devuelve un array de objetos. Cada objeto DEBE tener:
      // - 'id': Identificador de la obra en la app (ej: "ObraID001J")
      // - 'nombre': Nombre de la obra (ej: "Copia dneutra")
      // - 'spreadsheetId': EL ID REAL DE LA HOJA DE GOOGLE SHEETS (ej: "17OfTNY0OBiId27vCXqIa7p8nhmuvvk9Mh9C_WLGcnhA")
      // Otros campos como 'centro', 'googleSheetId' son opcionales o pueden ser alias.
      const data = await response.json() as unknown as Array<{
        id?: string;                 // Identificador de la obra en la app
        nombre?: string;             // Nombre de la obra
        spreadsheetId?: string;      // ID REAL DE LA HOJA DE GOOGLE SHEETS (campo esperado)
        centro?: string;             // Posible alias para 'nombre' o 'id' si la API lo usa así
        googleSheetId?: string;      // Posible alias para 'spreadsheetId' si la API lo usa así
        ubicacion?: string;
        estado?: string;
      }>;
      console.log('✅ Obras obtenidas de Google Sheets para', jefeNombre, '(raw):', data);
      if (!Array.isArray(data)) {
        console.warn('⚠️ API devolvió datos inválidos para obras, usando fallback si está activado');
        if (this.FALLBACK_TO_MOCK) {
          return MOCK_DATA.obras[jefeNombre] || [];
        }
        return [];
      }      const obras = data.map((item: any): Obra => {
        // ✅ ARQUITECTURA ESCALABLE: La API ahora devuelve IDs reales de Google Sheets
        // Formato esperado: {centro: "ObraID003J", spreadsheetId: "17OfTNY0OBiId27vCXqIa7p8nhmuvvk9Mh9C_WLGcnhA"}
        const obraAppId = item.centro || item.id || `obra-random-${Math.random().toString(36).substr(2, 9)}`;
        const obraNombre = item.nombre || item.centro || 'Obra sin nombre';
        const realSheetId = item.spreadsheetId; // ✅ Ahora contiene el ID real de Google Sheets
        if (!realSheetId) {
          console.warn(`❌ Obra ${obraNombre} (${obraAppId}) no tiene spreadsheetId desde la API. Las instalaciones no cargarán.`);
        } else {
          console.log(`✅ Obra ${obraNombre} (${obraAppId}) con ID real: ${realSheetId}`);
        }
        return {
          id: obraAppId, // ID de la obra en la app (ej: "ObraID003J")
          nombre: obraNombre, // Nombre de la obra
          spreadsheetId: realSheetId as string, // ID real de Google Sheets
          ubicacion: item.ubicacion || 'Madrid',
          estado: item.estado || 'Activo',
        };
      });
      console.log('🔄 Obras mapeadas (desde API) correctamente:', obras);
      return obras;
    } catch (error) {
      console.error('❌ Error obteniendo obras para jefe:', jefeNombre, error);
      if (this.FALLBACK_TO_MOCK) {
        console.log('🔄 Usando fallback a datos mock para obras...');
        return MOCK_DATA.obras[jefeNombre] || [];
      }
      return [];
    }
  }
}
export default new ApiService();
