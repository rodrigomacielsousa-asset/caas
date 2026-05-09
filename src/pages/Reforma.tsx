import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  Info,
  Calendar,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Reforma() {
  const [faturamento, setFaturamento] = useState<number>(100000);
  const [isCST, setIsCST] = useState(false);
  
  // Lógica fictícia e simplificada de simulação
  const cargaAtual = faturamento * 0.1425; // Ex: PIS/COFINS/ISS
  const cargaNova = faturamento * (isCST ? 0.265 : 0.279); // IBS + CBS
  const impacto = ((cargaNova / cargaAtual) - 1) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Layout */}
      <div className="bg-indigo-600 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-full bg-white opacity-5 rotate-12 -translate-y-20 flex flex-col gap-8">
           <div className="h-20 bg-white" />
           <div className="h-20 bg-white w-2/3" />
           <div className="h-20 bg-white w-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                 <Sparkles className="w-3 h-3" /> Exclusividade MicroCaaS
              </div>
              <h1 className="text-6xl font-black tracking-tighter leading-none">Hub da Reforma <br /> <span className="text-indigo-200 italic">Tributária.</span></h1>
              <p className="text-xl text-indigo-100/70 font-medium leading-relaxed italic font-serif max-w-2xl">
                O único centro de inteligência modular que simula o impacto do IBS/CBS no fluxo de caixa da sua carteira de clientes em tempo real.
              </p>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Simulator Card */}
          <div className="lg:col-span-2 space-y-12">
             <div className="bg-white dark:bg-slate-900 rounded-[56px] shadow-2xl border border-slate-200 dark:border-slate-800 p-12 space-y-12">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                     <Calculator className="w-6 h-6 text-indigo-600" /> Simulador de Impacto (QuickCheck)
                   </h2>
                   <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400">Modelo 2026-2033</div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Faturamento Mensal Estimado</label>
                        <span className="text-indigo-600 font-black text-lg">R$ {faturamento.toLocaleString('pt-BR')}</span>
                      </div>
                      <input 
                        type="range" 
                        min="10000" 
                        max="1000000" 
                        step="10000" 
                        value={faturamento}
                        onChange={(e) => setFaturamento(Number(e.target.value))}
                        className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600" 
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div 
                        onClick={() => setIsCST(false)}
                        className={cn(
                          "p-8 rounded-[32px] border-2 cursor-pointer transition-all space-y-4 text-center",
                          !isCST ? "border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-100" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                        )}
                      >
                         <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                           <Zap className="w-6 h-6" />
                         </div>
                         <h4 className="font-bold">Serviços Gerais</h4>
                         <p className="text-[10px] text-slate-500 font-medium">Alíquota padrão sem tratamentos diferenciados.</p>
                      </div>
                      <div 
                        onClick={() => setIsCST(true)}
                        className={cn(
                          "p-8 rounded-[32px] border-2 cursor-pointer transition-all space-y-4 text-center",
                          isCST ? "border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-100" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                        )}
                      >
                         <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                           <ShieldAlert className="w-6 h-6" />
                         </div>
                         <h4 className="font-bold">Setor de Construção</h4>
                         <p className="text-[10px] text-slate-500 font-medium">Considerando regimes específicos de CST / Incorporação.</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                   <div className="space-y-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Carga Atual (Média)</span>
                       <p className="text-3xl font-black text-slate-400 group-hover:text-slate-900 transition-all">R$ {cargaAtual.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
                   </div>
                   <div className="space-y-2">
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Nova Carga (IBS+CBS)</span>
                       <p className="text-3xl font-black text-indigo-600">R$ {cargaNova.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
                   </div>
                </div>

                <div className={cn(
                  "p-8 rounded-3xl flex items-center justify-between",
                  impacto > 0 ? "bg-rose-50 text-rose-800 border border-rose-100" : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                )}>
                   <div className="flex items-center gap-4 text-lg font-bold">
                      {impacto > 0 ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                      Aumento real de {impacto.toFixed(1)}% na carga nominal.
                   </div>
                   <button className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center gap-2">
                      Ver Cenário <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <section className="space-y-8">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                   <Calendar className="w-6 h-6 text-indigo-600" /> Cronograma de Transição
                </h2>
                <div className="space-y-4">
                   {[
                     { year: '2026', title: 'Período de Teste', desc: 'Início da cobrança de CBS (0,9%) e IBS (0,1%) com compensação no PIS/Cofins.' },
                     { year: '2027-2028', title: 'Extinção do PIS/Cofins', desc: 'Migração integral da base federal para a nova CBS.' },
                     { year: '2029-2033', title: 'Transição do ICMS/ISS', desc: 'Redução gradativa dos impostos estaduais/municipais e entrada do IBS.' },
                   ].map((step, idx) => (
                     <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 flex gap-8 group">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl shrink-0 flex items-center justify-center font-black text-xl text-slate-300 dark:text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">{step.year}</div>
                        <div className="space-y-2">
                           <h4 className="font-bold text-lg">{step.title}</h4>
                           <p className="text-sm text-slate-500 font-medium leading-relaxed italic font-serif">{step.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
             <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden group">
                <Sparkles className="w-32 h-32 absolute -right-8 -top-8 text-indigo-600 opacity-20 group-hover:scale-110 transition-transform" />
                <div className="relative z-10 space-y-6">
                   <h3 className="text-2xl font-bold leading-tight">Auditoria de <br /> Transição Pro</h3>
                   <p className="text-indigo-200/60 text-sm leading-relaxed font-medium">Nossa IA varre seus lançamentos de 2023-2024 e gera uma estimativa exata do crédito presumido que sua empresa terá direito em 2026.</p>
                   <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-100">
                     Habilitar Módulo <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                <h2 className="text-xl font-bold flex items-center gap-2">
                   <Info className="w-5 h-5 text-indigo-600" /> Top Artigos Técnicos
                </h2>
                <div className="space-y-4">
                   {[
                     "Cashback de IBS para baixa renda",
                     "Incidência Monofásica v2.0",
                     "Cesta Básica Nacional Isenta",
                     "O fim dos Benefícios ICMS"
                   ].map((art, i) => (
                     <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group cursor-pointer hover:bg-indigo-50 transition-all">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{art}</span>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-all" />
                     </div>
                   ))}
                </div>
             </div>

             <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[40px] border border-amber-100 dark:border-amber-900/30 flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold leading-relaxed uppercase tracking-widest">
                   AVISO: Este hub reflete o texto atual aprovado. Alíquotas podem sofrer alterações até a promulgação das leis complementares.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
