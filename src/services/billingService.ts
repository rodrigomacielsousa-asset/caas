import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { hubService } from './hubService';

export interface Bill {
  id: string;
  clientId: string;
  userId: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: 'pendente' | 'pago' | 'atrasado';
  type: 'receita' | 'despesa';
  createdAt: any;
}

export const billingService = {
  async createBill(bill: Omit<Bill, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'bills'), {
        ...bill,
        createdAt: serverTimestamp()
      });

      // Sync with Hub if it's a revenue or expense that should reflect in projection
      // For now, we sync on status change to 'pago' or just as a projection
      return docRef;
    } catch (error) {
      console.error("Billing Service Error:", error);
      throw error;
    }
  },

  async updateBillStatus(billId: string, status: Bill['status'], clientId: string, userId: string) {
    await updateDoc(doc(db, 'bills', billId), { status });
    
    // If paid, we could add a hub transaction automatically
    if (status === 'pago') {
      // Fetch bill details first or pass them
    }
    
    await hubService.updateClientHubSummary(clientId, userId);
  }
};
