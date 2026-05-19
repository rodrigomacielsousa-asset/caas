import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { 
  Zap, 
  Shield, 
  CheckCircle2, 
  LayoutGrid, 
  FileText, 
  TrendingUp, 
  ArrowRight,
  ChevronRight,
  Star,
  Users,
  Clock,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { products } from '../data/products';

export default function LandingPage() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Gratuito (FREE)',
      price: 'R$ 0',
      features: ['2 Clientes', '10 Documentos/mês', 'ExtratoBR básico', 'Suporte Comunitário'],
      cta: 'Começar Agora',
      tier: 'free'
    },
    {
      name: 'Profissional (PRO)',
      price: 'R$ 297',
      period: '/mês',
      features: ['Clientes Ilimitados', 'Documentos Ilimitados', 'ReceiptorBR Premium', 'Fechamento Contábil Pro', 'Suporte Prioritário'],
      cta: 'Assinar Pro',
      highlight: true,
      tier: 'pro'
    },
    {
      name: 'Avançado (ADVANCED)',
      price: 'R$ 597',
      period: '/mês',
      features: ['Tudo do Pro', 'Finance Insight IA', 'Cobra AI (Cobrança Automática)', 'Gerente de Conta', 'API de Integração'],
      cta: 'Assinar Avançado',
      tier: 'advanced'
    },
    {
      name: 'Empresarial (ENTERPRISE)',
      price: 'Sob Consulta',
      period: '',
      features: ['Infraestrutura Dedicada', 'SLA Garantido', 'Customizações API', 'Suporte VIP 24/7', 'Treinamento In-company'],
      cta: 'Falar com Consultor',
      tier: 'enterprise'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full max-w-7xl px-8 py-8 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl">
               <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase dark:text-white">MicroCaaS</span>
         </div>
         <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">Recursos</a>
            <Link to="/login" className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Login</Link>
            <Link to="/signup" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:bg-slate-900 transition-all">Começar Grátis</Link>
         </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-7xl px-8 pt-32 pb-48 text-center space-y-10 relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
         
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-6"
         >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full border border-blue-100 dark:border-blue-800">
               <Star className="w-4 h-4 fill-blue-600" />
               <span className="text-[10px] font-black uppercase tracking-widest">O Futuro da Contabilidade</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none max-w-4xl mx-auto">
               Automatize seu escritório <span className="text-blue-600 underline decoration-blue-600/30">em minutos</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
               Receba, processe e feche a contabilidade dos seus clientes de forma totalmente automática com Inteligência Artificial.
            </p>
         </motion.div>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link to="/signup" className="w-full sm:w-80 px-10 py-6 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-200 dark:shadow-none hover:bg-slate-900 transition-all flex items-center justify-center gap-3 group">
               Começar Grátis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-64 px-10 py-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
               Ver Demonstração
            </a>
         </div>
      </section>

      {/* Benefits */}
      <section id="features" className="w-full max-w-7xl px-8 py-48 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
         {[
           { title: 'Redução de Trabalho', desc: 'Elimine tarefas repetitivas e manuais em até 90%.', icon: Clock },
           { title: 'Erro Zero', desc: 'IA que valida cada dado para garantir precisão absoluta.', icon: Shield },
           { title: 'Ganho de Tempo', desc: 'Foque no que importa enquanto nós processamos os documentos.', icon: Zap },
           { title: 'Maior Lucro', desc: 'Escale seu escritório sem precisar contratar mais gente.', icon: TrendingUp }
         ].map(b => (
           <div key={b.title} className="space-y-6">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-blue-600 shadow-xl border border-slate-100 dark:border-slate-800">
                 <b.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase dark:text-white">{b.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{b.desc}</p>
           </div>
         ))}
      </section>

      {/* Modules Showcase */}
      <section className="w-full bg-slate-900 py-48">
         <div className="max-w-7xl mx-auto px-8 space-y-24">
            <div className="text-center space-y-4">
               <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">A Suíte Completa</h2>
               <p className="text-5xl font-black text-white tracking-tighter">Um ecossistema, infinitos módulos.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
               {[...products].sort(() => Math.random() - 0.5).slice(0, 6).map(p => (
                 <div key={p.id} className="p-8 bg-slate-800 rounded-[32px] border border-slate-700/50 space-y-4 group hover:bg-blue-600 transition-all cursor-pointer">
                    <div className="text-slate-400 group-hover:text-white transition-colors">
                       <LayoutGrid className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-white tracking-widest italic">{p.name}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-100 dark:border-slate-800 py-20 px-8">
         <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900 font-bold">M</div>
               <span className="font-black uppercase tracking-tighter dark:text-white">MicroCaaS</span>
            </div>
            <div className="flex gap-10">
               <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600">Termos</a>
               <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600">Privacidade</a>
               <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600">Suporte</a>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© 2026 MicroCaaS Intelligence.</p>
         </div>
      </footer>
    </div>
  );
}

function Crown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
