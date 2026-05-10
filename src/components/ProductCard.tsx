import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Zap, Play, ShoppingCart, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Product } from '../types';
import { useCart } from '../hooks/useCart';

interface CardProps {
  product?: Product;
  item?: Product;
  type?: 'solucao' | 'micro' | 'bundle';
}

export const ProductCard: React.FC<CardProps> = ({ product, item, type = 'solucao' }) => {
  const finalProduct = (product || item) as Product;
  
  if (!finalProduct) return null;

  const { addItem, items: cartItems } = useCart();
  const navigate = useNavigate();
  const isBeta = finalProduct.status === 'beta';
  const isSoon = finalProduct.status === 'em_breve';
  const isInCart = cartItems.some(i => i.slug === finalProduct.slug);
  
  const detailPath = type === 'solucao' ? `/solucao/${finalProduct.slug}` : 
                    type === 'bundle' ? `/bundle/${finalProduct.slug}` :
                    `/micro/${finalProduct.slug}`;

  const isInternalApp = finalProduct.liveUrl?.startsWith('/');
  const finalPath = isInternalApp ? finalProduct.liveUrl : detailPath;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: finalProduct.id,
      slug: finalProduct.slug,
      name: finalProduct.name,
      price: finalProduct.price,
      priceLabel: finalProduct.priceLabel,
      type: type === 'bundle' ? 'bundle' : 'individual',
      pricingModel: finalProduct.pricingModel,
      checkoutUrl: finalProduct.checkoutUrl
    });
  };

  const renderActionButton = () => {
    if (isSoon) {
      return (
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
          Em breve
        </span>
      );
    }

    if (isInternalApp) {
      return (
        <Link 
          to={finalProduct.liveUrl || '#'} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Play className="w-3 h-3 fill-current" /> Acessar
        </Link>
      );
    }

    if (finalProduct.pricingModel === 'free') {
      return (
        <a 
          href={finalProduct.liveUrl || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5"
        >
          <Play className="w-3 h-3 fill-current" /> Acessar
        </a>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link 
          to={finalPath}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <Play className="w-3 h-3 fill-current" /> Testar Grátis
        </Link>
      </div>
    );
  };

  const getPricingLabel = () => {
    switch (finalProduct.pricingModel) {
      case 'free': return 'Gratuito';
      case 'one_time': return 'Pagamento Único';
      case 'subscription': return 'Assinatura';
      default: return 'Consultar';
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 relative overflow-hidden">
      <div className="flex justify-between items-start mb-5">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
          type === 'solucao' ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-50 text-slate-600 border border-slate-100"
        )}>
          {finalProduct.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tight",
            isSoon ? "bg-slate-100 text-slate-500" :
            isBeta ? "bg-emerald-100 text-emerald-700" :
            finalProduct.status === 'active' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
          )}>
            {finalProduct.statusBadge}
          </span>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{getPricingLabel()}</span>
        </div>
      </div>

      <div className="flex-grow">
        <Link to={finalPath} className="block group/title">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 group-hover/title:text-indigo-600 transition-colors">
            {finalProduct.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {finalProduct.description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Investimento</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {finalProduct.priceLabel}
          </span>
        </div>
        {renderActionButton()}
      </div>
    </div>
  );
};
