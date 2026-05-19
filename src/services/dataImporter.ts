import axios from 'axios';
import AdmZip from 'adm-zip';
import { parse } from 'csv-parse';
import { fStore, admin } from '../lib/firebase-admin';
import fs from 'fs';
import path from 'path';

// Note: In a real environment, you'd iterate through all Establishedments0..9
// For this applet, we'll implement the logic to process a specific ZIP
export async function importCnaeData(zipUrl: string) {
  console.log(`Starting import from ${zipUrl}...`);
  
  try {
    const response = await axios.get(zipUrl, { responseType: 'arraybuffer' });
    const zip = new AdmZip(Buffer.from(response.data));
    const zipEntries = zip.getEntries();

    for (const entry of zipEntries) {
      if (entry.entryName.endsWith('.csv') || entry.entryName.includes('ESTABELE')) {
        console.log(`Processing entry: ${entry.entryName}`);
        const content = entry.getData().toString('latin1');
        
        const parser = parse(content, {
          delimiter: ';',
          relax_column_count: true,
          quote: '"',
          escape: '"'
        });

        let count = 0;
        const batchSize = 400;
        let batch = fStore.batch();

        for await (const record of parser) {
          // RFB Layout (simplified for this context):
          // 0: CNPJ Básico
          // 1: CNPJ Ordem
          // 2: CNPJ DV
          // 3: Identificador Matriz/Filial
          // 4: Nome Fantasia
          // 5: Situação Cadastral
          // ...
          // 10: Data Início Atividade (YYYYMMDD)
          // 11: CNAE Fiscal Principal
          // ...
          // 19: UF
          // 20: Município

          const cnpjCompleto = `${record[0]}${record[1]}${record[2]}`;
          const dataInicio = record[10];
          const cnae = record[11];
          const uf = record[19];
          const municipio = record[20];
          const fantasia = record[4];
          const situacao = record[5];

          if (!cnpjCompleto || !cnae) continue;

          // We only care about active companies for the "Radar"
          if (situacao !== '02') continue; // 02 = Ativa

          const docRef = fStore.collection('establishments').doc(cnpjCompleto);
          batch.set(docRef, {
            cnpj_completo: cnpjCompleto,
            cnae_fiscal: cnae,
            data_inicio_atividade: dataInicio, // Keep string for easy sorting/querying or convert to Date
            uf,
            municipio,
            nome_fantasia: fantasia,
            situacao_cadastral: situacao,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });

          count++;
          if (count % batchSize === 0) {
            await batch.commit();
            batch = fStore.batch();
            console.log(`Imported ${count} records...`);
          }

          // Safety limit for demonstration/container resources
          if (count > 5000) break; 
        }
        
        await batch.commit();
        console.log(`Completed entry ${entry.entryName}. Total: ${count}`);
      }
    }
  } catch (e) {
    console.error("Import failed:", e);
  }
}
