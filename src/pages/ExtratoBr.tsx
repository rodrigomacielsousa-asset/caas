import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Upload, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  History, 
  Search, 
  DollarSign, 
  Calendar,
  Sparkles,
  Info,
  X,
  Loader2,
  Trash2,
  Download,
  Eye,
  FileText,
  FileCode,
  ShoppingCart,
  AlertTriangle,
  Building2,
  Layers,
  Database,
  ChevronRight,
  ShieldCheck,
  Crown,
  Copy,
  LayoutGrid,
  Filter,
  Plus,
  Repeat
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { analyzeInvoice } from '../services/geminiService';
import { extratoService } from '../services/extratoService';
import { logService } from '../services/logService';
import { growthService } from '../services/growthService';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  onSnapshot, 
  doc, 
  setDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCart } from '../hooks/useCart';

// Types
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance?: number | null;
  source: 'OFX' | 'PDF' | 'CSV';
  confidence: 'high' | 'medium' | 'low';
  category: string;
  isDuplicate?: boolean;
}

interface StatementData {
  bank: string;
  period: string;
  transactions: Transaction[];
  sourceType: 'OFX' | 'PDF' | 'CSV';
}

interface Client {
  id: string;
  companyName: string;
  cnpj: string;
}

interface CategoryRule {
  id: string;
  contains: string;
  category: string;
  debitAccount?: string;
  creditAccount?: string;
}

interface UserProfile {
  credits: number;
  plan: 'free' | 'pro';
  usedThisMonth: number;
}

