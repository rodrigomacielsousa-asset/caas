import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Plus, 
  Search, 
  MoreVertical, 
  ChevronRight, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Lock,
  XCircle,
  Bell,
  Mail,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  orderBy, 
  Timestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { cn } from '../lib/utils';
import Paywall from '../components/growth/Paywall';
import { createCheckoutSession } from '../services/checkoutService';

// --- Types ---
interface Client {
  id: string;
  companyName: string;
  cnpj: string;
  responsible: string;
  status: string;
  userId: string;
}

interface BillingConfig {
  id: string;
  clientId: string;
  userId: string;
  amount: number;
  billingDay: number;
  type: 'mensal' | 'pontual';
  active: boolean;
  createdAt: string;
}

interface Bill {
  id: string;
  clientId: string;
  userId: string;
  amount: number;
  dueDate: string;
  status: 'pendente' | 'pago' | 'atrasado';
  paidAt?: string;
  configId: string;
  createdAt: string;
}

// --- Utils ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export default function CobraAI() {
  const [user, loadingAuth] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [configs, setConfigs] = useState<BillingConfig[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'bills'>('dashboard');
  
  // Modal states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [configForm, setConfigForm] = useState({
    amount: 0,
    billingDay: 5,
    type: 'mensal' as 'mensal' | 'pontual'
  });

  const [paywall, setPaywall] = useState(false);

  // 1. Initial Data Load
  useEffect(() => {
    if (loadingAuth) return;
    
    // FOR TESTING: Use a demo user ID if not logged in
    const activeUid = user?.uid || 'demo-accountant';

    setLoading(true);

    // Fetch Clients
    const qClients = query(collection(db, 'clients'), where('userId', '==', activeUid));
    const unsubClients = onSnapshot(qClients, (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
    }, (err) => {
      console.warn("Client fetch error (demo mode):", err);
    });

    // Fetch Billing Configs
    const qConfigs = query(collection(db, 'billingConfigs'), where('userId', '==', activeUid));
    const unsubConfigs = onSnapshot(qConfigs, (snap) => {
      setConfigs(snap.docs.map(d => ({ id: d.id, ...d.data() } as BillingConfig)));
    }, (err) => {
      console.warn("Configs fetch error (demo mode):", err);
    });

    // Fetch Bills
    const qBills = query(collection(db, 'bills'), where('userId', '==', activeUid), orderBy('dueDate', 'desc'));
    const unsubBills = onSnapshot(qBills, (snap) => {
      setBills(snap.docs.map(d => ({ id: d.id, ...d.data() } as Bill)));
      setLoading(false);
    }, (err) => {
      console.warn("Bills fetch error (demo mode):", err);
      setLoading(false);
    });

    return () => {
      unsubClients();
      unsubConfigs();
      unsubBills();
    };
  }, [user, loadingAuth]);

  // --- Logic & Computations ---
  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.cnpj.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyBills = bills.filter(b => {
      const date = new Date(b.dueDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const received = monthlyBills.filter(b => b.status === 'pago').reduce((acc, b) => acc + b.amount, 0);
    const pending = monthlyBills.filter(b => b.status === 'pendente').reduce((acc, b) => acc + b.amount, 0);
    const late = monthlyBills.filter(b => b.status === 'atrasado').reduce((acc, b) => acc + b.amount, 0);
    const totalToReceive = received + pending + late;
    
    const churnRate = 0; // Simple placeholder
    const inadimplencia = totalToReceive > 0 ? (late / totalToReceive) * 100 : 0;

    return { received, pending, late, totalToReceive, inadimplencia };
  }, [bills]);

  const saveConfig = async () => {
    if (!user || !selectedClient) return;

    // Free tier check
    if (configs.length >= 5 && !configs.find(c => c.clientId === selectedClient.id)) {
       setPaywall(true);
       return;
    }

    try {
      const activeUid = user?.uid || 'demo-accountant';
      const configId = configs.find(c => c.clientId === selectedClient.id)?.id || `config_${selectedClient.id}`;
      const newConfig = {
        id: configId,
        clientId: selectedClient.id,
        userId: activeUid,
        amount: configForm.amount,
        billingDay: configForm.billingDay,
        type: configForm.type,
        active: true,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'billingConfigs', configId), newConfig);
      
      // Auto generate first bill if it doesn't exist for this month
      const today = new Date();
      const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const dueDate = `${monthStr}-${String(configForm.billingDay).padStart(2, '0')}`;
      
      const billId = `bill_${selectedClient.id}_${monthStr}`;
      const existingBill = bills.find(b => b.id === billId);

      if (!existingBill) {
        await setDoc(doc(db, 'bills', billId), {
          id: billId,
          clientId: selectedClient.id,
          userId: activeUid,
          amount: configForm.amount,
          dueDate,
          status: today > new Date(dueDate) ? 'atrasado' : 'pendente',
          configId,
          createdAt: new Date().toISOString()
        });
      }

      setShowConfigModal(false);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'billingConfigs');
      alert("Erro ao salvar configuração.");
    }
  };

  const markAsPaid = async (billId: string) => {
    try {
      await updateDoc(doc(db, 'bills', billId), {
        status: 'pago',
        paidAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, `bills/${billId}`);
    }
  };

  // --- UI Components ---
  if (loadingAuth || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Iniciando Cobra AI Engine...</p>
      </div>
    );
  }

  // Auth bypassed for testing
  /*
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 space-y-6">
        <Lock className="w-16 h-16 text-blue-600 mb-4" />
        <h1 className="text-3xl font-black text-slate-900 dark:text-white text-center italic tracking-tighter">Acesso Restrito</h1>
        <p className="text-slate-500 text-center max-w-md">Autentique-se no Office Contábil para gerenciar as cobranças recorrentes dos seus clientes.</p>
        <button onClick={() => window.location.href = '/login'} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Ir para Login</button>
      </div>
    );
  }
  */

  return (
    <div className="min-h-screen bg-slate-50 p-8 sm:p-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100 rotate-3">
                <Zap className="w-6 h-6 text-white" />
             </div>
             <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">Cobra AI</h1>
          </div>
          <p className="text-slate-500 font-medium">Automação de cobrança e gestão de recebíveis contábeis.</p>
        </div>

        <nav className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
           {[
             { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
             { id: 'clients', label: 'Configurar Clientes', icon: Users },
             { id: 'bills', label: 'Cobranças', icon: CreditCard }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                 activeTab === tab.id 
                   ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                   : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
               )}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
             </button>
           ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-50 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-start">
                     <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600"><TrendingUp className="w-6 h-6" /></div>
                     <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full uppercase">Recebido</span>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Recebido (Mês)</p>
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(stats.received)}</h2>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-50 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-start">
                     <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Clock className="w-6 h-6" /></div>
                     <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full uppercase">A Receber</span>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendente</p>
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(stats.pending)}</h2>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-50 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-start">
                     <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-600"><AlertCircle className="w-6 h-6" /></div>
                     <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-full uppercase">Atrasado</span>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencido</p>
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter text-rose-600">{formatCurrency(stats.late)}</h2>
                  </div>
               </div>

               <div className="bg-slate-900 dark:bg-blue-600 p-8 rounded-[40px] shadow-2xl space-y-4 text-white">
                  <div className="flex justify-between items-start">
                     <div className="p-4 bg-white/10 rounded-2xl"><Users className="w-6 h-6" /></div>
                     <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Inadimplência</span>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Taxa Atual</p>
                     <h2 className="text-4xl font-black tracking-tighter">{stats.inadimplencia.toFixed(1)}%</h2>
                  </div>
                  <div className="pt-4 border-t border-white/10 text-[9px] font-bold text-slate-300 italic">IA: Taxa saudável para escritórios contábeis é &lt; 5%.</div>
               </div>
            </div>

            {/* AI Insights & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               <div className="lg:col-span-2 space-y-8">
                  <div className="flex justify-between items-center">
                     <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter">Últimas Cobranças</h3>
                     <button onClick={() => setActiveTab('bills')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Ver todas</button>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-[48px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50 dark:bg-slate-800/50">
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimento</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                           {bills.slice(0, 5).map(bill => {
                             const client = clients.find(c => c.id === bill.clientId);
                             return (
                               <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                  <td className="px-8 py-6">
                                     <p className="text-sm font-black text-slate-900 dark:text-white">{client?.companyName || 'Cliente Excluído'}</p>
                                     <p className="text-[10px] font-bold text-slate-400">{client?.cnpj}</p>
                                  </td>
                                  <td className="px-8 py-6">
                                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(bill.dueDate).toLocaleDateString()}</p>
                                  </td>
                                  <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white">{formatCurrency(bill.amount)}</td>
                                  <td className="px-8 py-6">
                                     <div className="flex justify-center">
                                        <span className={cn(
                                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                          bill.status === 'pago' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" :
                                          bill.status === 'atrasado' ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30" :
                                          "bg-slate-100 text-slate-500 dark:bg-slate-800"
                                        )}>
                                           {bill.status}
                                        </span>
                                     </div>
                                  </td>
                               </tr>
                             )
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="space-y-8">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter">Cobra IA Insights</h3>
                  <div className="space-y-6">
                     <div className="bg-blue-600/5 border border-blue-100 dark:border-blue-900/50 p-8 rounded-[40px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Bell className="w-12 h-12" /></div>
                        <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Bell className="w-4 h-4" /> Alerta de Atraso
                        </h4>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                           "Detectamos que 3 clientes sempre pagam com 2 dias de atraso. Sugerimos antecipar o disparo do e-mail de lembrete em 48h para melhorar seu fluxo de caixa."
                        </p>
                     </div>

                     <div className="bg-emerald-600/5 border border-emerald-100 dark:border-emerald-900/50 p-8 rounded-[40px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp className="w-12 h-12" /></div>
                        <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <TrendingUp className="w-4 h-4" /> Sugestão de Honorário
                        </h4>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                           "Baseado no volume de notas fiscais do cliente XYZ, sugerimos um reajuste de 12% no valor mensal para manter a margem de lucro operacional."
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {/* --- CLIENTS TAB --- */}
        {activeTab === 'clients' && (
          <motion.div 
            key="clients"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">Gestão de Honorários Recorrentes</h2>
                <div className="relative w-full md:w-80">
                   <input 
                     type="text" 
                     placeholder="Buscar empresa ou CNPJ..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border-none ring-2 ring-transparent focus:ring-blue-600 transition-all outline-none font-bold text-sm shadow-sm"
                   />
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClients.map(client => {
                  const config = configs.find(c => c.clientId === client.id);
                  return (
                    <div key={client.id} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 flex gap-2">
                          {config && (
                             <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                                Ativo
                             </div>
                          )}
                          {!config && (
                             <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                                Não Configurado
                             </div>
                          )}
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-1">
                             <h4 className="text-lg font-black text-slate-900 dark:text-white truncate pr-16 italic tracking-tight">{client.companyName}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.cnpj}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                             <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Mensal</p>
                                <p className="text-base font-black text-slate-900 dark:text-white">{config ? formatCurrency(config.amount) : '---'}</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimento</p>
                                <p className="text-base font-black text-slate-900 dark:text-white">{config ? `Dia ${config.billingDay}` : '---'}</p>
                             </div>
                          </div>

                          <button 
                            onClick={() => {
                              setSelectedClient(client);
                              if (config) {
                                setConfigForm({ amount: config.amount, billingDay: config.billingDay, type: config.type });
                              } else {
                                setConfigForm({ amount: 0, billingDay: 5, type: 'mensal' });
                              }
                              setShowConfigModal(true);
                            }}
                            className="w-full py-4 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                          >
                             {config ? 'Editar Configuração' : 'Configurar Cobrança'}
                             <ChevronRight className="w-3 h-3" />
                          </button>
                       </div>
                    </div>
                  );
                })}
             </div>
          </motion.div>
        )}

        {/* --- BILLS TAB --- */}
        {activeTab === 'bills' && (
          <motion.div 
            key="bills"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">Controle de Pagamentos</h2>
                <div className="flex gap-4">
                   <button className="px-6 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:border-blue-600 transition-all">
                      <Filter className="w-4 h-4" /> Filtros
                   </button>
                   <button className="px-6 py-3 bg-blue-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-105 transition-all flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Disparar Lembretes
                   </button>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                   <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Empresa</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Valor</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Vencimento</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {bills.map(bill => {
                        const client = clients.find(c => c.id === bill.clientId);
                        return (
                          <tr key={bill.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all group">
                             <td className="px-10 py-8">
                                <p className="text-base font-black text-slate-900 dark:text-white italic tracking-tight">{client?.companyName}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client?.cnpj}</p>
                             </td>
                             <td className="px-10 py-8">
                                <p className="text-base font-black text-slate-900 dark:text-white">{formatCurrency(bill.amount)}</p>
                             </td>
                             <td className="px-10 py-8">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(bill.dueDate).toLocaleDateString()}</p>
                             </td>
                             <td className="px-10 py-8">
                                <span className={cn(
                                   "px-4 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-sm",
                                   bill.status === 'pago' ? "bg-emerald-500 shadow-emerald-100" :
                                   bill.status === 'atrasado' ? "bg-rose-500 shadow-rose-100" :
                                   "bg-amber-500 shadow-amber-100"
                                )}>
                                   {bill.status}
                                </span>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex justify-end gap-3">
                                   {bill.status !== 'pago' && (
                                     <button 
                                       onClick={() => markAsPaid(bill.id)}
                                       className="p-3 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                                     >
                                        <CheckCircle2 className="w-4 h-4" />
                                     </button>
                                   )}
                                   <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                                      <Mail className="w-4 h-4" />
                                   </button>
                                </div>
                             </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALS --- */}
      <AnimatePresence>
         {showConfigModal && selectedClient && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl transition-all"
           >
              <div className="bg-white dark:bg-slate-900 max-w-lg w-full p-12 rounded-[64px] shadow-2xl relative overflow-hidden space-y-10">
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">Configurar Cobra AI</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedClient.companyName}</p>
                    </div>
                    <button onClick={() => setShowConfigModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                       <XCircle className="w-6 h-6 text-slate-300" />
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Honorário (R$)</label>
                       <div className="relative">
                          <input 
                            type="number" 
                            value={configForm.amount}
                            onChange={(e) => setConfigForm({ ...configForm, amount: parseFloat(e.target.value) })}
                            className="w-full pl-12 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border-none ring-2 ring-transparent focus:ring-blue-600 transition-all outline-none font-black text-2xl"
                          />
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dia de Cobrança</label>
                          <select 
                            value={configForm.billingDay}
                            onChange={(e) => setConfigForm({ ...configForm, billingDay: parseInt(e.target.value) })}
                            className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border-none ring-2 ring-transparent focus:ring-blue-600 transition-all outline-none font-bold text-sm"
                          >
                             {[...Array(28)].map((_, i) => <option key={i+1} value={i+1}>Todo dia {i+1}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequência</label>
                          <select 
                            value={configForm.type}
                            onChange={(e) => setConfigForm({ ...configForm, type: e.target.value as any })}
                            className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border-none ring-2 ring-transparent focus:ring-blue-600 transition-all outline-none font-bold text-sm"
                          >
                             <option value="mensal">Mensal (Recorrente)</option>
                             <option value="pontual">Pontual (Única)</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={saveConfig}
                   className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    <CheckCircle2 className="w-5 h-5" /> Ativar Monitoramento IA
                 </button>

                 <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status da Integração</p>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                       <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Puxando dados do Honorários Pro e Office Contábil...</p>
                    </div>
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* --- PAYWALL MODAL --- */}
      <AnimatePresence>
         {paywall && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl"
           >
              <div className="relative max-w-2xl w-full">
                <button 
                  onClick={() => setPaywall(false)} 
                  className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all shadow-lg"
                >
                   <XCircle className="w-6 h-6" />
                </button>
                <Paywall 
                  title="Evolua para o PRO" 
                  description="Você atingiu o limite do plano grátis (5 clientes). Libere faturamento ilimitado e alertas automáticos via WhatsApp."
                  limitReached={configs.length >= 5}
                  onUpgrade={() => createCheckoutSession(user?.uid || '', user?.email || '', 'price_COBRA_ID', 'enterprise')}
                />
              </div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
