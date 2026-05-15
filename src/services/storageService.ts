import type { Submission, CheckoutRequest } from '../types';

// Mock storage for demo purposes using LocalStorage
// In production, these should be Firestore calls

const SUBMISSIONS_KEY = 'microcaas_submissions';
const CHECKOUT_REQUESTS_KEY = 'microcaas_checkout_requests';

export const storageService = {
  async getSubmissions(): Promise<Submission[]> {
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async addSubmission(submission: Omit<Submission, 'id' | 'status' | 'createdAt'>): Promise<void> {
    const subs = await this.getSubmissions();
    const newSub: Submission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([newSub, ...subs]));
  },

  async updateSubmissionStatus(id: string, status: 'approved' | 'rejected' | 'analyzing'): Promise<void> {
    const subs = await this.getSubmissions();
    const updated = subs.map(s => s.id === id ? { ...s, status } : s);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  },

  async getCheckoutRequests(): Promise<CheckoutRequest[]> {
    const data = localStorage.getItem(CHECKOUT_REQUESTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async addCheckoutRequest(req: Omit<CheckoutRequest, 'id' | 'status' | 'createdAt'>): Promise<void> {
    const requests = await this.getCheckoutRequests();
    const newReq: CheckoutRequest = {
      ...req,
      id: 'REQ-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(CHECKOUT_REQUESTS_KEY, JSON.stringify([newReq, ...requests]));
  },

  async updateCheckoutRequest(id: string, data: Partial<CheckoutRequest>): Promise<void> {
    const requests = await this.getCheckoutRequests();
    const updated = requests.map(r => r.id === id ? { ...r, ...data } : r);
    localStorage.setItem(CHECKOUT_REQUESTS_KEY, JSON.stringify(updated));
  }
};
