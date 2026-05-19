import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Trash2, ArrowRight, Package, Sparkles } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { products } from '../data/products';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { cart, removeFromCart, isDrawerOpen, setIsDrawerOpen, addToCart, loading } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    navigate('/checkout');
  };

  // Recommendations: products that are not in cart
  const recommendations = products
    .filter(p => !cart.items.some(item => item.sku === p.slug) && p.status === 'active')
    .slice(0, 3);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Seu Carrinho</h2>
                  <p className="text-xs text-slate-500">{cart.items.length} itens selecionados</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <ShoppingCart size={40} />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold">Carrinho vazio</p>
                    <p className="text-sm text-slate-500">Adicione produtos para continuar</p>
                  </div>
                </div>
              ) : (
                cart.items.map((item, index) => (
                  <div key={`${item.sku}-${index}`} className="flex gap-4 group">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                      <Package size={24} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                      {item.metadata?.cnpj && (
                         <p className="text-[10px] text-blue-600 font-bold bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-1">
                           CNPJ: {item.metadata.cnpj}
                         </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-black text-slate-900">
                          {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <button 
                          onClick={() => removeFromCart(index)}
                          className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Recommendations */}
              <div className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-amber-500" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Quem comprou este também comprou</h3>
                </div>
                <div className="space-y-3">
                  {recommendations.map(p => (
                    <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">{p.category}</p>
                          <h4 className="text-xs font-bold text-slate-900 truncate">{p.subtitle}</h4>
                        </div>
                        <button 
                          onClick={() => addToCart({
                            sku: p.slug,
                            title: p.subtitle,
                            price: p.pricing.priceValue || 4.99,
                            metadata: {}
                          })}
                          className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-xl font-black text-slate-900">
                  {cart.totals.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <button
                disabled={cart.items.length === 0 || loading}
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-blue-200"
              >
                {loading ? 'Processando...' : 'Finalizar Compra'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-full text-slate-500 text-xs font-bold hover:text-slate-700 transition-colors"
              >
                Continuar navegando
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
