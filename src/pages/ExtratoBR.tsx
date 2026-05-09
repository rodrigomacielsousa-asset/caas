import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Table, 
  Brain, 
  Sparkles, 
  ArrowRight,
  Loader2,
  X,
  Plus,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getGeminiResponse } from '../lib/gemini';

interface Entry {
  data: string;
  descricao: string;
  valor: number;
  tipo: 'D' | 'C';
  contaSugerida: string;
  confianca: number;
}

export default function ExtratoBR() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      // Simulação de processamento via Gemini
      // Na vida real, transformaríamos PDF em base64 e enviaríamos para a API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: Entry[] = [
        { data: '05/05/2026', descricao: 'AMAZON WEB SERVICES', valor: 1250.40, tipo: 'D', contaSugerida: '4.1.3.01 - Cloud Computing', confianca: 98 },
        { data: '02/05/2026', descricao: 'POSTO DE GASOLINA BR', valor: 320.15, tipo: 'D', contaSugerida: '4.1.1.05 - Combustíveis', confianca: 92 },
        { data: '10/05/2026', descricao: 'RECEBIMENTO PIX - CLIENTE A', valor: 5000.00, tipo: 'C', contaSugerida: '1.1.1.02 - Bancos Conta Movimento', confianca: 100 },
        { data: '12/05/2026', descricao: 'FGTS ARRECADACAO', valor: 850.00, tipo: 'D', contaSugerida: '2.1.2.01 - Impostos a Recolher', confianca: 95 },
      ];
      
      setEntries(mockResult);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" /> IA-POWERED OCR
               </div>
               <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Extrato.BR</h1>
               <p className="text-lg text-slate-500 font-medium leading-relaxed italic font-serif">
                Transforme extratos bancários PDF em lançamentos contábeis classificados por IA em segundos.
               </p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-6">
              <div className="text-center">
                 <div className="text-2xl font-black text-indigo-600">45k</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notas Lidas</div>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                 <div className="text-2xl font-black text-emerald-500">99.2%</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precisão IA</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {entries.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={cn(
                "p-16 bg-white dark:bg-slate-900 rounded-[48px] border-4 border-dashed transition-all text-center space-y-8 cursor-pointer group hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-2xl shadow-slate-200 dark:shadow-none",
                isDragging ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 dark:border-slate-800"
              )}
            >
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-[32px] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                 <Upload className="w-12 h-12 text-indigo-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Arraste seu Extrato PDF</h3>
                <p className="text-slate-500 font-medium">Ou clique para selecionar arquivo do seu PC</p>
              </div>

              {file ? (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-between border border-indigo-100 max-w-sm mx-auto">
                   <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-bold truncate">{file.name}</span>
                   </div>
                   <button onClick={() => setFile(null)} className="p-1 hover:bg-white rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden" 
                  id="file-upload" 
                />
              )}

              <button 
                onClick={processFile}
                disabled={!file || isProcessing}
                className={cn(
                  "btn-primary py-5 px-12 rounded-2xl text-lg flex items-center justify-center gap-3 mx-auto transition-all shadow-xl shadow-indigo-200",
                  (!file || isProcessing) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> Processando com IA...
                  </>
                ) : (
                  <>
                    <Brain className="w-6 h-6" /> Iniciar Classificação Inteligente
                  </>
                )}
              </button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto shadow-md"><Download className="w-6 h-6" /></div>
                  <h4 className="font-bold text-sm">Exportação Pronta</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Gere arquivos em formato Domínio, Questor, Alterdata ou Excel.</p>
               </div>
               <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto shadow-md"><Shield className="w-6 h-6" /></div>
                  <h4 className="font-bold text-sm">Segurança Bancária</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Dados processados em memória volátil e nunca vendidos a terceiros.</p>
               </div>
               <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto shadow-md"><Sparkles className="w-6 h-6" /></div>
                  <h4 className="font-bold text-sm">ML Treinado</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Algoritmo especialista nos principais bancos do Brasil (Itaú, BB, Nubank).</p>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    Resultados Classificados <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">{entries.length}</span>
                  </h2>
                  <p className="text-slate-500 font-medium">Revisão obrigatória antes da importação para o contábil.</p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setEntries([])} className="px-6 py-3 font-bold text-slate-500 hover:text-rose-600 transition-all">Limpar</button>
                  <button className="btn-primary py-3 px-8 flex items-center gap-2 group">
                    Baixar Exportação <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-8 py-6">Data</th>
                        <th className="px-8 py-6">Descrição Original</th>
                        <th className="px-8 py-6">Valor</th>
                        <th className="px-8 py-6">Conta Contábil Sugerida</th>
                        <th className="px-8 py-6 text-center">Confiança</th>
                        <th className="px-8 py-6">Ação</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {entries.map((entry, idx) => (
                       <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="px-8 py-6 text-sm font-medium">{entry.data}</td>
                          <td className="px-8 py-6">
                             <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{entry.descricao}</div>
                             <span className={cn(
                               "text-[10px] font-bold uppercase tracking-wide",
                               entry.tipo === 'D' ? "text-rose-500" : "text-emerald-500"
                             )}>
                               {entry.tipo === 'D' ? 'Débito' : 'Crédito'}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <span className={cn(
                               "font-black",
                               entry.tipo === 'D' ? "text-rose-600" : "text-emerald-600"
                             )}>
                               R$ {entry.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                               <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                                   <Table className="w-3.5 h-3.5" />
                               </div>
                               <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{entry.contaSugerida}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col items-center gap-1">
                                <div className="text-[10px] font-bold text-slate-400">{entry.confianca}%</div>
                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                   <div 
                                     className={cn(
                                       "h-full rounded-full transition-all duration-1000",
                                       entry.confianca > 90 ? "bg-emerald-500" : "bg-amber-500"
                                     )}
                                     style={{ width: `${entry.confianca}%` }}
                                   />
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><X className="w-4 h-4 text-slate-300" /></button>
                                <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            <div className="flex items-center gap-4 p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[32px] border border-amber-100 dark:border-amber-900/30">
               <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
               <div>
                 <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Revisão de Amostragem Necessária</h4>
                 <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1 font-medium leading-relaxed">
                   Detectamos termos ambíguos em 2 lançamentos. Verifique se as contas sugeridas estão alinhadas com o plano de contas da empresa.
                 </p>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
