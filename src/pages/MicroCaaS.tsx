import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Rocket,
  Globe,
  Lock,
  Layers,
  Heart,
  Target,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function MicroCaaSPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Institutional Hero */}
      <div className="bg-indigo-600 pt-32 pb-48 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-full bg-white opacity-5 rotate-12 -translate-y-20 flex flex-col gap-8">
           <div className="h-24 bg-white" />
           <div className="h-24 bg-white w-2/3" />
           <div className="h-24 bg-white w-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <div className="max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                 <Rocket className="w-3 h-3" /> O Futuro da Contabilidade
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
                Contabilidade como <br /> <span className="text-indigo-200">Serviço Modular.</span>
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 font-medium leading-relaxed italic font-serif max-w-3xl mx-auto">
                "Não mais um software pesado e lento, mas um ecossistema de microsoluções que resolvem dores atômicas com precisão cirúrgica."
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-8">
                 <Link to="/solucoes" className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all">
                   Ver Catálogo de Soluções
                 </Link>
                 <Link to="/publicar" className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-bold text-lg border border-indigo-400 hover:bg-indigo-400 transition-all">
                   Publicar Minha Solução
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {/* Concept Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 pb-32">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] shadow-2xl space-y-6">
               <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Layers className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-bold">Modularidade Total</h3>
               <p className="text-slate-500 leading-relaxed font-medium">Contrate apenas o que você usa. Sem taxas de setup abusivas ou pacotes engessados que você nunca utiliza por completo.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] shadow-2xl space-y-6">
               <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Globe className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-bold">Ecossistema Aberto</h3>
               <p className="text-slate-500 leading-relaxed font-medium">Contadores desenvolvedores e criadores de soluções podem publicar suas ferramentas e monetizar seu conhecimento técnico.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] shadow-2xl space-y-6">
               <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center">
                  <Lock className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-bold">Segurança Cloud</h3>
               <p className="text-slate-500 leading-relaxed font-medium">Toda solução passa por nossa governança técnica de segurança e performance antes de ser listada no ecossistema.</p>
            </div>
         </div>

         {/* Manifesto */}
         <section className="py-32 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
               <div className="space-y-4">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Nosso Manifesto</span>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                    A morte do software monolítico e o nascimento do <span className="text-indigo-600 italic">Accounting as a Service.</span>
                  </h2>
               </div>
               <p className="text-lg text-slate-500 leading-relaxed font-serif italic">
                 "Acreditamos que a contabilidade não deve ser refém de grandes corporações de software que demoram meses para implementar uma mudança legal. O MicroCaaS é a agilidade que o mercado exige."
               </p>
               <div className="space-y-6">
                  {[
                    "Resolução imediata de dores fiscais e contábeis",
                    "Integração via APIs padronizadas",
                    "Foco na experiência do usuário final",
                    "Custo justo e escalável"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                       </div>
                       <span className="font-bold text-slate-700 dark:text-slate-300">{text}</span>
                    </div>
                  ))}
               </div>
            </div>
            <div className="relative">
               <div className="absolute -inset-4 bg-indigo-600/10 blur-[80px] rounded-full" />
               <div className="bg-slate-900 rounded-[64px] p-12 text-white space-y-12 relative z-10 border border-white/5">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black">Por que MicroCaaS?</h3>
                    <p className="text-indigo-200/60 font-medium">A fragmentação produtiva é o novo padrão ouro de eficiência.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <span className="text-4xl font-black text-white">98%</span>
                        <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Precisão de Cálculos</p>
                     </div>
                     <div className="space-y-2">
                        <span className="text-4xl font-black text-white">10x</span>
                        <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Mais Ágil que ERPs</p>
                     </div>
                     <div className="space-y-2">
                        <span className="text-4xl font-black text-white">40+</span>
                        <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Microsoluções</p>
                     </div>
                     <div className="space-y-2">
                        <span className="text-4xl font-black text-white">ZERO</span>
                        <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Taxa de Adesão</p>
                     </div>
                  </div>
                  <Link to="/solucoes" className="w-full py-5 bg-white text-slate-900 rounded-3xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                    Explorar Ecossistema <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
            </div>
         </section>

         {/* Call to Action for Reforma */}
         <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[64px] p-16 border border-slate-200 dark:border-slate-800 text-center space-y-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200">
               <Target className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Pronto para a Reforma Tributária?</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Use nosso hub especializado para simular o impacto do IBS e CBS nos seus clientes e antecipe-se às mudanças.</p>
            <Link to="/reforma-hub" className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-lg transition-all hover:scale-105">
               Simular Hub Reforma <TrendingUp className="w-6 h-6" />
            </Link>
         </div>
      </div>
    </div>
  );
}
