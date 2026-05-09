import React from 'react';
import { DollarSign } from 'lucide-react';

export default function SimuladorHonorarios() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto shadow-xl"><DollarSign className="w-10 h-10 text-indigo-600" /></div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Simulador de Honorários</h1>
        <p className="text-slate-500 font-medium italic font-serif">Precifique seus serviços contábeis com base em custos e margem.</p>
        <div className="p-8 bg-indigo-600 rounded-[32px] text-white">
           <p className="font-bold">Calculadora baseada em tempo de execução e complexidade.</p>
        </div>
      </div>
    </div>
  );
}