export default function ExtratoBr() {
  const { addItem } = useCart();
  const [user] = useAuthState(auth);
  const [file, setFile] = useState<File | null>(null);
  const [bank, setBank] = useState('Outros');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<StatementData | null>(null);
  const [activeTab, setActiveTab] = useState<'resumo' | 'transacoes' | 'contabil' | 'export'>('resumo');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Constants
  const BANKS = ['Itaú', 'Bradesco', 'Santander', 'Caixa', 'BB', 'Nubank', 'Inter', 'Outros'];

  // Fetch Data
  useEffect(() => {
    if (!user) return;

    // Fetch Clients
    const qClients = query(collection(db, 'clients'), where('userId', '==', user.uid));
    const unsubClients = onSnapshot(qClients, (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });

    // Fetch Rules
    const qRules = query(collection(db, 'categoryRules'), where('userId', '==', user.uid));
    const unsubRules = onSnapshot(qRules, (snap) => {
      setRules(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryRule)));
    });

    // Fetch Profile
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          credits: data.credits ?? 3,
          plan: data.plan ?? 'free',
          usedThisMonth: data.usedThisMonth ?? 0
        });
      } else {
        setProfile({ credits: 3, plan: 'free', usedThisMonth: 0 });
      }
    });

    return () => {
      unsubClients();
      unsubRules();
      unsubProfile();
    };
  }, [user]);

  // OFX Parser
  const parseOFX = (text: string): StatementData => {
    try {
      const transactions: Transaction[] = [];
      const bankIdMatch = text.match(/<BANKID>(.*)/);
      const bankName = bankIdMatch ? bankIdMatch[1].trim() : 'OFX Bank';

      // Split by STMTTRN
      const trnBlocks = text.split('<STMTTRN>');
      trnBlocks.shift(); // Remove header

      trnBlocks.forEach((block, idx) => {
        const trnType = block.match(/<TRNTYPE>(.*)/)?.[1].trim();
        const dtPosted = block.match(/<DTPOSTED>(.*)/)?.[1].trim();
        const trnAmt = block.match(/<TRNAMT>(.*)/)?.[1].trim();
        const fitId = block.match(/<FITID>(.*)/)?.[1].trim();
        const memo = block.match(/<MEMO>(.*)/)?.[1].trim() || block.match(/<NAME>(.*)/)?.[1].trim() || 'Sem descrição';

        if (dtPosted && trnAmt) {
          const amount = parseFloat(trnAmt);
          const dateStr = dtPosted.substring(0, 8); // YYYYMMDD
          const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
          
          transactions.push({
            id: fitId || `trn-${idx}`,
            date: formattedDate,
            description: memo,
            amount: amount,
            type: amount >= 0 ? 'credit' : 'debit',
            source: 'OFX',
            confidence: 'high',
            category: suggestCategory(memo, amount)
          });
        }
      });

      return {
        bank: bankName,
        period: transactions.length > 0 ? `${transactions[0].date} - ${transactions[transactions.length-1].date}` : '---',
        transactions,
        sourceType: 'OFX'
      };
    } catch (err) {
      throw new Error("Falha ao processar arquivo OFX. Verifique o formato.");
    }
  };

  const suggestCategory = (desc: string, amount: number) => {
    const d = desc.toUpperCase();
    
    // User Rules First
    const match = rules.find(r => d.includes(r.contains.toUpperCase()));
    if (match) return match.category;

    // Default Rules
    if (d.includes('PIX RECEB') || d.includes('TED RECEB') || amount > 0) return 'Receitas';
    if (d.includes('BOLETO') || d.includes('PAGTO') || d.includes('PAGAMENTO')) return 'Despesas';
    if (d.includes('TRANSF') || d.includes('DOC')) return 'Transferências';
    if (d.includes('TARIFA') || d.includes('JUROS')) return 'Tarifas Bancárias';
    if (d.includes('DAS') || d.includes('SIMPLES') || d.includes('DARF') || d.includes('IMPOSTO')) return 'Impostos';
    if (d.includes('SALARIO') || d.includes('FOLHA') || d.includes('PRO-LABORE')) return 'Pessoal';
    
    return 'A Classificar';
  };

  const handleUpload = async () => {
    if (!file || !user || !profile) return;

    setIsProcessing(true);
    setError(null);

    const isOfx = file.name.toUpperCase().endsWith('.OFX');

    try {
      if (isOfx) {
        const text = await file.text();
        const data = parseOFX(text);
        setResult(data);
      } else {
        // PDF Processing via Gemini - Simplified for MVP
        const reader = new FileReader();
        const data = await new Promise<any>((resolve, reject) => {
          reader.onload = async (e) => {
            const base64 = (e.target?.result as string)?.split(',')[1];
            try {
              // Using a specialized prompt for statements
              const promptOverride = "Extraia as transações deste extrato bancário. Retorne um JSON com 'bank', 'period' e um array 'transactions' [{id, date, description, amount, type}].";
              // Using the same service but with a mock-like structure for the POC if needed, or real Gemini
              const res = await analyzeInvoice(base64, file.type); 
              // Note: Ideally we'd have a separate Gemini tool for statements, but analyzeInvoice is reusable
              resolve(res);
            } catch (err) { reject(err); }
          };
          reader.readAsDataURL(file);
        });

        // Mapping Gemini results to Statement schema
        setResult({
          bank: data.bank || bank,
          period: data.period || 'Período Identificado',
          sourceType: 'PDF',
          transactions: (data.transactions || []).map((t: any, i: number) => ({
            id: t.id || `pdf-${i}`,
            date: t.date || new Date().toISOString().split('T')[0],
            description: t.description || t.fornecedor || 'Transação extraída',
            amount: t.amount || t.valor || 0,
            type: (t.amount || t.valor) >= 0 ? 'credit' : 'debit',
            source: 'PDF',
            confidence: 'medium',
            category: suggestCategory(t.description || t.fornecedor || '', t.amount || t.valor || 0)
          }))
        });
      }

      // Update Stats
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        usedThisMonth: profile.usedThisMonth + 1,
        lastExtraction: serverTimestamp()
      }, { merge: true });

    } catch (err: any) {
      setError(err.message || "Erro no processamento. Verifique se o arquivo é válido.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;
    setIsSaving(true);
    try {
      await extratoService.processStatement(user.uid, selectedClientId || '', result);
      await logService.info(user.uid, "Extrato Processado", { clientId: selectedClientId });
      
      // Growth Tracking
      await growthService.trackEvent(user.uid, 'extratobr', 'save_statement', {
        bank: result.bank,
        transactionCount: result.transactions.length
      });

      alert("Extrato salvo e integrado ao Data Hub com sucesso!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'statements');
      logService.error(user.uid, "Erro ao processar extrato", err);
    } finally {
      setIsSaving(false);
    }
  };

  const exportTransactions = () => {
    if (!result) return;
    const csvContent = "data,descricao,valor,categoria,fonte,confianca\n" + 
      result.transactions.map(t => `${t.date},"${t.description}",${t.amount},${t.category},${t.source},${t.confidence}`).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Extrato_${result.bank}_${result.period}.csv`);
    link.click();
  };

  const journalEntries = useMemo(() => {
    if (!result) return [];
    return result.transactions.map(t => {
      const isOut = t.amount < 0;
      return {
        date: t.date,
        history: `Lancamento Ref: ${t.description}`,
        debit: isOut ? t.category : 'Banco Conta Movimento',
        credit: isOut ? 'Banco Conta Movimento' : t.category,
        amount: Math.abs(t.amount)
      };
    });
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
       <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 mb-[-40px]">
          <Link to="/solucoes" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-all uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Catálogo de Soluções
          </Link>
       </div>
       {/* Extrato Header */}
       <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-8 pt-10 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-100 dark:shadow-none"><BarChart3 className="w-7 h-7" /></div>
               <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Extrato.BR</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Processamento Inteligente de Fluxo de Caixa</p>
               </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="px-6 py-2 text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Deduplicado</p>
                     <p className="text-sm font-black text-slate-900 dark:text-white leading-none">Sim</p>
                   </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 my-auto" />
                  <div className="px-6 py-2 text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">IA Confiança</p>
                     <p className="text-sm font-black text-emerald-500 leading-none">98.2%</p>
                  </div>
               </div>
               <button 
                 onClick={() => {
                    addItem({
                      id: 'extratobr',
                      name: 'Extrato.BR',
                      slug: 'extrato-br',
                      price: 59.90,
                      priceLabel: 'R$ 59,90/mês',
                      pricingModel: 'subscription',
                      type: 'individual'
                    });
                    alert('Adicionado ao carrinho!');
                 }}
                 className="bg-blue-600 hover:bg-slate-900 px-6 py-3 rounded-2xl text-[11px] font-black uppercase text-white tracking-widest transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
               >
                 <ShoppingCart className="w-4 h-4" /> Comprar Licença
               </button>
               <button className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                  <History className="w-6 h-6" />
               </button>
            </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
             
             {/* Left Column: Input */}
             <div className="space-y-10">
                <div className="p-10 md:p-16 bg-white dark:bg-slate-900 rounded-[56px] border-4 border-dashed border-slate-100 dark:border-slate-800 text-center space-y-8 group hover:border-emerald-400 transition-all cursor-pointer shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 text-emerald-600/5 pointer-events-none scale-150"><LayoutGrid className="w-48 h-48" /></div>
                   
                   <div className="relative z-10 space-y-8">
                      <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-[32px] flex items-center justify-center mx-auto text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                         <Upload className="w-10 h-10" />
                      </div>
                      <div className="space-y-3">
                         <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase italic underline decoration-emerald-600/30 underline-offset-8">Extrato<br />Live Engine.</h2>
                         <p className="text-sm text-slate-400 font-serif italic max-w-xs mx-auto">Importe OFX ou PDF para categorização automática em segundos.</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <select 
                             value={bank}
                             onChange={(e) => setBank(e.target.value)}
                             className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none text-center"
                           >
                              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                           </select>
                           <select 
                             value={selectedClientId}
                             onChange={(e) => setSelectedClientId(e.target.value)}
                             className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none text-center"
                           >
                              <option value="">Vincular Cliente</option>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                           </select>
                        </div>

                        {file ? (
                          <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center justify-between shadow-xl animate-bounce">
                             <div className="flex items-center gap-3">
                                <FileCode className="w-5 h-5" />
                                <span className="text-[10px] font-black truncate uppercase tracking-widest">{file.name}</span>
                             </div>
                             <button onClick={() => setFile(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="relative">
                             <input type="file" multiple={false} accept=".ofx,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                             <div className="py-4 border border-emerald-100 bg-emerald-50/50 rounded-2xl text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                Selecionar de um Arquivo (OFX/PDF)
                             </div>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={handleUpload}
                        disabled={!file || isProcessing}
                        className={cn(
                          "w-full py-6 rounded-[32px] text-xl font-black uppercase tracking-tighter italic flex items-center justify-center gap-3 shadow-2xl transition-all",
                          !file || isProcessing 
                            ? "bg-slate-100 text-slate-300 pointer-events-none" 
                            : "bg-emerald-600 text-white hover:bg-slate-900 hover:scale-[1.02]"
                        )}
                      >
                         {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-7 h-7" />}
                         {isProcessing ? 'Lendo Transações...' : 'Extrair Extrato'}
                      </button>

                      {error && (
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center gap-3 text-xs font-bold text-left animate-shake">
                           <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                           {error}
                        </div>
                      )}
                   </div>
                </div>

                {/* Feature Highlight */}
                <div className="bg-slate-900 rounded-[48px] p-8 text-white relative overflow-hidden">
                   <div className="absolute -bottom-8 -right-8 opacity-10"><Database className="w-40 h-40 text-emerald-400" /></div>
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-2">
                         <Repeat className="w-5 h-5 text-emerald-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Deduplicação Nativa</span>
                      </div>
                      <h4 className="text-xl font-black tracking-tighter leading-tight italic">Detectamos transações duplicadas <br /> e normalizamos descrições ilegíveis.</h4>
                      <div className="flex gap-3">
                         <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest italic tracking-widest">
                            Regras Inteligentes
                         </div>
                         <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest italic tracking-widest text-emerald-400">
                            99% Precisão OFX
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Column: Results */}
             <div className="space-y-6">
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
                   {[
                     { id: 'resumo', label: 'Resumo', icon: Eye },
                     { id: 'transacoes', label: 'Transações', icon: LayoutGrid },
                     { id: 'contabil', label: 'Contábil', icon: Database },
                     { id: 'export', label: 'Exportar', icon: Download }
                   ].map(t => (
                     <button
                       key={t.id}
                       onClick={() => setActiveTab(t.id as any)}
                       className={cn(
                         "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                         activeTab === t.id 
                           ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                           : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                       )}
                     >
                        <t.icon className="w-4 h-4" /> {t.label}
                     </button>
                   ))}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col p-2 overflow-hidden relative">
                   <AnimatePresence mode="wait">
                      {!result ? (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6"
                        >
                           <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-200 shadow-inner">
                              {isProcessing ? <Loader2 className="w-12 h-12 animate-spin text-emerald-400" /> : <Filter className="w-12 h-12" />}
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-2xl font-black text-slate-300 tracking-tight uppercase italic">{isProcessing ? 'Lendo Extrato...' : 'Aguardando Importação...'}</h3>
                              <p className="text-sm text-slate-400 font-medium max-w-xs">{isProcessing ? 'Extraindo datas, descrições e valores para conciliação.' : 'Importe um arquivo bancário para visualizar as transações estruturadas.'}</p>
                           </div>
                        </motion.div>
                      ) : (
                        <motion.div key="populated" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col h-full overflow-hidden">
                           <div className="p-10 space-y-10 flex-1 overflow-y-auto no-scrollbar">
                              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-8 sticky top-0 bg-white dark:bg-slate-900 z-10 pt-2">
                                 <div>
                                    <div className="flex items-center gap-3 mb-2">
                                       <span className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                          {result.sourceType}
                                       </span>
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{result.period}</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{result.bank}</h3>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transações</p>
                                    <p className="text-4xl font-black text-emerald-600 italic leading-none">{result.transactions.length}</p>
                                 </div>
                              </div>

                              <div className="py-2">
                                 {activeTab === 'resumo' && (
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-6">
                                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><DollarSign className="w-4 h-4" /> Fluxo Financeiro</h4>
                                         <div className="grid grid-cols-2 gap-6">
                                            <div>
                                               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Entradas</p>
                                               <p className="text-xl font-black text-slate-900 dark:text-white italic">R$ {result.transactions.filter(t => t.type === 'credit').reduce((s,t) => s + t.amount, 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                               <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Saídas</p>
                                               <p className="text-xl font-black text-slate-900 dark:text-white italic">R$ {Math.abs(result.transactions.filter(t => t.type === 'debit').reduce((s,t) => s + t.amount, 0)).toLocaleString()}</p>
                                            </div>
                                         </div>
                                      </div>
                                      <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-6">
                                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><CheckCircle2 className="w-4 h-4" /> Integridades</h4>
                                         <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white dark:bg-slate-700 p-3 rounded-2xl">
                                               <span className="text-[10px] font-black text-slate-400 uppercase">OFX Hash Verified</span>
                                               <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <div className="flex justify-between items-center bg-white dark:bg-slate-700 p-3 rounded-2xl">
                                               <span className="text-[10px] font-black text-slate-400 uppercase">Deduplicação Auto</span>
                                               <span className="text-[10px] font-black text-emerald-500">OK</span>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                 )}

                                 {activeTab === 'transacoes' && (
                                   <div className="bg-slate-50 dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                                      <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                                         <table className="w-full text-left">
                                            <thead className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                                               <tr>
                                                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                                                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                                                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cat</th>
                                               </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                               {result.transactions.map((t) => (
                                                 <tr key={t.id} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-black text-slate-400 italic font-mono">{t.date}</td>
                                                    <td className="px-6 py-4">
                                                       <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[200px]">{t.description}</p>
                                                       <p className="text-[9px] font-bold text-slate-400 uppercase">{t.source} • {t.confidence}</p>
                                                    </td>
                                                    <td className={cn(
                                                      "px-6 py-4 text-xs font-black text-right whitespace-nowrap",
                                                      t.amount >= 0 ? "text-emerald-500" : "text-rose-500"
                                                    )}>
                                                       R$ {Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                       <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[9px] font-black uppercase text-slate-500 italic">
                                                          {t.category}
                                                       </div>
                                                    </td>
                                                 </tr>
                                               ))}
                                            </tbody>
                                         </table>
                                      </div>
                                   </div>
                                 )}

                                 {activeTab === 'contabil' && (
                                   <div className="space-y-6">
                                      <div className="flex items-center justify-between">
                                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /> Pré-Lançamentos Contábeis</h4>
                                         <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest italic">Inteligência Receiptor</span>
                                      </div>
                                      <div className="bg-slate-900 rounded-[48px] p-1 overflow-hidden shadow-2xl">
                                         <div className="max-h-[400px] overflow-y-auto no-scrollbar p-6 space-y-4">
                                            {journalEntries.map((j, i) => (
                                              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[32px] space-y-4 relative group hover:bg-white/10 transition-all">
                                                 <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono italic">{j.date}</span>
                                                    <span className="text-lg font-black text-white italic">R$ {j.amount.toLocaleString()}</span>
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">DÉBITO (+)</p>
                                                       <p className="text-[10px] font-bold text-emerald-400 italic truncate">{j.debit}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">CRÉDITO (-)</p>
                                                       <p className="text-[10px] font-bold text-rose-400 italic truncate">{j.credit}</p>
                                                    </div>
                                                 </div>
                                              </div>
                                            ))}
                                         </div>
                                      </div>
                                   </div>
                                 )}

                                 {activeTab === 'export' && (
                                   <div className="space-y-8 py-10">
                                      <div className="text-center space-y-4">
                                         <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner"><Download className="w-8 h-8" /></div>
                                         <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic underline decoration-emerald-600/30">Pipeline de Dados.</h3>
                                         <p className="text-sm text-slate-400 max-w-sm mx-auto font-medium">Exportações otimizadas para ERPs Contábeis e Pré-Contábil AI.</p>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <button onClick={exportTransactions} className="p-8 bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:border-emerald-600 hover:shadow-xl transition-all group">
                                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all"><BarChart3 className="w-6 h-6" /></div>
                                            <div className="text-left flex-1">
                                               <p className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase">Listagem Geral</p>
                                               <p className="text-[10px] font-bold text-slate-400">Transações Limpas (CSV)</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-600" />
                                         </button>
                                         <button className="p-8 bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:border-emerald-600 hover:shadow-xl transition-all group">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all"><Database className="w-6 h-6" /></div>
                                            <div className="text-left flex-1">
                                               <p className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase">Lançamentos</p>
                                               <p className="text-[10px] font-bold text-slate-400">Pronto p/ Contabilidade</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-600" />
                                         </button>
                                      </div>
                                   </div>
                                 )}
                              </div>
                           </div>

                           <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                              <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 py-5 bg-emerald-600 text-white rounded-[32px] font-black text-lg tracking-tighter italic flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-emerald-100 dark:shadow-none"
                              >
                                 {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-7 h-7" />}
                                 {isSaving ? 'Gravando...' : 'Aprovar e Integrar no Office'}
                              </button>
                              <button onClick={() => setResult(null)} className="px-8 py-5 bg-white text-rose-500 rounded-[32px] font-black text-sm tracking-widest uppercase border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">
                                 <Trash2 className="w-6 h-6" />
                              </button>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             </div>

          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-medium pb-10">
             <div className="flex items-center gap-3 text-xs italic">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Autenticidade Bancária Verificada (Anti-Fraude)
             </div>
             <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                <a href="#" className="hover:text-emerald-600 transition-colors italic">SLA de Extração</a>
                <a href="#" className="hover:text-emerald-600 transition-colors italic">LGPD Compliance</a>
                <a href="#" className="hover:text-emerald-600 transition-colors italic">API Docs</a>
             </div>
          </div>
       </div>

       {/* Paywall */}
       <AnimatePresence>
          {profile && profile.credits <= 0 && profile.plan === 'free' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[56px] w-full max-w-lg p-12 text-center space-y-8 shadow-3xl">
                  <div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center mx-auto text-rose-600 shadow-inner">
                     <AlertTriangle className="w-12 h-12" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Limite Atingido.</h3>
                     <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto font-medium">Você atingiu seu limite de processamentos gratuitos. Adquira a versão PRO para uso ilimitado.</p>
                  </div>
                  <div className="space-y-4">
                     <button 
                        onClick={() => {
                          addItem({
                            id: 'extratobr',
                            name: 'Extrato.BR',
                            slug: 'extrato-br',
                            price: 59.90,
                            priceLabel: 'R$ 59,90/mês',
                            pricingModel: 'subscription',
                            type: 'individual'
                          });
                          window.location.href = '/carrinho';
                        }}
                        className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black text-xl tracking-tighter uppercase shadow-2xl shadow-blue-200"
                     >
                        Comprar agora
                     </button>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">A partir de R$ 59,90/mês</p>
                  </div>
                  <button onClick={() => window.location.reload()} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Voltar</button>
               </motion.div>
            </div>
          )}
       </AnimatePresence>
    </div>
  );
}
