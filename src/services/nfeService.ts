import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { growthService } from './growthService';

export interface NFeData {
  chave: string;
  emitente: string;
  valor: number;
  data: string;
  status: string;
  xml?: string;
  pdfUrl?: string;
  origem: 'consulta' | 'monitor';
  timestamp: any;
}

export interface NFeClient {
  id?: string;
  cnpj: string;
  nome: string;
  certificadoA1?: string; // encrypted pfx base64 (simulated)
  status: 'ativo' | 'inativo';
  ultNSU: string;
}

export const nfeService = {
  // 1. Manual Access Key Search
  async buscarNFe(chave: string, userId: string): Promise<NFeData> {
    // Validation
    const cleanChave = chave.replace(/\D/g, '');
    if (cleanChave.length !== 44) {
      throw new Error("Chave inválida. Deve conter 44 dígitos.");
    }

    try {
      const response = await fetch("/api/nfe/consulta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ chave: cleanChave, userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.type === 'config_missing') {
          throw new Error("Consulta indisponível no momento (API não configurada)");
        }
        throw new Error(errorData.error || "Nota não encontrada ou indisponível");
      }

      const data = await response.json();
      
      // Tracking
      await growthService.trackEvent(userId, 'nfe-consulta', 'search_api', { chave: cleanChave });
      
      return data as NFeData;
    } catch (err: any) {
      console.error("NFe Service Error:", err);
      throw err;
    }
  },

  async consultaPorChave(userId: string, chave: string): Promise<NFeData> {
    return this.buscarNFe(chave, userId);
  },

  // 1.1 Download Helpers
  downloadXML(chave: string, xml: string) {
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfe-${chave}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  },

  generatePDF(chave: string) {
    // In a real app we'd use a library like jspdf or a backend service
    // For simulation we open a mockup or download a dummy pdf
    alert("Gerando DANFE em PDF... (Simulado)");
    const blob = new Blob(['%PDF-1.4 ... (Conteúdo Binário Simulado do DANFE)'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danfe-${chave}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // 2. Monitoring Configuration
  async addMonitoredClient(userId: string, client: Omit<NFeClient, 'id' | 'ultNSU'>) {
    const clientsRef = collection(db, 'nfeMonitoredClients');
    const docRef = await addDoc(clientsRef, {
      ...client,
      ownerId: userId,
      ultNSU: (Math.floor(Math.random() * 1000)).toString(),
      status: 'ativo',
      createdAt: serverTimestamp()
    });
    
    await growthService.trackEvent(userId, 'monitor-nfe', 'add-client', { cnpj: client.cnpj });
    
    // Update clients count in metrics
    const metricsRef = doc(db, 'userMetrics', userId);
    const metricsSnap = await getDoc(metricsRef);
    if (metricsSnap.exists()) {
      await updateDoc(metricsRef, {
        clientsCreated: (metricsSnap.data().clientsCreated || 0) + 1
      });
    }

    return docRef.id;
  },

  // ... rest of the file
  async fetchNewNFEs(userId: string, clientId: string) {
    const clientRef = doc(db, 'nfeMonitoredClients', clientId);
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) throw new Error("Client not found");

    const clientData = clientSnap.data() as NFeClient;
    
    // Simulate DFe Call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mocking finding a new NF-e
    const newChave = "3523101234567800019055001000123456" + Math.floor(Math.random() * 100000000);
    const newNfe: NFeData = {
      chave: newChave,
      emitente: "FORNECEDOR AUTOMATICO S/A",
      valor: Math.random() * 500 + 50,
      data: new Date().toISOString(),
      status: "Encontrada via Monitor",
      origem: 'monitor',
      timestamp: serverTimestamp(),
      xml: `<?xml version="1.0" encoding="UTF-8"?><nfeProc versao="4.00">...</nfeProc>`
    };

    // Save to documents
    await addDoc(collection(db, 'documents'), {
      ...newNfe,
      ownerId: userId,
      clientId: clientId,
      type: 'nfe'
    });

    // Update NSU (simulated)
    const nextNSU = (parseInt(clientData.ultNSU) + 1).toString();
    await setDoc(clientRef, { ultNSU: nextNSU }, { merge: true });

    await growthService.trackEvent(userId, 'monitor-nfe', 'fetch-new', { clientId });

    return newNfe;
  },

  // 4. Manifestation
  async manifestarDocument(userId: string, chave: string, tipo: 'ciencia' | 'confirmacao' | 'desconhecimento') {
    // Simulate SEFAZ call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await addDoc(collection(db, 'nfeEvents'), {
      userId,
      chave,
      tipo,
      status: 'Registrado na SEFAZ',
      timestamp: serverTimestamp()
    });

    await growthService.trackEvent(userId, 'monitor-nfe', 'manifest', { chave, tipo });
    
    return true;
  }
};
