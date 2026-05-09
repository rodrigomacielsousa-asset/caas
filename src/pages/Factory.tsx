import { Target, Zap, Settings, Rocket, Package, FileText, ArrowRight, ShieldCheck, Sparkles, Code, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function Factory() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-24 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <div className="absolute top-10 left-10 w-64 h-64 border-4 border-indigo-600 rounded-full animate-pulse" />
           <div className="absolute bottom-10 right-10 w-96 h-96 border-4 border-indigo-600 rounded-full animate-pulse delay-700" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
               <Rocket className="w-3 h-3" /> Turn expertise into SaaS
            </div>
            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Transforme seu saber em <span className="text-indigo-600">Microsoluções.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed italic font-serif">
              A MicroCaaS Factory é a aceleradora modular que empacota sua expertise técnica em ferramentas escaláveis e prontas para o mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
               <button className="btn-primary py-4 px-12 text-lg shadow-xl shadow-indigo-100">Iniciar Projeto <ArrowRight className="w-5 h-5 ml-2 inline" /></button>
               <button className="py-4 px-12 font-bold text-slate-500 hover:text-indigo-600 transition-all">Ver Exemplos</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           <motion.div 
             whileHover={{ y: -10 }}
             className="bg-white dark:bg-slate-900 p-12 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
           >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-indigo-600"><Target className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold tracking-tight">01. Arquitetura de Valor</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Mapeamos sua regra de negócio, algoritmos e cases de sucesso para definir o core-value da solução.</p>
           </motion.div>

           <motion.div 
             whileHover={{ y: -10 }}
             className="bg-white dark:bg-slate-900 p-12 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
           >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-indigo-600"><Code className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold tracking-tight">02. Modularização Alpha</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Desenvolvemos o MVP em camadas desacopladas (CaaS specs), garantindo que ele rode nativo no ecossistema MicroCaaS.</p>
           </motion.div>

           <motion.div 
             whileHover={{ y: -10 }}
             className="bg-white dark:bg-slate-900 p-12 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
           >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-indigo-600"><Rocket className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold tracking-tight">03. Go-to-Market</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Publicação no marketplace, setup de billing recorrente e acesso à nossa base de +10k contadores ativos.</p>
           </motion.div>
        </div>

        {/* Deliverables Area */}
        <div className="mt-32 space-y-16">
           <div className="text-center">
              <h2 className="text-4xl font-black tracking-tight mb-4">O que entregamos na Factory?</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">Tudo que você precisa para que seu código se torne um produto real, homologado e seguro.</p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-slate-900 rounded-[56px] p-16 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-all" />
                 <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-8">Empacotamento Core</h3>
                    <ul className="space-y-6">
                       {[
                         { title: "UI Engine Pro", desc: "Design interfaces consistentes com o padrão MicroCaaS UI.", icon: Sparkles },
                         { title: "API Gateway", desc: "Endpoints expostos para integração com ERPs contábeis.", icon: Database },
                         { title: "Escalabilidade Cloud", desc: "Dockerized & Ready para AWS/GCP.", icon: Server },
                       ].map((item, i) => (
                         <li key={i} className="flex gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><item.icon className="w-5 h-5" /></div>
                            <div>
                               <h4 className="font-bold">{item.title}</h4>
                               <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[56px] p-16 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                 <div className="space-y-8">
                    <h3 className="text-3xl font-bold tracking-tight">Benefícios MicroCaaS Partner</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {[
                         "Billing Automatizado",
                         "Logística de Licenças",
                         "Dashboard Admin Próprio",
                         "Analytics de Uso",
                         "Split de Pagamentos",
                         "Documentação Auto-gerada"
                       ].map(b => (
                         <div key={b} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{b}</span>
                         </div>
                       ))}
                    </div>
                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-8">
                       <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                          <ShieldCheck className="w-6 h-6 text-indigo-600" />
                          <p className="text-xs text-slate-500 font-medium">Sua propriedade intelectual é protegida por contratos jurídicos de co-desenvolvimento transparentes.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

import { Database, Server } from 'lucide-react';
