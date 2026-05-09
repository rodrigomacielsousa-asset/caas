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
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const ACCOUNTS_PAYABLE = [
  { id: 1, title: 'Aluguel - Escritório Central', category: 'Infraestrutura', due: '05/05/2026', amount: 8500.00, status: 'Aguardando Aprovação', author: 'Cássio A.' },
  { id: 2, title: 'Amazon AWS - Cloud', category: 'Tecnologia', due: '10/05/2026', amount: 1250.40, status: 'Aprovado', author: 'Diego S.' },
  { id: 3, title: 'Papelaria & Insumos', category: 'Administrativo', due: '02/05/2026', amount: 320.15, status: 'Vencido', author: 'Ana B.' },
  { id: 4, title: 'Honorários Advocatícios', category: 'Legal', due: '12/05/2026', amount: 2500.00, status: 'Agendado', author: 'Cássio A.' },
  { id: 5, title: 'Energia Elétrica', category: 'Infraestrutura', due: '08/05/2026', amount: 1100.50, status: 'Pendente', author: 'Sistema' },
];

const COST_CENTERS = [
  { name: 'Operação', budget: 50000, current: 42000 },
  { name: 'Marketing', budget: 15000, current: 12500 },
  { name: 'Tecnologia', budget: 25000, current: 28000 },
  { name: 'RH', budget: 10000, current: 8000 },
];

export default function APInteligente() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AP Inteligente</h1>
                <p className="text-sm text-slate-500">Gestão Autônoma de Contas a Pagar</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-indigo-200 shadow-lg">
                 <Plus className="w-4 h-4" /> Nova Conta
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metas/KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+12% vs mês ant.</span>
            </div>
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total a Pagar</h3>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">R$ 138.450,20</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Aguardando Alçada</h3>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">08 <span className="text-sm font-normal text-slate-400">títulos</span></div>
            <button className="text-xs text-indigo-600 font-bold mt-2 hover:underline">Ver aprovações</button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl">
                <TrendingDown className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Em Atenção</h3>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">03 <span className="text-sm font-normal text-slate-400">duplicadas</span></div>
            <p className="text-[10px] text-slate-500 mt-2">Deteção por IA Inteligente</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Taxa de Automação</h3>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">92%</div>
            <p className="text-[10px] text-slate-500 mt-2">Lançamentos via OCR</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Board */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="font-bold">Quadro de Títulos</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar título..."
                      className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4">Fornecedor / Título</th>
                      <th className="px-6 py-4">Vencimento</th>
                      <th className="px-6 py-4">Valor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Alçada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ACCOUNTS_PAYABLE.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{item.title}</span>
                            <span className="text-[10px] text-slate-400">{item.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-medium">{item.due}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 dark:text-white">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                            item.status === 'Aprovado' ? "bg-emerald-100 text-emerald-700" :
                            item.status === 'Vencido' ? "bg-rose-100 text-rose-700" :
                            item.status === 'Agendado' ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                              {item.author.split(' ')[0][0]}
                            </div>
                            <span className="text-xs text-slate-500">{item.author}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-indigo-200" />
                    <h3 className="font-bold">IA Workflow</h3>
                 </div>
                 <p className="text-indigo-100 text-sm mb-6">Processamos 45 novos e-mails hoje. 42 foram classificados automaticamente para o fluxo de aprovação.</p>
                 <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold text-xs transition-all">
                    Revisar Pendentes <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                 <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <h3 className="font-bold">Equipe Contábil</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">D</div>
                        <span className="text-sm font-bold">Diego S.</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">12 tickets abertos</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">C</div>
                        <span className="text-sm font-bold">Cássio A.</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">03 tickets abertos</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" /> Centro de Custo
              </h3>
              <div className="space-y-6">
                {COST_CENTERS.map(center => (
                   <div key={center.name}>
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                        <span>{center.name}</span>
                        <span>{((center.current / center.budget) * 100).toFixed(0)}%</span>
                     </div>
                     <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            center.current > center.budget ? "bg-rose-500" : "bg-indigo-600"
                          )}
                          style={{ width: `${Math.min((center.current / center.budget) * 100, 100)}%` }}
                        />
                     </div>
                     <div className="flex justify-between mt-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">R$ {center.current.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">R$ {center.budget.toLocaleString()} bud.</span>
                     </div>
                   </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold mb-6">Alertas da Compliance</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Duplicidade na Amazon AWS</h5>
                    <p className="text-xs text-slate-500 mt-1">Detectamos dois títulos com o mesmo número de fatura em datas diferentes.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">SLA de Aprovação Vencendo</h5>
                    <p className="text-xs text-slate-500 mt-1">Honorários Advocatícios aguarda aprovação há mais de 48 horas.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
