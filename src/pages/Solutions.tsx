import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ArrowRight, 
  Zap, 
  Sparkles, 
  ChevronRight,
  LayoutGrid,
  TrendingUp,
  Box,
  Crown,
  CreditCard,
  Clock,
  MessageSquare,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';
import { cn } from '../lib/utils';
import type { Product, PricingModel } from '../types';
import { Link } from 'react-router-dom';

export default function Solutions() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedPricing, setSelectedPricing] = useState<PricingModel | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const all = await productService.getProducts();
        const active = all.filter(p => !p.status || p.status === 'active' || p.status === 'beta');
        setProducts(active);
      } catch (err) {
        console.error("Critical error in loadProducts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return ['Todas', ...Array.from(new Set(cats))];
  }, [products]);

  const pricingModels: { id: PricingModel | 'all'; label: string }[] = [
    { id: 'all', label: 'Todos os Planos' },
    { id: 'free', label: 'Gratuitos' },
    { id: 'subscription', label: 'Assinatura' },
    { id: 'one_time', label: 'Compra Única' },
    { id: 'usage', label: 'Por Uso' },
    { id: 'quote', label: 'Consultar' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const s = search.toLowerCase();
      const matchesSearch = 
        (p.name?.toLowerCase() || '').includes(s) || 
        (p.subtitle?.toLowerCase() || '').includes(s) ||
        (p.shortDescription?.toLowerCase() || '').includes(s) ||
        p.dors?.some(dor => dor.toLowerCase().includes(s));
      
      const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
      const matchesPricing = selectedPricing === 'all' || p.pricingModel === selectedPricing;
      
      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [products, search, selectedCategory, selectedPricing]);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-full bg-blue-600/10 blur-[150px] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
           <div className="max-w-4xl space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mx-auto">
                 <Crown className="w-3 h-3" /> Marketplace Oficial de MicroCaaS Contábeis
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85]">
                Soluções que <span className="text-blue-500">Contadores</span> Amam.
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed font-serif max-w-2xl mx-auto">
                Compre ferramentas prontas para usar. Sem setup complexo, sem contratos leoninos. Apenas produtividade.
              </p>
              
              <div className="relative max-w-3xl mx-auto">
                <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="O que você precisa automatizar hoje?"
                  className="w-full bg-white border-2 border-transparent rounded-[40px] pl-16 pr-6 py-7 text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none transition-all text-xl font-bold tracking-tight shadow-2xl" 
                />
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Banners */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
          <div className="md:col-span-8 bg-blue-600 rounded-[56px] p-12 md:p-16 text-white relative overflow-hidden group min-h-[400px] flex flex-col justify-end shadow-2xl">
             <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:rotate-12 transition-transform duration-1000"><Sparkles className="w-64 h-64" /></div>
             <div className="relative z-10 space-y-6">
                <span className="px-3 py-1 bg-white/20 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">Sazonal: IRPF 2026</span>
                <h2 className="text-5xl font-black tracking-tighter leading-none italic">
                   Mega Combo: <br /> Pack Tributário PRO.
                </h2>
                <p className="text-xl text-blue-100 font-medium max-w-md">
                   5 ferramentas essenciais em um único licenciamento com 40% de desconto.
                </p>
                <Link to="/solucoes/combo-pro" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all w-fit">
                   Aproveitar Oferta <ArrowRight className="w-5 h-5" />
                </Link>
             </div>
          </div>
          
          <div className="md:col-span-4 bg-slate-900 rounded-[56px] p-12 text-white relative overflow-hidden group flex flex-col justify-between shadow-xl">
             <div className="absolute -right-4 -top-4 opacity-10"><Zap className="w-40 h-40 text-blue-500" /></div>
             <div className="space-y-4 pt-12">
                <h3 className="text-3xl font-black tracking-tighter leading-tight">Lançamentos <br /> da Semana</h3>
                <p className="text-slate-400 font-medium text-sm">Novas MicroCaaS aprovadas no comitê técnico.</p>
             </div>
             <ul className="space-y-4">
                {products.slice(0, 3).map(p => (
                  <li key={p.id} className="flex items-center justify-between group/item">
                     <span className="text-sm font-bold text-slate-300 group-hover/item:text-blue-400 transition-colors uppercase tracking-tight">{p.name}</span>
                     <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-blue-400 transition-transform group-hover/item:translate-x-1" />
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    selectedCategory === cat 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                      : "bg-transparent text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
               {pricingModels.slice(1, 4).map(model => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedPricing(model.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                      selectedPricing === model.id 
                        ? "bg-slate-900 border-slate-900 text-white" 
                        : "bg-white border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-600"
                    )}
                  >
                    {model.label}
                  </button>
               ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
           </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[64px] border-4 border-dashed border-slate-100">
             <Box className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-3xl font-black text-slate-400 tracking-tighter leading-tight">Não encontramos <br />o que você busca.</h3>
             <button 
              onClick={() => { setSearch(''); setSelectedCategory('Todas'); setSelectedPricing('all'); }}
              className="mt-8 text-blue-600 font-black uppercase text-xs tracking-widest bg-blue-50 px-8 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
             >
                Limpar Filtros
             </button>
          </div>
        )}
      </div>

      {/* Suggested Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
         <div className="bg-slate-900 rounded-[56px] p-12 md:p-24 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-24 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
               <MessageSquare className="w-64 h-64" />
            </div>
            
            <div className="relative z-10 text-center max-w-3xl mx-auto space-y-10">
               <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                 A demanda por <span className="text-blue-500">agilidade</span> não para. <br /> Nós também não.
               </h2>
               <p className="text-xl text-slate-400 font-medium font-serif italic">
                 Sua ideia pode ser o próximo sucesso do Marketplace. Se você tem um processo manual lento, diga-nos e nós criaremos a solução.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/ideias" className="w-full sm:w-auto px-12 py-6 bg-blue-600 text-white rounded-[24px] font-black uppercase text-sm tracking-widest shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                    Sugerir Solução <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button className="w-full sm:w-auto px-12 py-6 bg-white/5 border border-white/10 text-white rounded-[24px] font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-all">
                    Falar com Especialista
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
