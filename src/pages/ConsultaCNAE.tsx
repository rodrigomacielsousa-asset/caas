import React, { useState } from 'react';
import { Search, Zap, ArrowRight, Info, CheckCircle2 } from 'lucide-react';

export default function ConsultaCNAE() {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 sm:p-20">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-6 text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <Search className="w-3 h-3" /> Optimizer Tool
           </div>
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Consulta de CNAE <br /><span className="text-indigo-600">Inteligente.</span></h1>
           <p className="text-lg text-slate-500 font-medium font-serif italic">Identifique os códigos ideais para cada atividade e evite bitributação.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8">
           <div className="relative">
              <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Ex: Desenvolvimento de Software"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] pl-16 pr-8 py-6 text-xl font-bold shadow-inner" 
              />
           </div>

           <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[32px] text-center border border-slate-100 dark:border-slate-700">
              <p className="text-slate-400 font-bold italic">Digite o nome da atividade ou código para análise em tempo real.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 bg-indigo-600 rounded-[40px] text-white space-y-4">
              <Zap className="w-8 h-8" />
              <h3 className="text-xl font-bold">Dica de Enquadramento</h3>
              <p className="text-indigo-100 text-sm leading-relaxed font-bold">Sempre verifique a compatibilidade do CNAE com o Simples Nacional (Anexos III vs V).</p>
           </div>
           <div className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 space-y-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Base CONCLA 2.3</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-bold">Dados atualizados diariamente com a base oficial do IBGE/Receita Federal.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
