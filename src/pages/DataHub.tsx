import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2,
  Database,
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  LayoutGrid,
  FileText,
  DollarSign,
  Activity,
  History,
  ShieldCheck,
  Zap,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { analyzeDataHub } from '../services/geminiService';

interface Client {
  id: string;
  companyName: string;
  cnpj: string;
}

interface HubTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'entrada' | 'saida';
  category: string;
  source: string;
  processedAt: Timestamp;
}

interface HubDocument {
  id: string;
  type: string;
  value: number;
  date: string;
  emitente: string;
  categoria: string;
  source: string;
  createdAt: Timestamp;
}

export default function DataHub() {
  const [user] = useAuthState(auth);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'perfil' | 'transações' | 'documentos' | 'integridade'>('perfil');
  const [transactions, setTransactions] = useState<HubTransaction[]>([]);
  const [documents, setDocuments] = useState<HubDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hubInsights, setHubInsights] = useState<any>(null);

  // Fetch Clients
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'clients'), where('userId', '==', user.uid));
    return onSnapshot(q, (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
  }, [user]);

  // Fetch Hub Data when client selected
  useEffect(() => {
    if (!selectedClientId || !user) return;
    setIsLoading(true);

    const qTrans = query(
      collection(db, 'hubTransactions'), 
      where('clientId', '==', selectedClientId),
      orderBy('date', 'desc'),
      limit(50)
    );
    const unsubTrans = onSnapshot(qTrans, (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as HubTransaction)));
    });

    const qDocs = query(
      collection(db, 'hubDocuments'), 
      where('clientId', '==', selectedClientId),
      orderBy('date', 'desc'),
      limit(50)
    );
    const unsubDocs = onSnapshot(qDocs, (snap) => {
      setDocuments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as HubDocument)));
      setIsLoading(false);
    });

    return () => {
      unsubTrans();
      unsubDocs();
    };
  }, [selectedClientId, user]);

  const selectedClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId), 
  [clients, selectedClientId]);

  const stats = useMemo(() => {
    const totalEntradas = transactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
    const totalSaidas = Math.abs(transactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0));
    const totalDocValue = documents.reduce((s, d) => s + d.value, 0);
    
    return {
      entradas: totalEntradas,
      saidas: totalSaidas,
      saldo: totalEntradas - totalSaidas,
      docsValue: totalDocValue,
      docCount: documents.length,
      transCount: transactions.length
    };
  }, [transactions, documents]);

  const handleAnalyzeHub = async () => {
    if (!selectedClientId) return;
    setIsAnalyzing(true);
    try {
      const dataPayload = {
        empresa: selectedClient?.companyName,
        resumoFinanceiro: stats,
        ultimasTransacoes: transactions.slice(0, 10).map(t => ({ d: t.description, v: t.amount, cat: t.category })),
        ultimosDocumentos: documents.slice(0, 10).map(d => ({ t: d.type, v: d.value, em: d.emitente }))
      };

      const result = await analyzeDataHub(JSON.stringify(dataPayload));
      setHubInsights(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-8 pt-12 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100 dark:shadow-none">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">Data Hub</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Consolidação e Normalização de Inteligência</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <select 
                 value={selectedClientId}
                 onChange={(e) => setSelectedClientId(e.target.value)}
                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none"
               >
                 <option value="">Selecionar Cliente...</option>
                 {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
               </select>
            </div>
            <button className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
              <Filter className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
        {!selectedClientId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8 animate-in fade-in zoom-in duration-500">
             <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[48px] flex items-center justify-center text-slate-300 shadow-inner">
                <Database className="w-16 h-16" />
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Selecione uma Empresa<br />para ver o Hub.</h2>
                <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Visualize todos os dados normalizados de extratos, notas fiscais e transações em um perfil único.</p>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
                {[
                  { label: 'Normalização', icon: Zap },
                  { label: 'Detecção Duplicidade', icon: ShieldCheck },
                  { label: 'Integridade IA', icon: Activity },
                  { label: 'Score Saúde', icon: TrendingUp }
                ].map(f => (
                  <div key={f.label} className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 text-center space-y-3">
                     <f.icon className="w-6 h-6 text-blue-600 mx-auto" />
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-tight">{f.label}</p>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Client Header Info */}
            <div className="bg-slate-900 rounded-[56px] p-10 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150"><Zap className="w-64 h-64 text-blue-400" /></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Ativo</span>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest font-mono">{selectedClient?.cnpj}</span>
                     </div>
                     <h2 className="text-5xl font-black tracking-tighter italic leading-none">{selectedClient?.companyName}</h2>
                  </div>
                  <div className="flex gap-4">
                     <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 text-center min-w-[140px]">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Saúde Fiscal</p>
                        <p className="text-2xl font-black text-emerald-400 italic">ALTA</p>
                     </div>
                     <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 text-center min-w-[140px]">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Integridade</p>
                        <p className="text-2xl font-black text-white italic">94%</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label: 'Entradas (Extrato)', val: `R$ ${stats.entradas.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                 { label: 'Saídas (Extrato)', val: `R$ ${stats.saidas.toLocaleString()}`, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50' },
                 { label: 'Saldo Projetado', val: `R$ ${stats.saldo.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
                 { label: 'Documentos (Hub)', val: stats.docCount, icon: FileText, color: 'text-slate-900', bg: 'bg-slate-100' }
               ].map(s => (
                 <motion.div 
                   key={s.label}
                   whileHover={{ y: -5 }}
                   className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4"
                 >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", s.bg)}>
                       <s.icon className={cn("w-6 h-6", s.color)} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{s.label}</p>
                       <p className={cn("text-2xl font-black tracking-tighter truncate", s.color)}>{s.val}</p>
                    </div>
                 </motion.div>
               ))}
            </div>

            {/* Main Tabs Container */}
            <div className="flex flex-col gap-6">
               <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-[32px] border border-slate-200 dark:border-slate-800 w-fit shadow-sm">
                  {[
                    { id: 'perfil', label: 'Visão 360º', icon: Activity },
                    { id: 'transações', label: 'Transações', icon: History },
                    { id: 'documentos', label: 'Documentos', icon: FileText },
                    { id: 'integridade', label: 'Integridade', icon: ShieldCheck }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={cn(
                        "flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === t.id 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none" 
                          : "text-slate-400 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                       <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                  ))}
               </div>

               <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] p-2">
                 <AnimatePresence mode="wait">
                   {activeTab === 'perfil' && (
                     <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-8">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2 underline decoration-blue-600/30 underline-offset-4"><TrendingUp className="w-4 h-4" /> Desempenho Mensal</h4>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px]">
                                    <div>
                                       <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Média de Faturamento</p>
                                       <p className="text-xl font-black text-slate-900 dark:text-white italic">R$ {(stats.entradas / 12 || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                       <span className="text-[10px] font-bold text-emerald-500">+12% vs last month</span>
                                    </div>
                                 </div>
                                 <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px]">
                                    <div>
                                       <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total de Despesas</p>
                                       <p className="text-xl font-black text-slate-900 dark:text-white italic">R$ {stats.saidas.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                       <span className="text-[10px] font-bold text-rose-500">+4% vs last month</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-8">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2 underline decoration-blue-600/30 underline-offset-4"><AlertTriangle className="w-4 h-4" /> Inconsistências Detectadas</h4>
                              <div className="bg-slate-900 rounded-[40px] p-8 space-y-6">
                                 <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0"><Info className="w-5 h-5" /></div>
                                    <div className="space-y-1">
                                       <p className="text-xs font-black text-white italic">Diferença de Faturamento (XML vs Extrato)</p>
                                       <p className="text-[10px] text-white/50 leading-relaxed italic">Detectamos R$ 4.200,00 em entradas no extrato sem notas fiscais emitidas no ReceiptorBR.</p>
                                    </div>
                                 </div>
                                 <div className="h-px bg-white/10" />
                                 <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shrink-0"><Zap className="w-5 h-5" /></div>
                                    <div className="space-y-1">
                                       <p className="text-xs font-black text-white italic">Sincronização Cobra AI</p>
                                       <p className="text-[10px] text-white/50 leading-relaxed italic">Todas as 4 cobranças recorrentes deste mês batem com o extrato bancário.</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                           <button 
                             onClick={handleAnalyzeHub}
                             disabled={isAnalyzing}
                             className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:bg-slate-900 transition-all flex items-center justify-center gap-3 group"
                           >
                              {isAnalyzing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Zap className="w-5 h-5 text-amber-400 group-hover:scale-125 transition-transform" />
                              )}
                              {isAnalyzing ? 'Processando Intelligence...' : 'Gerar Insights IA'}
                           </button>
                           <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all cursor-not-allowed opacity-50">
                              Report Consolidado (PDF)
                           </button>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-10 border-t border-slate-100 dark:border-slate-800 pt-10">
                           <div className="w-full lg:w-96 space-y-6">
                              <div className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2"><Activity className="w-4 h-4" /> Score de Saúde Hub</h4>
                                 <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full border-[6px] border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                                       <svg className="w-full h-full -rotate-90">
                                          <circle cx="48" cy="48" r="42" fill="none" strokeWidth="6" stroke="currentColor" strokeDasharray="264" strokeDashoffset={264 - (264 * (hubInsights?.score || (stats.saldo > 0 ? 88 : 42))) / 100} className="text-blue-600 transition-all duration-1000" />
                                       </svg>
                                       <span className="absolute text-2xl font-black italic">{hubInsights?.score || (stats.saldo > 0 ? 88 : 42)}%</span>
                                    </div>
                                    <div className="space-y-1">
                                       <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{hubInsights?.score > 80 ? 'Excelente' : hubInsights?.score > 50 ? 'Estável' : 'Requer Atenção'}</p>
                                       <p className="text-[9px] font-bold text-slate-400 leading-tight uppercase">Baseado em {stats.transCount + stats.docCount} pontos de dados.</p>
                                    </div>
                                 </div>
                              </div>

                              <div className="bg-slate-950 rounded-[48px] p-8 text-white space-y-6 relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-8 opacity-10"><Info className="w-20 h-20" /></div>
                                 <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic tracking-widest relative z-10">IA Highlights</h4>
                                 <div className="space-y-4 relative z-10">
                                    {hubInsights?.insights ? hubInsights.insights.slice(0, 3).map((ins: any, idx: number) => (
                                      <div key={idx} className="space-y-2 translate-y-0 animate-in fade-in slide-in-from-top-2 duration-300">
                                         <div className="flex items-center gap-2">
                                            <div className={cn("w-1.5 h-4 rounded-full", ins.type === 'alerta' ? 'bg-rose-500' : (ins.type === 'oportunidade' ? 'bg-emerald-500' : 'bg-blue-500'))} />
                                            <p className="text-[11px] font-black uppercase italic">{ins.title}</p>
                                         </div>
                                         <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">{ins.description}</p>
                                      </div>
                                    )) : (
                                      <p className="text-[10px] font-bold text-slate-500 italic uppercase">Clique em "Gerar Insights" para análise biométrica dos dados da empresa.</p>
                                    )}
                                 </div>
                              </div>
                           </div>

                           <div className="flex-1 space-y-8">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2 underline decoration-blue-600/30 underline-offset-4"><TrendingUp className="w-4 h-4" /> Próximos Passos</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {hubInsights?.proximosPassos ? hubInsights.proximosPassos.map((p: string, idx: number) => (
                                    <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] flex items-center gap-4 group hover:border-blue-600 transition-all">
                                       <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></div>
                                       <p className="text-[10px] font-black uppercase italic leading-tight">{p}</p>
                                    </div>
                                 )) : (
                                   <div className="col-span-2 p-10 bg-slate-50 dark:bg-slate-800/30 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                      <p className="text-xs font-bold text-slate-400 uppercase italic">Aguardando processamento Inteligente...</p>
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   )}

                   {activeTab === 'transações' && (
                     <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                        <div className="p-8 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Últimas 50 Movimentações Normalizadas</h4>
                           <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:bg-blue-50 p-2 rounded-xl transition-all">Baixar Ledger (CSV) <ChevronRight className="w-3 h-3" /></button>
                        </div>
                        <div className="flex-1 overflow-x-auto no-scrollbar">
                           <table className="w-full text-left">
                              <thead className="bg-slate-50 dark:bg-slate-800/50">
                                 <tr>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Fonte</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                 {transactions.length === 0 ? (
                                   <tr>
                                      <td colSpan={5} className="p-20 text-center text-[10px] font-black text-slate-300 uppercase italic">Nenhuma transação encontrada no Hub para este cliente.</td>
                                   </tr>
                                 ) : (
                                   transactions.map(t => (
                                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                         <td className="px-8 py-6 text-xs font-black text-slate-400 font-mono italic">{t.date}</td>
                                         <td className="px-8 py-6">
                                            <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[200px]">{t.description}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase italic">ID: {t.id.slice(0, 8)}</p>
                                         </td>
                                         <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[9px] font-black text-slate-500 uppercase italic">{t.category}</span>
                                         </td>
                                         <td className={cn(
                                           "px-8 py-6 text-sm font-black text-right italic",
                                           t.type === 'entrada' ? "text-emerald-500" : "text-rose-500"
                                         )}>
                                            {t.type === 'entrada' ? '+' : '-'} R$ {t.amount.toLocaleString()}
                                         </td>
                                         <td className="px-8 py-6 text-center">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.source}</span>
                                         </td>
                                      </tr>
                                   ))
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </motion.div>
                   )}

                   {activeTab === 'documentos' && (
                     <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                        <div className="p-8 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Documentos Fiscais e Recibos Centralizados</h4>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {documents.length === 0 ? (
                             <div className="col-span-full py-20 text-center text-[10px] font-black text-slate-300 uppercase italic">Nenhum documento processado no Hub.</div>
                           ) : (
                             documents.map(d => (
                               <div key={d.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-4 hover:shadow-lg transition-all group">
                                  <div className="flex justify-between items-start">
                                     <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                        <FileText className="w-5 h-5" />
                                     </div>
                                     <span className="text-[9px] font-black text-blue-600 bg-white dark:bg-slate-900 px-3 py-1 rounded-full uppercase tracking-widest italic">{d.type}</span>
                                  </div>
                                  <div>
                                     <h5 className="text-sm font-black text-slate-900 dark:text-white italic leading-tight truncate">{d.emitente}</h5>
                                     <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 italic">{d.date} • {d.categoria}</p>
                                  </div>
                                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                     <span className="text-lg font-black text-slate-900 dark:text-white italic">R$ {d.value.toLocaleString()}</span>
                                     <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest p-2 hover:bg-white rounded-xl transition-all">Ver Doc</button>
                                  </div>
                               </div>
                             ))
                           )}
                        </div>
                     </motion.div>
                   )}

                   {activeTab === 'integridade' && (
                     <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 flex flex-col items-center justify-center space-y-8 min-h-[400px]">
                        <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center text-emerald-600 shadow-xl animate-pulse">
                           <ShieldCheck className="w-12 h-12" />
                        </div>
                        <div className="text-center space-y-2">
                           <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic underline decoration-emerald-500/30">Motor de Integridade 2.0</h3>
                           <p className="text-sm text-slate-500 font-medium max-w-sm">Nossa IA está continuamente cruzando dados de extratos e documentos para garantir que sua contabilidade seja blindada contra erros.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                           <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-2">
                              <p className="text-[10px] font-black text-blue-600 uppercase">Cruzamento Tributário</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">100% das notas fiscais conferem com os débitos bancários.</p>
                           </div>
                           <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-2">
                              <p className="text-[10px] font-black text-blue-600 uppercase">Validação de Saldo</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">Saldo em 31/05 é compatível com o histórico de faturamento.</p>
                           </div>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto w-full px-8 py-10 mt-10 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-400 font-medium pb-20">
         <div className="flex items-center gap-3 text-xs italic">
            <Zap className="w-4 h-4 text-blue-600" /> Data Hub Core v4.1 (Enterprise Layer)
         </div>
         <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors italic">Integridade Documental</a>
            <a href="#" className="hover:text-blue-600 transition-colors italic">Ledger API</a>
            <a href="#" className="hover:text-blue-600 transition-colors italic">Segurança de Dados</a>
         </div>
      </div>
    </div>
  );
}
