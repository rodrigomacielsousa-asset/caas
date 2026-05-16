import React from 'react';
import { 
  Zap, 
  Crown, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface PaywallProps {
  title: string;
  description: string;
  limitReached?: boolean;
  onUpgrade?: () => void;
}

export default function Paywall({ title, description, limitReached = false, onUpgrade }: PaywallProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-[56px] border-2 border-dashed border-blue-100 dark:border-blue-900/30 text-center space-y-8 shadow-2xl shadow-blue-100/50">
       <div className="relative">
          <div className="w-24 h-24 bg-blue-600 rounded-[40px] flex items-center justify-center text-white shadow-2xl rotate-3">
             <Crown className="w-12 h-12" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 shadow-lg -rotate-12 animate-bounce">
             <Zap className="w-6 h-6" />
          </div>
       </div>

       <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
             {limitReached ? 'Limite de Uso Atingido' : 'Recurso Premium'}
          </h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
             {description || 'Faça o upgrade para o plano Pro e desbloqueie todo o potencial deste módulo.'}
          </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
          {[
            { label: 'Acesso Ilimitado', icon: CheckCircle2 },
            { label: 'Suporte Prioritário', icon: Star },
            { label: 'Exportação Premium', icon: TrendingUp },
            { label: 'Segurança Enterprise', icon: ShieldCheck }
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
               <f.icon className="w-4 h-4 text-blue-600" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{f.label}</span>
            </div>
          ))}
       </div>

       <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
          <Link 
            to="/checkout?plan=pro"
            className="flex-1 px-8 py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:bg-slate-900 transition-all flex items-center justify-center gap-3 group"
          >
             Fazer Upgrade Agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
             Voltar
          </button>
       </div>

       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
          Garante acesso a todos os módulos modularizados do ecossistema.
       </p>
    </div>
  );
}
