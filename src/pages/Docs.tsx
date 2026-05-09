import { Book, Shield, Code, Server, Zap, Lock, Globe, Database, FileText, ChevronRight, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useState } from 'react';

const SECTIONS = [
  { id: 'identidade', title: 'Identidade e Manifesto', icon: Book },
  { id: 'standards', title: 'Padrão Técnico (Specs)', icon: Code },
  { id: 'architecture', title: 'Arquitetura de Dados', icon: Database },
  { id: 'security', title: 'Segurança e Cloud', icon: Shield },
  { id: 'monetization', title: 'Modelos de Negócio', icon: Zap },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('identidade');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* Search & Sidebar */}
      <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 lg:sticky lg:top-0 lg:h-screen overflow-y-auto no-scrollbar">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">M</div>
            <h1 className="text-xl font-bold tracking-tight">CaaS Docs</h1>
          </div>
          
          <div className="relative mb-8">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar documentação..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          <nav className="space-y-2">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                  activeSection === section.id 
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <section.icon className={cn("w-4 h-4", activeSection === section.id ? "text-indigo-600" : "text-slate-400")} />
                  <span className="text-sm font-bold">{section.title}</span>
                </div>
                <ChevronRight className={cn("w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all", activeSection === section.id && "opacity-100 translate-x-1")} />
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
           <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Build v1.0</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Stable para MicroCaaS 2025 Release Candidate.</p>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 sm:px-12 py-12 lg:py-24 max-w-4xl">
        <motion.div
           key={activeSection}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-12"
        >
          {activeSection === 'identidade' && (
            <div className="space-y-8 prose dark:prose-invert max-w-none">
              <h1 className="text-5xl font-black tracking-tight mb-8">Manifesto MicroCaaS</h1>
              <p className="text-xl text-slate-500 leading-relaxed font-serif">
                MicroCaaS não é sobre software grande; é sobre soluções cirúrgicas. 
                Acreditamos que a complexidade contábil brasileira não será resolvida por um ERP gigante, 
                mas por infinitas ferramentas leves que fazem uma única coisa com perfeição.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                 <div className="p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-2">Independência Tecnológica</h3>
                    <p className="text-sm text-slate-500">Cada MicroCaaS deve funcionar de forma isolada, sem dependência obrigatória de outros módulos para entregar o seu core value.</p>
                 </div>
                 <div className="p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-2">Accounting First</h3>
                    <p className="text-sm text-slate-500">O foco é sempre a conformidade e a eficiência contábil. A tecnologia é o meio, nunca o fim sob o prisma estético apenas.</p>
                 </div>
              </div>
            </div>
          )}

          {activeSection === 'standards' && (
            <div className="space-y-8">
              <h1 className="text-5xl font-black tracking-tight mb-8">Padrão Técnico</h1>
              <div className="space-y-6">
                <div className="flex gap-4 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px]">
                   <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex-shrink-0 flex items-center justify-center"><Server className="w-6 h-6" /></div>
                   <div>
                     <h3 className="text-xl font-bold mb-2">Hospedagem & Disponibilidade</h3>
                     <p className="text-slate-500 text-sm leading-relaxed">Todas as ferramentas devem estar hospedadas em infraestrutura cloud escalável (AWS/GCP/Azure) com uptime garantido de 99.9%.</p>
                   </div>
                </div>
                <div className="flex gap-4 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px]">
                   <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex-shrink-0 flex items-center justify-center"><Globe className="w-6 h-6" /></div>
                   <div>
                     <h3 className="text-xl font-bold mb-2">Endpoints de Integração</h3>
                     <p className="text-slate-500 text-sm leading-relaxed">Para ser homologado como MicroCaaS oficial, a solução deve oferecer exportação de dados em CSV, JSON ou integração via Webhook conforme padrão CaaS.</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-8">
               <h1 className="text-5xl font-black tracking-tight mb-8">Segurança e Cloud</h1>
               <div className="bg-indigo-600 p-12 rounded-[48px] text-white overflow-hidden relative">
                 <Lock className="w-48 h-48 absolute -right-12 -bottom-12 opacity-10" />
                 <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-6">LGPD Compliance</h2>
                    <p className="text-indigo-100 mb-8 max-w-xl text-lg font-medium">Nosso ecossistema utiliza criptografia AES-256 para repouso de dados e TLS 1.3 para trânsito. Nenhuma solução é publicada sem auditoria de Zero-Trust.</p>
                    <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all flex items-center gap-2">
                       Baixar Whitepaper <FileText className="w-4 h-4" />
                    </button>
                 </div>
               </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
