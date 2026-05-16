import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Receipt, 
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
  Clock,
  Eye,
  FileText,
  FileCode,
  ShoppingCart,
  AlertTriangle,
  Building2,
  Layers,
  Percent,
  Check,
  ChevronRight,
  ShieldCheck,
  Crown,
  Database,
  ExternalLink,
  Copy,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { analyzeInvoice } from '../services/geminiService';
import { receiptorService } from '../services/receiptorService';
import { logService } from '../services/logService';
import { growthService } from '../services/growthService';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc,
  getDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import * as XLSX from 'xlsx';
import { useCart } from '../hooks/useCart';

// Types
interface ExtractedData {
  tipoDoc: "NFE_XML" | "NFSE_PDF" | "IMG_RECEIPT";
  emitente: {
    cnpj: string;
    razaoSocial: string;
    uf?: string;
    municipio?: string;
  };
  destinatario: {
    cnpjCpf: string;
    razaoSocial: string;
    uf?: string;
    municipio?: string;
  };
  totais: {
    valorTotal: number;
    valorServico?: number;
    valorProdutos?: number;
    impostos: {
      icms: number;
      ipi: number;
      pis: number;
      cofins: number;
      iss: number;
    };
  };
  itens: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    ncm?: string;
    cfop?: string;
  }>;
  lancamentoSugestao: {
    debito: string;
    credito: string;
    historico: string;
    confianca: 'Alta' | 'Média' | 'Baixa';
  };
  dataEmissao: string;
  numero: string;
  serie?: string;
  chave?: string;
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

