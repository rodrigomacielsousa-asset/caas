import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  X,
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
import { HeroPadrao } from '../components/HeroPadrao';
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

  const recentReleases = useMemo(() => {
    if (products.length === 0) return [];
    // Prioritize new products but shuffle to keep it dynamic
    const novos = products.filter(p => p.badges?.includes('Novo'));
    const others = products.filter(p => !p.badges?.includes('Novo'));
    const pool = novos.length > 0 ? novos : others;
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Hero Section */}
      <HeroPadrao 
        badge="Marketplace Oficial de MicroCaaS Contábeis"
        title={<>Micro-soluções que viram <span className="text-blue-500">produtividade.</span></>}
        description="Compre ferramentas prontas para usar. Sem setup complexo, sem contratos leoninos. Apenas produtividade."
        visualContent={
          <div className="relative max-w-3xl mx-auto">
            <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O que você precisa automatizar hoje?"
              className="w-full bg-white border-2 border-transparent rounded-[40px] pl-16 pr-14 py-5 text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none transition-all text-xl font-bold tracking-tight shadow-2xl" 
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
