import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Settings, 
  Plus, 
  Trash2, 
  Download,
  Search,
  Bell,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  FileText,
  Upload,
  CloudLightning,
  FileSearch,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { nfeService, NFeClient } from '../services/nfeService';

export default function MonitorNFe() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<NFeClient[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ cnpj: '', nome: '' });
  const [certFile, setCertFile] = useState<File | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Real-time clients
        const qClients = query(collection(db, 'nfeMonitoredClients'), where('ownerId', '==', u.uid));
        const unsubClients = onSnapshot(qClients, (snap) => {
          const fetchedClients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NFeClient));
          setClients(fetchedClients);
          if (fetchedClients.length > 0 && !activeClientId) {
            setActiveClientId(fetchedClients[0].id!);
          }
          setLoading(false);
        });

        // Real-time documents
        const qDocs = query(
          collection(db, 'documents'), 
          where('ownerId', '==', u.uid),
          where('origem', '==', 'monitor'),
          orderBy('timestamp', 'desc')
        );
        const unsubDocs = onSnapshot(qDocs, (snap) => {
          setDocuments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
          unsubClients();
          unsubDocs();
        };
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [activeClientId]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await nfeService.addMonitoredClient(user.uid, {
        cnpj: newClient.cnpj,
        nome: newClient.nome,
        status: 'ativo'
      });
      setShowAddModal(false);
      setNewClient({ cnpj: '', nome: '' });
      setCertFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSync = async (clientId: string) => {
    if (!user) return;
    try {
      await nfeService.fetchNewNFEs(user.uid, clientId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[48px] p-12 text-center shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100 dark:shadow-none">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Acesso Restrito</h2>
          <p className="text-slate-500 font-medium italic font-serif leading-relaxed mb-8">
            O Monitor NF-e é uma ferramenta Pro. Faça login para monitorar seus CNPJs automaticamente 24/7.
          </p>
          <div className="space-y-4">
            <Link 
              to="/login" 
              className="block w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all"
            >
              Fazer Login agora
            </Link>
            <Link 
              to="/solucoes" 
              className="block text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-all"
            >
              Voltar ao catálogo
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeClient = clients.find(c => c.id === activeClientId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      <div className="bg-slate-900 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-full bg-blue-600/10 blur-[150px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                <Activity className="w-3 h-3" /> Monitoramento em Tempo Real
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                Monitor <br /> <span className="text-blue-500 italic">NF-e Autônomo.</span>
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed italic font-serif max-w-lg">
                Detectamos todas as notas enviadas para seus CNPJs automaticamente. Sem scraping, sem captcha.
              </p>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-900/20 hover:bg-white hover:text-slate-900 transition-all group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Monitorar Novo CNPJ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar / CNPJ List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                Seus CNPJs <span>{clients.length}</span>
              </h3>
              <div className="space-y-3">
                {clients.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveClientId(c.id!)}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left transition-all group",
                      activeClientId === c.id 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none" 
                        : "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-400 hover:border-blue-200"
                    )}
                  >
                    <div className="font-black text-xs mb-1 truncate">{c.nome}</div>
                    <div className="text-[10px] font-mono opacity-60 uppercase">{c.cnpj}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-600 rounded-[32px] p-8 text-white relative overflow-hidden group">
               <ShieldCheck className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
               <div className="relative z-10 space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-tight">Status do Plano</h4>
                  <div className="text-3xl font-black italic">PRO</div>
                  <p className="text-[10px] font-bold text-emerald-100 uppercase leading-relaxed">
                    Você pode monitorar até 5 CNPJs simultâneos.
                  </p>
               </div>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-3 space-y-8">
            {activeClientId ? (
              <>
                {/* Insights Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Notas Detectadas (Total)', value: documents.length.toLocaleString(), icon: Activity, color: 'text-blue-600' },
                    { label: 'Eventos em Aberto', value: '12', icon: Bell, color: 'text-amber-500', alert: true },
                    { label: 'Última Captura', value: 'Ativo', icon: RefreshCw, color: 'text-emerald-500' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className={cn("text-3xl font-black italic tracking-tighter", stat.alert ? "text-amber-500" : "text-slate-900 dark:text-white")}>{stat.value}</div>
                      </div>
                      <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center", stat.color)}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Table Container */}
                <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">Últimas Movimentações</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sincronizado com SEFAZ</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Filtre por emissor..."
                          className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all min-w-[240px]"
                        />
                      </div>
                      <button 
                        onClick={() => handleSync(activeClientId)}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50 dark:border-slate-800">
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Emissor</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {documents.length > 0 ? documents.map((doc, i) => (
                          <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                                  <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="text-sm font-black text-slate-900 dark:text-white">NF-e {doc.chave.substring(25, 34)}</div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase leading-none truncate max-w-[120px]">Chave: {doc.chave.substring(0, 44)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{doc.emitente || 'Emissor Não Disponível'}</div>
                            </td>
                            <td className="px-8 py-6 font-black text-slate-900 dark:text-white text-sm">R$ { doc.valor ? doc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00' }</td>
                            <td className="px-8 py-6">
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                <CheckCircle2 className="w-3 h-3" /> Recebida
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 text-blue-600">
                                <button onClick={() => nfeService.downloadXML(doc.chave, doc.xml || '')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><Download className="w-4 h-4" /></button>
                                <button onClick={() => nfeService.generatePDF(doc.chave)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><FileText className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-8 py-20 text-center">
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300">
                                  <FileSearch className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma nota encontrada para este CNPJ.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-8 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Download em lote (CSV/ZIP)</button>
                  </div>
                </div>

                {/* Configuration / Certificate Section */}
                <div className="bg-slate-900 rounded-[48px] p-12 md:p-16 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                      <Settings className="w-64 h-64" />
                   </div>
                   
                   <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                      <div className="space-y-8">
                         <div className="space-y-4">
                            <h2 className="text-4xl font-black tracking-tighter leading-tight italic">Configuração de <br />Certificado Digital.</h2>
                            <p className="text-lg text-blue-200/60 font-medium font-serif italic leading-relaxed">
                               Para capturar as notas diretamente da SEFAZ, precisamos do seu certificado A1 (.pfx). A segurança é garantida por criptografia de ponta-a-ponta.
                            </p>
                         </div>
                         
                         <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-3">
                               <ShieldCheck className="w-6 h-6 text-emerald-400" />
                               <span className="text-xs font-black uppercase tracking-widest opacity-80">AES-256 Encryption</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <ShieldCheck className="w-6 h-6 text-emerald-400" />
                               <span className="text-xs font-black uppercase tracking-widest opacity-80">HSM Security</span>
                            </div>
                         </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] space-y-8">
                         <div className="space-y-2">
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Status do Certificado</div>
                            <div className="flex items-center gap-3">
                               <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                               <div className="text-xl font-black italic">Ativo para {activeClient?.nome}</div>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 gap-4">
                            <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-3">
                               <Plus className="w-5 h-5" /> Atualizar Certificado
                            </button>
                            <button className="w-full py-5 bg-white/5 text-white rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                               Remover Monitoramento
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[64px] border-4 border-dashed border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                   <Activity className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-3xl font-black text-slate-400 tracking-tighter">Nenhum CNPJ sob monitoramento. <br />Comece adicionando seu primeiro cliente.</h3>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="mt-8 px-10 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                >
                  <Plus className="w-5 h-5" /> Adicionar Primeiro CNPJ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Add Client Modal */}
       <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[48px] p-12 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12"><Settings className="w-48 h-48" /></div>
              
              <div className="relative z-10 space-y-8">
                <div className="text-center space-y-2">
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Monitorar Empresa</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Configure o motor fiscal para o seu cliente</p>
                </div>

                <form onSubmit={handleAddClient} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Nome / Razão Social</label>
                      <input 
                        required
                        value={newClient.nome}
                        onChange={e => setNewClient({ ...newClient, nome: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-blue-600" 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">CNPJ</label>
                      <input 
                        required
                        value={newClient.cnpj}
                        onChange={e => setNewClient({ ...newClient, cnpj: e.target.value })}
                        placeholder="00.000.000/0001-00"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-blue-600" 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Certificado A1 (.pfx)</label>
                      <div className="relative group">
                         <input 
                           type="file" 
                           accept=".pfx"
                           onChange={e => setCertFile(e.target.files?.[0] || null)}
                           className="hidden" id="cert-upload" 
                         />
                         <label 
                           htmlFor="cert-upload"
                           className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-6 px-8 cursor-pointer hover:border-blue-600 transition-all"
                         >
                            <div className="flex items-center gap-3">
                               <Upload className="w-5 h-5 text-blue-600" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600">
                                 {certFile ? certFile.name : "Clique para selecionar"}
                               </span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300" />
                         </label>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all"
                  >
                    Ativar Monitoramento
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
