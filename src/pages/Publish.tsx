import React, { useState } from 'react';
import { Rocket, Package, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Publish() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <Rocket className="w-3 h-3" /> MicroCaaS Publisher
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Coloque sua Solução <br /><span className="text-indigo-600">no Mapa.</span></h1>
          <p className="text-lg text-slate-500 font-medium font-serif italic">Inicie o fluxo de homologação e publicação no marketplace MicroCaaS.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { s: 1, t: "Manifesto", d: "Defina o core-value e área de atuação." },
            { s: 2, t: "Homologação", d: "Envie o código para auditoria técnica." },
            { s: 3, t: "Live", d: "Sua ferramenta ativa para o mercado." },
          ].map(s => (
            <div key={s.s} className={`p-8 rounded-[32px] border-2 transition-all ${step === s.s ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 dark:border-slate-800'}`}>
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black mx-auto mb-4 ${step === s.s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{s.s}</div>
               <h3 className="font-bold mb-2">{s.t}</h3>
               <p className="text-[10px] text-slate-500 font-medium">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 space-y-8">
           <p className="text-xl font-bold text-slate-400 italic">O fluxo de auto-publicação está em fase Beta.</p>
           <button className="btn-primary py-5 px-12 text-lg shadow-xl shadow-indigo-100">
             Entrar na Fila de Espera <ArrowRight className="w-5 h-5 ml-2 inline" />
           </button>
        </div>
      </div>
    </div>
  );
}
