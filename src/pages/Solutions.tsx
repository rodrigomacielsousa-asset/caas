import { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ChevronRight,
  Target,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import solucoesData from '../data/solucoes.json';
import { cn } from '../lib/utils';
import type { Solucao } from '../types';

export default function Solutions() {
  const [activeTab, setActiveTab] = useState<'all' | 'fiscal' | 'contabil' | 'societario' | 'gestao'>('all');
  const [search, setSearch] = useState('');

  const filteredSolutions = (solucoesData as Solucao[]).filter(p => {
    const matchesTab = activeTab === 'all' || p.area.toLowerCase() === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      {/* Header Solutions */}
      <div className="bg-slate-900 py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-full bg-indigo-600/20 blur-[120px] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-widest">
                 <ShieldCheck className="w-3 h-3" /> Soluções Oficiais Homologadas
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">
                Microsoluções que <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">escalam seu escritório.</span>
              </h1>
              <p className="text-xl text-indigo-100/60 font-medium leading-relaxed italic font-serif">
                Desenvolvemos as ferramentas fundamentais para a modernização da contabilidade no Brasil.
              </p>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
           {/* Sidebar Filters */}
           <div className="space-y-12">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar na biblioteca..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600 transition-all" 
                />
              </div>

              <div className="space-y-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-2">Setores</h3>
                 <div className="flex flex-col gap-1">
                    {[
                      { id: 'all', label: 'Ver Todas', icon: LayoutGrid },
                      { id: 'fiscal', label: 'Fiscal & Tax', icon: FileText },
                      { id: 'contabil', label: 'Contabilidade', icon: Target },
                      { id: 'gestao', label: 'Gestão Interna', icon: Zap },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl transition-all group",
                          activeTab === tab.id ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"
                        )}
                      >
                         <div className="flex items-center gap-3">
                            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-indigo-600" : "text-slate-400")} />
                            <span className="text-sm font-bold">{tab.label}</span>
                         </div>
                         <ChevronRight className={cn("w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all", activeTab === tab.id && "opacity-100")} />
                      </button>
                    ))}
                 </div>
              </div>

              <div className="p-8 bg-indigo-600 rounded-[40px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Sparkles className="w-32 h-32" /></div>
                 <h4 className="text-lg font-black mb-4 leading-tight relative z-10">MicroCaaS <br /> Enterprise</h4>
                 <p className="text-xs text-indigo-100/80 mb-6 relative z-10 mb-8 font-medium">Soluções customizadas para escritórios com mais de 5.000 clientes.</p>
                 <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-xs relative z-10 flex items-center justify-center gap-2">
                   Contato Comercial <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* Main Content */}
           <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {filteredSolutions.map(product => (
                   <ProductCard key={product.id} product={product} />
                 ))}
              </div>
              
              {filteredSolutions.length === 0 && (
                <div className="text-center py-24 bg-slate-50 dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-200">
                   <h3 className="text-xl font-bold text-slate-400 italic">Nenhuma solução oficial para este filtro.</h3>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
