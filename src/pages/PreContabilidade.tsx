import React, { useState } from 'react';
import { 
  FileSearch, 
  Upload, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  History,
  X,
  Loader2,
  Table,
  Terminal,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { analyzeInvoice } from '../services/geminiService';

interface Result {
  fornecedor: string;
  cnpj: string;
  data: string;
  valor: number;
  impostos: number;
  tipoOperacao: string;
  contaContabil: string;
  centroCusto: string;
  resumo: string;
}

export default function PreContabilidade() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const data = await analyzeInvoice(base64.split(',')[1], file.type);
        setResult(data);
        setHistory(prev => [{ name: file.name, date: new Date().toLocaleString(), ...data }, ...prev]);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Erro ao processar o documento. Certifique-se de que é uma imagem ou PDF legível.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header UI */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="space-y-6 max-w-2xl text-center md:text-left">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <Brain className="w-3 h-3" /> Gemini 1.5 Pro Enabled
                 </div>
                 <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">Pré-Contabilidade IA</h1>
                 <p className="text-xl text-slate-500 font-medium italic font-serif leading-relaxed">
                   Upload de Notas e Recibos. Nossa IA lê, extrai e sugere a classificação contábil automática.
                 </p>
              </div>
              <div className="p-8 bg-white dark:bg-slate-800 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-8">
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Hoje</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">128</p>
                 </div>
                 <div className="w-px h-10 bg-slate-100 dark:bg-slate-700" />
                 <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Precisão</p>
                    <p className="text-2xl font-black text-emerald-500">98%</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
           
           {/* Section 1: Upload & Action */}
           <div className="space-y-12">
              <div className="p-10 bg-slate-50 dark:bg-slate-900 rounded-[48px] border-4 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-8 group hover:border-blue-600 transition-all">
                 <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-blue-600" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Arraste seu arquivo aqui</h3>
                    <p className="text-sm text-slate-400 font-medium">Aceitamos PDF, JPG e PNG de alta resolução</p>
                 </div>
                 
                 {file ? (
                   <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-between mx-auto max-w-xs border border-blue-100">
                      <div className="flex items-center gap-3">
                         <FileText className="w-5 h-5 text-blue-600" />
                         <span className="text-sm font-bold truncate">{file.name}</span>
                      </div>
                      <button onClick={() => setFile(null)} className="p-1 hover:bg-white rounded-lg"><X className="w-4 h-4" /></button>
                   </div>
                 ) : (
                   <input 
                    type="file" 
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="hidden" 
                    id="pre-file" 
                   />
                 )}

                 <button 
                  onClick={handleUpload}
                  disabled={!file || isProcessing}
                  className={cn(
                    "w-full btn-primary py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-100 overflow-hidden relative",
                    (!file || isProcessing) && "opacity-50"
                  )}
                 >
                   {isProcessing && <motion.div layoutId="loader" className="absolute inset-0 bg-blue-700/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></motion.div>}
                   <Sparkles className="w-6 h-6" /> {isProcessing ? 'Extraindo Dados...' : 'Analisar com Gemini IA'}
                 </button>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <History className="w-4 h-4" /> Histórico Recente
                 </h4>
                 <div className="space-y-2">
                    {history.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nenhum processamento recente.</p>
                    ) : (
                      history.map((h, i) => (
                        <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center group cursor-pointer hover:border-blue-200 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                              <div>
                                 <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{h.name}</p>
                                 <p className="text-[10px] text-slate-400">{h.date}</p>
                              </div>
                           </div>
                           <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-blue-600 transition-all" />
                        </div>
                      ))
                    )}
                 </div>
              </div>
           </div>

           {/* Section 2: Results Display */}
           <div className="min-h-[500px]">
              <AnimatePresence mode="wait">
                 {result ? (
                   <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-[56px] p-12 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-10"
                   >
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Extração Completa</span>
                           <h2 className="text-3xl font-black text-slate-900 dark:text-white">{result.fornecedor}</h2>
                           <p className="text-xs text-slate-400 font-bold tracking-widest">{result.cnpj}</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-3xl">
                           <Zap className="w-8 h-8 text-blue-600" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8 border-y border-slate-50 dark:border-slate-800 py-10">
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Data Emissão</span>
                              <p className="text-lg font-bold">{result.data}</p>
                           </div>
                           <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Valor Fiscal</span>
                              <p className="text-lg font-black text-blue-600">R$ {result.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Impostos</span>
                              <p className="text-lg font-bold">{result.impostos > 0 ? `R$ ${result.impostos}` : 'Não Identificado'}</p>
                           </div>
                           <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tipo Operação</span>
                              <p className="text-lg font-bold">{result.tipoOperacao}</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-4">
                           <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                             <Table className="w-4 h-4" /> Classificação Contábil Sugerida
                           </h4>
                           <div className="space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                 <span className="font-bold text-slate-700 dark:text-slate-200">{result.contaContabil}</span>
                                 <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Trocar</button>
                              </div>
                              <div className="flex justify-between items-center text-xs text-slate-500 font-medium italic">
                                 <span>Centro de Custo: {result.centroCusto}</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl flex gap-4">
                           <Terminal className="w-5 h-5 text-amber-600 flex-shrink-0" />
                           <div>
                              <h5 className="text-xs font-bold text-amber-800 dark:text-amber-200">Resumo da IA</h5>
                              <p className="text-xs text-amber-700/80 mt-1 leading-relaxed italic">{result.resumo}</p>
                           </div>
                        </div>
                     </div>

                     <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                        Exportar para o Contábil <ArrowRight className="w-5 h-5" />
                     </button>
                   </motion.div>
                 ) : (
                   <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full bg-slate-50 dark:bg-slate-900/50 rounded-[56px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center space-y-6"
                   >
                     <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-200 shadow-sm">
                        <FileSearch className="w-10 h-10" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-400">Aguardando Documento...</h3>
                     <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">Faça o upload de uma nota fiscal ou recibo no lado esquerdo para iniciar a análise por visão computacional.</p>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
