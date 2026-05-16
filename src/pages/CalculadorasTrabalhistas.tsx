import React from 'react';
import { Calculator, Users, Clock } from 'lucide-react';

export default function CalculadorasTrabalhistas() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto shadow-xl"><Calculator className="w-10 h-10 text-blue-600" /></div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Calculadoras Trabalhistas</h1>
        <p className="text-slate-500 font-medium italic font-serif">Cálculo de rescisão, férias, décimo terceiro e FGTS.</p>
        <div className="p-8 bg-blue-600 rounded-[32px] text-white">
           <p className="font-bold">Em breve: Novos templates de cálculos rescisórios.</p>
        </div>
      </div>
    </div>
  );
}
