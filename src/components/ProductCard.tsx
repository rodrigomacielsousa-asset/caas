import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Zap, Heart, CheckCircle, Star, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Product } from '../types';
import { useCart } from '../hooks/useCart';

interface CardProps {
  product: Product;
}

export const ProductCard: React.FC<CardProps> = ({ product }) => {
  const { addItem, items } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating] = useState(() => Math.floor(Math.random() * (5 - 4 + 1) + 4)); // 4-5 stars
  const [reviews] = useState(() => Math.floor(Math.random() * (200 - 20 + 1) + 20));

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
  const isInCart = items.some(i => i.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.pricing.priceValue,
      priceLabel: product.pricing.priceLabel,
      pricingModel: product.pricingModel,
      type: 'individual'
    });
  };

  return (
    <div className="group bg-white rounded-[2.5rem] border border-slate-200 p-8 flex flex-col shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden h-full">
      {/* Favorite Button */}
      <button 
        onClick={toggleFavorite}
        className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 flex items-center justify-center shadow-sm hover:scale-110 transition-all group/fav"
      >
        <Heart className={cn("w-5 h-5 transition-colors", isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-300 group-hover/fav:text-rose-400")} />
      </button>

      <div className="flex justify-between items-start mb-6 pr-12">
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
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("w-3 h-3", i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400">({reviews} avaliações)</span>
          </div>
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
        
        <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-6 leading-relaxed">
          {product.shortDescription}
        </p>

        <div className="flex flex-col gap-3 mb-8">
          {product.usageImpact && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
              </div>
              <span className="text-[11px] font-bold text-slate-500">{product.usageImpact}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-500">Homologado & Seguro 2026</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="flex flex-col mb-6">
           <div className="flex items-baseline justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Preço</span>
                <span className="text-[28px] font-black text-slate-900 tracking-tight leading-none">
                  {product.pricing.priceLabel}
                </span>
              </div>
              {product.pricingModel !== 'free' && (
                <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-right flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Compra Segura
                </div>
              )}
           </div>
        </div>

        <div className="flex flex-col gap-3">
            {product.pricingModel !== 'free' && (
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={cn(
                  "relative text-[12px] font-black px-8 py-5 rounded-2xl transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95",
                  isInCart 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                    : "bg-blue-600 hover:bg-slate-900 text-white shadow-blue-100"
                )}
              >
                {isInCart ? (
                  <>No Carrinho <CheckCircle className="w-4 h-4" /></>
                ) : (
                  <>Comprar Agora <ShoppingCart className="w-4 h-4" /></>
                )}
              </button>
            )}
            
            <Link 
              to={product.pricing.ctaAction === 'open_app' ? appPath : detailPath}
              className={cn(
                "group/btn relative text-[12px] font-black px-8 py-5 rounded-2xl transition-all uppercase tracking-widest shadow-sm flex items-center gap-2 active:scale-95 justify-center",
                product.pricingModel === 'free' 
                  ? "bg-blue-600 hover:bg-slate-900 text-white shadow-blue-100"
                  : "bg-white border-2 border-slate-100 text-slate-900 hover:border-blue-600"
              )}
            >
              {product.pricing.ctaAction === 'open_app' 
                ? (product.pricingModel === 'free' ? 'Testar Agora' : 'Acessar APP') 
                : (product.pricing.ctaText || 'Ver Detalhes')} 
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-8 -right-8 opacity-0 group-hover:opacity-[0.03] transition-all duration-700 pointer-events-none group-hover:scale-150 rotate-[-15deg]">
        <ArrowRight className="w-64 h-64 text-blue-600" />
      </div>
    </div>
  );
};
