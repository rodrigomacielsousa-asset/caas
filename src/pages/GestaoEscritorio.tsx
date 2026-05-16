import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  BarChart3, 
  Search, 
  Filter, 
  Calendar,
  MoreVertical,
  Plus,
  ArrowRight,
  ChevronRight,
  Zap,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const TASKS = [
  { id: 1, title: 'Fechamento Fiscal - Cliente A', responsible: 'Diego S.', deadline: '2h restantes', status: 'In Progress', priority: 'High' },
  { id: 2, title: 'Abertura de Empresa - Prime', responsible: 'Cássio A.', deadline: 'Hoje', status: 'Pending', priority: 'Medium' },
  { id: 3, title: 'Revisão Societária', responsible: 'Ana B.', deadline: 'Amanhã', status: 'Done', priority: 'Low' },
  { id: 4, title: 'Conciliação Bancária Q1', responsible: 'Diego S.', deadline: '15/05', status: 'In Progress', priority: 'High' },
];

const TEAM = [
  { name: 'Diego S.', role: 'Senior Tax', status: 'Ocupado', tasks: 12, efficiency: 98 },
  { name: 'Cássio A.', role: 'Contador Jr.', status: 'Disponível', tasks: 4, efficiency: 92 },
  { name: 'Ana B.', role: 'RH Specialist', status: 'Férias', tasks: 0, efficiency: 85 },
];

export default function GestaoEscritorio() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'team'>('tasks');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Profile Area */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestão do Escritório</h1>
              <p className="text-sm font-medium text-slate-500">Controle operacional e produtividade em tempo real</p>
            </div>
            <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
               <button 
                onClick={() => setActiveTab('tasks')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeTab === 'tasks' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500"
                )}
               >Operacional</button>
               <button 
                onClick={() => setActiveTab('team')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeTab === 'team' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500"
                )}
               >Time & RH</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* KPIs bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
           {[
             { label: 'SLA Atual', val: '99.2%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
             { label: 'Ocupação do Time', val: '84%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Receita / Colab.', val: 'R$ 12k', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Tarefas em Atraso', val: '03', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
           ].map(k => (
             <div key={k.label} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
                <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center flex-shrink-0", k.bg)}>
                   <k.icon className={cn("w-7 h-7", k.color)} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{k.label}</p>
                   <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{k.val}</p>
                </div>
             </div>
           ))}
        </div>

        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {/* Left Board - Kanban style simple */}
             <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                     <Target className="w-5 h-5 text-blue-600" /> Backlog Ativo
                   </h2>
                   <div className="flex gap-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs" placeholder="Buscar tarefa..." />
                      </div>
                      <button className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100"><Plus className="w-4 h-4" /></button>
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                               <th className="px-8 py-5">Tarefa</th>
                               <th className="px-8 py-5">Responsável</th>
                               <th className="px-8 py-5">Deadline</th>
                               <th className="px-8 py-5">Status</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {TASKS.map(task => (
                               <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                                  <td className="px-8 py-6">
                                     <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{task.title}</span>
                                        <span className={cn(
                                          "text-[9px] font-black uppercase mt-1",
                                          task.priority === 'High' ? "text-rose-500" : "text-slate-400"
                                        )}>{task.priority} Priority</span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                     <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">{task.responsible[0]}</div>
                                        <span className="text-sm font-medium">{task.responsible}</span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                     <span className="text-sm text-slate-500">{task.deadline}</span>
                                  </td>
                                  <td className="px-8 py-6">
                                     <span className={cn(
                                       "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                                       task.status === 'In Progress' ? "bg-amber-100 text-amber-700" :
                                       task.status === 'Done' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                     )}>
                                       {task.status}
                                     </span>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>

             {/* Right Sidebar - Analytics & Tools */}
             <div className="space-y-8">
                <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                   <Zap className="w-32 h-32 absolute -right-8 -bottom-8 opacity-10" />
                   <div className="relative z-10">
                      <h3 className="text-xl font-bold mb-4 leading-tight">Insight Operacional</h3>
                      <p className="text-blue-100 text-sm mb-6 leading-relaxed">Diego finalizou 8 tarefas hoje antes do SLA. Sugerimos realocar o "Fechamento Cliente A" para ele.</p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold text-xs transition-all">
                        Ver Sugestões <ChevronRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                   <h3 className="font-bold mb-6 flex items-center gap-2">
                     <BarChart3 className="w-5 h-5 text-blue-600" /> Gargalos de Processo
                   </h3>
                   <div className="space-y-6">
                      <div>
                         <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                            <span>Abertura Societária</span>
                            <span>Crítico</span>
                         </div>
                         <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full w-[85%]" />
                         </div>
                         <p className="text-[10px] text-slate-500 mt-2">Média de 14 dias para finalização (ideal 7)</p>
                      </div>
                      <div>
                         <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                            <span>Fechamento Fiscal</span>
                            <span>Estável</span>
                         </div>
                         <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-[20%]" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {TEAM.map(member => (
               <motion.div 
                 key={member.name}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-xl transition-all"
               >
                  <div className="flex justify-between items-start mb-8">
                     <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[30px] flex items-center justify-center text-2xl font-black text-slate-300 dark:text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        {member.name[0]}
                     </div>
                     <span className={cn(
                       "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                       member.status === 'Disponível' ? "bg-emerald-50 text-emerald-600" :
                       member.status === 'Ocupado' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"
                     )}>
                       {member.status}
                     </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{member.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-8">{member.role}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pb-8 border-b border-slate-50 dark:border-slate-800 mb-8">
                     <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Carga Atual</span>
                        <span className="text-lg font-bold">{member.tasks} tasks</span>
                     </div>
                     <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Eficiência</span>
                        <span className="text-lg font-bold text-emerald-500">{member.efficiency}%</span>
                     </div>
                  </div>

                  <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-500 hover:text-blue-600 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                    Ver Timesheet <ArrowRight className="w-4 h-4" />
                  </button>
               </motion.div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
