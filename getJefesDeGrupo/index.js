const { google } = require('googleapis');
const path = require('path'); // Necesitarás el módulo 'path'

// ID de tu Hoja Maestra
const SPREADSHEET_ID = '1UUU7rq-mjx4GxoE_tR7F8tGSyue0EyC0WimZ70UfitQ';
const RANGE = 'Hoja1!A2:A';

// Ruta al archivo de clave de la cuenta de servicio para pruebas locales
// AJUSTA ESTA RUTA A DONDE GUARDES TU ARCHIVO JSON
const KEY_FILE_PATH = path.join(__dirname, '..', '_secrets', 'checkedhid-986711418a01.json'); // Ejemplo

/**
 * HTTP Cloud Function.
 * @param {Object} req Cloud Functions request context.
 * @param {Object} res Cloud Functions response context.
 */
exports.getJefesDeGrupo = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    // Siempre intentar usar la autenticación de Google Cloud primero
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    let jefes = [];
    if (rows && rows.length) {
      jefes = [...new Set(rows.map(row => row[0]).filter(jefe => jefe && jefe.trim() !== ''))];
    }

    res.status(200).json(jefes);
  } catch (error) {
    console.error('Error al obtener Jefes de Grupo:', error);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('Google API Error:', error.response.data.error);
        res.status(500).send(`Error de la API de Google: ${error.response.data.error.message || JSON.stringify(error.response.data.error)}`);
    } else {
        res.status(500).send(`Error interno al procesar la solicitud: ${error.message}`);
    }
  }
};