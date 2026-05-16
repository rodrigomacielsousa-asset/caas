import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, CheckCircle2, ShoppingCart, ArrowLeft, Zap, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import bundlesData from '../data/bundles.json';
import microcaasData from '../data/microcaas.json';
import { cn } from '../lib/utils';

export default function BundleDetail() {
  const { slug } = useParams();
  const bundle = bundlesData.find(b => b.slug === slug);
  const { addItem, items } = useCart();

  if (!bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Combo não encontrado</h2>
          <Link to="/microcaas" className="text-blue-600 font-bold hover:underline">Voltar ao Marketplace</Link>
        </div>
      </div>
    );
  }

  // Get full objects for items in this bundle
  const includedItems = microcaasData.filter(p => bundle.bundleItems.includes(p.slug));
  const isInCart = items.some(item => item.slug === bundle.slug);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-24">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 dark:from-blue-900/10 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <Link to="/microcaas" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Bundle Exclusivo
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Economia de 35%
                </span>
              </div>
              <h1 className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {bundle.name}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                {bundle.description}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">O que está incluído:</h3>
              <div className="grid grid-cols-1 gap-4">
                {includedItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Vantagens deste Bundle:</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Integração total garantida",
                    "Suporte prioritário MicroCaaS",
                    "Updates simultâneos",
                    "Licenciamento estendido"
                  ].map(v => (
                    <div key={v} className="flex items-center gap-2">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{v}</span>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>

          {/* Right: Sticky Action Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:sticky lg:top-24"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
              {/* Promo Decor */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rotate-45 translate-x-16 -translate-y-16 flex items-end justify-center pb-4">
                 <Sparkles className="w-6 h-6 text-white -rotate-45" />
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">R$ {bundle.price}</span>
                    <span className="text-slate-400 line-through text-lg font-bold">R$ {(bundle.price * 1.5).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mt-1">Pagamento único ou {bundle.price}/mês</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => addItem({
                    id: bundle.id,
                    slug: bundle.slug,
                    name: bundle.name,
                    price: bundle.price,
                    priceLabel: bundle.priceLabel,
                    type: 'bundle',
                    pricingModel: bundle.pricingModel as any
                  })}
                  disabled={isInCart}
                  className={cn(
                    "w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-lg shadow-lg",
                    isInCart 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:scale-[1.02]"
                  )}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {isInCart ? 'Já está no carrinho' : 'Adicionar este Bundle'}
                </button>
                <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Ativação imediata pós checkout
                </p>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Garantia de Satisfação 7 dias</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Certificado Homologado CaaS</span>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl space-y-3">
                 <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest">
                    <Heart className="w-4 h-4 fill-current" /> Combo Best-Seller
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                   Este pacote é a escolha preferida de +500 escritórios que iniciaram sua digitalização em 2025.
                 </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
