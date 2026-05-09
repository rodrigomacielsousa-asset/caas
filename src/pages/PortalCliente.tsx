import React from 'react';
import { Users, FileText, Download, Bell, Settings, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function PortalCliente() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 sm:p-20">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-100">C</div>
              <div>
                 <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">Portal do Cliente</h1>
                 <p className="text-sm font-medium text-slate-500">Nexus Tecnologia LTDA</p>
              </div>
           </div>
           <div className="flex gap-4">
              <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600"><Bell className="w-6 h-6" /></button>
              <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600"><Settings className="w-6 h-6" /></button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="md:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                 <h2 className="text-xl font-bold">Documentos para Assinatura</h2>
                 <div className="space-y-4">
                    {[
                      "Contrato de Manutenção - Maio 2026",
                      "Aditivo Contratual de Expansão",
                    ].map(doc => (
                      <div key={doc} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl flex justify-between items-center group cursor-pointer hover:bg-indigo-50 transition-all">
                         <div className="flex items-center gap-4">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-bold">{doc}</span>
                         </div>
                         <button className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">Assinar <ArrowRight className="w-4 h-4" /></button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="space-y-8">
              <div className="bg-indigo-600 p-10 rounded-[48px] text-white shadow-xl shadow-indigo-100">
                 <h3 className="text-xl font-bold mb-4">Seu Contador: Diego S.</h3>
                 <p className="text-indigo-100 text-sm mb-8 leading-relaxed font-medium">Atendimento ativo das 08h às 18h. Precisa de uma guia urgente?</p>
                 <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-sm">Chamar no WhatsApp</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
