import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Rocket, 
  Sparkles, 
  Globe, 
  Package, 
  Target,
  BarChart3,
  Search,
  Plus,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import solucoesData from '../data/solucoes.json';
import microcaasData from '../data/microcaas.json';
import { ProductCard } from '../components/ProductCard';

export default function Home() {
  const featuredSolutions = (solucoesData as any[]).slice(0, 3);
  const marketplaceTeaser = (microcaasData as any[]).slice(0, 4);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                <Sparkles className="w-3 h-3 text-indigo-600" /> O Futuro é Modular
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
                Ecossistema de <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Micro-Soluções</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed font-serif italic">
                A revolução CaaS (Accounting as a Service) chegou. Ferramentas cirúrgicas para contadores que não aceitam o "tamanho único" dos ERPs gigantes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link to="/solucoes" className="btn-primary py-5 px-12 text-lg group shadow-xl shadow-indigo-100">
                Explorar Catálogo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/docs" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-5 px-12 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                 Manifesto MicroCaaS
              </Link>
            </motion.div>

            {/* Dashboard Mockup/Preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full relative mt-12 group"
            >
              <div className="relative mx-auto max-w-5xl rounded-[40px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 aspect-video flex items-center justify-center p-2">
                 <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[32px] p-8 flex flex-col items-start text-left overflow-hidden relative">
                    {/* Fake App Layout */}
                    <div className="w-full border-b border-slate-200 dark:border-slate-800 pb-4 mb-8 flex justify-between items-center">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-rose-400" />
                          <div className="w-3 h-3 rounded-full bg-amber-400" />
                          <div className="w-3 h-3 rounded-full bg-emerald-400" />
                       </div>
                       <div className="flex gap-4">
                          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 w-full">
                       <div className="col-span-2 space-y-4">
                          <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                          <div className="h-32 w-full bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 space-y-3">
                             <div className="h-4 w-1/3 bg-indigo-100 dark:bg-indigo-900/30 rounded" />
                             <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                             <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 w-3/4" />
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="h-24 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800" />
                             <div className="h-24 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="h-64 bg-indigo-600 rounded-[32px] shadow-lg shadow-indigo-200" />
                       </div>
                    </div>

                    {/* Gradient Overlay for modern look */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] -z-0" />
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-24 tracking-tight">Adeus, Monólitos Pesados. <br /><span className="text-indigo-400">Olá, Microsoluções Ágeis.</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
               {[
                 { title: "CaaS Nativo", desc: "Accounting as a Service. Modular por definição, não por adaptação.", icon: Target },
                 { title: "Escalabilidade", desc: "Pague apenas pelo que usar. Mensal ou por volume de notas.", icon: Zap },
                 { title: "Segurança Cloud", desc: "Infraestrutura segregada com criptografia de ponta a ponta.", icon: ShieldCheck },
                 { title: "IA de Alçada", desc: "Nossa IA exclusiva atua na classificação de dados brutos.", icon: Sparkles },
               ].map((item, i) => (
                 <div key={i} className="flex flex-col items-center space-y-6">
                    <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center text-indigo-400 backdrop-blur-md">
                       <item.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
                    <p className="text-indigo-200/60 text-sm leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Featured Solutions */}
      <section className="py-32 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
              <div className="space-y-4">
                 <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Soluções Oficiais CaaS</h2>
                 <p className="text-slate-500 font-medium italic font-serif">As ferramentas core que todo escritório inovador precisa hoje.</p>
              </div>
              <Link to="/solucoes" className="flex items-center gap-2 text-indigo-600 font-bold group">
                Ver catálogo completo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSolutions.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
           </div>
        </div>
      </section>

      {/* Marketplace Teaser */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-white dark:bg-slate-900 rounded-[56px] p-8 md:p-20 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 opacity-5 blur-[100px] -z-0 group-hover:opacity-10 transition-all duration-700" />
              
              <div className="flex flex-col lg:flex-row justify-between items-start gap-16 relative z-10">
                 <div className="lg:max-w-md space-y-8">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-[28px] flex items-center justify-center text-indigo-600">
                       <Plus className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">O Marketplace das Comunidades.</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">Milhares de desenvolvedores e contadores criando micro-soluções homologadas pela MicroCaaS.</p>
                    <Link to="/microcaas" className="btn-primary py-4 px-10 rounded-2xl font-bold flex items-center justify-center gap-2 w-full lg:w-auto">
                      Explorar Marketplace <Globe className="w-4 h-4" />
                    </Link>
                 </div>

                 <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {marketplaceTeaser.map(item => (
                      <div key={item.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800 hover:scale-105 transition-all">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                               <Package className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.area}</span>
                         </div>
                         <h4 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{item.name}</h4>
                         <p className="text-[10px] text-slate-500 font-medium">{item.priceLabel}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
         </div>
      </section>

      {/* Call to Action: MicroCaaS Factory */}
      <section className="py-40 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <Plus className="w-3 h-3" /> Produza seu Próprio SaaS
           </div>
           <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">Transforme sua expertise <br /><span className="text-indigo-600">em renda passiva.</span></h2>
           <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium font-serif italic text-pretty">
             Você tem uma planilha, um script ou uma regra de negócio que economiza horas de trabalho? Nós ajudamos a transformar isso em um MicroCaaS escalável na nossa Factory.
           </p>
           <div className="pt-8">
             <Link to="/microcaas-factory" className="btn-primary py-5 px-16 text-xl shadow-2xl shadow-indigo-200">
               Conhecer a Factory <Rocket className="w-6 h-6 ml-2 inline animate-bounce" />
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
}
