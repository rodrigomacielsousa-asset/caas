import React from 'react';
import { FileText, Send, CheckCircle2, Clock, Plus, ArrowRight } from 'lucide-react';

export default function PropostasContratos() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 sm:p-20">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
           <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter">Propostas & <span className="text-blue-600">Contratos.</span></h1>
              <p className="text-slate-500 font-medium italic font-serif">Gerenciamento do ciclo de vida comercial do seu escritório.</p>
           </div>
           <button className="btn-primary py-4 px-10 rounded-2xl font-bold flex items-center gap-2">
             <Plus className="w-5 h-5" /> Nova Proposta
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {[
             { label: 'Em Elaboração', count: 5, color: 'bg-slate-100 text-slate-500' },
             { label: 'Enviadas', count: 12, color: 'bg-amber-50 text-amber-600' },
             { label: 'Aprovadas', count: 48, color: 'bg-emerald-50 text-emerald-600' },
             { label: 'Perdidas', count: 3, color: 'bg-rose-50 text-rose-500' },
           ].map(stat => (
             <div key={stat.label} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${stat.color}`}>{stat.label}</span>
                <p className="text-4xl font-black mt-4">{stat.count}</p>
             </div>
           ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
           <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Documentos Recentes</h2>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <tr>
                       <th className="px-8 py-6">Cliente</th>
                       <th className="px-8 py-6">Tipo</th>
                       <th className="px-8 py-6">Data</th>
                       <th className="px-8 py-6">Status</th>
                       <th className="px-8 py-6"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { c: 'Lojas Americanas', t: 'Contrato de BPO', d: '10/05/2026', s: 'Aprovado' },
                      { c: 'Padaria do Zé', t: 'Proposta Honorários', d: '09/05/2026', s: 'Enviado' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer font-medium">
                         <td className="px-8 py-6 text-slate-900 dark:text-white font-bold">{row.c}</td>
                         <td className="px-8 py-6 text-sm text-slate-500">{row.t}</td>
                         <td className="px-8 py-6 text-sm text-slate-500">{row.d}</td>
                         <td className="px-8 py-6">
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-2 py-1 rounded",
                              row.s === 'Aprovado' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            )}>{row.s}</span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <button className="text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-all"><ArrowRight className="w-4 h-4" /></button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
