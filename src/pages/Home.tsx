import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  FileText,
  Brain,
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { cn } from '../lib/utils';
import { blogService } from '../services/blogService';
import type { BlogPost } from '../types';

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  // Status messages for Hero Mock
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = [
    "Processando balancete...",
    "Gerando DRE...",
    "Calculando indicadores...",
    "Validando conformidade...",
    "Finalizando relatório..."
  ];

  // Hero Rotating Messages
  const [heroIndex, setHeroIndex] = useState(0);
  const heroMessages = [
    {
      overline: "Plataforma de Inteligência Contábil",
      title: "Ecossistema de Micro-Soluções",
      subtitle: "A revolução CaaS (Accounting as a Service) chegou. Ferramentas cirúrgicas para contadores que não aceitam o \"tamanho único\" dos ERPs gigantes."
    },
    {
      overline: "O Futuro é Modular",
      title: "Automatize tarefas contábeis em minutos, não horas.",
      subtitle: "Micro-soluções cirúrgicas para resolver dores fiscais, contábeis e financeiras com alta performance."
    },
    {
      overline: "Soluções Contábeis de Alta Performance",
      title: "Descubra erros fiscais e economize impostos em minutos.",
      subtitle: "Pare de perder tempo com processos manuais. Use micro-soluções cirúrgicas para automatizar sua rotina fiscal, contábil e financeira."
    },
    {
      overline: "O Futuro da Contabilidade",
      title: "Contabilidade como Serviço Modular.",
      subtitle: "Não mais um software pesado e lento, mas um ecossistema de micro-soluções que resolvem dores atômicas com precisão cirúrgica."
    },
    {
      overline: "A Nova Era da Contabilidade",
      title: "Pare de usar sistemas contábeis complexos.",
      subtitle: "Resolva tarefas do dia a dia com ferramentas simples e rápidas. Ferramentas práticas para resolver problemas contábeis sem complicação."
    }
  ];

  useEffect(() => {
    async function loadPosts() {
      const allPosts = await blogService.getPosts();
      const published = allPosts
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      setPosts(published);
    }
    loadPosts();

    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 3000);

    const heroInterval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroMessages.length);
    }, 6000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(heroInterval);
    };
  }, []);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  const categories = useMemo(() => ['Todas', ...Array.from(new Set(products.map(p => p.category)))], []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.subtitle || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }); // Removed slice to show all if needed, but user might still want it limited for home?
  // Actually the prompt says "cadê o restante?" so I'll show more or all.
  // I'll show all matching products on Home too if that's what they want, 
  // or at least remove the strict slice of 9.

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 max-w-4xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-widest text-slate-600">
                    <Sparkles className="w-3 h-3 text-blue-600" /> {heroMessages[heroIndex].overline}
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                    {heroMessages[heroIndex].title}
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                    {heroMessages[heroIndex].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-left">
                {[
                  { title: "Experimente antes", desc: "Use ferramentas reais sem nem precisar de login inicial." },
                  { title: "Soluções modulares", desc: "Contrate apenas o que você usa, sem mensalidades pesadas." },
                  { title: "Zero retrabalho", desc: "Elimine planilhas e digitação manual hoje mesmo." },
                  { title: "Escalabilidade", desc: "Atenda mais clientes com a mesma infraestrutura atual." }
                ].map((item, i) => (
                  <div key={i} className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {item.title}
                     </div>
                     <p className="text-[10px] font-medium text-slate-500 leading-tight">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link to="/solucoes" className="btn-primary py-5 px-12 text-lg group shadow-2xl shadow-blue-200">
                Explorar Soluções <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/ecossistema" className="bg-white border border-slate-200 py-5 px-12 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm text-slate-900">
                 Como funciona
              </Link>
            </motion.div>

            {/* Dashboard Mockup/Preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full relative mt-12 group"
            >
              <div className="relative mx-auto max-w-5xl rounded-[40px] overflow-hidden border border-slate-200 shadow-2xl bg-white aspect-video flex items-center justify-center p-2 hover:shadow-blue-200 transition-all duration-700">
                 <div className="w-full h-full bg-slate-50 rounded-[32px] p-8 flex flex-col items-start text-left overflow-hidden relative">
                    {/* Fake App Layout Header */}
                    <div className="w-full border-b border-slate-200 pb-4 mb-8 flex justify-between items-center">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-rose-400" />
                          <div className="w-3 h-3 rounded-full bg-amber-400" />
                          <div className="w-3 h-3 rounded-full bg-emerald-400" />
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="h-4 w-48 bg-slate-100 rounded-full flex items-center px-3 gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                             <AnimatePresence mode="wait">
                               <motion.span 
                                 key={statusIndex}
                                 initial={{ opacity: 0, y: 5 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -5 }}
                                 className="text-[9px] font-black uppercase tracking-tighter text-slate-400"
                               >
                                 {statuses[statusIndex]}
                               </motion.span>
                             </AnimatePresence>
                          </div>
                          <div className="h-6 w-6 bg-slate-200 rounded-lg" />
                       </div>
                    </div>

                    <div className="grid grid-cols-12 gap-8 w-full">
                       {/* Left Content */}
                       <div className="col-span-8 space-y-6">
                          {/* Main Metric Card */}
                          <div className="h-48 w-full bg-white rounded-[32px] border border-slate-100 p-8 flex flex-col justify-between relative overflow-hidden group/card shadow-sm hover:shadow-md transition-all">
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:rotate-12 transition-transform duration-500">
                                <BarChart3 className="w-32 h-32 text-blue-600" />
                             </div>
                             
                             <div className="space-y-2 relative z-10">
                                <div className="h-5 w-32 bg-blue-50 rounded-lg flex items-center px-2 gap-2">
                                   <Activity className="w-3 h-3 text-blue-600" />
                                   <span className="text-[9px] font-bold text-blue-600 uppercase">Analítico Geral</span>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mt-4">R$ 2.482.190,00</h3>
                                <p className="text-xs text-slate-400 font-medium">Receita Consolidada • Março 2026</p>
                             </div>

                             <div className="relative z-10 flex items-center gap-4">
                                <div className="h-2 flex-grow bg-slate-100 rounded-full overflow-hidden">
                                   <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: "82%" }}
                                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                                      className="h-full bg-blue-600 rounded-full relative"
                                   >
                                      <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                                   </motion.div>
                                </div>
                                <span className="text-[10px] font-black text-blue-600">82%</span>
                             </div>
                          </div>

                          {/* Secondary Metrics */}
                          <div className="grid grid-cols-3 gap-6">
                             {[
                                { label: "Lucro Líquido", val: "R$ 542k", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
                                { label: "Margem", val: "22.5%", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
                                { label: "ROE", val: "18.2%", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" }
                             ].map((metric, i) => (
                                <motion.div 
                                  key={i}
                                  whileHover={{ y: -5 }}
                                  className="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col gap-3 shadow-sm"
                                >
                                   <div className={`w-8 h-8 ${metric.bg} rounded-xl flex items-center justify-center ${metric.color}`}>
                                      <metric.icon className="w-4 h-4" />
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</p>
                                      <p className="text-sm font-black text-slate-900">{metric.val}</p>
                                   </div>
                                </motion.div>
                             ))}
                          </div>
                       </div>

                       {/* Right Content */}
                       <div className="col-span-4 space-y-6">
                          <div className="h-full bg-blue-600 rounded-[40px] p-8 flex flex-col justify-between shadow-2xl shadow-blue-200 relative overflow-hidden group/cta">
                             <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl group-hover/cta:scale-150 transition-transform duration-1000" />
                             
                             <div className="relative z-10 space-y-4">
                                <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl">
                                   <Zap className="w-5 h-5 fill-blue-600" />
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-tight leading-none">Status do <br />Balanceamento</h4>
                                <div className="flex gap-1.5 flex-wrap">
                                   {['#NEXUS', '#AUDIT', '#2026'].map(tag => (
                                      <span key={tag} className="text-[8px] font-black px-2 py-1 bg-white/20 text-white rounded-full uppercase">{tag}</span>
                                   ))}
                                </div>
                             </div>

                             <div className="relative z-10 space-y-4 mt-auto">
                                <div className="space-y-2">
                                   <div className="flex justify-between text-[10px] font-bold text-white/60">
                                      <span>Sync Cloud</span>
                                      <span>94%</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: "94%" }}
                                        transition={{ duration: 1.5, delay: 1 }}
                                        className="h-full bg-white"
                                      />
                                   </div>
                                </div>
                                <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                                   Liberar Fluxo
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Gradient Overlay for modern look */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Micro-Onboarding: Qual a sua dor hoje? */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10"><Brain className="w-64 h-64 text-blue-500" /></div>
              
              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Quick Start Onboarding
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Qual a sua dor hoje?</h2>
                <p className="text-blue-100/60 max-w-2xl mx-auto font-medium">Escolha uma opção e veja a solução ideal agora</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                  {[
                    { label: "Digitação Manual", slug: "pre-contabil-ai", icon: FileText },
                    { label: "Conciliação Bancária", slug: "extratobr", icon: Activity },
                    { label: "Gestão de Prazos", slug: "gestao-escritorio", icon: Zap },
                    { label: "Preços & Lucro", slug: "simulador-honorarios", icon: TrendingUp }
                  ].map((pain, i) => (
                    <Link 
                      key={i} 
                      to={`/solucoes/${pain.slug}`}
                      className="group bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <pain.icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-tighter">{pain.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Mais Usados & Recomendados Carousel/Grid */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="space-y-2">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Trending Now</span>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Mais usados pela comunidade</h2>
            </div>
            <Link to="/solucoes" className="text-blue-600 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
              Ver marketplace completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.filter(p => ['pre-contabil-ai', 'nexus-df', 'extratobr'].includes(p.id)).map(product => (
              <ProductCard key={product.id} product={{...product, badges: ['Mais usado']}} />
            ))}
          </div>

          <div className="mt-32">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div className="space-y-2">
                 <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Smart Matching</span>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Recomendados para você</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-90 grayscale-[0.5] hover:grayscale-0 transition-all">
              {products.filter(p => ['consulta-nfe', 'valida-empresa', 'calculadoras-trabalhistas'].includes(p.id)).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                Conteúdo Educativo
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Conteúdos para contadores</h2>
              <p className="text-xl text-slate-500 font-medium">Dicas práticas e novas formas de trabalhar com contabilidade</p>
            </div>
            <Link to="/blog" className="text-blue-600 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform group">
              Ver todos os conteúdos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all"
              >
                <Link to={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </Link>
                <div className="p-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-medium">
                    {post.summary}
                  </p>
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
                  >
                    Ler conteúdo <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-white flex flex-col items-center text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]">
              Pronto para parar de perder tempo com processos manuais?
            </h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
              Use ferramentas simples, rápidas e feitas para o seu dia a dia contábil.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Link 
              to="/solucoes" 
              className="btn-primary py-6 px-16 text-lg shadow-2xl shadow-blue-100 hover:shadow-blue-200"
            >
              Explorar soluções agora
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
