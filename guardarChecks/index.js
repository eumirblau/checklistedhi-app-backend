const { google } = require('googleapis');
const path = require('path');

const KEY_FILE_PATH = path.join(__dirname, '..', '_secrets', 'checkedhid-986711418a01.json'); // ¡¡AJUSTA!!

// MAPEO DE NOMBRES DESCRIPTIVOS A IDS REALES DE GOOGLE SHEETS - ACTUALIZADO
const MAPEO_NOMBRES_A_IDS = {
  // IDs por nombre de obra (de la hoja maestra)
  "Centro Los Mayores Los Almendros": "15UNDktnDzB_8lHkxx4QjKYRfABX4_M2wjCXx61Wh474",
  "San Blas pabellón": "1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw",
  "La Chulapona": "155MQ4WgQ-GNHu1mAyC4DWVtKXAyJLTrh2TfjAzq9Nh4",
  "Barajas pabellón": "1LsJA1rqefygrW1owLiAQjTNleENyvIMOzsn1iu6yBzw",
  "Azul": "1ICEl45f3I59Iz4JDTRHD17huoiyISBxCO9eRXWcPdyU",
  "Copia de Barajas pabellón": "1YWMpahk6CAtw1trGiKuLMlJRTL0JOy9x7rRkxrAaRn4",
  "Copia de San Blas pabellón": "15EYdKNe_GqHi918p8CVh3-RjCc-zEy8jrdWNdoX6Q1A",
  "Copia dneutra": "17OfTNY0OBiId27vCXqIa7p8nhmuvvk9Mh9C_WLGcnhA",
  "verde": "1U5zK1Ov9NWUA-C4HcHomGpYr44jpUOafs6v8sRsEl2E",
  
  // IDs por código de obra (de la hoja maestra)
  "ObraID001M": "15UNDktnDzB_8lHkxx4QjKYRfABX4_M2wjCXx61Wh474",
  "ObraID002M": "1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw",
  "ObraID003M": "155MQ4WgQ-GNHu1mAyC4DWVtKXAyJLTrh2TfjAzq9Nh4",
  "ObraID004M": "1LsJA1rqefygrW1owLiAQjTNleENyvIMOzsn1iu6yBzw",
  "ObraID005M": "1ICEl45f3I59Iz4JDTRHD17huoiyISBxCO9eRXWcPdyU",
  "ObraID001J": "1YWMpahk6CAtw1trGiKuLMlJRTL0JOy9x7rRkxrAaRn4",
  "ObraID002J": "15EYdKNe_GqHi918p8CVh3-RjCc-zEy8jrdWNdoX6Q1A",
  "ObraID003J": "17OfTNY0OBiId27vCXqIa7p8nhmuvvk9Mh9C_WLGcnhA",
  "ObraID004J": "1U5zK1Ov9NWUA-C4HcHomGpYr44jpUOafs6v8sRsEl2E"
};

// Mapeo de columnas (0-indexed) - DEBEN COINCIDIR CON getItemsDeChecklist y tu hoja
const COL_S_CONTRATO_CHECK = 11; // Columna L (para √)
const COL_S_CONTRATO_CROSS = 12; // Columna M (para X)
const COL_FECHAPP = 14;          // Columna P
const COL_OBSERVACIONES = 15;    // Columna Q
const COL_USERAPP = 16;          // Columna R
const COL_CARGOAPP = 17;         // Columna S

/**
 * Convierte un índice de columna (0-indexed) a la letra de la columna (A, B, ..., Z, AA, AB, ...).
 * @param {number} columnIndex El índice de la columna (0 para A, 1 para B, etc.).
 * @return {string} La letra de la columna.
 */
function columnIndexToLetter(columnIndex) {
  let letter = '';
  let tempColumn = columnIndex;
  while (tempColumn >= 0) {
    letter = String.fromCharCode((tempColumn % 26) + 65) + letter;
    tempColumn = Math.floor(tempColumn / 26) - 1;
  }
  return letter;
}

/**
 * HTTP Cloud Function.
 * @param {Object} req Cloud Functions request context.
 * @param {Object} res Cloud Functions response context.
 */
