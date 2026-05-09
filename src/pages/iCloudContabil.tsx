import React, { useState, useCallback } from 'react';
import { 
  Folder, 
  File, 
  Upload, 
  Search, 
  Filter, 
  Brain, 
  MoreVertical, 
  ExternalLink, 
  Trash2, 
  Download, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  X,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { classifyCloudFile } from '../services/geminiService';

interface CloudFile {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
  category: 'Fiscal' | 'RH' | 'Contabil' | 'Legal' | 'Outros';
  confidence?: number;
}

const INITIAL_FILES: CloudFile[] = [
  { id: '1', name: 'Contrato Social - Nexus.pdf', type: 'application/pdf', size: '2.4 MB', updatedAt: '08/05/2026', category: 'Legal' },
  { id: '2', name: 'Folha de Pagamento - Abr2026.xlsx', type: 'application/vnd.ms-excel', size: '1.1 MB', updatedAt: '07/05/2026', category: 'RH' },
  { id: '3', name: 'Nota Fiscal 2024-05.pdf', type: 'application/pdf', size: '840 KB', updatedAt: '09/05/2026', category: 'Fiscal' },
];

export default function ICloudContabil() {
  const [files, setFiles] = useState<CloudFile[]>(INITIAL_FILES);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulação de Upload + Classificação Gemini
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const result = await classifyCloudFile(base64.split(',')[1], file.type);
        
        const newFile: CloudFile = {
          id: Math.random().toString(),
          name: file.name,
          type: file.type,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          updatedAt: new Date().toLocaleDateString(),
          category: result.category,
          confidence: result.confidence
        };

        setFiles(prev => [newFile, ...prev]);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 w-full md:max-w-xl">
             <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar em todos os documentos..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-600 transition-all font-medium" 
                />
             </div>
             <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
                <Filter className="w-5 h-5" />
             </button>
          </div>

          <label className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[20px] font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer">
             <Upload className="w-5 h-5" />
             {isUploading ? 'Classificando Documento...' : 'Upload Inteligente'}
             <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar Filters */}
          <div className="space-y-10">
             <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Pastas Inteligentes</h3>
                <nav className="space-y-1">
                  {[
                    { name: 'Todos os Arquivos', count: files.length, icon: Folder, active: true },
                    { name: 'Setor Fiscal', count: files.filter(f => f.category === 'Fiscal').length, icon: ShieldCheck },
                    { name: 'Trabalhista & RH', count: files.filter(f => f.category === 'RH').length, icon: FileText },
                    { name: 'Legal & Contratos', count: files.filter(f => f.category === 'Legal').length, icon: Brain },
                  ].map(item => (
                    <button key={item.name} className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm",
                      item.active ? "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
                    )}>
                      <div className="flex items-center gap-3">
                         <item.icon className={cn("w-4 h-4", item.active ? "text-indigo-600" : "text-slate-400")} />
                         {item.name}
                      </div>
                      <span className="text-[10px]">{item.count}</span>
                    </button>
                  ))}
                </nav>
             </div>

             <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[40px] text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-all" />
                <div className="relative z-10 space-y-6">
                   <h4 className="text-xl font-bold leading-tight">Backup Georedundante</h4>
                   <p className="text-xs text-indigo-200 leading-relaxed font-medium">Seus arquivos são replicados em 3 regiões diferentes para garantir 100% de disponibilidade.</p>
                   <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4" /> Ativo
                   </div>
                </div>
             </div>
          </div>

          {/* Main Grid */}
          <div className="lg:col-span-3">
             <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                   <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
                     Documentos Recentes <ChevronRight className="w-4 h-4 text-slate-300" />
                   </h2>
                   <div className="flex gap-4">
                      <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline"><Plus className="w-4 h-4" /> Nova Pasta</button>
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                           <th className="px-10 py-6">Nome do Arquivo</th>
                           <th className="px-10 py-6">Classificação</th>
                           <th className="px-10 py-6">Tamanho</th>
                           <th className="px-10 py-6">Atualizado</th>
                           <th className="px-10 py-6"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                         {filteredFiles.map(file => (
                           <tr 
                             key={file.id} 
                             onClick={() => setSelectedFile(file)}
                             className={cn(
                               "hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer",
                               selectedFile?.id === file.id && "bg-indigo-50/30 dark:bg-indigo-900/10"
                             )}
                           >
                             <td className="px-10 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                      <File className="w-5 h-5" />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{file.name}</p>
                                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">{file.type.split('/')[1]}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                                  file.category === 'Fiscal' ? "bg-amber-100 text-amber-700" :
                                  file.category === 'RH' ? "bg-emerald-100 text-emerald-700" :
                                  file.category === 'Legal' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"
                                )}>
                                   {file.category}
                                </span>
                                {file.confidence && (
                                  <div className="text-[8px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 mt-1 transition-opacity">IA: {file.confidence}% PRECISION</div>
                                )}
                             </td>
                             <td className="px-10 py-6">
                                <span className="text-xs font-medium text-slate-500">{file.size}</span>
                             </td>
                             <td className="px-10 py-6">
                                <span className="text-xs font-medium text-slate-500">{file.updatedAt}</span>
                             </td>
                             <td className="px-10 py-6">
                                <button className="p-2 opacity-0 group-hover:opacity-100 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 transition-all"><MoreVertical className="w-4 h-4" /></button>
                             </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                
                {filteredFiles.length === 0 && (
                   <div className="p-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6"><Search className="w-10 h-10 text-slate-300" /></div>
                      <h3 className="text-xl font-bold text-slate-400">Nenhum arquivo encontrado</h3>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-0 right-0 w-full md:w-[400px] h-screen bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-10 overflow-y-auto"
          >
             <div className="flex justify-between items-center mb-12">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalhes do Arquivo</span>
                <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><X className="w-5 h-5" /></button>
             </div>

             <div className="flex flex-col items-center text-center space-y-6 mb-12">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-400 shadow-inner">
                   <File className="w-10 h-10" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{selectedFile.name}</h3>
                   <p className="text-sm text-slate-400 mt-2 font-medium">{selectedFile.size} • {selectedFile.type}</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-4">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                      <span>Categoria IA</span>
                      <span className="text-indigo-600">{selectedFile.category}</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                      <span>Confiança</span>
                      <span className="text-indigo-600">{selectedFile.confidence || 100}%</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] hover:border-indigo-600 hover:text-indigo-600 transition-all group">
                      <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">Baixar</span>
                   </button>
                   <button className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] hover:border-indigo-600 hover:text-indigo-600 transition-all group">
                      <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">Partilhar</span>
                   </button>
                </div>

                <button className="w-full py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all hover:bg-rose-100">
                   <Trash2 className="w-4 h-4" /> Excluir Arquivo
                </button>
             </div>

             <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 text-emerald-500 font-bold text-xs uppercase tracking-widest mb-6">
                   <ShieldCheck className="w-5 h-5" /> Verificado por Auditoria
                </div>
                <div className="space-y-4">
                   <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full" />
                   </div>
                   <p className="text-[10px] text-slate-400 leading-relaxed font-bold">O arquivo foi verificado pelo módulo de governança MicroCaaS e está livre de malwares ou macros maliciosas.</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
