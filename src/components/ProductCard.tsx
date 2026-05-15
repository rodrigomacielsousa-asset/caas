import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ShoppingCart, ArrowRight, MessageSquare, Zap, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { useState, useEffect } from 'react';

interface CardProps {
  product: Product;
}

export const ProductCard: React.FC<CardProps> = ({ product }) => {
  const { items: cartItems } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('microcaas_favorites') || '[]');
    setIsFavorite(favorites.includes(product.id));
  }, [product.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('microcaas_favorites') || '[]');
    let newFavorites;
    if (favorites.includes(product.id)) {
      newFavorites = favorites.filter((id: string) => id !== product.id);
      setIsFavorite(false);
    } else {
      newFavorites = [...favorites, product.id];
      setIsFavorite(true);
    }
    localStorage.setItem('microcaas_favorites', JSON.stringify(newFavorites));
  };

  const detailPath = `/solucoes/${product.slug}`;
  const appPath = product.liveUrl || `/solucoes/${product.slug}`;

  return (
    <div className="group bg-white rounded-[2.5rem] border border-slate-200 p-8 flex flex-col shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden h-full">
      {/* Favorite Button */}
      <button 
        onClick={toggleFavorite}
        className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 flex items-center justify-center shadow-sm hover:scale-110 transition-all group/fav"
      >
        <Heart className={cn("w-5 h-5 transition-colors", isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-300 group-hover/fav:text-rose-400")} />
      </button>

      <div className="flex justify-between items-start mb-8 pr-12">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-black px-3 py-1 bg-slate-900 text-white rounded-full uppercase tracking-widest w-fit">
              {product.category}
            </span>
            {product.badges?.map(badge => (
              <span key={badge} className="text-[9px] font-black px-3 py-1 bg-blue-600 text-white rounded-full uppercase tracking-widest w-fit">
                {badge}
              </span>
            ))}
          </div>
          {product.modelBadge && (
             <span className={cn(
              "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight w-fit",
              product.modelBadge === 'PAGAMENTO ÚNICO' 
                ? "bg-rose-50 text-rose-600 border border-rose-100" 
                : product.modelBadge === 'GRATUITO' || product.modelBadge === 'DEMO'
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-blue-50 text-blue-600 border border-blue-100"
            )}>
              {product.modelBadge}
            </span>
          )}
        </div>
      </div>

      <div className="flex-grow">
        <div className="flex items-start gap-4 mb-4">
           <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-sm text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
            {(product.subtitle || product.name).substring(0, 2).toUpperCase()}
          </div>
          <div>
            <Link to={detailPath} className="block">
              <h3 className="font-black text-[22px] text-slate-900 group-hover:text-blue-600 transition-colors tracking-tighter leading-tight">
                {product.name}
              </h3>
            </Link>
            {product.subtitle && (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {product.subtitle}
              </p>
            )}
          </div>
        </div>
        
        {product.impactPhrase && (
          <div className="mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
            <span className="text-[9px] font-black text-blue-600/50 uppercase tracking-widest block mb-1">Impacto Previsto</span>
            <p className="text-[14px] font-bold text-slate-700 leading-relaxed font-sans">
              {product.impactPhrase}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 mb-8">
          {product.usageImpact && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
              </div>
              <span className="text-[11px] font-bold text-slate-500">{product.usageImpact}</span>
            </div>
          )}
          {product.integrationInfo && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[11px] font-bold text-slate-500">{product.integrationInfo}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-slate-100">
        <div className="flex items-end justify-between mb-8">
           <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Investimento</span>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {product.pricing.priceLabel}
            </span>
          </div>
          <Link 
            to={product.pricing.ctaAction === 'open_app' ? appPath : detailPath}
            className="group/btn relative bg-blue-600 hover:bg-slate-900 text-white text-[12px] font-black px-8 py-4 rounded-2xl transition-all uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2 active:scale-95"
          >
            {product.pricing.ctaAction === 'open_app' ? 'Ver exemplo real' : product.pricing.ctaText || 'Acessar'} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <Link 
          to={detailPath}
          className="w-full flex items-center justify-center py-4 text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.2em] transition-all border-2 border-slate-50 hover:border-blue-100 rounded-2xl"
        >
          Explorar Detalhes
        </Link>
      </div>

      {/* Decorative arrow background */}
      <div className="absolute -bottom-8 -right-8 opacity-0 group-hover:opacity-[0.03] transition-all duration-700 pointer-events-none group-hover:scale-150 rotate-[-15deg]">
        <ArrowRight className="w-64 h-64 text-blue-600" />
      </div>
    </div>
  );
};
