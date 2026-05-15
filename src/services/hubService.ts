import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  setDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface HubTransactionInput {
  clientId: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  type: 'entrada' | 'saida';
  category: string;
  source: string;
  docRefId?: string;
}

export interface HubDocumentInput {
  clientId: string;
  userId: string;
  type: 'nfe' | 'nfse' | 'recibo' | 'outro';
  value: number;
  date: string;
  emitente: string;
  categoria: string;
  source: string;
  docRefId?: string;
}

export const hubService = {
  async addTransaction(input: HubTransactionInput) {
    try {
      await addDoc(collection(db, 'hubTransactions'), {
        ...input,
        processedAt: serverTimestamp()
      });
      // Event: Data Changed
      await this.updateClientHubSummary(input.clientId, input.userId);
    } catch (error) {
      console.error("HubService Error (Transaction):", error);
    }
  },

  async addDocument(input: HubDocumentInput) {
    try {
      await addDoc(collection(db, 'hubDocuments'), {
        ...input,
        createdAt: serverTimestamp()
      });
      // Event: Data Changed
      await this.updateClientHubSummary(input.clientId, input.userId);
    } catch (error) {
      console.error("HubService Error (Document):", error);
    }
  },

  async updateClientHubSummary(clientId: string, userId: string) {
    try {
      // Fetch some stats to build summary
      const qTrans = query(
        collection(db, 'hubTransactions'), 
        where('clientId', '==', clientId),
        orderBy('date', 'desc'),
        limit(20)
      );
      const snapTrans = await getDocs(qTrans);
      const transactions = snapTrans.docs.map(d => d.data());

      const totalEntradas = transactions
        .filter(t => t.type === 'entrada')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const totalSaidas = transactions
         .filter(t => t.type === 'saida')
         .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

      const healthScore = totalEntradas > totalSaidas ? 'alto' : (totalEntradas < totalSaidas * 0.5 ? 'baixo' : 'medio');

      await setDoc(doc(db, 'clientHubs', clientId), {
        clientId,
        userId,
        lastSummaryUpdate: serverTimestamp(),
        monthlyRevenue: totalEntradas,
        monthlyExpenses: totalSaidas,
        currentBalance: totalEntradas - totalSaidas,
        healthScore,
        lastTransactions: transactions.slice(0, 5).map(t => ({
          date: t.date,
          description: t.description,
          amount: t.amount,
          type: t.type
        }))
      }, { merge: true });

    } catch (error) {
      console.error("HubService Error (Summary):", error);
    }
  }
};
