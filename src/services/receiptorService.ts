import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot,
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { hubService } from './hubService';

export const receiptorService = {
  async processDocument(userId: string, clientId: string, result: any) {
    try {
      // 1. Save Original Receipt
      const receiptRef = await addDoc(collection(db, 'receipts'), {
        clientId,
        userId,
        ...result,
        createdAt: serverTimestamp()
      });

      // 2. Relay to Data Hub (Normalized)
      await hubService.addDocument({
        clientId,
        userId,
        type: result.tipoDoc?.toLowerCase().includes('xml') ? 'nfe' : 'nfse',
        value: result.totais?.valorTotal || 0,
        date: result.dataEmissao,
        emitente: result.emitente?.razaoSocial || 'Desconhecido',
        categoria: result.lancamentoSugestao?.debito || 'Não Categorizado',
        source: 'receiptor-br',
        docRefId: receiptRef.id
      });

      return receiptRef;
    } catch (error) {
      console.error("Receiptor Service Error:", error);
      throw error;
    }
  },

  subscribeToReceipts: (clientId: string, callback: (docs: any[]) => void) => {
    const q = query(
      collection(db, 'receipts'), 
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }
};
