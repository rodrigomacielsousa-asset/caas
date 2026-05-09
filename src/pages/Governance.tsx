import { ShieldCheck, CheckCircle2, AlertCircle, FileText, Lock, Globe, Scale, Users, Zap, Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function Governance() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
               <ShieldCheck className="w-3 h-3" /> QA & Compliance Engine
            </div>
            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Governança e <br />
              <span className="text-emerald-600">Responsabilidade Ética.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed italic font-serif">
              O ecossistema MicroCaaS opera sob padrões rígidos de homologação para garantir que cada microsolução seja segura, precisa e juridicamente viável.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Principles */}
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" /> Critérios de Homologação
              </h2>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Antes de ser listada no marketplace oficial, toda solução (seja ela oficial ou da comunidade) passa por 4 camadas de auditoria:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 {[
                   { t: "Precisão Contábil", d: "Validação cruzada com as normas do CFC e Receita Federal.", icon: Scale },
                   { t: "Pentest de Segurança", d: "Testes de intrusão e vulnerabilidades OWASP nos endpoints.", icon: Lock },
                   { t: "Arquitetura Modular", d: "Verificação de dependências e isolamento de processos.", icon: Zap },
                   { t: "Compliance LGPD", d: "Mapeamento rigoroso do fluxo de tratamento de dados PII.", icon: ShieldCheck },
                 ].map((item, i) => (
                   <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600"><item.icon className="w-6 h-6" /></div>
                      <h3 className="font-bold text-lg">{item.t}</h3>
                      <p className="text-sm text-slate-500">{item.d}</p>
                   </div>
                 ))}
              </div>
            </section>

            <div className="p-10 bg-slate-900 rounded-[48px] text-white relative overflow-hidden">
               <Globe className="w-48 h-48 absolute -right-16 -top-16 opacity-5" />
               <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-bold">Conselho de Ética Digital</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">
                    Mantemos um board consultivo formado por contadores seniores e especialistas em direito digital para revisar algoritmos que tomam decisões fiscais críticas. Nosso objetivo é eliminar o "viés de caixa-preta" na IA.
                  </p>
                  <div className="flex gap-4 pt-4">
                     <div className="flex -space-x-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold">ME</div>
                        ))}
                     </div>
                     <div className="flex flex-col justify-center">
                        <span className="text-xs font-bold">12 Auditores Ativos</span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Board de Curadoria</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> Repositório de Normas
                </h3>
                <div className="space-y-4">
                   {[
                     "Manual de Design MicroCaaS v1",
                     "Contrato de Uso de Dados v2.1",
                     "Termos de Parceria Factory",
                     "Política de Zero-Knowledge"
                   ].map(doc => (
                     <button key={doc} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-emerald-50 transition-all group">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 transition-colors">{doc}</span>
                        <AlertCircle className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                     </button>
                   ))}
                </div>
             </div>

             <div className="bg-emerald-600 p-8 rounded-[32px] text-white shadow-xl shadow-emerald-100">
                <h3 className="font-bold mb-4">Denuncie uma Solução</h3>
                <p className="text-sm text-emerald-100 mb-6 leading-relaxed">Viu algo errado em uma microsolução? Reporte para nossa auditoria técnica imediatamente para revisão.</p>
                <button className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all">
                  Abrir Relatório Técnico
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
