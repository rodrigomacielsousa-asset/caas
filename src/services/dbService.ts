import { collection, addDoc, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const dbService = {
  async addDoc(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding document: ", error);
      // Fallback for demo mode
      const localData = JSON.parse(localStorage.getItem(`db_${collectionName}`) || '[]');
      const newDoc = { ...data, id: Math.random().toString(), createdAt: new Date().toISOString() };
      localData.push(newDoc);
      localStorage.setItem(`db_${collectionName}`, JSON.stringify(localData));
      return newDoc.id;
    }
  },

  async getCollection<T>(collectionName: string, filters: any[] = []) {
    try {
      const q = query(collection(db, collectionName), ...filters);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error("Error getting collection: ", error);
      // Fallback for demo mode
      const localData = JSON.parse(localStorage.getItem(`db_${collectionName}`) || '[]');
      return localData as T[];
    }
  }
};
