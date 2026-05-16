import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Plus, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  Link as LinkIcon, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  LayoutGrid, 
  Database, 
  Download, 
  Trash2, 
  History,
  Sparkles,
  Crown,
  Layers,
  ArrowUpRight,
  Target,
  BarChart2,
  Lock,
  Unlock,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { hubService } from '../services/hubService';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  onSnapshot, 
  doc, 
  setDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  getDocs,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import * as XLSX from 'xlsx';

// Types
interface ClosePeriod {
  id: string;
  period: string; // YYYY-MM
  status: 'em_andamento' | 'concluido' | 'atrasado';
  progress: { done: number; total: number };
  createdAt: any;
}

interface CloseTask {
  id: string;
  clientId: string;
  periodId: string;
  title: string;
  description: string;
  status: 'pendente' | 'em_andamento' | 'aguardando_revisao' | 'aprovado' | 'bloqueado';
  ownerUserId: string;
  dueDate: string;
  dependsOn?: string[];
  evidence?: Array<{ type: 'file' | 'url'; name: string; value: string; uploadedAt: string }>;
  notes?: Array<{ text: string; createdAt: string; author: string }>;
  tags: string[];
}

interface Client {
  id: string;
  companyName: string;
  cnpj: string;
}

interface UserProfile {
  credits: number;
  plan: 'free' | 'pro';
  usedThisMonth: number;
}

const DEFAULT_TASKS = [
  { title: "Reconciliação Bancária (ExtratoBR)", category: "Banco", desc: "Conferir se todas as transações do extrato foram importadas e classificadas." },
  { title: "Processamento de Documentos (ReceiptorBR)", category: "Fiscal", desc: "Verificar se NF-e e NFS-e do período foram extraídas." },
  { title: "Classificação Contábil", category: "Contábil", desc: "Revisar lançamentos sugeridos e corrigir categorizações pendentes." },
  { title: "Apuração de Impostos (DAS/DARF)", category: "Fiscal", desc: "Gerar guias de impostos baseadas no faturamento processado." },
  { title: "Conferência de Folha de Pagamento", category: "Folha", desc: "Validar encargos e salários contra provisões contábeis." },
  { title: "Conciliação de Fornecedores", category: "Contábil", desc: "Cruzar pagamentos efetuados com notas fiscais de entrada." },
  { title: "Relatório de Fechamento", category: "Revisão", desc: "Gerar balancete e DRE preliminar para conferência final." }
];