export default function ReceiptorBr() {
  const [user] = useAuthState(auth);
  const { addItem } = useCart();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtractedData | null>(null);
  const [activeTab, setActiveTab] = useState<'resumo' | 'itens' | 'impostos' | 'contabil' | 'export'>('resumo');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Clients & Profile
  useEffect(() => {
    if (!user) return;

    // Fetch Clients
    const qClients = query(collection(db, 'clients'), where('userId', '==', user.uid));
    const unsubClients = onSnapshot(qClients, (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
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
        // Initialize profile
        setProfile({ credits: 3, plan: 'free', usedThisMonth: 0 });
      }
    });

    return () => {
      unsubClients();
      unsubProfile();
    };
  }, [user]);

  const parseXML = async (text: string): Promise<ExtractedData> => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    
    const getVal = (tag: string) => xml.getElementsByTagName(tag)[0]?.textContent || "";
    
    // Header
    const numero = getVal("nNF");
    const serie = getVal("serie");
    const dhEmi = getVal("dhEmi") || getVal("dEmi");
    const chave = getVal("chNFe") || xml.getElementsByTagName("infNFe")[0]?.getAttribute("Id")?.replace("NFe", "");

    // Emitente
    const emit = xml.getElementsByTagName("emit")[0];
    const emitente = {
      cnpj: emit?.getElementsByTagName("CNPJ")[0]?.textContent || "",
      razaoSocial: emit?.getElementsByTagName("xNome")[0]?.textContent || "",
      uf: emit?.getElementsByTagName("UF")[0]?.textContent || "",
      municipio: emit?.getElementsByTagName("xMun")[0]?.textContent || ""
    };

    // Destinatario
    const dest = xml.getElementsByTagName("dest")[0];
    let destCnpjCpf = dest?.getElementsByTagName("CNPJ")[0]?.textContent || dest?.getElementsByTagName("CPF")[0]?.textContent || "";
    if (dest?.getElementsByTagName("CPF")[0]) {
      destCnpjCpf = destCnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4");
    }
    const destinatario = {
      cnpjCpf: destCnpjCpf,
      razaoSocial: dest?.getElementsByTagName("xNome")[0]?.textContent || "Consumidor Final",
      uf: dest?.getElementsByTagName("UF")[0]?.textContent || "",
      municipio: dest?.getElementsByTagName("xMun")[0]?.textContent || ""
    };

    // Itens
    const dets = Array.from(xml.getElementsByTagName("det"));
    const itens = dets.map(d => ({
      descricao: d.getElementsByTagName("xProd")[0]?.textContent || "",
      quantidade: parseFloat(d.getElementsByTagName("qCom")[0]?.textContent || "0"),
      valorUnitario: parseFloat(d.getElementsByTagName("vUnCom")[0]?.textContent || "0"),
      valorTotal: parseFloat(d.getElementsByTagName("vProd")[0]?.textContent || "0"),
      ncm: d.getElementsByTagName("NCM")[0]?.textContent || "",
      cfop: d.getElementsByTagName("CFOP")[0]?.textContent || ""
    }));

    // Totals
    const icmsTot = xml.getElementsByTagName("ICMSTot")[0];
    const totais = {
      valorTotal: parseFloat(icmsTot?.getElementsByTagName("vNF")[0]?.textContent || "0"),
      valorProdutos: parseFloat(icmsTot?.getElementsByTagName("vProd")[0]?.textContent || "0"),
      impostos: {
        icms: parseFloat(icmsTot?.getElementsByTagName("vICMS")[0]?.textContent || "0"),
        ipi: parseFloat(icmsTot?.getElementsByTagName("vIPI")[0]?.textContent || "0"),
        pis: parseFloat(icmsTot?.getElementsByTagName("vPIS")[0]?.textContent || "0"),
        cofins: parseFloat(icmsTot?.getElementsByTagName("vCOFINS")[0]?.textContent || "0"),
        iss: 0
      }
    };

    // Suggestions
    const isEntrada = getVal("tpNF") === "0";
    const lancamentoSugestao: ExtractedData['lancamentoSugestao'] = {
      debito: isEntrada ? "Aquisicao de Mercadorias" : "Clientes a Receber",
      credito: isEntrada ? "Fornecedores" : "Receita de Vendas",
      historico: `NF-e ${numero} - ${emitente.razaoSocial}`,
      confianca: 'Alta'
    };

    return {
      tipoDoc: "NFE_XML",
      emitente,
      destinatario,
      totais,
      itens,
      lancamentoSugestao,
      dataEmissao: dhEmi ? new Date(dhEmi).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      numero,
      serie,
      chave
    };
  };

  const handleUpload = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!file) return;

    if (!user) {
      setError("Você precisa estar logado para processar documentos.");
      return;
    }

    if (!profile) {
      setError("Carregando seu perfil fiscal... Tente novamente em 2 segundos.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    
    try {
      if (file.name.toUpperCase().endsWith('.XML')) {
        const text = await file.text();
        if (!text.includes('<NFe') && !text.includes('<nfeProc')) {
           throw new Error("Arquivo XML inválido ou não é uma NF-e reconhecida.");
        }
        const data = await parseXML(text);
        setResult(data);
      } else {
        // PDF or Image - Convert to Promise to await the processing
        const data = await new Promise<any>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64 = (e.target?.result as string)?.split(',')[1];
            if (!base64) {
              reject(new Error("Não foi possível ler o conteúdo do arquivo."));
              return;
            }
            try {
              const res = await analyzeInvoice(base64, file.type);
              resolve(res);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error("Erro ao ler arquivo."));
          reader.readAsDataURL(file);
        });

        const formatted: ExtractedData = {
          tipoDoc: file.type.includes('pdf') ? 'NFSE_PDF' : 'IMG_RECEIPT',
          emitente: {
            cnpj: data.cnpj || '',
            razaoSocial: data.fornecedor || '',
          },
          destinatario: {
            cnpjCpf: 'Identificado pelo Office',
            razaoSocial: 'Usuario Receiptor',
          },
          totais: {
            valorTotal: data.valor || 0,
            valorServico: data.valor || 0,
            impostos: {
              icms: 0, ipi: 0, pis: 0, cofins: 0,
              iss: data.impostos || 0
            }
          },
          itens: data.itens || [],
          lancamentoSugestao: {
            debito: data.lancamentoSugestao?.debito || 'Despesa a Classificar',
            credito: data.lancamentoSugestao?.credito || 'Caixa/Bancos',
            historico: data.lancamentoSugestao?.historico || `Ref: ${file.name}`,
            confianca: data.lancamentoSugestao?.confianca || 'Média'
          },
          dataEmissao: data.data || new Date().toLocaleDateString('pt-BR'),
          numero: data.numero || 'S/N'
        };
        setResult(formatted);
      }

      // Update Usage Stats
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        usedThisMonth: profile.usedThisMonth + 1,
        lastExtraction: serverTimestamp()
      }, { merge: true });

    } catch (err: any) {
      console.error("Upload/Processing error:", err);
      setError(err.message || "Erro ao processar documento pela IA.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;
    setIsSaving(true);
    try {
      await receiptorService.processDocument(user.uid, selectedClientId || '', result);
      await logService.info(user.uid, "Documento Auditado", { clientId: selectedClientId, type: result.tipoDoc });
      
      // Growth Tracking
      await growthService.trackEvent(user.uid, 'receiptorbr', 'save_document', { 
        type: result.tipoDoc, 
        value: result.totais.valorTotal 
      });

      alert("Documento salvo e integrado ao Data Hub!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'receipts');
      logService.error(user.uid, "Erro Receiptor", error);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToExcel = () => {
    if (!result) return;
    const itemsData = result.itens.map(it => ({
      Descricao: it.descricao,
      Qtd: it.quantidade,
      Unitario: it.valorUnitario,
      Total: it.valorTotal,
      NCM: it.ncm,
      CFOP: it.cfop
    }));
    
    const wsItems = XLSX.utils.json_to_sheet(itemsData);
    const postingData = [{
      Data: result.dataEmissao,
      Debito: result.lancamentoSugestao.debito,
      Credito: result.lancamentoSugestao.credito,
      Valor: result.totais.valorTotal,
      Historico: result.lancamentoSugestao.historico
    }];
    const wsPostings = XLSX.utils.json_to_sheet(postingData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsItems, "Itens");
    XLSX.utils.book_append_sheet(wb, wsPostings, "Lancamentos");
    XLSX.writeFile(wb, `Receiptor_${result.numero}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
       <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 mb-[-40px]">
          <Link to="/solucoes" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Catálogo de Soluções
          </Link>
       </div>
       {/* Slim Dynamic Header */}
       <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-8 pt-10 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100 dark:shadow-none"><Receipt className="w-7 h-7" /></div>
               <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Receiptor.BR</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Engine de Extração Fiscal & Contábil</p>
               </div>
            </div>
         </div>
            
            <div className="flex items-center gap-6">
        <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="px-6 py-2 text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mês Atual</p>
             <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{profile?.usedThisMonth || 0} Docs</p>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 my-auto" />
          <div className="px-6 py-2 text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
             <p className="text-sm font-black text-emerald-500 leading-none">Ativo</p>
          </div>
        </div>
        <button 
          onClick={() => {
            addItem({
               id: 'receiptorbr',
               name: 'Receiptor.BR',
               slug: 'receiptor-br',
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
        <button className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
          <History className="w-6 h-6" />
        </button>
            </div>
       </div>

       <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
             
             {/* Left Column: Upload & Control */}
             <div className="space-y-10">
                <div className="p-10 md:p-16 bg-white dark:bg-slate-900 rounded-[56px] border-4 border-dashed border-slate-100 dark:border-slate-800 text-center space-y-8 group hover:border-blue-400 transition-all cursor-pointer relative overflow-hidden shadow-sm">
                   {/* Decoration */}
                   <div className="absolute top-0 right-0 p-8 text-blue-600/5 group-hover:scale-110 transition-transform pointer-events-none"><Database className="w-48 h-48" /></div>
                   
                   <div className="relative z-10 space-y-8">
                      <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-[32px] flex items-center justify-center mx-auto text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                         <Upload className="w-10 h-10" />
                      </div>
                      <div className="space-y-3">
                         <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase italic underline decoration-blue-600/30 underline-offset-8">Receiptor<br /> Live Engine.</h2>
                         <p className="text-sm text-slate-400 font-serif italic max-w-xs mx-auto">Arraste XML ou PDF para extrair o lançamento e impostos em segundos.</p>
                      </div>
                      
                      <div className="space-y-4">
                        <select 
                          value={selectedClientId}
                          onChange={(e) => setSelectedClientId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none text-center"
                        >
                           <option value="">Vincular ao Cliente (Opcional)</option>
                           {clients.map(c => (
                             <option key={c.id} value={c.id}>{c.companyName}</option>
                           ))}
                        </select>

                        {file ? (
                          <div className="p-4 bg-blue-600 text-white rounded-2xl flex items-center justify-between mx-auto max-w-xs shadow-xl animate-bounce">
                             <div className="flex items-center gap-3">
                                {file.name.endsWith('.xml') ? <FileCode className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                <span className="text-[10px] font-black truncate uppercase tracking-widest">{file.name}</span>
                             </div>
                             <button onClick={() => setFile(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="relative">
                             <input type="file" multiple={false} accept=".xml,.pdf,.png,.jpg" onChange={(e) => { setFile(e.target.files?.[0] || null); setError(null); }} className="absolute inset-0 opacity-0 cursor-pointer" id="receipt-upload" />
                             <div className="py-4 border border-blue-100 bg-blue-50/50 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">
                                Selecionar de um Arquivo
                             </div>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => handleUpload()}
                        disabled={!file || isProcessing}
                        className={cn(
                          "w-full py-6 rounded-[32px] text-xl font-black uppercase tracking-tighter italic flex items-center justify-center gap-3 shadow-2xl transition-all",
                          !file || isProcessing 
                            ? "bg-slate-100 text-slate-300 pointer-events-none" 
                            : "bg-blue-600 text-white hover:bg-slate-900 hover:scale-[1.02]"
                        )}
                      >
                         {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-7 h-7" />}
                         {isProcessing ? 'Processando...' : 'Iniciar Extração'}
                      </button>

                      {error && (
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex flex-col gap-4 text-xs font-bold text-left animate-shake">
                           <div className="flex items-center gap-3">
                              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                              <span className="flex-1">{error}</span>
                           </div>
                           {!user && (
                             <button 
                               onClick={async () => {
                                 try {
                                   const { signInWithGoogle } = await import('../lib/firebase');
                                   await signInWithGoogle();
                                   setError(null);
                                 } catch (err) {
                                   setError("Falha ao entrar com Google.");
                                 }
                               }}
                               className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-colors self-start"
                             >
                               Entrar com Google
                             </button>
                           )}
                        </div>
                      )}
                   </div>
                </div>

                {/* Integration Badges */}
                <div className="bg-slate-900 rounded-[48px] p-8 text-white relative overflow-hidden">
                   <div className="absolute -bottom-8 -right-8 opacity-10"><Database className="w-40 h-40 text-blue-400" /></div>
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-2">
                         <Layers className="w-5 h-5 text-blue-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Ecosistema Conectado</span>
                      </div>
                      <h4 className="text-xl font-black tracking-tighter leading-tight italic">ReceiptorBR se comunica com <br /> Pré-Contábil AI & Office.</h4>
                      <div className="flex gap-3">
                         <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Office Contábil Sync
                         </div>
                         <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Pré-Contábil Ready
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Column: Processing Result Area */}
             <div className="space-y-6">
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
                   {[
                     { id: 'resumo', label: 'Resumo', icon: Eye },
                     { id: 'itens', label: 'Itens/Produtos', icon: Layers },
                     { id: 'impostos', label: 'Impostos', icon: Percent },
                     { id: 'contabil', label: 'Contábil', icon: Database },
                     { id: 'export', label: 'Exportar', icon: Download }
                   ].map(t => (
                     <button
                       key={t.id}
                       onClick={() => setActiveTab(t.id as any)}
                       className={cn(
                         "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                         activeTab === t.id 
                           ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                           : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                       )}
                     >
                        <t.icon className="w-4 h-4" /> {t.label}
                     </button>
                   ))}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col p-2 overflow-hidden">
                   <AnimatePresence mode="wait">
                      {!result ? (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6"
                        >
                           <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-200 shadow-inner">
                              {isProcessing ? <Loader2 className="w-12 h-12 animate-spin text-blue-400" /> : <Search className="w-12 h-12" />}
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-2xl font-black text-slate-300 tracking-tight uppercase italic">{isProcessing ? 'Processando Documento...' : 'Aguardando Arquivo...'}</h3>
                              <p className="text-sm text-slate-400 font-medium max-w-xs">{isProcessing ? 'Nossa IA está lendo cada campo e interpretando os dados fiscais.' : 'Os resultados da extração estruturada aparecerão aqui em tempo real.'}</p>
                           </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="populated"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex-1 flex flex-col h-full"
                        >
                           <div className="p-10 space-y-10 flex-1">
                              {/* Header Meta */}
                              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-8">
                                 <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                       <span className={cn(
                                         "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                         result.tipoDoc === 'NFE_XML' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                       )}>
                                          {result.tipoDoc}
                                       </span>
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{result.dataEmissao}</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{result.emitente.razaoSocial}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{result.emitente.cnpj}</p>
                                 </div>
                                 <div className="text-right space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total</p>
                                    <p className="text-4xl font-black text-blue-600 italic leading-none">R$ {result.totais.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                 </div>
                              </div>

                              {/* Tab Content */}
                              <div className="py-2">
                                 {activeTab === 'resumo' && (
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-6">
                                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><Building2 className="w-4 h-4" /> Emitente</h4>
                                         <div className="space-y-4">
                                            <div>
                                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Razão Social</p>
                                               <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.emitente.razaoSocial}</p>
                                            </div>
                                            <div>
                                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Localização</p>
                                               <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.emitente.municipio} - {result.emitente.uf}</p>
                                            </div>
                                         </div>
                                      </div>
                                      <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-6">
                                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><CheckCircle2 className="w-4 h-4" /> Destinatário</h4>
                                         <div className="space-y-4">
                                            <div>
                                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Nome/Razão</p>
                                               <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.destinatario.razaoSocial}</p>
                                            </div>
                                            <div>
                                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">CPF/CNPJ</p>
                                               <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono italic">{result.destinatario.cnpjCpf}</p>
                                            </div>
                                         </div>
                                      </div>
                                      <div className="md:col-span-2 p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-[40px] border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                                         <div className="space-y-1">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Chave NF-e / ID</p>
                                            <p className="text-xs font-bold text-slate-500 font-mono break-all line-clamp-1">{result.chave || 'SEM CHAVE ACESSO'}</p>
                                         </div>
                                         <button className="p-3 bg-white dark:bg-slate-800 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Copy className="w-4 h-4" /></button>
                                      </div>
                                   </div>
                                 )}

                                 {activeTab === 'itens' && (
                                   <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                                      <table className="w-full text-left">
                                         <thead className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto/Serviço</th>
                                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qtd</th>
                                               <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                                            </tr>
                                         </thead>
                                         <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {result.itens.map((it, i) => (
                                              <tr key={i} className="hover:bg-white dark:hover:bg-slate-800/80 transition-colors">
                                                 <td className="px-6 py-4">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">{it.descricao}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">CFOP: {it.cfop || '---'} • NCM: {it.ncm || '---'}</p>
                                                 </td>
                                                 <td className="px-6 py-4 text-xs font-bold text-slate-400 text-center">{it.quantidade}</td>
                                                 <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white text-right whitespace-nowrap">R$ {it.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                              </tr>
                                            ))}
                                         </tbody>
                                      </table>
                                   </div>
                                 )}

                                 {activeTab === 'impostos' && (
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                      {[
                                        { label: 'ICMS Total', val: result.totais.impostos.icms, color: 'text-blue-600' },
                                        { label: 'IPI Total', val: result.totais.impostos.ipi, color: 'text-emerald-500' },
                                        { label: 'PIS/COFINS', val: result.totais.impostos.pis + result.totais.impostos.cofins, color: 'text-amber-500' },
                                        { label: 'ISS Serviços', val: result.totais.impostos.iss, color: 'text-rose-500' }
                                      ].map(imp => (
                                        <div key={imp.label} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-2">
                                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{imp.label}</h5>
                                           <p className={cn("text-lg font-black italic", imp.color)}>R$ {imp.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                      ))}
                                   </div>
                                 )}

                                 {activeTab === 'contabil' && (
                                   <div className="space-y-8">
                                      <div className="flex items-center justify-between px-2">
                                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-600" /> Sugestão da IA Receiptor</h4>
                                         <div className={cn(
                                           "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                           result.lancamentoSugestao.confianca === 'Alta' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                         )}>Confiança: {result.lancamentoSugestao.confianca}</div>
                                      </div>
                                      
                                      <div className="bg-slate-900 rounded-[48px] p-10 text-white space-y-8 relative overflow-hidden ring-4 ring-blue-600/10 shadow-2xl">
                                         <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150"><Database className="w-40 h-40" /></div>
                                         
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                            <div className="space-y-6">
                                               <div className="space-y-2">
                                                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest"><Check className="w-3 h-3" /> Conta Débito</div>
                                                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 font-bold italic text-sm">{result.lancamentoSugestao.debito}</div>
                                               </div>
                                               <div className="space-y-2">
                                                  <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest"><ArrowRight className="w-3 h-3" /> Conta Crédito</div>
                                                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 font-bold italic text-sm">{result.lancamentoSugestao.credito}</div>
                                               </div>
                                            </div>
                                            <div className="space-y-6">
                                               <div className="space-y-2">
                                                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Histórico Padrão</div>
                                                  <div className="p-4 bg-white/5 rounded-3xl border border-white/10 font-serif italic text-sm leading-relaxed overflow-hidden line-clamp-4 h-[124px]">{result.lancamentoSugestao.historico}</div>
                                               </div>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                 )}

                                 {activeTab === 'export' && (
                                   <div className="space-y-8 py-10">
                                      <div className="text-center space-y-4">
                                         <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner ring-4 ring-white"><Download className="w-8 h-8" /></div>
                                         <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Dados Prontos.</h3>
                                         <p className="text-sm text-slate-400 max-w-sm mx-auto font-medium">Escolha o formato desejado para alimentar seu sistema ou planilha.</p>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <button onClick={exportToExcel} className="p-6 bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:border-blue-600 hover:shadow-xl transition-all group">
                                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all"><Database className="w-6 h-6" /></div>
                                            <div className="text-left">
                                               <p className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase">Excel Master</p>
                                               <p className="text-[10px] font-bold text-slate-400">Items e Lançamentos</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 ml-auto text-slate-200 group-hover:text-blue-600" />
                                         </button>
                                         <button className="p-6 bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:border-blue-600 hover:shadow-xl transition-all group">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><FileText className="w-6 h-6" /></div>
                                            <div className="text-left">
                                               <p className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase">Layout ERP</p>
                                               <p className="text-[10px] font-bold text-slate-400">Importação Direta</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 ml-auto text-slate-200 group-hover:text-blue-600" />
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
                                className="flex-1 py-5 bg-blue-600 text-white rounded-[32px] font-black text-lg tracking-tighter italic flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 dark:shadow-none"
                              >
                                 {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-7 h-7" />}
                                 {isSaving ? 'Salvando...' : 'Aprovar e Vincular no Office'}
                              </button>
                              <button onClick={() => setResult(null)} className="px-8 py-5 bg-white text-rose-500 rounded-[32px] font-black text-sm tracking-widest uppercase border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                 <Trash2 className="w-6 h-6" />
                              </button>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             </div>

          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-medium">
             <div className="flex items-center gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Segurança HTTPS e Criptografia Militar
             </div>
             <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                <a href="#" className="hover:text-blue-600 transition-colors">Termos de Uso</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Política de Retenção</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Suporte Técnico</a>
             </div>
          </div>
       </div>

       {/* Paywall Modal */}
       <AnimatePresence>
          {profile && profile.credits <= 0 && profile.plan === 'free' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="relative bg-white rounded-[56px] w-full max-w-lg p-12 text-center space-y-8 overflow-hidden shadow-3xl"
               >
                  <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                  <div className="w-24 h-24 bg-blue-50 rounded-[40px] flex items-center justify-center mx-auto text-blue-600 shadow-inner">
                     <AlertTriangle className="w-12 h-12" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Créditos Esgotados.</h3>
                     <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">Você atingiu seu limite de uso no plano gratuito. Adquira uma licença para continuar processando documentos ilimitados.</p>
                  </div>
                  <div className="space-y-4">
                     <button 
                        onClick={() => {
                           addItem({
                              id: 'receiptorbr',
                              name: 'Receiptor.BR',
                              slug: 'receiptor-br',
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
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A partir de R$ 59,90/mês</p>
                  </div>
                  <button onClick={() => window.location.reload()} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Talvez mais tarde</button>
               </motion.div>
            </div>
          )}
       </AnimatePresence>
    </div>
  );
}
