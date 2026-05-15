import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { blogService } from '../services/blogService';
import { productService } from '../services/productService';
import type { BlogPost, Product } from '../types';
import { ArrowLeft, Calendar, Clock, Share2, Rocket } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedProduct, setRelatedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      const data = await blogService.getPostBySlug(slug);
      if (!data) {
        navigate('/blog');
        return;
      }
      setPost(data);
      
      if (data.relatedProductId) {
        const products = await productService.getProducts();
        const found = products.find(p => p.slug === data.relatedProductId);
        if (found) setRelatedProduct(found);
      }
      
      setLoading(false);
    }
    loadPost();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  if (loading || !post) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Hero */}
      <div className="relative h-[60vh] min-h-[400px] w-full mt-24">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-16">
          <div className="max-w-4xl mx-auto px-4">
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 font-black uppercase text-[10px] tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
            </Link>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-8">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 text-white/60 font-bold uppercase text-[10px] tracking-widest">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> {new Date(post.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> 5 min leitura</span>
              <button className="flex items-center gap-2 hover:text-white transition-colors"><Share2 className="w-4 h-4 text-blue-500" /> Compartilhar</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row gap-20">
          <article className="flex-1 max-w-3xl prose prose-slate prose-lg">
            <div 
              className="font-medium text-slate-700 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-96 space-y-12">
            {relatedProduct && (
              <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 shadow-sm sticky top-32">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                  Resolva isso agora com o <span className="text-blue-600">{relatedProduct.name}</span>
                </h3>
                <p className="text-slate-500 mb-8 font-medium">
                  Pare de sofrer com processos manuais. Conheça a nossa micro solução específica para este problema.
                </p>
                <Link 
                  to={`/solucao/${relatedProduct.slug}`}
                  className="w-full btn-primary py-4 text-center block shadow-xl shadow-blue-100"
                >
                  Ver solução relacionada
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
