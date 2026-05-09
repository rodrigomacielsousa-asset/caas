import React, { useState } from 'react';
import { 
  Receipt, 
  Upload, 
  ArrowRight, 
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
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { analyzeInvoice } from '../services/geminiService';

export default function ReceiptorBr() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const data = await analyzeInvoice(base64.split(',')[1], file.type);
        setResult(data);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
       {/* Slim Dynamic Header */}
       <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-8">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><Receipt className="w-6 h-6" /></div>
              <div>
                 <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">Receiptor.BR</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leitor Inteligente de Cupons e Recibos</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limite Mensal</div>
                 <div className="text-sm font-black text-slate-900 dark:text-white">85 / 500 Recibos</div>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />
              <button className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Ver Histórico</button>
           </div>
         </div>
       </div>

       <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start h-full">
             
             {/* Left Column: Upload */}
             <div className="h-full flex flex-col space-y-12">
                <div className="p-12 md:p-24 bg-white dark:bg-slate-900 rounded-[56px] border-4 border-dashed border-slate-100 dark:border-slate-800 text-center space-y-10 group hover:border-indigo-400 transition-all cursor-pointer relative overflow-hidden">
                   {/* Decoration */}
                   <div className="absolute top-0 right-0 p-8 text-indigo-600/5 group-hover:scale-110 transition-transform"><Receipt className="w-48 h-48" /></div>
                   
                   <div className="relative z-10 space-y-8">
                      <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-[32px] flex items-center justify-center mx-auto text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                         <Upload className="w-10 h-10" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Arraste seu cupom <br /> fiscal aqui.</h2>
                         <p className="text-sm text-slate-500 font-medium mt-4">Ou clique para abrir o explorador de arquivos.</p>
                      </div>
                      
                      {file ? (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-between mx-auto max-w-xs border border-indigo-100">
                           <div className="flex items-center gap-3">
                              <Receipt className="w-5 h-5 text-indigo-600" />
                              <span className="text-xs font-bold truncate">{file.name}</span>
                           </div>
                           <button onClick={() => setFile(null)} className="p-1 hover:bg-white rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="receipt-upload" />
                      )}

                      <button 
                        onClick={handleUpload}
                        disabled={!file || isProcessing}
                        className={cn(
                          "w-full btn-primary py-5 rounded-[28px] text-xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 group transition-all",
                          (!file || isProcessing) && "opacity-50"
                        )}
                      >
                         {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                         {isProcessing ? 'Lendo com IA...' : 'Extrair Dados Agora'}
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 text-center space-y-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Legibilidade</h4>
                      <p className="text-sm font-black">99.8%</p>
                   </div>
                   <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 text-center space-y-2">
                      <Clock className="w-6 h-6 text-indigo-600 mx-auto" />
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Média Process</h4>
                      <p className="text-sm font-black">1.2s</p>
                   </div>
                   <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 text-center space-y-2">
                      <Sparkles className="w-6 h-6 text-violet-500 mx-auto" />
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Sugestão Cat.</h4>
                      <p className="text-sm font-black">Ativa</p>
                   </div>
                </div>
             </div>

             {/* Right Column: Results */}
             <div className="h-full">
                <AnimatePresence mode="wait">
                   {result ? (
                     <motion.div
                       key="result"
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="bg-white dark:bg-slate-900 rounded-[56px] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-12 h-fit"
                     >
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Resultado do Scan</span>
                              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{result.fornecedor}</h3>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{result.cnpj || 'CNPJ NÃO IDENTIFICADO'}</p>
                           </div>
                           <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl text-slate-400"><Receipt className="w-8 h-8" /></div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-10 border-y border-slate-100 dark:border-slate-800">
                           <div className="space-y-4">
                              <div className="space-y-1">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block"><Calendar className="w-3 h-3 inline mr-1" /> Data Fiscal</span>
                                 <p className="text-xl font-bold">{result.data}</p>
                              </div>
                              <div className="space-y-1">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block"><DollarSign className="w-3 h-3 inline mr-1" /> Valor Total</span>
                                 <p className="text-3xl font-black text-indigo-600 italic">R$ {result.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              </div>
                           </div>
                           <div className="flex flex-col justify-end space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CNPJ / CPF</span>
                              <p className="text-sm font-medium">{result.cnpj}</p>
                           </div>
                        </div>

                        <div className="space-y-8">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">Classificação Inteligente</h4>
                              <div className="flex flex-wrap gap-3">
                                 <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl text-xs font-bold ring-1 ring-indigo-200">Setor: {result.tipoOperacao}</div>
                                 <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 ring-1 ring-slate-100">Centro de Custo: {result.centroCusto}</div>
                              </div>
                           </div>
                           
                           <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-2">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Info className="w-3 h-3" /> Observação IA</div>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{result.resumo}</p>
                           </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                           <button className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[28px] font-black text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                             Salvar no Cloud <Download className="w-5 h-5" />
                           </button>
                           <button className="p-5 bg-rose-50 text-rose-600 rounded-[28px] hover:bg-rose-100 transition-all font-bold text-sm flex items-center justify-center">
                              <Trash2 className="w-6 h-6" />
                           </button>
                        </div>
                     </motion.div>
                   ) : (
                     <div className="h-full bg-slate-50 dark:bg-slate-900/50 rounded-[56px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-200 shadow-sm"><Search className="w-12 h-12" /></div>
                        <h3 className="text-2xl font-black text-slate-400 tracking-tight">O resultado da análise <br /> aparecerá aqui.</h3>
                        <p className="text-sm text-slate-400 max-w-xs font-medium">Use nossa visão computacional treinada em recibos amassados, escuros ou com baixa resolução.</p>
                     </div>
                   )}
                </AnimatePresence>
             </div>

          </div>
       </div>
    </div>
  );
}
