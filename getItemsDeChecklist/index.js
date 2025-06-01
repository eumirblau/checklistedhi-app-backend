const { google } = require('googleapis');
const path = require('path');

const KEY_FILE_PATH = path.join(__dirname, '..', '_secrets', 'checkedhid-986711418a01.json'); // ¡¡AJUSTA!!

const HEADER_ROWS_OPTIONS = [9]; // Filas posibles para encabezados (1-indexed)
const DATA_START_ROW_OFFSET = 1;

const COL_UNIDAD = 1; // B
const COL_DESCRIPCION = 5; // F
const COL_S_CONTRATO_CHECK = 11; // L
const COL_S_CONTRATO_CROSS = 12; // M
const COL_FECHAPP = 14; // P (corregido para coincidir con guardarChecks)
const COL_OBSERVACIONES = 15; // Q (corregido para coincidir con guardarChecks)
const COL_USERAPP = 16; // R
const COL_CARGOAPP = 17; // S


// MAPEO DE NOMBRES DESCRIPTIVOS A IDS REALES DE GOOGLE SHEETS (ACTUALIZADO)
const MAPEO_NOMBRES_A_IDS = {
  "ObraID001M": "15UNDktnDzB_8lHkxx4QjKYRfABX4_M2wjCXx61Wh474",
  "ObraID002M": "1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw",
  "ObraID003M": "155MQ4WgQ-GNHu1mAyC4DWVtKXAyJLTrh2TfjAzq9Nh4",
  "ObraID004M": "1LsJA1rqefygrW1owLiAQjTNleENyvIMOzsn1iu6yBzw",
  "ObraID005M": "1ICEl45f3I59Iz4JDTRHD17huoiyISBxCO9eRXWcPdyU",
  "ObraID001J": "1YWMpahk6CAtw1trGiKuLMlJRTL0JOy9x7rRkxrAaRn4",
  "ObraID002J": "15EYdKNe_GqHi918p8CVh3-RjCc-zEy8jrdWNdoX6Q1A",
  "ObraID003J": "17OfTNY0OBiId27vCXqIa7p8nhmuvvk9Mh9C_WLGcnhA",
  "ObraID004J": "1U5zK1Ov9NWUA-C4HcHomGpYr44jpUOafs6v8sRsEl2E",
  "Centro Los Mayores Los Almendros": "15UNDktnDzB_8lHkxx4QjKYRfABX4_M2wjCXx61Wh474",
  "San Blas pabellón": "1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw",
  "La Chulapona": "155MQ4WgQ-GNHu1mAyC4DWVtKXAyJLTrh2TfjAzq9Nh4",
  "Barajas pabellón": "1LsJA1rqefygrW1owLiAQjTNleENyvIMOzsn1iu6yBzw",
  "Azul": "1ICEl45f3I59Iz4JDTRHD17huoiyISBxCO9eRXWcPdyU",
  "Copia de Barajas pabellón": "1YWMpahk6CAtw1trGiKuLMlJRTL0JOy9x7rRkxrAaRn4",
  "Copia de San Blas pabellón": "15EYdKNe_GqHi918p8CVh3-RjCc-zEy8jrdWNdoX6Q1A",
  "Copia dneutra": "17OfTNY0OBiId27vCXqIa7p8nhmuvvk9Mh9C_WLGcnhA",
  "verde": "1U5zK1Ov9NWUA-C4HcHomGpYr44jpUOafs6v8sRsEl2E"
};

// Función para convertir nombre descriptivo a ID real
function convertirNombreAId(nombreOId) {
    // Si ya es un ID real de Google Sheets (empieza con 1 y tiene formato correcto)
    if (nombreOId.match(/^1[a-zA-Z0-9_-]{43}$/)) {
        return nombreOId;
    }
    
    // Buscar en el mapeo
    const idReal = MAPEO_NOMBRES_A_IDS[nombreOId];
    if (idReal && idReal !== 'PENDIENTE_CREAR_SPREADSHEET') {
        return idReal;
    }
    
    // Si no encuentra mapeo, devolver el original
    return nombreOId;
}

