import fs from 'fs';
import path from 'path';
import axios from 'axios';
import unzipper from 'unzipper';
import Papa from 'papaparse';
import admin from 'firebase-admin';

// Initialize Firebase Admin for standalone script
// assumes service account or environment auth is set up
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const URL_BASE = 'https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/';
const ESTAB_FILES = ['Estabelecimentos0.zip', 'Estabelecimentos1.zip']; // Simplified for demo
const COMP_FILES = ['Empresas0.zip'];
const CNAE_FILE = 'Cnaes.zip';

const TEMP_DIR = path.join(process.cwd(), 'temp_cnpj');

async function downloadAndProcess(url: string, type: 'establishment' | 'company' | 'cnae') {
  console.log(`Iniciando processamento de: ${url}`);
  
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  });

  return new Promise((resolve, reject) => {
    response.data
      .pipe(unzipper.Parse())
      .on('entry', async (entry: any) => {
        if (entry.type === 'File') {
          console.log(`Extraindo CSV: ${entry.path}`);
          
          Papa.parse(entry, {
            delimiter: ';',
            encoding: 'ISO-8859-1',
            chunkSize: 1000,
            chunk: async (results) => {
              const batch = db.batch();
              
              for (const row of results.data as any[]) {
                if (type === 'establishment') {
                  const cnpj = `${row[0]}${row[1]}${row[2]}`;
                  const docRef = db.collection('establishments').doc(cnpj);
                  batch.set(docRef, {
                    cnpj_basico: row[0],
                    nome_fantasia: row[4],
                    situacao: row[5],
                    data_inicio: row[10],
                    cnae_principal: row[11],
                    uf: row[18],
                    municipio: row[19],
                    updated_at: admin.firestore.FieldValue.serverTimestamp()
                  }, { merge: true });
                } else if (type === 'cnae') {
                    const docRef = db.collection('cnae_lookup').doc(row[0]);
                    batch.set(docRef, {
                        descricao: row[1]
                    });
                }
              }
              
              await batch.commit();
              console.log(`Batch processado para ${type}`);
            },
            complete: () => {
              console.log(`Processamento completo para: ${entry.path}`);
              resolve(true);
            },
            error: (err) => reject(err)
          });
        } else {
          entry.autodrain();
        }
      })
      .on('error', (err: any) => reject(err));
  });
}

async function runETL() {
  try {
    console.log('--- Iniciando Job ETL CNAE Radar ---');
    
    // 1. Process CNAEs first for lookup
    await downloadAndProcess(`${URL_BASE}${CNAE_FILE}`, 'cnae');
    
    // 2. Process Establishments
    for (const file of ESTAB_FILES) {
      await downloadAndProcess(`${URL_BASE}${file}`, 'establishment');
    }

    console.log('--- ETL Concluído com Sucesso ---');
  } catch (err) {
    console.error('Falha no ETL:', err);
  }
}

// Check for command line flags if needed
runETL();