exports.guardarChecks = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Permitir POST y OPTIONS
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Método no permitido. Solo se acepta POST.');
    return;
  }
  const { spreadsheetId: spreadsheetIdOriginal, pestana, usuario, cargo, items } = req.body;

  // Convertir nombre descriptivo a ID real usando el mapeo
  const spreadsheetId = MAPEO_NOMBRES_A_IDS[spreadsheetIdOriginal] || spreadsheetIdOriginal;
  
  console.log(`Mapeo guardarChecks: "${spreadsheetIdOriginal}" -> "${spreadsheetId}"`);

  if (!spreadsheetId || !pestana || !usuario || !cargo || !Array.isArray(items)) {
    return res.status(400).send('Error: Faltan datos requeridos en el cuerpo de la solicitud (spreadsheetId, pestana, usuario, cargo, items).');
  }

  if (items.length === 0) {
    return res.status(200).json({ success: true, message: 'No hay ítems para actualizar.' });
  }
  try {
    // Simplificar autenticación - usar Google Cloud por defecto
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Necesita permiso de escritura
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const dataForBatchUpdate = [];    for (const item of items) {
      if (typeof item.rowIndex !== 'number' || item.rowIndex <= 0) {
        console.warn('Ítem omitido: rowIndex inválido o faltante.', item);
        continue; // Saltar este ítem si no tiene un rowIndex válido
      }

      const rowIndex = item.rowIndex; // 1-indexed

      // Determinar si hay cambios reales en este item
      const hasCheckChange = item.s_contrato === '√' || item.s_contrato === 'X';
      const hasObservations = item.observaciones && item.observaciones.trim() !== '';
      const hasRealChanges = hasCheckChange || hasObservations;

      // s/CONTRATO
      if (item.s_contrato === '√') {
        dataForBatchUpdate.push({
          range: `${pestana}!${columnIndexToLetter(COL_S_CONTRATO_CHECK)}${rowIndex}`,
          values: [['√']],
        });
        dataForBatchUpdate.push({ // Limpiar la columna X
          range: `${pestana}!${columnIndexToLetter(COL_S_CONTRATO_CROSS)}${rowIndex}`,
          values: [['']],
        });
      } else if (item.s_contrato === 'X') {
        dataForBatchUpdate.push({ // Limpiar la columna L
          range: `${pestana}!${columnIndexToLetter(COL_S_CONTRATO_CHECK)}${rowIndex}`,
          values: [['']],
        });
        dataForBatchUpdate.push({
          range: `${pestana}!${columnIndexToLetter(COL_S_CONTRATO_CROSS)}${rowIndex}`,
          values: [['X']],
        });
      } else { // Si s_contrato es "" o cualquier otra cosa, limpiar ambas
        dataForBatchUpdate.push({
          range: `${pestana}!${columnIndexToLetter(COL_S_CONTRATO_CHECK)}${rowIndex}`,
          values: [['']],
        });
        dataForBatchUpdate.push({
          range: `${pestana}!${columnIndexToLetter(COL_S_CONTRATO_CROSS)}${rowIndex}`,
          values: [['']],
        });
      }
      
      // fechapp
      dataForBatchUpdate.push({
        range: `${pestana}!${columnIndexToLetter(COL_FECHAPP)}${rowIndex}`,
        values: [[item.fechapp || '']],
      });

      // Observaciones
      dataForBatchUpdate.push({
        range: `${pestana}!${columnIndexToLetter(COL_OBSERVACIONES)}${rowIndex}`,
        values: [[item.observaciones || '']],
      });

      // Solo guardar usuario y cargo si hay cambios reales (check o observaciones)
      if (hasRealChanges) {
        console.log(`✅ Guardando usuario/cargo para fila ${rowIndex} (tiene cambios reales)`);
        
        // Userapp
        dataForBatchUpdate.push({
          range: `${pestana}!${columnIndexToLetter(COL_USERAPP)}${rowIndex}`,
          values: [[usuario]],
        });

        // Cargoapp
        dataForBatchUpdate.push({
          range: `${pestana}!${columnIndexToLetter(COL_CARGOAPP)}${rowIndex}`,
          values: [[cargo]],
        });
      } else {
        console.log(`⏭️ Saltando usuario/cargo para fila ${rowIndex} (sin cambios reales)`);
      }
    }

    if (dataForBatchUpdate.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          valueInputOption: 'USER_ENTERED', // O 'RAW' si no necesitas que Sheets interprete los datos
          data: dataForBatchUpdate,
        },
      });
      res.status(200).json({ success: true, message: `${items.length} ítem(s) procesado(s) y guardado(s) correctamente.` });
    } else {
      res.status(200).json({ success: true, message: 'No se generaron actualizaciones válidas para la hoja.' });
    }

  } catch (error) {
    console.error(`Error en guardarChecks para ${spreadsheetId}, pestaña ${pestana}:`, error);
    if (error.response && error.response.data && error.response.data.error) {
        console.error('Google API Error:', error.response.data.error);
        res.status(500).send(`Error de la API de Google: ${error.response.data.error.message || JSON.stringify(error.response.data.error)}`);
    } else {
        res.status(500).send(`Error interno al procesar la solicitud: ${error.message}`);
    }
  }
};