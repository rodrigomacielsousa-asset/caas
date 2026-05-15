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

export const extratoService = {
  async processStatement(userId: string, clientId: string, result: any) {
    try {
      // 1. Save Original Statement
      const statementRef = await addDoc(collection(db, 'statements'), {
        clientId,
        userId,
        summary: result.summary,
        status: "pendente",
        createdAt: serverTimestamp()
      });

      // 2. Batch Relay Transactions to Data Hub
      const hubPromises = result.transactions.map((t: any) => 
        hubService.addTransaction({
          clientId,
          userId,
          date: t.date,
          description: t.description,
          amount: t.amount,
          type: t.amount >= 0 ? 'entrada' : 'saida',
          category: t.category,
          source: 'extrato-br',
          docRefId: statementRef.id
        })
      );

      await Promise.all(hubPromises);
      return statementRef;
    } catch (error) {
      console.error("Extrato Service Error:", error);
      throw error;
    }
  }
};
