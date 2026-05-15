import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { blogService } from '../services/blogService';
import type { BlogPost } from '../types';
import { ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const allPosts = await blogService.getPosts();
      // Only published posts, sorted by date (most recent first)
      const published = allPosts
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(published);
      setLoading(false);
    }
    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <BookOpen className="w-3 h-3" /> Blog Oficial
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            Conteúdos para <span className="text-blue-600">contadores.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            Dicas práticas, tendências e novas formas de evoluir no dia a dia contábil com o uso de tecnologia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
            >
              <Link to={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5 min leitura</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-4 group-hover:underline">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                  {post.summary}
                </p>
                <Link 
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest group/btn"
                >
                  Ler mais <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
