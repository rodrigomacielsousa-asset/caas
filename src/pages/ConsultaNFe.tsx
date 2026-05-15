import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  ExternalLink, 
  History, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileCheck,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { nfeService, NFeData } from '../services/nfeService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';

export default function ConsultaNFe() {
  const [chave, setChave] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NFeData | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanChave = chave.replace(/\D/g, '');
    
    if (cleanChave.length !== 44) {
      setError('A chave de acesso deve ter exatamente 44 dígitos numéricos.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await nfeService.consultaPorChave(user?.uid || 'anonymous', cleanChave);
      setResult(data);
    } catch (err: any) {
      setError(
        <div className="flex flex-col gap-3 py-2">
          <p className="normal-case font-medium text-sm">Essa NF pode não estar disponível para consulta pública direta ou o SEFAZ retornou indisponibilidade temporária.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              to="/solucoes/monitor-nfe" 
              className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              Ativar Monitor NF-e <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest italic">(Recomendado para captura automática 24/7)</span>
          </div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            Ferramentas Fiscais
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
            Consulta <span className="text-indigo-600">NF-e</span>
          </h1>
          <p className="text-slate-500 font-medium italic text-lg max-w-2xl mx-auto">
            Consulte qualquer nota fiscal eletrônica apenas com a chave de acesso. Baixe XML e PDF instantaneamente.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[40px] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Chave de Acesso (44 dígitos)</label>
              <div className="relative group">
                <input 
                  type="text"
                  maxLength={54} // with spacing
                  value={chave}
                  onChange={(e) => setChave(e.target.value)}
                  placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
                  className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl py-6 px-8 text-xl font-mono tracking-wider focus:border-indigo-600 focus:ring-0 transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                />
                <div className="absolute right-3 top-3">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="h-14 w-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-[11px] font-black uppercase tracking-widest"
              >
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}
          </form>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center"
              >
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dados do Emitente</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight italic">{result.emitente}</div>
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded text-[9px] font-black tracking-widest uppercase">Autorizada</span>
                       <span className="text-[11px] font-medium text-slate-400">Consultado em {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Valor Total</div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white italic">R$ {result.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button 
                    onClick={() => result.xml && nfeService.downloadXML(result.chave, result.xml)}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                  >
                    <Download className="w-4 h-4" /> Baixar XML
                  </button>
                  <button 
                    onClick={() => nfeService.generatePDF(result.chave)}
                    className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    <FileText className="w-4 h-4" /> Gerar PDF (DANFE)
                  </button>
                </div>

                {!user && (
                  <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800 text-center max-w-sm">
                    <Zap className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4">Quer monitorar notas fiscais automaticamente?</p>
                    <Link to="/signup" className="inline-block text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline decoration-2">Crie sua conta grátis agora →</Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Features Info */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { icon: Zap, title: "Busca Real-time", desc: "Integração direta com a SEFAZ para resultados atualizados." },
             { icon: FileCheck, title: "DANFE Nativo", desc: "PDFs gerados com layout oficial e campos completos." },
             { icon: History, title: "Histórico Cloud", desc: "Suas consultas ficam salvas e organizadas (exige login)." }
           ].map((f, i) => (
             <div key={i} className="text-center space-y-4">
               <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                 <f.icon className="w-6 h-6 text-indigo-600" />
               </div>
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white italic">{f.title}</h3>
               <p className="text-[11px] font-medium text-slate-500 italic">{f.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
