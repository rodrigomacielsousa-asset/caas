import { useState, useMemo } from 'react';
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
import { products } from '../data/products';
import { cn } from '../lib/utils';
import type { Product, PricingModel } from '../types';
import { Link } from 'react-router-dom';

export default function Solutions() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedPricing, setSelectedPricing] = useState<PricingModel | 'all'>('all');

  const categories = useMemo(() => ['Todas', ...Array.from(new Set(products.map(p => p.category)))], []);

  const pricingModels: { id: PricingModel | 'all'; label: string }[] = [
    { id: 'all', label: 'Todos os Planos' },
    { id: 'free', label: 'Gratuitos' },
    { id: 'subscription', label: 'Assinatura' },
    { id: 'one_time', label: 'Pagamento Único' },
    { id: 'usage', label: 'Por Uso' },
    { id: 'quote', label: 'Consultar' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
        p.dors?.some(dor => dor.toLowerCase().includes(search.toLowerCase())) ||
        p.legacyNames?.some(name => name.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
      const matchesPricing = selectedPricing === 'all' || p.pricingModel === selectedPricing;
      
      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [search, selectedCategory, selectedPricing]);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-full bg-blue-600/10 blur-[150px] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                 <Crown className="w-3 h-3" /> Ferramentas validadas para uso contábil
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                Resolva tarefas contábeis <br /> <span className="text-blue-500 italic">do dia a dia em minutos. Sem planilhas. Sem retrabalho.</span>
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed italic font-serif max-w-lg">
                Ferramentas simples e rápidas para contadores que precisam de agilidade no dia a dia.
              </p>
              
              <div className="relative max-w-2xl">
                <Search className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ex: recuperar NF-e, conciliar banco, fechar contabilidade..."
                  className="w-full bg-white/5 border border-white/10 rounded-[40px] pl-16 pr-6 py-7 text-white placeholder-slate-600 focus:ring-4 focus:ring-blue-600/20 focus:bg-white/10 outline-none transition-all text-xl font-bold tracking-tight" 
                />
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="flex flex-col gap-10 mb-20 bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-sm">
          
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Qual é a sua dor hoje?</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'xml', label: 'NF-e / XML', tag: 'xml' },
                { id: 'bank', label: 'Conciliação', tag: 'banco' },
                { id: 'closing', label: 'Fechamento', tag: 'fechamento' },
                { id: 'docs', label: 'Documentos', tag: 'docs' },
                { id: 'tax', label: 'Cálculo de Imposto', tag: 'imposto' },
                { id: 'sales', label: 'Vendas/Propostas', tag: 'vendas' },
                { id: 'recovery', label: 'Cobrança', tag: 'cobrança' }
              ].map(chip => (
                <button
                   key={chip.id}
                  onClick={() => setSearch(chip.label)}
                  className="px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-blue-100 transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-50">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Filter className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Categorias</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all",
                      selectedCategory === cat 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 text-slate-400">
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Modelos</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pricingModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedPricing(model.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all",
                      selectedPricing === model.id 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {model.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
           </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[64px] border-4 border-dashed border-slate-100">
             <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                <Box className="w-12 h-12 text-slate-300" />
             </div>
             <h3 className="text-3xl font-black text-slate-400 tracking-tighter">Nenhuma ferramenta <br />encontrada para este termo.</h3>
             <button 
              onClick={() => { setSearch(''); setSelectedCategory('Todas'); setSelectedPricing('all'); }}
              className="mt-6 text-blue-600 font-black uppercase text-xs tracking-widest hover:underline"
             >
                Limpar todos os filtros
             </button>
          </div>
        )}
      </div>

      {/* Safety message */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-12">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Dados segregados por usuário • Conformidade LGPD • Acesso controlado via Keycloak
        </p>
      </div>

      {/* Suggested Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
         <div className="bg-blue-600 rounded-[56px] p-12 md:p-20 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
               <Sparkles className="w-64 h-64" />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                    Deseja sugerir <br />uma nova MicroCaaS?
                  </h2>
                  <p className="text-xl text-blue-100 font-medium font-serif italic">
                    Nosso ecossistema cresce com o seu feedback. Se existe uma tarefa que você odeia fazer manualmente, nós podemos automatizá-la.
                  </p>
                  <Link to="/ideias" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-50 transition-all">
                    Sugerir Lançamento <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Checklists", count: "140+" },
                    { label: "Integrações", count: "25" },
                    { label: "Usuários", count: "3.2k" },
                    { label: "SLA Médio", count: "99.9%" }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                       <div className="text-2xl font-black mb-1">{stat.count}</div>
                       <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
