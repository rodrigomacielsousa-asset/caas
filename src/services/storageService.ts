import { collection, doc, getDocs, setDoc, query, orderBy, addDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { Submission, CheckoutRequest } from '../types';

const SUBMISSIONS_COLLECTION = 'submissions';
const CHECKOUT_REQUESTS_COLLECTION = 'checkoutRequests';

export const storageService = {
  async getSubmissions(): Promise<Submission[]> {
    try {
      const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Submission));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, SUBMISSIONS_COLLECTION);
      return [];
    }
  },

  async addSubmission(submission: Omit<Submission, 'id' | 'status' | 'createdAt'>): Promise<void> {
    try {
      const newSub = {
        ...submission,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, SUBMISSIONS_COLLECTION), newSub);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, SUBMISSIONS_COLLECTION);
    }
  },

  async updateSubmissionStatus(id: string, status: 'approved' | 'rejected' | 'analyzing'): Promise<void> {
    try {
      await updateDoc(doc(db, SUBMISSIONS_COLLECTION, id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, SUBMISSIONS_COLLECTION);
    }
  },

  async getCheckoutRequests(): Promise<CheckoutRequest[]> {
     try {
      const q = query(collection(db, CHECKOUT_REQUESTS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CheckoutRequest));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, CHECKOUT_REQUESTS_COLLECTION);
      return [];
    }
  },

  async addCheckoutRequest(req: Omit<CheckoutRequest, 'id' | 'status' | 'createdAt'>): Promise<void> {
    try {
      const newReq = {
        ...req,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, CHECKOUT_REQUESTS_COLLECTION), newReq);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, CHECKOUT_REQUESTS_COLLECTION);
    }
  },

  async updateCheckoutRequest(id: string, data: Partial<CheckoutRequest>): Promise<void> {
    try {
      await updateDoc(doc(db, CHECKOUT_REQUESTS_COLLECTION, id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, CHECKOUT_REQUESTS_COLLECTION);
    }
  }
};
