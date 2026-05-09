import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ArrowRight, 
  Zap, 
  Star, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import microcaasData from '../data/microcaas.json';
import bundlesData from '../data/bundles.json';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import type { Product } from '../types';

export default function MicroCaaSPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'fiscal' | 'contabil' | 'societario' | 'rh'>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filteredProducts = (microcaasData as Product[]).filter(p => {
    const matchesTab = activeTab === 'all' || p.area.toLowerCase() === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header Marketplace */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="space-y-6 max-w-2xl text-center md:text-left">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <Star className="w-3 h-3 fill-current" /> Marketplace Aberto
                 </div>
                 <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">Explore o Ecossistema <br /><span className="text-indigo-600">MicroCaaS.</span></h1>
                 <p className="text-xl text-slate-500 font-medium italic font-serif">A maior biblioteca de microsoluções contábeis do Brasil. Criadas por quem vive o dia a dia do escritório.</p>
              </div>
              
              <div className="w-full md:w-auto flex flex-col gap-4">
                 <div className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Qual desafio deseja resolver?"
                      className="w-full md:w-96 bg-white dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-5 shadow-2xl shadow-indigo-100 dark:shadow-none focus:ring-2 focus:ring-indigo-600 transition-all text-lg font-medium" 
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters and Bundles */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          <div className="space-y-10">
            <div className="space-y-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-2">Categorias</h3>
               <div className="flex flex-col gap-1">
                  {[
                    { id: 'all', label: 'Todas as Soluções' },
                    { id: 'fiscal', label: 'Fiscal' },
                    { id: 'contabil', label: 'Contábil' },
                    { id: 'rh', label: 'Recursos Humanos' },
                    { id: 'societario', label: 'Societário' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between group",
                        activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                      )}
                    >
                      {tab.label}
                      <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-all", activeTab === tab.id && "opacity-100")} />
                    </button>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[32px] border border-indigo-100 dark:border-indigo-900/30 space-y-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Ganhe Descontos <br /> Progressivos</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Adicione mais de 3 MicroCaaS ao carrinho e ganhe automaticamente 15% de desconto.</p>
                <div className="pt-4 flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                   Saiba Mais <ArrowRight className="w-4 h-4" />
                </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-12">
            {/* Bundles highlight */}
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Melhores Ofertas (Bundles)</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {bundlesData.map(bundle => (
                    <Link 
                      to={`/bundle/${bundle.slug}`}
                      key={bundle.id}
                      className="group bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                    >
                       <div className="absolute top-0 right-0 p-8 opacity-20"><Zap className="w-24 h-24" /></div>
                       <div className="relative z-10">
                          <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{bundle.name}</h3>
                          <p className="text-indigo-200/60 text-xs font-medium max-w-[200px]">{bundle.description}</p>
                       </div>
                       <div className="relative z-10 flex items-center justify-between pt-8">
                          <span className="text-2xl font-black italic">R$ {bundle.price}</span>
                          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                            Ver Combo <ChevronRight className="w-3 h-3" />
                          </span>
                       </div>
                    </Link>
                  ))}
               </div>
            </div>

            {/* Grid display */}
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Catálogo de Ferramentas</h2>
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                      <button onClick={() => setView('grid')} className={cn("p-2 rounded-lg transition-all", view === 'grid' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-400")}><Grid className="w-4 h-4" /></button>
                      <button onClick={() => setView('list')} className={cn("p-2 rounded-lg transition-all", view === 'list' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-400")}><List className="w-4 h-4" /></button>
                  </div>
               </div>

               <div className={cn(
                 "grid gap-8",
                 view === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
               )}>
                  {filteredProducts.map(p => (
                    <ProductCard key={p.id} product={p} hideAdd={false} />
                  ))}
               </div>

               {filteredProducts.length === 0 && (
                 <div className="text-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-400 tracking-tight">Nenhuma ferramenta <br /> encontrada para esta pesquisa.</h3>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
