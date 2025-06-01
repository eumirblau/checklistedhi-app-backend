// Script para verificar el contenido de la hoja maestra y corregir el mapeo de Copia dneutra
const { google } = require('googleapis');
const path = require('path');

// ID de la Hoja Maestra
const SPREADSHEET_ID = '1UUU7rq-mjx4GxoE_tR7F8tGSyue0EyC0WimZ70UfitQ';
const RANGE = 'Hoja1!A2:C';

async function verificarHojaMaestra() {
    console.log('🔍 === VERIFICANDO CONTENIDO DE LA HOJA MAESTRA ===');
    
    try {
        // Configurar autenticación
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, '..', '_secrets', 'checkedhid-986711418a01.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Leer toda la hoja maestra
        console.log('\n1️⃣ Leyendo hoja maestra...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        
        if (!rows || rows.length === 0) {
            console.log('❌ No se encontraron datos en la hoja maestra');
            return;
        }

        console.log(`✅ Encontradas ${rows.length} filas de datos`);
        
        // 2. Mostrar todas las obras
        console.log('\n2️⃣ === CONTENIDO COMPLETO DE LA HOJA MAESTRA ===');
        console.log('Formato: JEFE | CENTRO | SPREADSHEET_ID');
        console.log('-'.repeat(80));
        
        rows.forEach((row, index) => {
            if (row.length >= 3) {
                const jefe = row[0] || 'Sin jefe';
                const centro = row[1] || 'Sin centro';
                const spreadsheetId = row[2] || 'Sin spreadsheetId';
                console.log(`${index + 1}. ${jefe} | ${centro} | ${spreadsheetId}`);
            }
        });
        
        // 3. Buscar específicamente "Copia dneutra"
        console.log('\n3️⃣ === BÚSQUEDA ESPECÍFICA DE COPIA DNEUTRA ===');
        const dneutraRows = rows.filter((row, index) => {
            if (row.length >= 3) {
                const centro = row[1] || '';
                const spreadsheetId = row[2] || '';
                return centro.toLowerCase().includes('dneutra') || 
                       spreadsheetId.toLowerCase().includes('dneutra') ||
                       centro.includes('ObraID003J');
            }
            return false;
        });
        
        if (dneutraRows.length > 0) {
            console.log(`✅ Encontradas ${dneutraRows.length} filas relacionadas con dneutra:`);
            dneutraRows.forEach((row, index) => {
                console.log(`   ${index + 1}. Jefe: "${row[0]}" | Centro: "${row[1]}" | SpreadsheetId: "${row[2]}"`);
            });
            
            // 4. Verificar si el spreadsheet ID actual es correcto
            const currentMapping = dneutraRows[0];
            console.log('\n4️⃣ === VERIFICACIÓN DEL MAPEO ACTUAL ===');
            console.log(`   Jefe: ${currentMapping[0]}`);
            console.log(`   Centro: ${currentMapping[1]}`);
            console.log(`   SpreadsheetId actual: ${currentMapping[2]}`);
            console.log(`   SpreadsheetId que debería ser: 1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw`);
            
            if (currentMapping[2] === '17OfTNY0OBiId27vCXqIa7p8nhmuvvk9Mh9C_WLGcnhA') {
                console.log('❌ CONFIRMADO: La hoja maestra tiene el spreadsheet ID incorrecto');
                console.log('🔧 ACCIÓN NECESARIA: Actualizar la hoja maestra con el ID correcto');
            } else if (currentMapping[2] === '1__5J8ykBjRvgFYW3d4i0vCyM6ukZ4Ax4Pf21N2Le7tw') {
                console.log('✅ CORRECTO: La hoja maestra ya tiene el ID correcto');
            } else {
                console.log(`⚠️ INESPERADO: La hoja maestra tiene un ID diferente: ${currentMapping[2]}`);
            }
        } else {
            console.log('❌ No se encontró "Copia dneutra" en la hoja maestra');
        }
        
        // 5. Buscar todas las obras de Javier
        console.log('\n5️⃣ === TODAS LAS OBRAS DE JAVIER ===');
        const obrasJavier = rows.filter(row => {
            if (row.length >= 3) {
                const jefe = row[0] || '';
                return jefe.toLowerCase().trim() === 'javier';
            }
            return false;
        });
        
        console.log(`📋 Javier tiene ${obrasJavier.length} obras:`);
        obrasJavier.forEach((row, index) => {
            console.log(`   ${index + 1}. "${row[1]}" -> "${row[2]}"`);
        });
        
    } catch (error) {
        console.error('❌ Error verificando hoja maestra:', error);
        if (error.response && error.response.data) {
            console.error('Google API Error:', error.response.data);
        }
    }
}

verificarHojaMaestra();
