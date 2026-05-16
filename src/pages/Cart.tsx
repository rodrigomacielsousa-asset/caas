import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Zap, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { motion } from 'motion/react';
import bundlesData from '../data/bundles.json';
import { cn } from '../lib/utils';

export default function Cart() {
  const { items, removeItem, total } = useCart();

  const suggestedBundle = total > 50 ? bundlesData[0] : null;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-12 rounded-[40px] text-center max-w-md w-full border-2 border-dashed border-blue-200 dark:border-blue-800">
          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
             <ShoppingBag className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Seu carrinho está vazio</h2>
          <p className="text-slate-500 mb-8 font-medium">Explore nosso catálogo e encontre a solução ideal para seu escritório.</p>
          <Link
            to="/microcaas"
            className="btn-primary w-full py-4 text-lg"
          >
            Explorar Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Item List */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
              Meu Carrinho <span className="text-lg font-normal text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">{items.length}</span>
            </h1>
            <Link to="/microcaas" className="text-sm font-bold text-blue-600 hover:underline">Continuar comprando</Link>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex items-center gap-6"
              >
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                   {item.type === 'bundle' ? <Zap className="w-10 h-10 text-amber-500" /> : <ShoppingBag className="w-10 h-10 text-blue-600" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.type === 'bundle' ? 'Bundle' : 'Individual'}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{item.pricingModel}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{item.name}</h3>
                  <div className="mt-4 flex items-center gap-4 lg:hidden">
                     <span className="font-bold text-blue-600">{item.priceLabel}</span>
                     <button onClick={() => removeItem(item.id)} className="text-rose-500 font-bold text-xs">Remover</button>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-12">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Valor</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{item.priceLabel}</span>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Remover"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {suggestedBundle && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 bg-gradient-to-br from-blue-600 to-violet-700 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-8 opacity-20"><Sparkles className="w-32 h-32" /></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="max-w-md">
                     <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block italic">Proposta do Dia</span>
                     <h3 className="text-2xl font-bold mb-4 leading-tight">Que tal economizar mais com o {suggestedBundle.name}?</h3>
                     <p className="text-blue-100 text-sm">Este bundle já inclui alguns itens do seu carrinho e oferece ferramentas complementares por um preço muito menor do que avulsos.</p>
                  </div>
                  <Link 
                    to={`/bundle/${suggestedBundle.slug}`}
                    className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all text-center whitespace-nowrap"
                  >
                    Ver Oferta <ArrowRight className="w-4 h-4 inline ml-2" />
                  </Link>
               </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Resumo</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Instalação</span>
                  <span className="text-emerald-500 font-bold uppercase text-[10px] bg-emerald-50 px-2 py-1 rounded">Grátis</span>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 dark:text-white text-lg">Total</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-blue-600 tracking-tighter">R$ {total.toFixed(2)}</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Estimativa Anual</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  to="/checkout"
                  className="w-full btn-primary py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-lg shadow-lg shadow-blue-200"
                >
                  Ir para Pagamento
                  <ArrowRight className="w-6 h-6" />
                </Link>
                <div className="flex items-center justify-center gap-2 text-slate-400 py-2">
                   <ShieldCheck className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Ambiente 100% Seguro</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl flex gap-3">
                   <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                   <div>
                     <p className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-1 leading-tight">Nota Fiscal</p>
                     <p className="text-[10px] text-amber-700/80 leading-relaxed font-medium">Você receberá a NF-e de serviço no e-mail cadastrado em até 48h após a confirmação.</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-8 px-6 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                     <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Compra Garantida</h4>
                    <p className="text-[10px] text-slate-500">Homologado pelo Portal CaaS</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
