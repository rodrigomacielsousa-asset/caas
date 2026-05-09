import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

export default function SimuladorRegime() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto shadow-xl"><Zap className="w-10 h-10 text-indigo-600" /></div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Simulador de Regimes</h1>
        <p className="text-slate-500 font-medium italic font-serif">Simples Nacional vs Lucro Presumido vs Lucro Real.</p>
        <div className="p-8 bg-indigo-600 rounded-[32px] text-white">
           <p className="font-bold">Aguardando atualização das tabelas 2026.</p>
        </div>
      </div>
    </div>
  );
}
