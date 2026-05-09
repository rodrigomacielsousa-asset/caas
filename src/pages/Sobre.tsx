import React from 'react';
import { Target, Users, Zap, Globe, ShieldCheck, Rocket } from 'lucide-react';
import { motion } from 'motion/react';

export default function Sobre() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="bg-slate-900 py-32 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-full bg-indigo-600/20 blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
           <h1 className="text-6xl md:text-8xl font-black tracking-tighter">Nosso Manifesto.</h1>
           <p className="text-xl md:text-2xl text-indigo-100/60 max-w-3xl mx-auto font-serif italic italic leading-relaxed">
             Acreditamos que a contabilidade não deve ser um monólito pesado, mas um ecossistema de soluções cirúrgicas.
           </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
               <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">O que nos move?</h2>
               <div className="space-y-8">
                  <div className="flex gap-6">
                     <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shrink-0 text-indigo-600"><Target className="w-7 h-7" /></div>
                     <div>
                        <h4 className="text-xl font-bold mb-2">Simplicidade Radical</h4>
                        <p className="text-slate-500 font-medium font-serif italic leading-relaxed">Eliminamos o excesso de camadas. Queremos que você resolva um problema específico em menos de 3 cliques.</p>
                     </div>
                  </div>
                  <div className="flex gap-6">
                     <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shrink-0 text-indigo-600"><Users className="w-7 h-7" /></div>
                     <div>
                        <h4 className="text-xl font-bold mb-2">Poder da Comunidade</h4>
                        <p className="text-slate-500 font-medium font-serif italic leading-relaxed">As melhores soluções nascem da dor de quem está no campo de batalha. Estimulamos a criação descentralizada.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-16 bg-slate-50 dark:bg-slate-900 rounded-[56px] border border-slate-100 dark:border-slate-800 space-y-12">
               <h3 className="text-2xl font-bold tracking-tight">CaaS Timeline</h3>
               <div className="space-y-8 relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                  {[
                    { year: '2023', text: 'Ideação do modelo MicroCaaS em Brasília.' },
                    { year: '2024', text: 'Lançamento da Beta com 12 microsoluções.' },
                    { year: '2025', text: 'Ecossistema global com API de Governança.' },
                  ].map((h, i) => (
                    <div key={i} className="flex gap-10 relative z-10 group">
                       <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full border border-slate-200 flex items-center justify-center font-black text-xs text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">{h.year}</div>
                       <p className="text-sm font-bold text-slate-500 pt-3 italic font-serif leading-relaxed">{h.text}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