exports.getItemsDeChecklist = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const spreadsheetIdOriginal = req.query.spreadsheetId;
  const spreadsheetId = convertirNombreAId(spreadsheetIdOriginal);
  
  console.log(`🔄 Convirtiendo: ${spreadsheetIdOriginal} -> ${spreadsheetId}`);
  const nombrePestana = req.query.pestana;

  if (!spreadsheetId) return res.status(400).send('Error: Falta el parámetro "spreadsheetId".');
  if (!nombrePestana) return res.status(400).send('Error: Falta el parámetro "pestana".');
  try {
    // Simplificar autenticación - usar Google Cloud por defecto
    const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });

    const sheets = google.sheets({ version: 'v4', auth });
    const rangeToRead = `${nombrePestana}!A10:S`; // Leer hasta la columna S

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: rangeToRead,
    });

    const allRows = response.data.values; // Esto seguirá funcionando
    const items = [];

    if (!allRows || allRows.length === 0) {
      return res.status(200).json(items);
    }

    // Comenta o elimina toda la lógica de headerRowIndex y dataStartActualRow
    /*
    let headerRowIndex = -1; // 0-indexed

    // Encontrar la fila de encabezado
    for (let i = 0; i < allRows.length; i++) {
      if (HEADER_ROWS_OPTIONS.includes(i + 1)) { // i+1 es 1-indexed
        const row = allRows[i];
        if (row) { // Asegurarse que la fila no sea undefined
            const unidadHeader = (row[COL_UNIDAD] || '').toString().trim().toUpperCase();
            const descHeader = (row[COL_DESCRIPCION] || '').toString().trim().toUpperCase();
            // Buscamos un texto más específico si es posible, o al menos que no esté vacío
            if (unidadHeader === 'UNIDAD' || descHeader === 'DESCRIPCIÓN' || (unidadHeader && unidadHeader.length > 2) || (descHeader && descHeader.length > 2) ) {
              headerRowIndex = i;
              break;
            }
        }
      }
      // Si hemos pasado las filas de encabezado candidatas y no encontramos nada, paramos la búsqueda de encabezado.
      if (i + 1 > Math.max(...HEADER_ROWS_OPTIONS) && headerRowIndex === -1) {
          break; 
      }
    }

    if (headerRowIndex === -1) {
      console.warn(`No se encontró una fila de encabezado clara en "${nombrePestana}" para ${spreadsheetId}. Verifique las constantes HEADER_ROWS_OPTIONS y el contenido de las filas ${HEADER_ROWS_OPTIONS.join(', ')}.`);
      return res.status(200).json(items);
    }

    const dataStartActualRow = headerRowIndex + DATA_START_ROW_OFFSET;
    console.log(`Pestaña: ${nombrePestana}, Fila de encabezado (0-indexed): ${headerRowIndex}, Fila de inicio de datos (0-indexed): ${dataStartActualRow}`);
    */

    // Asume que la primera fila leída (índice 0) son los datos
    const dataProcessingStartIndex = 0; 

    for (let i = dataProcessingStartIndex; i < allRows.length; i++) { // El bucle ahora solo debería ejecutarse una vez si solo leemos una fila
      const row = allRows[i];
      if (!row) {
        console.log(`Fila ${i + 1} (índice ${i}) es undefined. Saltando.`);
        continue; 
      }

      // --- INICIO DE NUEVO CÓDIGO DE DEPURACIÓN ---
      /*
      if (i === dataStartActualRow) { // Solo para la primera fila de datos
        console.log(`--- Depurando primera fila de datos (Fila de Hoja: ${i + 1}, Índice de Array: ${i}) ---`);
        console.log('Contenido completo de la fila (row):', JSON.stringify(row));
        console.log(`Valor leído para UNIDAD (columna ${COL_UNIDAD + 1}):`, row[COL_UNIDAD]);
        console.log(`Valor leído para DESCRIPCION (columna ${COL_DESCRIPCION + 1}):`, row[COL_DESCRIPCION]);
      }
      */
      // --- FIN DE NUEVO CÓDIGO DE DEPURACIÓN ---
      
      const unidad = (row[COL_UNIDAD] || '').toString().trim(); // COL_UNIDAD sigue siendo 1
      const descripcion = (row[COL_DESCRIPCION] || '').toString().trim(); // COL_DESCRIPCION sigue siendo 5

      // Comenta la condición de parada temporalmente para ver qué se procesa
      /*
      if (unidad === '' && descripcion === '') {
        console.log(`Fila ${i + 1} (índice ${i}) evaluada como vacía en columnas clave (Unidad: '${unidad}', Descripción: '${descripcion}'). Deteniendo.`);
        break; 
      }
      */
      
      let s_contrato = '';
      if ((row[COL_S_CONTRATO_CHECK] || '').toString().trim() === '√') {
        s_contrato = '√';
      } else if ((row[COL_S_CONTRATO_CROSS] || '').toString().trim().toUpperCase() === 'X') {
        s_contrato = 'X';
      }
        items.push({
        rowIndex: 10 + i, // Ajusta el 10 si cambias la fila de inicio en rangeToRead
        unidad: unidad,
        descripcion: descripcion,
        s_contrato: s_contrato,
        fechapp: (row[COL_FECHAPP] || '').toString().trim(),
        observaciones: (row[COL_OBSERVACIONES] || '').toString().trim(),
        userapp: (row[COL_USERAPP] || '').toString().trim(),
        cargoapp: (row[COL_CARGOAPP] || '').toString().trim(),
      });
    }

    res.status(200).json(items);

  } catch (error) {
    console.error(`Error en getItemsDeChecklist para ${spreadsheetId}, pestaña ${nombrePestana}:`, error);
    // ... (manejo de errores igual) ...
    if (error.response && error.response.data && error.response.data.error) {
        console.error('Google API Error:', error.response.data.error);
        res.status(500).send(`Error de la API de Google: ${error.response.data.error.message || JSON.stringify(error.response.data.error)}`);
    } else {
        res.status(500).send(`Error interno al procesar la solicitud: ${error.message}`);
    }
  }
};