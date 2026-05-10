import { useState, useMemo } from 'react';
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
  FileText,
  Star,
  ShoppingBag,
  TrendingUp,
  Box,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import solucoesData from '../data/solucoes.json';
import microcaasData from '../data/microcaas.json';
import bundlesData from '../data/bundles.json';
import { cn } from '../lib/utils';
import type { Product } from '../types';
import { Link } from 'react-router-dom';

export default function Solutions() {
  const [activeTab, setActiveTab] = useState<'all' | 'fiscal' | 'contabil' | 'gestao' | 'reforma'>('all');
  const [search, setSearch] = useState('');

  // Unificar todos os produtos para o catálogo
  const allProducts = useMemo(() => {
    const products = [
      ...(solucoesData as any[]).map(p => ({ ...p, type: 'solucao' })),
      ...(microcaasData as any[]).map(p => ({ ...p, type: 'micro' }))
    ];
    return products as Product[];
  }, []);

  const featuredProducts = useMemo(() => {
    return allProducts.filter(p => p.statusBadge === 'Destaque' || p.price > 400).slice(0, 3);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesTab = activeTab === 'all' || 
                        p.area.toLowerCase().includes(activeTab) ||
                        (activeTab === 'reforma' && p.tags?.some(t => t.includes('reforma')));
      
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.description.toLowerCase().includes(search.toLowerCase()) ||
                            p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      return matchesTab && matchesSearch;
    });
  }, [allProducts, activeTab, search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Dynamic Hero */}
      <div className="bg-slate-900 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-full bg-indigo-600/10 blur-[150px] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                   <Crown className="w-3 h-3" /> Ecossistema Homologado
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                  Catálogo de <br /> <span className="text-indigo-500 italic">Soluções.</span>
                </h1>
                <p className="text-xl text-slate-400 font-medium leading-relaxed italic font-serif max-w-lg">
                  Busque ferramentas modulares que resolvem dores reais do seu escritório contábil.
                </p>
                <div className="relative max-w-md">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="O que você precisa automatizar hoje?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-600 focus:bg-white/10 transition-all text-lg font-medium" 
                  />
                </div>
              </div>

              {/* Featured Cards in Hero */}
              <div className="hidden lg:grid grid-cols-1 gap-4">
                 <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                         <Sparkles className="w-3 h-3" /> Recomendação IA
                       </span>
                       <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Ativo Agora</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Reforma Hub Pro</h3>
                    <p className="text-sm text-slate-400">O módulo completo para simular IBS/CBS na sua carteira.</p>
                    <Link to="/reforma-hub" className="inline-flex items-center gap-2 text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-colors">
                      Simular agora <ArrowRight className="w-4 h-4" />
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Marketplace Bundles Section */}
        <section className="mb-20">
           <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                   <Zap className="w-6 h-6 text-indigo-600" /> Combos de Lançamento
                 </h2>
                 <p className="text-sm text-slate-500 font-medium">Economize até 40% com nossos pacotes pré-configurados.</p>
              </div>
              <Link to="/carrinho" className="text-sm font-bold text-indigo-600 hover:gap-2 flex items-center transition-all">
                 Ver Carrinho <ChevronRight className="w-4 h-4" />
              </Link>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {bundlesData.map(bundle => (
                <Link 
                  key={bundle.id}
                  to={`/bundle/${bundle.slug}`}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-8 hover:shadow-2xl hover:shadow-indigo-100 transition-all relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Box className="w-24 h-24" /></div>
                   <div className="space-y-4">
                      <div className="inline-flex px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Bundle</div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{bundle.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{bundle.description}</p>
                      <div className="pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                         <span className="text-lg font-black text-slate-900 dark:text-white">R$ {bundle.price}</span>
                         <span className="p-2 bg-indigo-600 text-white rounded-xl group-hover:px-4 transition-all overflow-hidden flex items-center gap-2">
                           <ArrowRight className="w-4 h-4 shrink-0" />
                           <span className="text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Detalhes</span>
                         </span>
                      </div>
                   </div>
                </Link>
              ))}
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
           {/* Sidebar Filters */}
           <div className="space-y-12">
              <div className="space-y-4 sticky top-32">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-2">Categorias</h3>
                 <div className="flex flex-col gap-1">
                    {[
                      { id: 'all', label: 'Todas as Soluções', icon: LayoutGrid },
                      { id: 'fiscal', label: 'Fiscal & Tax', icon: FileText },
                      { id: 'contabil', label: 'Contabilidade', icon: Target },
                      { id: 'gestao', label: 'Gestão Interna', icon: Zap },
                      { id: 'reforma', label: 'Reforma Tributária', icon: TrendingUp },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                          activeTab === tab.id ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800" : "text-slate-500 hover:bg-white dark:hover:bg-slate-900"
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

                 <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[40px] border border-indigo-100 dark:border-indigo-900/30 space-y-6 mt-12">
                    <Sparkles className="w-8 h-8 text-indigo-600" />
                    <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Sugira uma <br /> MicroCaaS</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Não encontrou o que precisava? Diga-nos qual tarefa deseja automatizar.</p>
                    <Link to="/contato" className="block w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-xs text-center border border-indigo-100 transition-all hover:bg-slate-50">
                      Sugerir Solução
                    </Link>
                 </div>
              </div>
           </div>

           {/* Main Content */}
           <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-8 px-2">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredProducts.length} ferramentas encontradas</span>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">FILTRO:</span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">{activeTab}</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {filteredProducts.map(product => (
                   <ProductCard key={`${product.type}-${product.id}`} product={product} />
                 ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[56px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                   <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-slate-300" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-400 tracking-tight">Nenhuma ferramenta <br /> encontrada.</h3>
                   <p className="text-sm text-slate-500 mt-2">Tente buscar por termos mais genéricos.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
