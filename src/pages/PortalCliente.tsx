import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  FileText, 
  Download, 
  Bell, 
  Settings, 
  ArrowRight, 
  Upload, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  Building2,
  Paperclip,
  Check,
  ChevronRight,
  Plus,
  ArrowLeft,
  Loader2,
  FileCode,
  Calendar,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { cn } from '../lib/utils';
import { analyzeInvoice } from '../services/geminiService';

// --- Types ---
interface Client {
  id: string;
  companyName: string;
  cnpj: string;
  responsible: string;
  status: string;
  userId: string;
  portalUserId?: string;
}

interface ClientRequest {
  id: string;
  clientId: string;
  title: string;
  description: string;
  competencia: string;
  status: 'pendente' | 'enviado' | 'aprovado';
  dueDate: string;
  createdAt: any;
}

interface ClientDocument {
  id: string;
  clientId: string;
  type: 'nota_fiscal' | 'extrato' | 'outro';
  fileName: string;
  fileUrl: string;
  competencia: string;
  requestId?: string;
  createdAt: any;
}

interface ClientMessage {
  id: string;
  clientId: string;
  senderUid: string;
  text: string;
  createdAt: any;
}

interface ClosingStatus {
  id: string;
  period: string;
  status: string;
}

// --- Components ---

