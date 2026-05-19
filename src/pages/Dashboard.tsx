import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Settings, 
  ExternalLink, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  Filter,
  User as UserIcon,
  Zap,
  LayoutGrid,
  Mail,
  ArrowRight,
  Crown,
  ChevronRight,
  ShieldCheck,
  Star,
  Lock
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { planService, UserPlan } from '../services/planService';
import { products } from '../data/products';
import { cn } from '../lib/utils';
import { Link, useSearchParams } from 'react-router-dom';
import { createCheckoutSession } from '../services/checkoutService';
import { STRIPE_PRICES } from '../config';
import { SmartSuggestions } from '../components/SmartSuggestions';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const plan = await planService.getUserPlan(u.uid);
        setUserPlan(plan);

        // Auto-checkout if plan requested from landing/pricing
        const requestedPlan = searchParams.get('plan');
        if (requestedPlan && requestedPlan !== plan?.tier && requestedPlan !== 'free') {
           const priceId = requestedPlan === 'pro' ? STRIPE_PRICES.PRO : (requestedPlan === 'advanced' ? STRIPE_PRICES.ADVANCED : null);
           if (priceId) {
              createCheckoutSession(u.uid, u.email || '', priceId, requestedPlan);
           }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
           <Zap className="w-12 h-12 text-blue-600 mb-4" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Configurando seu cockpit...</p>
        </div>
      </div>
    );
  }

  const accessibleProducts = products.filter(p => 
    userPlan?.activeModules.includes(p.slug) || userPlan?.tier === 'black'
  );

  const lockedProducts = products.filter(p => 
    !userPlan?.activeModules.includes(p.slug) && userPlan?.tier !== 'black' && p.status === 'active'
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Profile Area */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-blue-600 rounded-[36px] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-100 dark:shadow-none relative">
                 {user?.email?.[0]?.toUpperCase()}
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-slate-900 shadow-lg">
                    <Crown className="w-5 h-5" />
                 </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                      Comandante {user?.email?.split('@')[0]}
                   </h1>
                   <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                      Plano {userPlan?.tier}
                   </span>
                </div>
                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {user?.email}</span>
                   <span className="flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5" /> {accessibleProducts.length} Módulos Ativos</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
               <button className="flex items-center gap-2 px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-slate-900 dark:text-white">
                  <Settings className="w-4 h-4" /> Configs
               </button>
               {userPlan?.tier === 'free' && (
                 <Link to="/pricing" className="flex items-center gap-2 px-8 py-4 bg-amber-400 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-100 hover:bg-slate-900 hover:text-white transition-all group">
                    <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" /> Upgrade Pro
                 </Link>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
           <SmartSuggestions userId={user?.uid || ''} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter uppercase">
                Meus Sistemas <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full not-italic tracking-widest">{accessibleProducts.length}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {accessibleProducts.map((p) => (
                 <motion.div
                  whileHover={{ y: -8 }}
                  key={p.id}
                  className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-100 dark:hover:shadow-none transition-all group relative overflow-hidden"
                 >
                   <div className="absolute top-0 right-0 p-8 opacity-5 -translate-y-4 translate-x-4"><Zap className="w-32 h-32" /></div>
                   
                   <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                         <LayoutGrid className="w-8 h-8" />
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">Ativo</span>
                   </div>

                   <div className="space-y-2 relative z-10">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">{p.name}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">{p.shortDescription}</p>
                   </div>
                   
                   <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronizado</span>
                      </div>
                      <Link 
                        to={p.liveUrl || `/solucoes/${p.slug}`}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 group/btn"
                      >
                        Abrir Sistema <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                   </div>
                 </motion.div>
               ))}
            </div>

            {lockedProducts.length > 0 && (
              <div className="space-y-8 pt-12">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 underline decoration-blue-600/30 underline-offset-4">
                    Sugestões de Expansão
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    {lockedProducts.map(p => (
                      <div key={p.id} className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300"><Lock className="w-5 h-5" /></div>
                            <div>
                               <p className="text-xs font-black uppercase italic dark:text-white">{p.name}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Módulo Premium</p>
                            </div>
                         </div>
                         <Link to="/pricing" className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white transition-all"><ArrowRight className="w-4 h-4" /></Link>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>

          <div className="space-y-12">
            <div className="bg-slate-950 rounded-[56px] p-12 text-white space-y-10 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 scale-150"><Zap className="w-64 h-64" /></div>
               
               <div className="space-y-4 relative z-10">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Hub da Empresa</h4>
                  <p className="text-3xl font-black tracking-tighter leading-none">Status da <br /> Organização</p>
               </div>

               <div className="space-y-6 relative z-10">
                  {[
                    { label: 'Saúde Contábil', val: '92%', icon: ShieldCheck, color: 'text-emerald-400' },
                    { label: 'Doc. Pendentes', val: '12', icon: Clock, color: 'text-amber-400' },
                    { label: 'Eficiência IA', val: '84%', icon: Zap, color: 'text-blue-400' }
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                       <div className="flex items-center gap-4">
                          <s.icon className={cn("w-5 h-5", s.color)} />
                          <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-400">{s.label}</span>
                       </div>
                       <span className="text-sm font-black italic">{s.val}</span>
                    </div>
                  ))}
               </div>

               <button className="w-full py-6 bg-white text-slate-900 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl relative z-10">
                  Ver Relatórios Hub
               </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 space-y-8">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 shadow-sm"><Star className="w-4 h-4 text-amber-400" /> Benefícios do Plano</h4>
               <div className="space-y-4">
                  {userPlan?.limits && (
                    <>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">Clientes</span>
                            <span className="text-slate-900 dark:text-white">Uso: 0 / {userPlan.limits.clients}</span>
                         </div>
                         <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full w-2" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">Documentos</span>
                            <span className="text-slate-900 dark:text-white">Uso: 0 / {userPlan.limits.docsPerMonth}</span>
                         </div>
                         <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-2" />
                         </div>
                      </div>
                    </>
                  )}
               </div>
               <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase italic">
                  Renovação automática em {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
