import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  ArrowUpRight, 
  BarChart3, 
  Zap, 
  MousePointer2, 
  Clock,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Paywall from '../components/growth/Paywall';

export default function GrowthDashboard() {
  const [user] = useAuthState(auth);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchMetrics = async () => {
      try {
        const snap = await getDocs(collection(db, 'userMetrics'));
        const data = snap.docs.map(d => d.data());
        setMetrics(data);
        setTotalUsers(data.length);
        setActiveUsers(data.filter((u: any) => u.funnelStage !== 'visitante').length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const funnelStats = {
    free: metrics.filter(m => m.funnelStage === 'usuario_free').length,
    active: metrics.filter(m => m.funnelStage === 'usuario_ativo').length,
    paying: metrics.filter(m => m.funnelStage === 'usuario_pagante' || m.funnelStage === 'usuario_premium').length,
  };

  if (!user) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8 text-slate-900">
      <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
        <Users className="w-16 h-16 text-slate-200 mx-auto" />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Acesso Restrito</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">Área exclusiva para administradores e estrategistas do ecossistema.</p>
        <Link to="/login" className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all">Fazer Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 sm:p-20">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                 <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                 <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">Painel de Crescimento</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic shadow-sm">Métricas de Conversão e Retenção SaaS</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Total Usuários', val: totalUsers, icon: Users, color: 'text-indigo-600' },
             { label: 'Usuários Ativos', val: activeUsers, icon: Zap, color: 'text-amber-500' },
             { label: 'MRR Projetado', val: `R$ ${(funnelStats.paying * 199).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
             { label: 'Taxa de Conversão', val: `${Math.round((funnelStats.paying / totalUsers) * 100 || 0)}%`, icon: Target, color: 'text-rose-500' }
           ].map(s => (
             <div key={s.label} className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                   <s.icon className={cn("w-6 h-6", s.color)} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{s.label}</p>
                   <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">{s.val}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[56px] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2 underline decoration-indigo-600/30 underline-offset-4">Funil de Conversão</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Visualizaram', count: totalUsers, color: 'bg-slate-100', width: '100%' },
                   { label: 'Cadastrados (Free)', count: funnelStats.free, color: 'bg-indigo-100', width: `${(funnelStats.free / totalUsers) * 100}%` },
                   { label: 'Ativos', count: funnelStats.active, color: 'bg-indigo-300', width: `${((funnelStats.active) / totalUsers) * 100}%` },
                   { label: 'Pagantes', count: funnelStats.paying, color: 'bg-indigo-600', width: `${(funnelStats.paying / totalUsers) * 100}%`, text: 'text-white' }
                 ].map(f => (
                   <div key={f.label} className="relative h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden group">
                      <div className={cn("absolute inset-y-0 left-0 transition-all duration-1000", f.color)} style={{ width: f.width }} />
                      <div className="absolute inset-0 flex justify-between items-center px-6 relative z-10">
                         <span className={cn("text-xs font-black uppercase italic tracking-widest", f.text || "text-slate-900 dark:text-white")}>{f.label}</span>
                         <span className={cn("text-lg font-black italic", f.text || "text-slate-900 dark:text-white")}>{f.count}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[48px] p-10 text-white space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150"><BarChart3 className="w-64 h-64 text-indigo-400" /></div>
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic relative z-10">Produtos Populares</h3>
              <div className="space-y-6 relative z-10">
                 {[
                   { name: 'ExtratoBR', usage: '82%' },
                   { name: 'ReceiptorBR', usage: '64%' },
                   { name: 'Finance Insight', usage: '42%' },
                   { name: 'Cobra AI', usage: '31%' }
                 ].map(p => (
                   <div key={p.name} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-xs font-black uppercase italic italic">{p.name}</span>
                         <span className="text-[10px] font-mono text-indigo-400">{p.usage}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 rounded-full" style={{ width: p.usage }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
