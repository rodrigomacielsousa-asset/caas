import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Filter, 
  Download, 
  ArrowRight, 
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
  { month: 'Fev', revenue: 52000, expenses: 31000, profit: 21000 },
  { month: 'Mar', revenue: 48000, expenses: 35000, profit: 13000 },
  { month: 'Abr', revenue: 61000, expenses: 38000, profit: 23000 },
  { month: 'Mai', revenue: 65000, expenses: 40000, profit: 25000 },
  { month: 'Jun', revenue: 72000, expenses: 42000, profit: 30000 },
];

const PIE_DATA = [
  { name: 'Honorários', value: 65 },
  { name: 'Consultoria', value: 20 },
  { name: 'BPO Financeiro', value: 15 },
];

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899'];

export default function ForecastRelatorios() {
  const [scenario, setScenario] = useState<'optimistic' | 'conservative'>('optimistic');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Forecast & Relatórios</h1>
              <p className="text-sm text-slate-500 font-medium">Análise preditiva e performance financeira em tempo real</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all">
                <Filter className="w-4 h-4" /> Filtros
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100">
                <Download className="w-4 h-4" /> Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Scenario Switcher */}
        <div className="flex items-center gap-4 mb-8 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
          <button 
            onClick={() => setScenario('optimistic')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              scenario === 'optimistic' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500"
            )}
          >
            <TrendingUp className="w-4 h-4" /> Cenário Otimista
          </button>
          <button 
            onClick={() => setScenario('conservative')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              scenario === 'conservative' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
            )}
          >
            <TrendingDown className="w-4 h-4" /> Cenário Conservador
          </button>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                 <BarChart3 className="w-5 h-5 text-blue-600" /> Fluxo de Caixa Projetado
               </h3>
               <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600" /> Receita</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> Despesas</span>
               </div>
            </div>
            
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `R$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#4f46e5', strokeWidth: 2 }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="space-y-8">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm"
             >
                <h3 className="font-bold flex items-center gap-2 mb-8">
                  <PieIcon className="w-5 h-5 text-blue-600" /> Canais de Receita
                </h3>
                <div className="h-64 relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={PIE_DATA}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {PIE_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">85%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Recorrente</span>
                   </div>
                </div>
                <div className="space-y-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                  {PIE_DATA.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                       </div>
                       <span className="text-sm font-black text-slate-800 dark:text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-gradient-to-br from-blue-600 to-violet-700 p-8 rounded-[32px] text-white shadow-xl"
             >
                <div className="flex items-center gap-3 mb-6">
                   <Target className="w-6 h-6 text-blue-200" />
                   <h3 className="font-bold">Meta do Trimestre</h3>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-blue-100">
                      <span>Progresso</span>
                      <span>72%</span>
                   </div>
                   <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '72%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                      />
                   </div>
                   <p className="text-[10px] text-blue-100 mt-4 leading-relaxed">Faltam **R$ 28.500** para atingir a meta de expansão do Q2.</p>
                </div>
             </motion.div>
          </div>
        </div>

        {/* Tactical Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
           {[
             { title: 'Taxa de Retenção', val: '94.2%', change: '+2.1%', up: true, desc: 'LTM Turnover' },
             { title: 'Ticket Médio', val: 'R$ 1.250', change: '+R$ 120', up: true, desc: 'Per month individual' },
             { title: 'Churn Proporcional', val: '0.8%', change: '-0.3%', up: true, desc: 'Monthly average' },
             { title: 'CAC / LTV', val: '1:6', change: 'Estável', up: true, desc: 'Eficiência de vendas' },
           ].map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.1 * i }}
               className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm"
             >
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{stat.title}</h4>
                <div className="flex items-baseline gap-2 mb-1">
                   <span className="text-2xl font-black text-slate-800 dark:text-white">{stat.val}</span>
                   {stat.change && (
                     <span className={cn(
                       "text-[10px] font-bold flex items-center",
                       stat.up ? "text-emerald-500" : "text-rose-500"
                     )}>
                       {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {stat.change}
                     </span>
                   )}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{stat.desc}</p>
             </motion.div>
           ))}
        </div>

        {/* Smart Recommendations */}
        <div className="mt-12 p-8 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 text-blue-600/10 group-hover:text-blue-600/20 transition-all">
              <Sparkles className="w-32 h-32" />
           </div>
           <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-[32px] flex items-center justify-center flex-shrink-0">
                 <Target className="w-10 h-10 text-blue-600" />
              </div>
              <div className="flex-1 space-y-4 text-center lg:text-left">
                 <h2 className="text-2xl font-black text-slate-800 dark:text-white">Insight da IA: Otimize seu Fluxo de Caixa</h2>
                 <p className="text-slate-500 max-w-xl font-medium leading-relaxed">
                   Detectamos que 45% do seu faturamento em Julho será de honorários fixos. Sugerimos antecipar o disparo das propostas de consultoria variável para manter a liquidez acima de 15%.
                 </p>
              </div>
              <button className="btn-primary py-4 px-10 rounded-2xl font-bold flex items-center gap-2 group whitespace-nowrap shadow-xl shadow-blue-100">
                Aplicar Estratégia <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
