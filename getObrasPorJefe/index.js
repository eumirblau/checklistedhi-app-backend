const { google } = require('googleapis');
const path = require('path');

// ID de tu Hoja Maestra
const SPREADSHEET_ID = '1UUU7rq-mjx4GxoE_tR7F8tGSyue0EyC0WimZ70UfitQ';
// Estructura real: Col A: JEFES DE GRUPO, Col B: NumeroObraID, Col C: CENTRO (nombre descriptivo), Col D: URLs con IDs reales
// Las URLs en la columna D contienen los IDs reales de Google Sheets que se extraen dinámicamente
const RANGE = 'Hoja1!A2:D';

// Función para extraer el ID real del spreadsheet desde la URL de Google Sheets
function extractSpreadsheetIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Patrón para extraer ID de URLs como: https://docs.google.com/spreadsheets/d/ID_AQUI/edit...
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// Ruta al archivo de clave de la cuenta de servicio para pruebas locales
const KEY_FILE_PATH = path.join(__dirname, '..', '_secrets', 'checkedhid-986711418a01.json');

/**
 * HTTP Cloud Function.
 * @param {Object} req Cloud Functions request context.
 * @param {Object} res Cloud Functions response context.
 */
exports.getObrasPorJefe = async (req, res) => {
  // Configurar CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  // Obtener el parámetro 'jefe' de la query string
  const jefeDeGrupoSeleccionado = req.query.jefe;

  console.log('Parámetro recibido:', jefeDeGrupoSeleccionado);

  if (!jefeDeGrupoSeleccionado) {
    res.status(400).send('Error: Falta el parámetro "jefe" en la consulta.');
    return;
  }
  try {
    // Simplificar autenticación - usar Google Cloud por defecto
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });    const rows = response.data.values;
    const obrasFiltradas = [];
    
    console.log('Total de filas encontradas:', rows ? rows.length : 0);
    console.log('Primeras 3 filas para debug:', rows ? rows.slice(0, 3) : []);    if (rows && rows.length) {
      for (const row of rows) {        // Estructura REAL: [JEFES DE GRUPO, NumeroObraID, CENTRO (nombre descriptivo), URL]
        // row[0] = JEFES DE GRUPO, row[1] = NumeroObraID, row[2] = CENTRO (nombre descriptivo), row[3] = URL con ID real
        console.log('Comparando:', `"${row[0]}" vs "${jefeDeGrupoSeleccionado}"`);
        
        if (row.length >= 4 && row[0] && row[0].trim().toLowerCase() === jefeDeGrupoSeleccionado.trim().toLowerCase()) {
          const numeroObraId = row[1] ? row[1].trim() : '';
          const nombreDescriptivo = row[2] ? row[2].trim() : ''; // El nombre descriptivo está en columna C
          const urlCompleta = row[3] ? row[3].trim() : ''; // La URL está en columna D (posición 3)
          
          if (numeroObraId && nombreDescriptivo && urlCompleta) {
            // Extraer ID real de la URL de Google Sheets
            const idReal = extractSpreadsheetIdFromUrl(urlCompleta);
            
            if (idReal) {
              console.log(`✅ Obra escalable: "${nombreDescriptivo}" (${numeroObraId}) -> ID real: ${idReal}`);
              
              obrasFiltradas.push({
                centro: numeroObraId, // Usar NumeroObraID como identificador
                spreadsheetId: idReal, // ID real extraído dinámicamente de la URL
                nombre: nombreDescriptivo   // Nombre descriptivo de la columna C
              });
            } else {
              console.warn(`⚠️ No se pudo extraer ID de la URL: ${urlCompleta}`);
            }
          }
        }
      }
    }

    res.status(200).json(obrasFiltradas);

  } catch (error) {
    console.error('Error al obtener Obras por Jefe:', error);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('Google API Error:', error.response.data.error);
        res.status(500).send(`Error de la API de Google: ${error.response.data.error.message || JSON.stringify(error.response.data.error)}`);
    } else {
        res.status(500).send(`Error interno al procesar la solicitud: ${error.message}`);
    }
  }
};