export default function PortalCliente() {
  const [user, loadingAuth] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [isClientMode, setIsClientMode] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [closingStats, setClosingStats] = useState<ClosingStatus[]>([]);
  
  // UI State
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documentos' | 'solicitacoes' | 'mensagens'>('dashboard');
  const [isUploading, setIsUploading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLinkingUser, setIsLinkingUser] = useState(false);
  const [portalEmailToLink, setPortalEmailToLink] = useState('');

  // 1. Determine User Role and Fetch Initial Data
  useEffect(() => {
    let unsubClientCheck: (() => void) | null = null;
    let unsubAllClients: (() => void) | null = null;

    if (loadingAuth) return;
    
    // FOR TESTING: Bypass auth
    const activeUid = user?.uid || 'demo-client';

    setLoading(true);
    setError(null);

    // Step 1: Check if user is a client
    const qClientCheck = query(collection(db, 'clients'), where('portalUserId', '==', activeUid));
    
    unsubClientCheck = onSnapshot(qClientCheck, (snap) => {
      if (!snap.empty) {
        // Mode: Client
        setIsClientMode(true);
        const clientData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Client;
        setCurrentClient(clientData);
        setSelectedClientId(clientData.id);
        setLoading(false);
        setError(null);
        
        // Clean up accountant listener if any
        if (unsubAllClients) {
          unsubAllClients();
          unsubAllClients = null;
        }
      } else {
        // Mode: Accountant (or not linked)
        setIsClientMode(false);
        setCurrentClient(null);

        // Step 2: Fetch all clients for accountant
        const qAllClients = query(collection(db, 'clients'), where('userId', '==', activeUid));
        
        if (unsubAllClients) unsubAllClients();
        
        unsubAllClients = onSnapshot(qAllClients, (allSnap) => {
          const clientList = allSnap.docs.map(d => ({ id: d.id, ...d.data() } as Client));
          setClients(clientList);
          setLoading(false);
          setError(null);
        }, (err) => {
          console.error("Accountant clients query error:", err);
          // Only show error if we haven't successfully loaded anything or if it's a terminal failure
          if (clients.length === 0) {
            setError("Erro ao carregar clientes. Verifique se você possui permissão.");
            setLoading(false);
          }
        });
      }
    }, (err) => {
       console.error("Client check query error:", err);
       setError("Erro ao verificar acesso ao portal.");
       setLoading(false);
    });

    return () => {
      if (unsubClientCheck) unsubClientCheck();
      if (unsubAllClients) unsubAllClients();
    };
  }, [user, loadingAuth]);

  // 2. Fetch Selected Client Details
  useEffect(() => {
    const activeUid = user?.uid || 'demo-client';
    if (!selectedClientId) return;

    // Requests
    const qRequests = query(
      collection(db, 'clientRequests'), 
      where('clientId', '==', selectedClientId),
      orderBy('createdAt', 'desc')
    );
    const unsubRequests = onSnapshot(qRequests, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClientRequest)));
    });

    // Documents
    const qDocs = query(
      collection(db, 'clientDocuments'), 
      where('clientId', '==', selectedClientId),
      orderBy('createdAt', 'desc')
    );
    const unsubDocs = onSnapshot(qDocs, (snap) => {
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClientDocument)));
    });

    // Messages
    const qMsgs = query(
      collection(db, 'clientMessages'), 
      where('clientId', '==', selectedClientId),
      orderBy('createdAt', 'asc')
    );
    const unsubMsgs = onSnapshot(qMsgs, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClientMessage)));
    });

    // Closing Status (from closePeriods or closeTasks)
    const qClosing = query(
      collection(db, 'closePeriods'),
      where('userId', '==', isClientMode ? currentClient?.userId : activeUid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const unsubClosing = onSnapshot(qClosing, (snap) => {
       setClosingStats(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClosingStatus)));
    });

    return () => {
      unsubRequests();
      unsubDocs();
      unsubMsgs();
      unsubClosing();
    };
  }, [selectedClientId, user, isClientMode, currentClient]);

  // Actions
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedClientId || !user) return;
    try {
      await addDoc(collection(db, 'clientMessages'), {
        clientId: selectedClientId,
        senderUid: user.uid,
        text: newMessage,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'clientMessages');
    }
  };

  const handleFileUpload = async (file: File, type: 'nota_fiscal' | 'extrato' | 'outro', requestId?: string) => {
    if (!selectedClientId || !user) return;
    setIsUploading(true);
    try {
      // 1. "Upload" (Mocking binary upload, using base64 or just filename for POC)
      const fileName = file.name;
      const fileUrl = `https://storage.mock/${fileName}`; // Placeholder
      const competencia = new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

      // 2. Save Client Document
      const docRef = await addDoc(collection(db, 'clientDocuments'), {
        clientId: selectedClientId,
        userId: user.uid,
        type,
        fileName,
        fileUrl,
        competencia,
        requestId: requestId || null,
        createdAt: serverTimestamp()
      });

      // 3. Automation Integrations
      if (type === 'nota_fiscal') {
        // Integrate with ReceiptorBR
        await addDoc(collection(db, 'receipts'), {
          userId: isClientMode ? currentClient?.userId : user.uid,
          clientId: selectedClientId,
          tipoDoc: "PDF/IMG",
          dataEmissao: new Date().toLocaleDateString('pt-BR'),
          numero: "Pendente",
          valorTotal: 0,
          status: "pendente revisão",
          createdAt: serverTimestamp()
        });
      } else if (type === 'extrato') {
        // Integrate with ExtratoBR
        await addDoc(collection(db, 'statements'), {
          userId: isClientMode ? currentClient?.userId : user.uid,
          clientId: selectedClientId,
          bank: "Pendente",
          period: competencia,
          sourceType: "PDF",
          transactions: [],
          status: "pendente",
          createdAt: serverTimestamp()
        });
      }

      // 4. Update Request Status if applicable
      if (requestId) {
        await updateDoc(doc(db, 'clientRequests', requestId), {
          status: 'enviado'
        });
      }

      alert("Documento enviado com sucesso!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'clientDocuments');
    } finally {
      setIsUploading(false);
    }
  };

  const createRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    
    if (!selectedClientId || !user) return;
    
    try {
      await addDoc(collection(db, 'clientRequests'), {
        clientId: selectedClientId,
        accountantUserId: user.uid,
        title: data.get('title'),
        description: data.get('description'),
        competencia: data.get('competencia'),
        status: 'pendente',
        dueDate: data.get('dueDate'),
        createdAt: serverTimestamp()
      });
      form.reset();
      alert("Solicitação criada!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'clientRequests');
    }
  };

  const handleLinkPortalUser = async () => {
    if (!selectedClientId || !portalEmailToLink) return;
    try {
      await updateDoc(doc(db, 'clients', selectedClientId), {
        portalEmail: portalEmailToLink,
        status: 'pending_invite'
      });
      setIsLinkingUser(false);
      setPortalEmailToLink('');
      alert("Acesso vinculado!");
    } catch (error) {
      console.error("Error linking user:", error);
    }
  };

  if (loading || loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-serif italic">Carregando ecossistema do portal...</p>
      </div>
    );
  }

  // Auth Bypassed for testing
  /*
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="w-24 h-24 bg-indigo-50 dark:bg-slate-900 rounded-[40px] flex items-center justify-center text-indigo-600">
           <Users className="w-12 h-12" />
        </div>
        <div className="max-w-md space-y-4">
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Acesso Restrito</h1>
           <p className="text-slate-500 font-medium">Você precisa estar logado para acessar o Portal do Cliente.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          Ir para Login
        </button>
      </div>
    );
  }
  */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[40px] flex items-center justify-center">
           <AlertTriangle className="w-12 h-12" />
        </div>
        <div className="max-w-md space-y-4">
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Ops! Algo deu errado</h1>
           <p className="text-slate-500 font-medium">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // --- ACCOUNTANT VIEW: Select Client ---
  if (!isClientMode && !selectedClientId) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 sm:p-20">
         <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center text-white shadow-xl shadow-indigo-100"><Users className="w-10 h-10" /></div>
                  <div>
                     <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">Gestão de Portais</h1>
                     <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-2">{clients.length} Clientes Ativos</p>
                  </div>
               </div>
               <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-600 transition-all">
                  <Plus className="w-5 h-5" /> Adicionar Cliente
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {clients.map(client => (
                 <motion.div 
                   key={client.id}
                   whileHover={{ y: -5 }}
                   className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 group cursor-pointer hover:border-indigo-600 transition-all"
                   onClick={() => setSelectedClientId(client.id)}
                 >
                    <div className="flex justify-between items-start">
                       <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <Building2 className="w-8 h-8" />
                       </div>
                       <div className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          client.portalUserId ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                       )}>
                          {client.portalUserId ? 'Acesso Ativo' : 'Acesso Pendente'}
                       </div>
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{client.companyName}</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{client.cnpj}</p>
                    </div>
                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-400 italic">Responsável: {client.responsible}</span>
                       <ArrowRight className="w-5 h-5 text-indigo-600" />
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </div>
    );
  }

  // --- PORTAL VIEW (Client or Accountant managing a specific portal) ---
  const portalClient = isClientMode ? currentClient : clients.find(c => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
       {/* Slim Header */}
       <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 pt-10 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-6">
                {!isClientMode && (
                  <button onClick={() => setSelectedClientId(null)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600"><ArrowLeft className="w-5 h-5" /></button>
                )}
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black">{portalClient?.companyName[0]}</div>
                <div>
                   <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none italic">Portal do Cliente</h1>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{portalClient?.companyName}</p>
                </div>
             </div>
             
             {!isClientMode && (
               <button 
                onClick={() => setIsLinkingUser(!isLinkingUser)}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
              >
                 {portalClient?.portalUserId ? 'Alterar Acesso' : 'Vincular Portal'}
              </button>
             )}

             <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-[24px]">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
                  { id: 'documentos', label: 'Documentos', icon: FileText },
                  { id: 'solicitacoes', label: 'Solicitações', icon: AlertTriangle },
                  { id: 'mensagens', label: 'Mensagens', icon: MessageSquare }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === t.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600"
                    )}
                  >
                     <t.icon className="w-4 h-4" /> <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
             </div>

             <div className="flex items-center gap-4">
                <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600"><Bell className="w-5 h-5" /></button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block" />
                <div className="hidden md:flex items-center gap-3 text-right">
                   <div>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none">Diego S. (Contador)</p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Disponível</p>
                   </div>
                   <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
             </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
           
           {/* Linking Modal */}
           {isLinkingUser && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-indigo-100 dark:border-indigo-900 shadow-xl shadow-indigo-100/20"
              >
                <div className="flex flex-col md:flex-row gap-6 items-end">
                   <div className="flex-1 space-y-2">
                       <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-2">Vincular E-mail do Cliente</label>
                       <input 
                         type="email" 
                         placeholder="digite o e-mail do cliente..."
                         value={portalEmailToLink}
                         onChange={(e) => setPortalEmailToLink(e.target.value)}
                         className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold outline-none ring-2 ring-indigo-50 focus:ring-indigo-600 transition-all font-serif italic"
                       />
                   </div>
                   <div className="flex gap-4">
                      <button 
                        onClick={handleLinkPortalUser}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-200"
                      >
                         Vincular Agora
                      </button>
                      <button onClick={() => setIsLinkingUser(false)} className="px-6 py-4 text-slate-400 font-bold uppercase text-[10px]">Cancelar</button>
                   </div>
                </div>
                <p className="mt-4 text-[10px] text-slate-400 font-medium italic">* Quando o cliente logar no MicroCaaS com este e-mail, ele será identificado automaticamente como proprietário deste portal.</p>
              </motion.div>
           )}
          
          <AnimatePresence mode="wait">
             {activeTab === 'dashboard' && (
               <motion.div 
                 key="dashboard"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="space-y-12"
               >
                  {/* Status Banner */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2 bg-indigo-600 p-12 rounded-[56px] text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
                        <div className="absolute -bottom-20 -right-20 opacity-10"><Sparkles className="w-80 h-80 rotate-12" /></div>
                        <div className="relative z-10 space-y-8">
                           <div className="space-y-2">
                              <h2 className="text-4xl font-black tracking-tighter italic italic leading-tight">Olá, {portalClient?.responsible}!</h2>
                              <p className="text-lg font-medium text-indigo-100 italic opacity-80">Você tem <span className="text-white font-black">{requests.filter(r => r.status === 'pendente').length} pendências</span> este mês.</p>
                           </div>
                           <div className="flex gap-4">
                              <button onClick={() => setActiveTab('solicitacoes')} className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">Ver Pendências</button>
                              <button onClick={() => setActiveTab('documentos')} className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest border border-indigo-400 hover:bg-indigo-400 transition-all">Enviar Avulso</button>
                           </div>
                        </div>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[30px] flex items-center justify-center shadow-inner"><CheckCircle2 className="w-10 h-10" /></div>
                        <div>
                           <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Status do Fechamento</h3>
                           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Maio 2026</p>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="w-3/4 h-full bg-emerald-500 rounded-full" />
                        </div>
                        <p className="text-xs font-black text-emerald-500 uppercase tracking-widest italic animate-pulse">Aguardando Extrato do Inter</p>
                     </div>
                  </div>

                  {/* Secondary stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     {[
                       { label: 'Docs Enviados', value: documents.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                       { label: 'Solicitações', value: requests.length, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
                       { label: 'Mensagens', value: messages.length, icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-50' },
                       { label: 'Dias p/ Finalizar', value: '12', icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50' }
                     ].map(stat => (
                       <div key={stat.label} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}><stat.icon className="w-6 h-6" /></div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                             <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{stat.value}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  {/* Highlights section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="space-y-8">
                        <div className="flex justify-between items-center px-4">
                           <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic flex items-center gap-3"><Clock className="w-6 h-6 text-indigo-600" /> Atividade Recente</h3>
                           <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">Ver Tudo</button>
                        </div>
                        <div className="space-y-4">
                           {documents.slice(0, 4).map(doc => (
                             <div key={doc.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-50 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-600 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                   <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-indigo-600 transition-colors"><FileText className="w-5 h-5" /></div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900 dark:text-white">{doc.fileName}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enviado em {doc.createdAt?.toDate().toLocaleDateString()}</p>
                                   </div>
                                </div>
                                <div className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2">
                                   <Check className="w-3 h-3" /> Processado
                                </div>
                             </div>
                           ))}
                           {documents.length === 0 && <p className="text-center text-slate-400 font-serif italic py-10 bg-white rounded-[32px] border border-dashed">Nenhuma atividade registrada.</p>}
                        </div>
                     </div>

                     <div className="space-y-8">
                        <div className="flex justify-between items-center px-4">
                           <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic flex items-center gap-3"><MessageSquare className="w-6 h-6 text-sky-500" /> Últimas Conversas</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                           <div className="space-y-6 max-h-[300px] overflow-y-auto no-scrollbar">
                              {messages.slice(-3).map(msg => (
                                <div key={msg.id} className={cn("max-w-xs p-4 rounded-3xl text-sm italic", msg.senderUid === user.uid ? "ml-auto bg-indigo-600 text-white rounded-br-none" : "mr-auto bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none")}>
                                   {msg.text}
                                </div>
                              ))}
                              {messages.length === 0 && <p className="text-center text-slate-300 font-serif italic py-8">Nenhuma mensagem ainda.</p>}
                           </div>
                           <button onClick={() => setActiveTab('mensagens')} className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Abrir Chat Completo</button>
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}

             {activeTab === 'documentos' && (
               <motion.div 
                 key="docs"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="space-y-12"
               >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                     <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">Pasta de Documentos</h2>
                           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                              {['Maio 2026', 'Abril 2026'].map(m => (
                                <button key={m} className={cn("px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", m === 'Maio 2026' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}>{m}</button>
                              ))}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {['Nota Fiscal', 'Extrato', 'Outro'].map(cat => (
                             <div key={cat} className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 group hover:border-indigo-600 transition-colors">
                                <div className="flex justify-between items-start">
                                   <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors"><FileText className="w-8 h-8" /></div>
                                   <div className="text-right">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total</p>
                                      <p className="text-2xl font-black text-slate-900 dark:text-white italic">{documents.filter(d => (cat === 'Nota Fiscal' ? d.type === 'nota_fiscal' : cat === 'Extrato' ? d.type === 'extrato' : d.type === 'outro')).length}</p>
                                   </div>
                                </div>
                                <div>
                                   <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{cat}</h3>
                                   <p className="text-xs font-serif text-slate-400 italic">Pasta arquivada e organizada pelo portal.</p>
                                </div>
                                <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Visualizar Arquivos</button>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-8">
                        <div className="p-10 bg-indigo-600 rounded-[56px] text-white space-y-8 shadow-2xl shadow-indigo-100">
                           <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-white"><Upload className="w-8 h-8" /></div>
                           <h3 className="text-2xl font-black tracking-tighter leading-tight italic">Upload Rápido<br /> Inteligente.</h3>
                           <div className="space-y-4">
                              <div className="relative">
                                 <input 
                                   type="file" 
                                   className="absolute inset-0 opacity-0 cursor-pointer" 
                                   onChange={(e) => {
                                     const file = e.target.files?.[0];
                                     if (file) handleFileUpload(file, 'outro');
                                   }}
                                 />
                                 <div className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                                    {isUploading ? 'Processando...' : 'Selecionar Arquivo'}
                                 </div>
                              </div>
                              <p className="text-[10px] font-bold text-center opacity-60 uppercase tracking-widest">Suporte: PDF, XML, PNG, JPG</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}

             {activeTab === 'solicitacoes' && (
               <motion.div 
                 key="requests"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="space-y-12"
               >
                  {!isClientMode && (
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                       <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3"><Plus className="w-6 h-6 text-indigo-600" /> Nova Solicitação</h3>
                       <form onSubmit={createRequest} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                          <div className="md:col-span-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">Título</label>
                             <input name="title" required placeholder="Ex: Extrato Maio" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-serif italic" />
                          </div>
                          <div className="md:col-span-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">Vencimento</label>
                             <input name="dueDate" type="date" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
                          </div>
                          <div className="md:col-span-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">Competência</label>
                             <input name="competencia" placeholder="05/2026" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-serif italic" />
                          </div>
                          <button type="submit" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                             <Send className="w-4 h-4" /> Enviar p/ Cliente
                          </button>
                       </form>
                    </div>
                  )}

                  <div className="space-y-6">
                     <h3 className="text-xl font-black text-slate-900 dark:text-white px-4 italic underline decoration-indigo-600/30 underline-offset-8">Acompanhamento de Tarefas</h3>
                     <div className="grid grid-cols-1 gap-6">
                        {requests.map(req => (
                          <div key={req.id} className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-indigo-600 transition-colors">
                             <div className="flex items-center gap-8">
                                <div className={cn(
                                   "w-16 h-16 rounded-3xl flex items-center justify-center transition-all",
                                   req.status === 'aprovado' ? "bg-emerald-50 text-emerald-600" : req.status === 'enviado' ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-500"
                                )}>
                                   {req.status === 'aprovado' ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                                </div>
                                <div className="space-y-2">
                                   <div className="flex items-center gap-3">
                                      <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{req.title}</h4>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{req.competencia}</span>
                                   </div>
                                   <p className="text-sm font-serif text-slate-500 italic">Vencimento: {new Date(req.dueDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                             </div>

                             <div className="flex gap-4">
                                {isClientMode && req.status === 'pendente' && (
                                  <div className="relative">
                                     <input 
                                       type="file" 
                                       className="absolute inset-0 opacity-0 cursor-pointer" 
                                       onChange={(e) => {
                                         const file = e.target.files?.[0];
                                         if (file) handleFileUpload(file, req.title.toLowerCase().includes('extrato') ? 'extrato' : 'nota_fiscal', req.id);
                                       }}
                                     />
                                     <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3">
                                        <Upload className="w-4 h-4" /> Enviar Documento
                                     </button>
                                  </div>
                                )}
                                <div className={cn(
                                   "px-6 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic",
                                   req.status === 'aprovado' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                                )}>
                                   {req.status === 'pendente' ? 'Pendente' : req.status === 'enviado' ? 'Em Análise' : 'Aprovado'}
                                </div>
                             </div>
                          </div>
                        ))}
                        {requests.length === 0 && <p className="text-center text-slate-300 font-serif italic py-20 bg-white rounded-[48px] border border-dashed border-slate-100">Nenhuma solicitação pendente.</p>}
                     </div>
                  </div>
               </motion.div>
             )}

             {activeTab === 'mensagens' && (
               <motion.div 
                 key="msgs"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[700px]"
               >
                  <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-600 rounded-[28px] text-white flex items-center justify-center font-black">?</div>
                        <div>
                           <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic">Central de Atendimento</h3>
                           <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Suporte Online</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 p-10 overflow-y-auto space-y-8 no-scrollbar bg-slate-50/30 dark:bg-slate-900/30">
                     {messages.map((msg, i) => (
                       <motion.div 
                         key={msg.id}
                         initial={{ opacity: 0, x: msg.senderUid === user.uid ? 20 : -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         className={cn(
                           "max-w-md p-8 rounded-[40px] text-sm leading-relaxed shadow-sm italic",
                           msg.senderUid === user.uid 
                             ? "ml-auto bg-indigo-600 text-white rounded-br-none" 
                             : "mr-auto bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none border border-slate-100 dark:border-slate-700"
                         )}
                       >
                          {msg.text}
                          <div className={cn("text-[9px] font-black uppercase tracking-widest mt-4 opacity-50", msg.senderUid === user.uid ? "text-white" : "text-slate-400")}>
                             {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </motion.div>
                     ))}
                     {messages.length === 0 && (
                       <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-200 shadow-inner"><MessageSquare className="w-10 h-10" /></div>
                          <p className="text-slate-400 font-serif italic italic">Inicie uma conversa diretamente com o escritório.</p>
                       </div>
                     )}
                  </div>

                  <div className="p-10 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                     <div className="flex gap-6 items-center">
                        <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors"><Paperclip className="w-6 h-6" /></button>
                        <input 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Digite aqui sua mensagem..." 
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-700 rounded-[32px] px-10 py-5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-serif italic" 
                        />
                        <button 
                          onClick={sendMessage}
                          className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl hover:scale-110"
                        >
                           <Send className="w-6 h-6" />
                        </button>
                     </div>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>

          {/* Footer Info */}
          <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 text-center space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal do Cliente v1.0 • MicroCaaS System</p>
             <div className="flex justify-center gap-8 text-[9px] font-bold text-slate-400 italic">
                <span>Backup em Tempo Real</span>
                <span>Criptografia Ponta-a-Ponta</span>
                <span>Suporte Prioritário Contratado</span>
             </div>
          </div>
       </div>
    </div>
  );
}
