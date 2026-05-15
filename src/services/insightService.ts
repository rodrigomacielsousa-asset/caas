import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { hubService } from './hubService';

export const insightService = {
  async saveProjection(userId: string, clientId: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, 'financeModels'), {
        userId,
        clientId,
        ...data,
        createdAt: serverTimestamp()
      });

      await hubService.updateClientHubSummary(clientId, userId);
      return docRef;
    } catch (error) {
       console.error("Insight Service Error:", error);
       throw error;
    }
  }
};
