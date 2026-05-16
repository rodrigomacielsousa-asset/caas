import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSearch, 
  Upload, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  X,
  Loader2,
  Table,
  Zap,
  Download,
  Trash2,
  Edit2,
  Filter,
  ArrowLeft,
  Crown,
  History,
  ShieldCheck,
  FileCode,
  Layers,
  Percent,
  Receipt,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { analyzeInvoice } from '../services/geminiService';
import { useCart } from '../hooks/useCart';

// Types
interface Documento {
  id: string;
  name: string;
  type: 'XML' | 'PDF' | 'Imagem' | 'Outro';
  category: 'Receita' | 'Despesa' | 'Imposto' | 'Folha';
  operation?: 'Entrada' | 'Saída';
  issuer: string;
  cnpj: string;
  date: string;
  value: number;
  taxes: number;
  status: 'Processado' | 'Pendente' | 'Erro';
  rawText?: string;
}

export default function PreContabilAI() {
  const { addItem } = useCart();
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [filterType, setFilterType] = useState<string>('Todos');

  // Stats calculation
  const stats = {
    total: documents.length,
    receita: documents.filter(d => d.category === 'Receita').reduce((sum, d) => sum + d.value, 0),
    despesa: documents.filter(d => d.category === 'Despesa').reduce((sum, d) => sum + d.value, 0),
    taxes: documents.reduce((sum, d) => sum + d.taxes, 0),
    pending: documents.filter(d => d.status === 'Pendente').length
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    // O usuário solicitou que não haja menção a upgrade ou limites de plano free
    setIsProcessing(true);
    const newDoc: Documento = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.name.toUpperCase().endsWith('.XML') ? 'XML' : file.type.includes('pdf') ? 'PDF' : 'Imagem',
      category: 'Despesa', // Default
      issuer: 'Analisando...',
      cnpj: '---',
      date: new Date().toLocaleDateString('pt-BR'),
      value: 0,
      taxes: 0,
      status: 'Pendente'
    };

    setDocuments(prev => [newDoc, ...prev]);

    try {
      if (newDoc.type === 'XML') {
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        
        const vNF = xmlDoc.getElementsByTagName("vNF")[0]?.textContent || "0";
        const vICMS = xmlDoc.getElementsByTagName("vICMS")[0]?.textContent || "0";
        const vPIS = xmlDoc.getElementsByTagName("vPIS")[0]?.textContent || "0";
        const vCOFINS = xmlDoc.getElementsByTagName("vCOFINS")[0]?.textContent || "0";
        const vISS = xmlDoc.getElementsByTagName("vISS")[0]?.textContent || "0";
        
        const totalTaxes = parseFloat(vICMS) + parseFloat(vPIS) + parseFloat(vCOFINS) + parseFloat(vISS);
        
        const dhEmi = xmlDoc.getElementsByTagName("dhEmi")[0]?.textContent || "";
        const xNome = xmlDoc.getElementsByTagName("xNome")[0]?.textContent || "Emitente Desconhecido";
        const CNPJ = xmlDoc.getElementsByTagName("CNPJ")[0]?.textContent || "";
        const tpNF = xmlDoc.getElementsByTagName("tpNF")[0]?.textContent; // 0=Entrada, 1=Saída

        updateDoc(newDoc.id, {
          issuer: xNome,
          cnpj: CNPJ,
          date: dhEmi ? new Date(dhEmi).toLocaleDateString('pt-BR') : newDoc.date,
          value: parseFloat(vNF),
          taxes: totalTaxes,
          operation: tpNF === "0" ? "Entrada" : "Saída",
          status: 'Processado',
          category: tpNF === "1" ? 'Receita' : 'Despesa'
        });
      } else {
        // PDF or Image via Gemini
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = (e.target?.result as string).split(',')[1];
          try {
            const data = await analyzeInvoice(base64, file.type);
            if (!data || !data.fornecedor) throw new Error("Dados não encontrados");
            
            updateDoc(newDoc.id, {
              issuer: data.fornecedor || 'Desconhecido',
              cnpj: data.cnpj || '---',
              date: data.data || new Date().toLocaleDateString('pt-BR'),
              value: data.valor || 0,
              taxes: data.impostos || 0,
              operation: data.tipoOperacao === 'Venda' ? 'Saída' : 'Entrada',
              status: 'Processado',
              category: data.tipoOperacao === 'Venda' ? 'Receita' : 'Despesa'
            });
          } catch (err: any) {
            console.error("Analysis failed:", err);
            updateDoc(newDoc.id, { 
              status: 'Erro',
              issuer: 'Erro na Análise',
              rawText: err.message || 'Falha na IA'
            });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      updateDoc(newDoc.id, { status: 'Erro' });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateDoc = (id: string, updates: Partial<Documento>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(documents.map(d => ({
      Documento: d.name,
      Tipo: d.type,
      Categoria: d.category,
      Operacao: d.operation || '---',
      Emitente: d.issuer,
      CNPJ: d.cnpj,
      Data: d.date,
      Valor: d.value,
      Impostos: d.taxes,
      Status: d.status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Documentos");
    XLSX.writeFile(wb, "pre_contabil_export.xlsx");
  };

  const filteredDocs = filterType === 'Todos' 
    ? documents 
    : documents.filter(d => d.category === filterType);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar Navigation */}
      <div className="w-24 md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col pt-32 pb-10 fixed h-full z-20">
        <div className="px-6 mb-12 hidden md:block">
           <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
             <Brain className="w-5 h-5 text-blue-600" /> Pré-Contábil AI
           </h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Entrada de Documentos</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
           <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-blue-600 text-white shadow-lg transition-all">
              <Layers className="w-6 h-6 flex-shrink-0" />
              <span className="font-bold text-sm hidden md:block">Processamento</span>
           </button>
           <button onClick={exportToExcel} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Download className="w-6 h-6 flex-shrink-0" />
              <span className="font-bold text-sm hidden md:block">Exportar Dados</span>
           </button>
        </nav>

        <div className="px-4 mt-auto space-y-4">
           <button 
              onClick={() => {
                addItem({
                  id: 'precontabilai',
                  name: 'Pré-Contábil AI',
                  slug: 'pre-contabil-ai',
                  price: 89.90,
                  priceLabel: 'R$ 89,90/mês',
                  pricingModel: 'subscription',
                  type: 'individual'
                });
                alert('Adicionado ao carrinho!');
              }}
              className="w-full p-6 bg-blue-600 hover:bg-slate-900 text-white rounded-[32px] shadow-2xl flex flex-col items-center gap-2 transition-all group"
           >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Comprar Agora</span>
           </button>
           
           <Link to="/solucoes" className="flex items-center gap-4 px-4 py-4 text-slate-400 hover:text-blue-600 transition-all">
              <ArrowLeft className="w-6 h-6" />
              <span className="font-bold text-sm hidden md:block">Voltar</span>
           </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-24 md:ml-72 pt-32 pb-20 px-4 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Zap className="w-3 h-3" /> Extração Inteligente Ativa
                  </div>
               </div>
               <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Gestão <span className="text-blue-600">Documental.</span>
               </h1>
               <p className="text-lg text-slate-500 font-serif italic max-w-md leading-relaxed">
                 Automatize a leitura de XML, PDF e Recibos com classificação contábil automática por IA.
               </p>
            </div>
          </div>

          {/* KPI Mini-Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Processados', val: stats.total - stats.pending, icon: CheckCircle2, color: 'text-emerald-500' },
              { label: 'Receitas', val: `R$ ${stats.receita.toLocaleString()}`, icon: ArrowRight, color: 'text-blue-600' },
              { label: 'Despesas', val: `R$ ${stats.despesa.toLocaleString()}`, icon: ArrowLeft, color: 'text-rose-500' },
              { label: 'Total Impostos', val: `R$ ${stats.taxes.toLocaleString()}`, icon: Percent, color: 'text-amber-500' },
            ].map(k => (
              <div key={k.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400"><k.icon className={cn("w-6 h-6", k.color)} /></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{k.label}</p>
                   <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{k.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-100 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-blue-600 tracking-tight uppercase">Licença Ativa necessária</h3>
              <p className="text-sm font-medium text-blue-500">Esta é uma demonstração do Pré-Contábil AI. Para uso em produção, adquira uma licença.</p>
            </div>
            <button 
              onClick={() => {
                addItem({
                  id: 'precontabilai',
                  name: 'Pré-Contábil AI',
                  slug: 'pre-contabil-ai',
                  price: 89.90,
                  priceLabel: 'R$ 89,90/mês',
                  pricingModel: 'subscription',
                  type: 'individual'
                });
                window.location.href = '/carrinho';
              }}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all"
            >
              Comprar Licença Completa
            </button>
          </div>

          {/* Upload Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "p-12 md:p-20 bg-white dark:bg-slate-900 rounded-[56px] border-4 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-8 relative overflow-hidden group",
              dragActive ? "border-blue-600 bg-blue-50/10" : "border-slate-200 dark:border-slate-800"
            )}
          >
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
               <Upload className="w-12 h-12" />
            </div>
            
            <div className="space-y-2">
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Importar Lote Contábil</h3>
               <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto">Arraste seus arquivos XML, PDF ou Recibos. A IA fará o resto por você.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
               {['XML de Entrada/Saída', 'PDF de Serviços', 'Cupons Fiscais', 'Recibos'].map(tag => (
                 <span key={tag} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-widest">{tag}</span>
               ))}
            </div>

            <input 
              type="file" 
              multiple 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => {
                if (e.target.files) Array.from(e.target.files).forEach(processFile);
              }}
            />

            {isProcessing && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                 <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                 <p className="text-xs font-black uppercase tracking-widest">IA Operando no Lote...</p>
              </div>
            )}
          </div>

          {/* Processed Documents List */}
          <div className="space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic flex items-center gap-2">
                   <Table className="w-4 h-4 text-blue-500" /> Lista de Processamento
                </h3>
                <div className="flex items-center gap-4">
                   <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                      {['Todos', 'Receita', 'Despesa', 'Imposto', 'Folha'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setFilterType(t)}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            filterType === t ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"
                          )}
                        >
                           {t}
                        </button>
                      ))}
                   </div>
                   <button onClick={exportToExcel} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                      <Download className="w-5 h-5" />
                   </button>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                         <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operação</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Emitente</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Impostos</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                         <AnimatePresence>
                           {filteredDocs.map((doc) => (
                             <motion.tr 
                               key={doc.id}
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               exit={{ opacity: 0, x: 20 }}
                               className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                             >
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                                         {doc.type === 'XML' ? <FileCode className="w-5 h-5 text-blue-500 group-hover:text-white" /> : <FileText className="w-5 h-5 text-slate-400 group-hover:text-white" />}
                                      </div>
                                      <div>
                                         <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{doc.name}</p>
                                         <p className={cn(
                                           "text-[10px] font-black uppercase",
                                           doc.status === 'Erro' ? "text-rose-500" : "text-slate-400"
                                         )}>
                                           {doc.date} • {doc.status} {doc.rawText && `(${doc.rawText})`}
                                         </p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <select 
                                     value={doc.category}
                                     onChange={(e) => updateDoc(doc.id, { category: e.target.value as any })}
                                     className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600"
                                   >
                                      <option>Receita</option>
                                      <option>Despesa</option>
                                      <option>Imposto</option>
                                      <option>Folha</option>
                                   </select>
                                </td>
                                <td className="px-8 py-6">
                                   <div className={cn(
                                     "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                     doc.operation === 'Entrada' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                   )}>
                                      {doc.operation || '---'}
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="max-w-[200px]">
                                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.issuer}</p>
                                      <p className="text-[10px] font-black uppercase text-slate-400">{doc.cnpj}</p>
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">
                                   R$ {doc.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-rose-500 whitespace-nowrap">
                                   {doc.taxes > 0 ? `R$ ${doc.taxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
                                </td>
                                <td className="px-8 py-6 text-right space-x-2">
                                   <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-300 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                   <button onClick={() => handleDelete(doc.id)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </td>
                             </motion.tr>
                           ))}
                         </AnimatePresence>
                         {filteredDocs.length === 0 && (
                           <tr>
                              <td colSpan={6} className="px-8 py-20 text-center">
                                 <div className="flex flex-col items-center justify-center space-y-4">
                                    <FileSearch className="w-12 h-12 text-slate-200" />
                                    <p className="text-sm font-bold text-slate-400 italic">Nenhum documento processado neste lote.</p>
                                 </div>
                              </td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

          {/* Integration & Future Info */}
          <div className="bg-slate-900 rounded-[56px] p-12 md:p-20 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none scale-150"><Zap className="w-64 h-64 text-blue-400" /></div>
             <div className="max-w-3xl space-y-8 relative z-10">
                <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl mb-8"><Sparkles className="w-10 h-10" /></div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.85] uppercase italic">Integremos sua <br />Produtividade.</h2>
                <p className="text-lg text-slate-400 font-medium leading-relaxed italic">
                  O Pré-Contábil AI se conecta ao Office Contábil para amarrar os documentos aos seus clientes automaticamente. 
                  Gere o lote, exporte para seu ERP e esqueça o trabalho manual.
                </p>
                <div className="flex gap-4">
                   <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
                      Habilitar Automação ERP
                   </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
