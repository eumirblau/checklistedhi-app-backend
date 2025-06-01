const { google } = require('googleapis');
const path = require('path');

// Ruta al archivo de clave de la cuenta de servicio para pruebas locales
const KEY_FILE_PATH = path.join(__dirname, '..', '_secrets', 'checkedhid-986711418a01.json'); // ¡¡AJUSTA ESTE NOMBRE!!

/**
 * HTTP Cloud Function.
 * @param {Object} req Cloud Functions request context.
 * @param {Object} res Cloud Functions response context.
 */

// MAPEO DE NOMBRES DESCRIPTIVOS A IDS REALES DE GOOGLE SHEETS
const MAPEO_NOMBRES_A_IDS = {
  "ObraID001M": "15UNDktnDzB_8lHkxx4QjKYRfABX4_M2wjCXx61Wh474",
  "ObraID002M": "1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw",
  "ObraID003M": "PENDIENTE_CREAR_SPREADSHEET",
  "ObraID004M": "PENDIENTE_CREAR_SPREADSHEET",
  "ObraID001J": "1YWMpahk6CAtw1trGiKuLMlJRTL0JOy9x7rRkxrAaRn4",
  "ObraID002J": "15EYdKNe_GqHi918p8CVh3-RjCc-zEy8jrdWNdoX6Q1A",
  "ObraID003J": "1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw",
  "Centro Los Mayores Los Almendros": "15UNDktnDzB_8lHkxx4QjKYRfABX4_M2wjCXx61Wh474",
  "San Blas pabellón": "1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw",
  "La Chulapona": "PENDIENTE_CREAR_SPREADSHEET",
  "Barajas pabellón": "PENDIENTE_CREAR_SPREADSHEET",
  "Copia de Barajas pabellón": "1YWMpahk6CAtw1trGiKuLMlJRTL0JOy9x7rRkxrAaRn4",
  "Copia de San Blas pabellón": "15EYdKNe_GqHi918p8CVh3-RjCc-zEy8jrdWNdoX6Q1A",
  "Copia dneutra": "1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw"
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

exports.getInstalacionesDeObra = async (req, res) => {
  // Configurar CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Obtener el parámetro 'spreadsheetId' de la query string
  const spreadsheetIdOriginal = req.query.spreadsheetId;
  const spreadsheetId = convertirNombreAId(spreadsheetIdOriginal);
  
  console.log(`🔄 Convirtiendo: ${spreadsheetIdOriginal} -> ${spreadsheetId}`);

  if (!spreadsheetId) {
    res.status(400).send('Error: Falta el parámetro "spreadsheetId" en la consulta.');
    return;
  }
  try {
    // Simplificar autenticación - usar Google Cloud por defecto
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'], // Solo necesitamos leer metadatos
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Obtener los metadatos de la hoja de cálculo, incluyendo información de las pestañas
    const spreadsheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      fields: 'sheets.properties.title', // Solo pedimos los títulos de las pestañas para eficiencia
    });

    const sheetTitles = [];
    if (spreadsheetMetadata.data.sheets && spreadsheetMetadata.data.sheets.length > 0) {
      spreadsheetMetadata.data.sheets.forEach(sheet => {
        if (sheet.properties && sheet.properties.title) {
          sheetTitles.push(sheet.properties.title);
        }
      });
    }

    res.status(200).json(sheetTitles);

  } catch (error) {
    console.error('Error al obtener Instalaciones de Obra:', error);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('Google API Error:', error.response.data.error);
        // El error de la API de Sheets puede estar anidado de forma diferente para 'get'
        let errorMessage = 'Error desconocido de la API de Google.';
        if (error.response.data.error.message) {
            errorMessage = error.response.data.error.message;
        } else if (typeof error.response.data.error === 'string') {
            errorMessage = error.response.data.error;
        }
        res.status(error.response.status || 500).send(`Error de la API de Google: ${errorMessage}`);
    } else {
        res.status(500).send(`Error interno al procesar la solicitud: ${error.message}`);
    }
  }
};