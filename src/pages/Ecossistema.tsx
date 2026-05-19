import React from 'react';
import { motion } from 'motion/react';
import { Box, Zap, Globe, Cpu, ArrowRight, CheckCircle2, Layers, ShieldCheck, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroPadrao } from '../components/HeroPadrao';

export default function Ecossistema() {
  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero Section */}
      <HeroPadrao 
        badge="A Nova Era da Contabilidade"
        title={<>Pare de depender de <br /><span className="text-blue-600">sistemas contábeis complexos.</span></>}
        description="Use ferramentas simples e diretas para resolver tarefas do dia a dia em segundos. O ecossistema CaaS transforma micro-dores em soluções ágeis."
        ctaText="Ver soluções disponíveis"
        ctaLink="/solucoes"
      />

      {/* Simple Explanation Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
                <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    Hoje você depende de sistemas grandes, lentos e complexos.
                </p>
                <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full" />
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                    Aqui, você usa ferramentas pequenas, rápidas e focadas em resolver um único problema de cada vez.
                </p>
            </div>
        </div>
      </section>

      {/* CaaS vs MicroCaaS */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Escolha seu nível de automação</h2>
             <p className="text-slate-500 font-medium">Do micro ao macro, temos o que você precisa.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CaaS Block */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-blue-600 rounded-[3rem] p-12 text-white space-y-8 relative overflow-hidden group shadow-2xl shadow-blue-200"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500"><Box className="w-48 h-48" /></div>
              <div className="space-y-4 relative z-10">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest">Estrutura Completa</span>
                <h2 className="text-5xl font-black tracking-tight">CaaS</h2>
                <div className="space-y-2">
                  <p className="font-bold text-blue-100 flex items-center gap-2 uppercase text-xs">• Sistema completo</p>
                  <p className="font-bold text-blue-100 flex items-center gap-2 uppercase text-xs">• Mais robusto</p>
                  <p className="font-bold text-blue-100 flex items-center gap-2 uppercase text-xs">• Mais complexo</p>
                  <p className="font-bold text-blue-100 flex items-center gap-2 uppercase text-xs">• Ideal para operações grandes</p>
                </div>
                <p className="font-medium text-blue-50 pt-4 leading-relaxed">
                  Contabilidade completa sob demanda para processos de larga escala.
                </p>
              </div>
              <Link to="/solucoes" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all relative z-10 shadow-lg">
                Ver ferramentas disponíveis <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* MicroCaaS Block */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-slate-900 rounded-[3rem] p-12 text-white space-y-8 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500"><Zap className="w-48 h-48 text-blue-500" /></div>
              <div className="space-y-4 relative z-10">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">Solução Imediata</span>
                <h2 className="text-5xl font-black tracking-tight">MicroCaaS</h2>
                <div className="space-y-2">
                  <p className="font-bold text-slate-400 flex items-center gap-2 uppercase text-xs">• Resolve um problema específico</p>
                  <p className="font-bold text-slate-400 flex items-center gap-2 uppercase text-xs">• Rápido e direto</p>
                  <p className="font-bold text-slate-400 flex items-center gap-2 uppercase text-xs">• Sem complexidade</p>
                  <p className="font-bold text-slate-400 flex items-center gap-2 uppercase text-xs">• Uso imediato</p>
                </div>
                <p className="font-medium text-slate-400 pt-4 leading-relaxed">
                  Aplicações leves e rápidas para resolver dores específicas em segundos.
                </p>
              </div>
              <Link to="/solucoes" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all relative z-10 shadow-lg">
                Testar soluções agora <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Connection with Product Section */}
          <div className="mt-20 text-center space-y-8 bg-blue-50 rounded-[4rem] p-16 border border-blue-100">
             <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto">
                <Rocket className="w-8 h-8" />
             </div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tight">Veja como isso funciona na prática</h3>
             <Link 
              to="/solucoes" 
              className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 active:scale-95"
             >
               Explorar soluções <ArrowRight className="w-5 h-5" />
             </Link>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Por que o MicroCaaS é diferente?</h2>
            <p className="text-slate-500 font-medium">Os fundamentos que tornam cada ferramenta premium.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: "Inteligência Rápida", desc: "Nossas ferramentas ajudam você a tomar decisões mais rápidas e seguras." },
              { icon: Layers, title: "Modularidade Total", desc: "Use apenas o que precisa, sem depender de sistemas completos." },
              { icon: ShieldCheck, title: "Segurança de Elite", desc: "Seus dados protegidos com padrão de segurança elevado." }
            ].map((pilar, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <pilar.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{pilar.title}</h3>
                <p className="text-base text-slate-500 font-medium leading-relaxed">{pilar.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
             <Link to="/solucoes" className="text-blue-600 font-black text-sm uppercase tracking-[0.2em] hover:opacity-80 transition-opacity flex items-center justify-center gap-2">
               Experimente uma solução agora <ArrowRight className="w-4 h-4 text-blue-600" />
             </Link>
          </div>
        </div>
      </section>

      {/* Authority Section (Asset Group) */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
           <div className="w-[1px] h-20 bg-slate-200 mx-auto mb-8" />
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Quem está por trás do MicroCaaS?</h2>
           <div className="p-12 bg-white rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                Asset Group
              </div>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                O MicroCaaS é desenvolvido pela **Asset Group**, com o objetivo de transformar a forma como a contabilidade é feita no Brasil.
              </p>
              <p className="text-xl text-slate-600 font-black leading-relaxed">
                Criamos soluções simples, rápidas e focadas em resolver problemas reais do dia a dia contábil.
              </p>
              <div className="pt-8">
                 <Link to="/contato" className="text-blue-600 font-black text-sm uppercase tracking-widest border-b-2 border-blue-600 pb-1">Fale Conosco</Link>
              </div>
           </div>
           
           <div className="pt-20">
              <Link to="/solucoes" className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-[2.5rem] font-black text-lg uppercase tracking-widest transition-all shadow-2xl hover:shadow-blue-200 hover:-translate-y-1">
                Começar agora <ArrowRight className="w-6 h-6" />
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
}