export default function FechamentoContabilPro() {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'checklist' | 'evidencias' | 'gargalos' | 'aprovacoes' | 'relatorios'>('checklist');
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [periods, setPeriods] = useState<ClosePeriod[]>([]);
  const [tasks, setTasks] = useState<CloseTask[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Data
  useEffect(() => {
    if (!user) return;

    // Fetch Clients
    const qClients = query(collection(db, 'clients'), where('userId', '==', user.uid));
    const unsubClients = onSnapshot(qClients, (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });

    // Fetch Periods
    const qPeriods = query(collection(db, 'closePeriods'), where('userId', '==', user.uid), orderBy('period', 'desc'));
    const unsubPeriods = onSnapshot(qPeriods, (snap) => {
      setPeriods(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClosePeriod)));
    });

    // Fetch Profile
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          credits: data.credits ?? 0,
          plan: data.plan ?? 'free',
          usedThisMonth: data.usedThisMonth ?? 0
        });
      } else {
        setProfile({ credits: 0, plan: 'free', usedThisMonth: 0 });
      }
    });

    return () => {
      unsubClients();
      unsubPeriods();
      unsubProfile();
    };
  }, [user]);

  // Fetch Tasks for Selected Period/Client
  useEffect(() => {
    if (!user) return;
    const currentPeriod = periods.find(p => p.period === selectedPeriod);
    if (!currentPeriod) {
      setTasks([]);
      return;
    }

    let qTasks = query(collection(db, 'closeTasks'), where('userId', '==', user.uid), where('periodId', '==', currentPeriod.id));
    if (selectedClientId) {
      qTasks = query(qTasks, where('clientId', '==', selectedClientId));
    }

    const unsubTasks = onSnapshot(qTasks, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloseTask)));
    });

    return () => unsubTasks();
  }, [user, selectedPeriod, periods, selectedClientId]);

  const handleCreatePeriod = async () => {
    if (!user || !profile) return;
    
    // O usuário solicitou remover limites compulsórios de plano free
    setIsProcessing(true);
    try {
      // 1. Create Period
      const periodRef = await addDoc(collection(db, 'closePeriods'), {
        userId: user.uid,
        period: selectedPeriod,
        status: 'em_andamento',
        progress: { done: 0, total: DEFAULT_TASKS.length * (selectedClientId ? 1 : clients.length || 1) },
        createdAt: serverTimestamp()
      });

      // 2. Create Tasks from Template for all clients (or current)
      const clientsToProcess = selectedClientId ? [clients.find(c => c.id === selectedClientId)!] : clients;
      
      const batchPromises = [];
      for (const client of (clientsToProcess.length ? clientsToProcess : [{id: 'geral', companyName: 'Geral'}])) {
        for (const t of DEFAULT_TASKS) {
           batchPromises.push(addDoc(collection(db, 'closeTasks'), {
             userId: user.uid,
             periodId: periodRef.id,
             clientId: client.id,
             title: t.title,
             description: t.desc,
             status: 'pendente',
             ownerUserId: user.uid,
             dueDate: `${selectedPeriod}-20`,
             tags: [t.category],
             createdAt: serverTimestamp()
           }));
        }
      }
      await Promise.all(batchPromises);

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'closePeriods');
    } finally {
      setIsProcessing(false);
    }
  };

   const updateTaskStatus = async (taskId: string, newStatus: CloseTask['status']) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'closeTasks', taskId), { status: newStatus });
      
      const task = tasks.find(t => t.id === taskId);
      if (newStatus === 'aprovado' && task?.clientId) {
        await hubService.updateClientHubSummary(task.clientId, user.uid);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addEvidence = async (taskId: string, name: string, value: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newEvidence = [...(task.evidence || []), { type: 'url' as const, name, value, uploadedAt: new Date().toISOString() }];
    await updateDoc(doc(db, 'closeTasks', taskId), { evidence: newEvidence });
  };

  const currentPeriodData = useMemo(() => periods.find(p => p.period === selectedPeriod), [periods, selectedPeriod]);
  
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'aprovado').length;
    const waiting = tasks.filter(t => t.status === 'aguardando_revisao').length;
    const late = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'aprovado').length;
    return { total, done, waiting, late, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
       <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 mb-[-40px]">
          <Link to="/solucoes" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Catálogo de Soluções
          </Link>
       </div>
       {/* Premium Sub-Header */}
       <div className="bg-blue-600 px-6 py-2 flex justify-between items-center text-white border-b border-blue-500 shadow-sm z-30">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Crown className="w-3 h-3" /> {profile?.plan === 'pro' ? 'Assinante Pro' : 'Plano Free'}
             </div>
             <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Painel de Fechamento Operacional</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <span className="opacity-70">Operacional:</span>
                <span className="bg-white text-blue-600 px-3 py-1 rounded-full shadow-lg">Multi-Empresa Ativo</span>
             </div>
          </div>
       </div>

       {/* Dynamic Tool Header */}
       <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-8 pt-10 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100 dark:shadow-none"><ClipboardCheck className="w-7 h-7" /></div>
               <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">Fechamento.PRO</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Gestão de Checklists & Evidências de Auditoria</p>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-200 dark:border-slate-700">
                     <Calendar className="w-4 h-4 text-blue-600" />
                     <input 
                       type="month" 
                       value={selectedPeriod} 
                       onChange={(e) => setSelectedPeriod(e.target.value)}
                       className="bg-transparent text-xs font-black uppercase outline-none"
                     />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2">
                     <Building2 className="w-4 h-4 text-blue-600" />
                     <select 
                       value={selectedClientId}
                       onChange={(e) => setSelectedClientId(e.target.value)}
                       className="bg-transparent text-xs font-black uppercase outline-none max-w-[150px]"
                     >
                        <option value="">Todos os Clientes</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                     </select>
                  </div>
               </div>

               {!currentPeriodData ? (
                 <button 
                   onClick={handleCreatePeriod}
                   disabled={isProcessing}
                   className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-slate-900 transition-all flex items-center gap-2"
                 >
                   {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                   Criar Fechamento
                 </button>
               ) : (
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status do Período</p>
                       <p className="text-xs font-black text-blue-600 uppercase leading-none">{currentPeriodData.status.replace('_', ' ')}</p>
                    </div>
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${stats.progress}%` }} />
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white italic">{stats.progress}%</span>
                 </div>
               )}
            </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
          
          {/* Dashboard Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
             {[
               { label: 'Total Tarefas', val: stats.total, icon: Layers, color: 'text-blue-600' },
               { label: 'Aprovadas', val: stats.done, icon: CheckCircle2, color: 'text-emerald-500' },
               { label: 'Aguar. Revisão', val: stats.waiting, icon: Clock, color: 'text-amber-500' },
               { label: 'Atrasadas', val: stats.late, icon: AlertTriangle, color: 'text-rose-500' }
             ].map(s => (
               <div key={s.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400"><s.icon className={cn("w-6 h-6", s.color)} /></div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                     <p className="text-xl font-black text-slate-900 dark:text-white leading-none italic">{s.val}</p>
                  </div>
               </div>
             ))}
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-10">
             
             {/* Main Area */}
             <div className="flex-1 space-y-6">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar self-start">
                   {[
                     { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
                     { id: 'evidencias', label: 'Audit / Evidências', icon: FileText },
                     { id: 'aprovacoes', label: 'Revisão', icon: ShieldCheck },
                     { id: 'gargalos', label: 'Gargalos', icon: BarChart2 },
                     { id: 'relatorios', label: 'Exportar', icon: Download }
                   ].map(t => (
                     <button
                       key={t.id}
                       onClick={() => setActiveTab(t.id as any)}
                       className={cn(
                         "flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                         activeTab === t.id 
                           ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                           : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                       )}
                     >
                        <t.icon className="w-4 h-4" /> {t.label}
                     </button>
                   ))}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] flex flex-col overflow-hidden">
                   <AnimatePresence mode="wait">
                      {tasks.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-200 shadow-inner">
                              <Target className="w-10 h-10" />
                           </div>
                           <h3 className="text-xl font-black text-slate-300 tracking-tight uppercase italic">Sem Fechamento Ativo</h3>
                           <p className="text-sm text-slate-400 max-w-xs font-medium">Crie um novo período de fechamento para iniciar a gestão de tarefas e evidências para seus clientes.</p>
                        </motion.div>
                      ) : (
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8">
                           {activeTab === 'checklist' && (
                             <div className="space-y-4">
                                {tasks.map(task => (
                                  <div key={task.id} className="group p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                                     <div className="flex items-center gap-6">
                                        <button 
                                          onClick={() => updateTaskStatus(task.id, task.status === 'aprovado' ? 'pendente' : 'aprovado')}
                                          className={cn(
                                            "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all",
                                            task.status === 'aprovado' 
                                              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" 
                                              : "border-slate-200 hover:border-blue-400"
                                          )}
                                        >
                                           {task.status === 'aprovado' && <Check className="w-5 h-5" />}
                                        </button>
                                        <div className="space-y-1">
                                           <div className="flex items-center gap-3">
                                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{task.title}</p>
                                              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">{task.tags[0]}</span>
                                           </div>
                                           <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.dueDate}</span>
                                              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {clients.find(c => c.id === task.clientId)?.companyName || 'Geral'}</span>
                                              {task.evidence && task.evidence.length > 0 && (
                                                <span className="flex items-center gap-1 text-emerald-500"><ShieldCheck className="w-3 h-3" /> {task.evidence.length} Evidências</span>
                                              )}
                                           </div>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => {
                                            const url = prompt("Cole o link da evidência (Google Drive, Portal, etc):");
                                            if (url) addEvidence(task.id, "Link de Auditoria", url);
                                          }}
                                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:shadow-md transition-all shadow-sm"
                                        >
                                           <LinkIcon className="w-4 h-4" />
                                        </button>
                                        <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:shadow-md transition-all shadow-sm"><MoreVertical className="w-4 h-4" /></button>
                                     </div>
                                  </div>
                                ))}
                             </div>
                           )}

                           {activeTab === 'evidencias' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tasks.filter(t => t.evidence && t.evidence.length > 0).map(t => (
                                  <div key={t.id} className="p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><FileText className="w-24 h-24" /></div>
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><FileText className="w-5 h-5" /></div>
                                        <div className="space-y-0.5">
                                           <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{t.title}</h4>
                                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.evidence?.length} Arquivos Anexados</p>
                                        </div>
                                     </div>
                                     <div className="space-y-3">
                                        {t.evidence?.map((ev, idx) => (
                                          <a key={idx} href={ev.value} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-600 hover:border-blue-400 transition-all shadow-sm group">
                                             <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 className="w-4 h-4" /></div>
                                             <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{ev.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{ev.uploadedAt.split('T')[0]}</p>
                                             </div>
                                             <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-blue-600" />
                                          </a>
                                        ))}
                                     </div>
                                  </div>
                                ))}
                             </div>
                           )}

                           {activeTab === 'aprovacoes' && (
                             <div className="space-y-6">
                                <div className="text-center p-10 bg-blue-50/50 dark:bg-blue-900/10 rounded-[40px] border border-blue-100 dark:border-blue-800 mb-8">
                                   <h4 className="text-xl font-black text-blue-600 italic uppercase underline decoration-blue-200 underline-offset-8">Fluxo Preparador & Revisor.</h4>
                                   <p className="text-sm text-slate-500 font-medium mt-4">Tarefas finalizadas que aguardam seu carimbo de revisão final.</p>
                                </div>
                                <div className="space-y-4">
                                   {tasks.filter(t => t.status === 'aguardando_revisao').length === 0 ? (
                                      <div className="p-20 text-center space-y-4">
                                         <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-inner"><Check className="w-8 h-8" /></div>
                                         <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Nenhuma tarefa aguardando revisão</p>
                                      </div>
                                   ) : (
                                     tasks.filter(t => t.status === 'aguardando_revisao').map(t => (
                                       <div key={t.id} className="p-8 bg-white dark:bg-slate-800 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-xl transition-all">
                                          <div className="flex items-center gap-6">
                                             <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 animate-pulse"><Clock className="w-6 h-6" /></div>
                                             <div className="space-y-1">
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{t.title}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preparado por Rodrigo Maciel • {t.dueDate}</p>
                                             </div>
                                          </div>
                                          <div className="flex gap-4">
                                             <button onClick={() => updateTaskStatus(t.id, 'aprovado')} className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center gap-2 italic">Aprovar Task</button>
                                             <button onClick={() => updateTaskStatus(t.id, 'em_andamento')} className="px-8 py-3 bg-white text-rose-500 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">Reprovar</button>
                                          </div>
                                       </div>
                                     ))
                                   )}
                                </div>
                             </div>
                           )}

                           {activeTab === 'gargalos' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                   <div className="flex items-center gap-3">
                                      <div className="p-3 bg-rose-50 rounded-xl text-rose-500"><AlertTriangle className="w-6 h-6" /></div>
                                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Principais Gargalos</h3>
                                   </div>
                                   <div className="space-y-4">
                                      {tasks.filter(t => t.status === 'pendente' && new Date(t.dueDate) < new Date()).map(t => (
                                        <div key={t.id} className="p-6 bg-rose-50/30 rounded-3xl border border-rose-100/50 flex items-center justify-between">
                                           <div className="space-y-1">
                                              <p className="text-[10px] font-black text-rose-600 uppercase tracking-tight">{t.title}</p>
                                              <p className="text-[9px] font-bold text-slate-400 uppercase">{clients.find(c => c.id === t.clientId)?.companyName || 'Geral'}</p>
                                           </div>
                                           <div className="text-right">
                                              <p className="text-[10px] font-black text-rose-400 uppercase italic">Atraso Crítico</p>
                                              <p className="text-xs font-bold text-slate-600">{t.dueDate}</p>
                                           </div>
                                        </div>
                                      ))}
                                   </div>
                                </div>
                                <div className="space-y-8">
                                   <div className="flex items-center gap-3">
                                      <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><BarChart2 className="w-6 h-6" /></div>
                                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Timeline Prevista</h3>
                                   </div>
                                   <div className="h-64 flex items-end gap-2 px-4 pb-4 bg-slate-50 dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-800">
                                      {[40, 70, 45, 90, 65, 85, 30].map((h, i) => (
                                        <div key={i} className="flex-1 bg-blue-600/10 rounded-t-xl relative group">
                                           <div className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-xl transition-all duration-700 group-hover:bg-blue-400" style={{ height: `${h}%` }} />
                                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded select-none uppercase tracking-widest">{h}%</div>
                                        </div>
                                      ))}
                                   </div>
                                   <div className="flex justify-between px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                      <span>Fiscal</span>
                                      <span>Contab.</span>
                                      <span>Banco</span>
                                      <span>Folha</span>
                                      <span>Outros</span>
                                   </div>
                                </div>
                             </div>
                           )}

                           {activeTab === 'relatorios' && (
                             <div className="space-y-10 py-10">
                                <div className="text-center space-y-4">
                                   <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner"><Download className="w-8 h-8" /></div>
                                   <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic decoration-emerald-200 underline underline-offset-8">Report de Fechamento.</h3>
                                   <p className="text-sm text-slate-400 max-w-sm mx-auto font-medium font-serif italic italic leading-relaxed pt-2">Transparência total para você e seu cliente. Exporte a trilha de auditoria completa.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="p-10 bg-white dark:bg-slate-800 rounded-[48px] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group flex flex-col items-center text-center space-y-6">
                                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all"><FileText className="w-8 h-8" /></div>
                                      <div className="space-y-1">
                                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest underline decoration-blue-100 italic">Checklist Detalhado</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preparador, Revisor e Datas</p>
                                      </div>
                                      <button className="w-full py-4 bg-slate-50 dark:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-900 hover:text-white transition-all">Download CSV</button>
                                   </div>
                                   <div className="p-10 bg-white dark:bg-slate-800 rounded-[48px] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group flex flex-col items-center text-center space-y-6">
                                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Database className="w-8 h-8" /></div>
                                      <div className="space-y-1">
                                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest underline decoration-emerald-100 italic">Dossiê de Evidências</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compilado de Links e Arquivos</p>
                                      </div>
                                      <button className="w-full py-4 bg-slate-50 dark:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-900 hover:text-white transition-all">Download Relatório</button>
                                   </div>
                                </div>
                             </div>
                           )}
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             </div>

             {/* Sidebar: Eco-Indicadores */}
             <div className="w-full lg:w-80 space-y-8">
                <div className="bg-slate-900 rounded-[48px] p-8 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute -bottom-8 -right-8 opacity-10"><Database className="w-40 h-40 text-blue-400" /></div>
                   <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-2">
                         <Sparkles className="w-4 h-4 text-blue-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest italic tracking-widest">Ecossistema Conectado</span>
                      </div>
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                               <span>ReceiptorBR</span>
                               <span className="text-emerald-400">OK</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                               <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                               <p className="text-[10px] font-bold leading-tight">42 Notas Fiscais processadas no período.</p>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                               <span>ExtratoBR</span>
                               <span className="text-amber-400">Pendente</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                               <AlertTriangle className="w-4 h-4 text-amber-400" />
                               <p className="text-[10px] font-bold leading-tight">Conciliação pendente para 1 banco.</p>
                            </div>
                         </div>
                      </div>
                      <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                         <History className="w-4 h-4" /> Histórico do Ecossistema
                      </button>
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic tracking-widest">Time Alocado</h4>
                   <div className="space-y-4">
                      {[
                        { name: 'Rodrigo Maciel', role: 'Preparador', initial: 'RM', tasks: 12 },
                        { name: 'Ana Oliveira', role: 'Revisor', initial: 'AO', tasks: 3 },
                        { name: 'Consultor IA', role: 'Automação', initial: 'AI', tasks: 42 }
                      ].map(m => (
                        <div key={m.name} className="flex items-center gap-4">
                           <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black italic",
                             m.role === 'Automação' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                           )}>{m.initial}</div>
                           <div className="flex-1">
                              <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{m.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.role}</p>
                           </div>
                           <span className="text-[9px] font-black text-blue-600 italic">{m.tasks} tasks</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-medium pb-10">
             <div className="flex items-center gap-3 text-xs italic">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Trilha de Auditoria com Carimbo do Tempo (Imutável)
             </div>
             <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                <a href="#" className="hover:text-blue-600 transition-colors">Manual de Procedimentos</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Segurança de Dados</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Exportar tudo (JSON/XLSX)</a>
             </div>
          </div>
       </div>

       {/* O usuário solicitou remover o overlay de paywall */}
    </div>
  );
}
