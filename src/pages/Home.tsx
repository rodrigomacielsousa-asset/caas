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
import { productService } from '../services/productService';
import { cn } from '../lib/utils';
import { blogService } from '../services/blogService';
import type { BlogPost, Product } from '../types';

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allPosts, allProducts] = await Promise.all([
          blogService.getPosts(),
          productService.getProducts()
        ]);
        
        const published = allPosts
          .filter(p => p.status === 'published')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        
        setPosts(published);
        
        // Ensure we handle potential undefined status gracefully
        const active = allProducts.filter(p => !p.status || p.status === 'active' || p.status === 'beta');
        setProducts(active);
      } catch (err) {
        console.error("Critical error in loadData:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredProducts = useMemo(() => 
    products.filter(p => p.isFeatured || p.badges?.includes('Destaque')).slice(0, 3), 
  [products]);

  const trendingProducts = useMemo(() => 
    products.slice(0, 3), 
  [products]);

  // Hero Message
  const heroContent = {
    overline: "Plataforma de Inteligência Contábil",
    title: "Ecossistema de Micro-Soluções",
    subtitle: "A revolução CaaS (Accounting as a Service) chegou. Ferramentas cirúrgicas para contadores que não aceitam o \"tamanho único\" dos ERPs gigantes."
  };

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return ['Todas', ...Array.from(new Set(cats))];
  }, [products]);

  const filteredProducts = products.filter(p => {
    const s = search.toLowerCase();
    const matchesSearch = 
      (p.name?.toLowerCase() || '').includes(s) || 
      (p.subtitle?.toLowerCase() || '').includes(s);
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
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-widest text-slate-600">
                  <Sparkles className="w-3 h-3 text-blue-600" /> {heroContent.overline}
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                  {heroContent.title}
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                  {heroContent.subtitle}
                </p>
              </div>
              
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
            {trendingProducts.map(product => (
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
              {featuredProducts.map(product => (
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
