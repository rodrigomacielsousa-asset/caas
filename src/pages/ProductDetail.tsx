import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  ShieldCheck, 
  Zap, 
  Star, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Globe,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import solucoesData from '../data/solucoes.json';
import microcaasData from '../data/microcaas.json';
import { cn } from '../lib/utils';
import type { Product, Solucao } from '../types';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Procurar em ambos os datasets
  const product = [...(solucoesData as any[]), ...(microcaasData as any[])].find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center space-y-6">
           <h2 className="text-4xl font-black text-slate-900 dark:text-white">Produto não encontrado.</h2>
           <Link to="/solucoes" className="btn-primary py-4 px-10 rounded-2xl font-bold flex items-center justify-center gap-2">
             <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
           </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Dynamic Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <Link to={product.ponto_de_entrada === 'MicroCaaS Community' ? '/microcaas' : '/solucoes'} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest mb-10">
              <ArrowLeft className="w-4 h-4" /> Voltar
           </Link>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{product.area}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.ponto_de_entrada}</span>
                 </div>
                 <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{product.name}</h1>
                 <p className="text-xl text-slate-500 font-medium leading-relaxed italic font-serif italic max-w-xl">{product.description}</p>
                 
                 <div className="flex flex-wrap gap-4 pt-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Star className="w-5 h-5 fill-current" /></div>
                       <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Popularidade</div>
                          <div className="text-lg font-black text-slate-900 dark:text-white">TOP Tier</div>
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                       <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600"><ShieldCheck className="w-5 h-5" /></div>
                       <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</div>
                          <div className="text-lg font-black text-emerald-600">Homologado</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-10"><Zap className="w-48 h-48 group-hover:scale-110 transition-transform duration-700" /></div>
                 <div className="relative z-10 space-y-8">
                    <div className="space-y-1">
                       <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Assinatura Mensal</div>
                       <div className="text-6xl font-black italic">R$ {product.price}</div>
                       <p className="text-xs text-slate-400">Ativação imediata pós-checkout. Cancele quando quiser.</p>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    <div className="space-y-4">
                       <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-200">Acesso Instantâneo Inclui:</h4>
                       <ul className="space-y-3">
                          <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dashboard Operacional Completo</li>
                          <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> API Gateway para Integração</li>
                          <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Update de Versões Perpétuo</li>
                       </ul>
                    </div>

                    <button 
                      onClick={handleAddToCart}
                      className="w-full bg-white text-slate-900 py-6 rounded-[28px] font-black text-xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-xl"
                    >
                       <ShoppingCart className="w-6 h-6" /> Adicionar à Carteira
                    </button>
                    
                    <button className="w-full text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Solicitar Demonstração Live</button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div className="space-y-12">
               <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Por que usar o <br />{product.name}?</h2>
               <div className="space-y-8">
                  <div className="flex gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0"><Sparkles className="w-6 h-6 text-indigo-600" /></div>
                     <div>
                        <h4 className="text-lg font-bold mb-2">Padrão de Qualidade MicroCaaS</h4>
                        <p className="text-slate-500 font-medium leading-relaxed italic font-serif">Esta solução segue os critérios de design 'Swiss-Tech' e modularidade 'CaaS-Spec' da nossa governança operacional.</p>
                     </div>
                  </div>
                  <div className="flex gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0"><Globe className="w-6 h-6 text-indigo-600" /></div>
                     <div>
                        <h4 className="text-lg font-bold mb-2">Cloud Ready Nativo</h4>
                        <p className="text-slate-500 font-medium leading-relaxed italic font-serif">Seus dados são armazenados de forma segregada e escalável, prontos para lidar com picos sazonais (como IR ou encerramento de balanços).</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[56px] p-16 border border-slate-200 dark:border-slate-800 shadow-sm space-y-12">
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight">O que dizem os contadores</h3>
                  <div className="flex gap-1 text-amber-400"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
               </div>
               
               <blockquote className="space-y-6">
                  <p className="text-xl text-slate-600 font-medium italic leading-relaxed">"O {product.name} mudou a forma como lidamos com as demandas desse setor. O retorno sobre o investimento foi de menos de 15 dias."</p>
                  <footer className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-300">RC</div>
                     <div>
                        <cite className="not-italic font-bold text-slate-900 dark:text-white">Ricardo Carvalho</cite>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sócio-diretor Nexus Contabilidade</p>
                     </div>
                  </footer>
               </blockquote>
            </div>
         </div>
      </div>
    </div>
  );
}
