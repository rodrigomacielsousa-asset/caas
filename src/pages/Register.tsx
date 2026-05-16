import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-[56px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-8 md:p-16 flex flex-col justify-center space-y-10">
           <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Criar Conta Parceira</h2>
              <p className="text-sm text-slate-500 font-medium">Inicie sua jornada no ecossistema MicroCaaS.</p>
           </div>
           
           <form className="space-y-6">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Nome Completo</label>
                 <div className="relative">
                    <User className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-14 py-4 font-medium" placeholder="Ex: Rodrigo Maciel" />
                 </div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Empresa / E-mail</label>
                 <div className="relative">
                    <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-14 py-4 font-medium" placeholder="seu@email.com" />
                 </div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Senha de Acesso</label>
                 <div className="relative">
                    <Lock className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-14 py-4 font-medium" placeholder="••••••••" />
                 </div>
              </div>
              <button className="w-full btn-primary py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3">
                 Criar Workspace <ArrowRight className="w-6 h-6" />
              </button>
           </form>

           <p className="text-center text-sm font-medium text-slate-500">
              Já possui conta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Fazer login</Link>
           </p>
        </div>

        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative">
           <div className="absolute top-0 right-0 p-12 opacity-10"><LayoutGrid className="w-48 h-48" /></div>
           <div className="relative z-10 space-y-6">
              <h1 className="text-5xl font-black tracking-tighter leading-none">Benefícios de <br /><span className="text-blue-400">Ser Parceiro.</span></h1>
              <ul className="space-y-6">
                 {[
                   "Acesso ao Marketplace CaaS",
                   "Suporte Prioritário Gemini Pro",
                   "Workspace Compartilhada",
                   "Billing Unificado"
                 ].map(b => (
                    <li key={b} className="flex items-center gap-3 text-sm font-bold">
                       <ShieldCheck className="w-5 h-5 text-emerald-400" /> {b}
                    </li>
                 ))}
              </ul>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
