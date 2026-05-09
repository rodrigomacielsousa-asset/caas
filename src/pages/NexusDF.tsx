import React, { useState } from 'react';
import { 
  BarChart3, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  FileText, 
  Users, 
  Clock, 
  Search, 
  Plus,
  ArrowRight,
  TrendingDown,
  ChevronDown,
  LayoutDashboard,
  Zap,
  Globe,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const NEXUS_STATS = [
  { label: 'Empresas Ativas', val: '42', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Processos Q1', val: '1.250', icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Uptime Global', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Alertas Fiscais', val: '04', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
];

export default function NexusDF() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Sidebar-like layout header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <Link to="/dashboard" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                       <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">N</div>
                    <h1 className="text-3xl font-black tracking-tighter">Nexus.DF</h1>
                 </div>
                 <p className="text-indigo-200/60 font-medium max-w-xl">Controladoria e Gestão Societária de Alta Performance para empresas do Distrito Federal.</p>
              </div>
              <div className="flex gap-3">
                 <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-xl">Configurações</button>
                 <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/50">Novo Processo</button>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {NEXUS_STATS.map(stat => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={stat.label} 
                className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-6"
              >
                 <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center flex-shrink-0", stat.bg)}>
                    <stat.icon className={cn("w-7 h-7", stat.color)} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{stat.val}</p>
                 </div>
              </motion.div>
            ))}
         </div>

         <div className="py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" /> Processos em Andamento
                  </h3>
                  <button className="text-xs font-bold text-indigo-600 hover:underline">Ver todos</button>
               </div>

               <div className="space-y-4">
                  {[
                    { id: 1, title: 'Alteração Contratual - Holding X', step: 'Junta Comercial', progress: 75, status: 'Em Análise' },
                    { id: 2, title: 'Encerramento - Empresa ABC', step: 'Receita Federal', progress: 40, status: 'Aguardando Documento' },
                    { id: 3, title: 'Abertura de Filial - Tech LTDA', step: 'Criação de Contrato', progress: 15, status: 'Draft' },
                  ].map(process => (
                    <div key={process.id} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 hover:border-indigo-200 transition-all group">
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-4 flex-1">
                             <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-all">{process.title}</h4>
                             <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><LayoutDashboard className="w-3 h-3" /> {process.step}</span>
                                <span className={cn(
                                  "px-2 py-0.5 rounded",
                                  process.status === 'Em Análise' ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                                )}>{process.status}</span>
                             </div>
                          </div>
                          <div className="w-full md:w-32 space-y-2">
                             <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                <span>Progresso</span>
                                <span>{process.progress}%</span>
                             </div>
                             <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${process.progress}%` }} />
                             </div>
                          </div>
                          <button className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 rounded-xl transition-all group-hover:bg-indigo-600 group-hover:text-white">
                             <ChevronDown className="w-5 h-5 -rotate-90" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-8">
               <div className="p-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[40px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-20"><Zap className="w-32 h-32" /></div>
                  <div className="relative z-10 space-y-6">
                     <h3 className="text-2xl font-black leading-tight">Nexus Cloud <br /> Auditor Pro</h3>
                     <p className="text-indigo-100 text-sm leading-relaxed font-medium">Ativamos a auditoria cruzada automática em todos os processos. Sua segurança jurídica é nossa prioridade.</p>
                     <button className="flex items-center gap-2 text-xs font-bold bg-white text-indigo-600 px-6 py-3 rounded-2xl hover:scale-105 transition-all">
                        Upgrade Plano <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" /> Agenda Societária
                  </h3>
                  <div className="space-y-4">
                     {[
                       { date: '15 Mai', title: 'Assembleia Ordinária' },
                       { date: '22 Mai', title: 'Vencimento Taxas JUCE' },
                       { date: '30 Mai', title: 'Renovação Certificado Digital' },
                     ].map(item => (
                       <div key={item.title} className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer">
                          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
                             <span className="text-[10px] font-black leading-none">{item.date.split(' ')[0]}</span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase">{item.date.split(' ')[1]}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex-1 flex items-center">{item.title}</h4>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
