import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Client {
  id: string;
  userId: string;
  companyName: string;
  cnpj: string;
  email: string;
  phone?: string;
  status: 'ativo' | 'inativo';
  createdAt: any;
}

export const clientService = {
  getCollection: () => collection(db, 'clients'),

  subscribeToClients: (userId: string, callback: (clients: Client[]) => void) => {
    const q = query(collection(db, 'clients'), where('userId', '==', userId));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
    });
  },

  async createClient(clientData: Partial<Client>) {
    return addDoc(collection(db, 'clients'), {
      ...clientData,
      status: 'ativo',
      createdAt: serverTimestamp()
    });
  },

  async updateClient(clientId: string, data: Partial<Client>) {
    return updateDoc(doc(db, 'clients', clientId), data);
  }
};
