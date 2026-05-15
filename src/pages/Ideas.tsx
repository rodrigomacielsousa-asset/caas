import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  Plus, 
  ThumbsUp, 
  MessageSquare, 
  TrendingUp, 
  Search, 
  Filter, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  ChevronDown,
  X,
  User,
  ShoppingBag,
  Info,
  Sparkles
} from 'lucide-react';
import { products } from '../data/products';
import { Link } from 'react-router-dom';

interface Comment {
  id: string;
  userName: string;
  date: string;
  text: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  userName: string;
  date: string;
  votes: number;
  comments: Comment[];
  status: 'Votando' | 'Em Análise' | 'Produção' | 'Lançado';
  category: string;
}

const INITIAL_IDEAS: Idea[] = [
  { 
    id: '1', 
    title: 'Conciliação de Cartão STONE Automática', 
    description: 'Uma ferramenta para ler o extrato da Stone e conciliar automaticamente com o ERP contábil via API.', 
    userName: 'Contador HighTech',
    date: '2026-05-10',
    votes: 142, 
    comments: [
      { id: 'c1', userName: 'Maria Silva', date: '2026-05-11', text: 'Precisamos disso urgente! Hoje faço na mão.' },
      { id: 'c2', userName: 'João Rocha', date: '2026-05-12', text: 'Se tiver API da Stone é 100% vivel.' }
    ], 
    status: 'Votando', 
    category: 'Financeiro' 
  },
  { 
    id: '2', 
    title: 'Dashboard de Auditoria em Lote (RFB)', 
    description: 'Cruzar dados do e-CAC de vários clientes de uma vez para identificar divergências de DCTF.', 
    userName: 'Audit Pro',
    date: '2026-05-08',
    votes: 98, 
    comments: [], 
    status: 'Produção', 
    category: 'Compliance' 
  },
  { 
    id: '3', 
    title: 'Gerador de Alçadas via WhatsApp', 
    description: 'Aprovação de pagamentos direto pelo bot no WhatsApp com log centralizado.', 
    userName: 'Gestor Ágil',
    date: '2026-05-05',
    votes: 76, 
    comments: [], 
    status: 'Em Análise', 
    category: 'Gestão' 
  },
  { 
    id: '4', 
    title: 'Extrator de NFSe Prefeituras S/ API', 
    description: 'Robô para prefeituras que não possuem API ou exportação facilitada de notas.', 
    userName: 'Fiscal Tech',
    date: '2026-05-01',
    votes: 215, 
    comments: [], 
    status: 'Votando', 
    category: 'Fiscal' 
  },
];

type SortOption = 'recent' | 'oldest' | 'az' | 'za' | 'votes' | 'comments';

export default function Ideas() {
  const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);
  const [searchQuery, setSearchQuery] = useState('');
  const [newIdea, setNewIdea] = useState({ title: '', description: '' });
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('votes');
  const [votedIdeas, setVotedIdeas] = useState<string[]>([]);
  const [commentText, setCommentText] = useState('');

  // Handle Voting
  const handleVote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (votedIdeas.includes(id)) return;

    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, votes: idea.votes + 1 } : idea
    ));
    setVotedIdeas(prev => [...prev, id]);
  };

  // Handle New Idea Submit
  const handleSubmitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.title || !newIdea.description || searchQuery.length < 3) return;
    
    const idea: Idea = {
      id: Date.now().toString(),
      title: newIdea.title,
      description: newIdea.description,
      userName: 'Usuário logado',
      date: new Date().toISOString().split('T')[0],
      votes: 1,
      comments: [],
      status: 'Votando',
      category: 'Comunidade'
    };
    
    setIdeas([idea, ...ideas]);
    setNewIdea({ title: '', description: '' });
    setSearchQuery('');
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !selectedIdea) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userName: 'Você',
      date: new Date().toISOString().split('T')[0],
      text: commentText
    };

    setIdeas(prev => prev.map(idea => 
      idea.id === selectedIdea.id 
        ? { ...idea, comments: [newComment, ...idea.comments] }
        : idea
    ));
    setSelectedIdea(prev => prev ? {
      ...prev,
      comments: [newComment, ...prev.comments]
    } : null);
    setCommentText('');
  };

  // Smart Search logic
  const suggestedIdeas = useMemo(() => {
    if (searchQuery.length < 3) return [];
    return ideas.filter(i => 
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, ideas]);

  const suggestedProducts = useMemo(() => {
    if (searchQuery.length < 3) return [];
    return products.filter(p => 
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Sorting logic
  const sortedIdeas = useMemo(() => {
    return [...ideas].sort((a, b) => {
      switch (sortBy) {
        case 'recent': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'az': return a.title.localeCompare(b.title);
        case 'za': return b.title.localeCompare(a.title);
        case 'votes': return b.votes - a.votes;
        case 'comments': return b.comments.length - a.comments.length;
        default: return 0;
      }
    });
  }, [ideas, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Hero Section */}
      <section className="bg-white pt-32 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              Laboratório de Inovação
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              Sugestões e <span className="text-blue-600">Ideias</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              O ecossistema é movido pela sua necessidade. Pesquise, vote e contribua com as próximas ferramentas do mercado.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Section: Search & New Idea */}
          <section className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Pesquise se essa ideia já existe</h3>
                    <p className="text-sm text-slate-400 font-medium italic font-serif">Ou se já temos uma ferramenta pronta.</p>
                  </div>
                </div>
                <div className="relative">
                   <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Pesquise por palavras-chave (ex: Stone, ERP, Fiscal...)" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl py-5 pl-14 pr-14 text-sm font-bold outline-none transition-all"
                   />
                   {searchQuery && (
                     <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                      title="Limpar busca"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   )}
                </div>
              </div>

              {/* Suggestions results */}
              <AnimatePresence>
                {searchQuery.length >= 3 && (suggestedIdeas.length > 0 || suggestedProducts.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-6 bg-blue-50 rounded-3xl border border-blue-100"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                       <Info className="w-3 h-3" /> Encontramos resultados semelhantes:
                    </p>
                    <div className="space-y-3">
                      {suggestedProducts.map(p => (
                        <Link 
                          key={p.id} 
                          to={`/solucoes/${p.slug}`}
                          className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-200 hover:border-blue-600 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                               <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                               <div className="text-[10px] font-bold text-emerald-600 uppercase">SOLUÇÃO EXISTENTE</div>
                               <div className="text-sm font-black text-slate-900">{p.subtitle}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      ))}
                      {suggestedIdeas.map(i => (
                        <button 
                          key={i.id} 
                          onClick={() => setSelectedIdea(i)}
                          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-amber-200 hover:border-amber-600 transition-all group text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                               <Lightbulb className="w-5 h-5" />
                            </div>
                            <div>
                               <div className="text-[10px] font-bold text-amber-600 uppercase">IDEIA JÁ SUGERIDA</div>
                               <div className="text-sm font-black text-slate-900">{i.title}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400">{i.votes} votos</span>
                            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form - only visible if user has searched something */}
              {searchQuery.length >= 3 && (
                <div className="pt-8 border-t border-slate-100 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Crie sua nova ideia</h3>
                        <p className="text-sm text-slate-400 font-medium">Se não encontrou nada parecido, publique agora.</p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmitIdea} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <input 
                        type="text" 
                        placeholder="Título da ideia (ex: Extrator de PDF Itaú)"
                        value={newIdea.title}
                        onChange={e => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <textarea 
                        placeholder="Descreva detalhadamente o problema e como essa solução ajudaria seu dia a dia..."
                        value={newIdea.description}
                        onChange={e => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-sm font-bold min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <button type="submit" className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                      Publicar ideia <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>

          {/* Ideas List Section */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Ideias da comunidade</h2>
                <p className="text-slate-500 font-medium">O que as pessoas estão sugerindo.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="votes">Mais votadas</option>
                    <option value="recent">Mais recentes</option>
                    <option value="oldest">Mais antigas</option>
                    <option value="comments">Mais comentadas</option>
                    <option value="az">A → Z</option>
                    <option value="za">Z → A</option>
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Internal Scroll List */}
            <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden">
               <div className="max-h-[800px] overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  {sortedIdeas.map((idea) => (
                    <motion.div 
                      layout
                      key={idea.id}
                      onClick={() => setSelectedIdea(idea)}
                      className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-transparent hover:border-blue-100 hover:bg-white transition-all flex flex-col md:flex-row gap-8 group cursor-pointer"
                    >
                      <div className="order-2 md:order-1 flex-grow space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-white text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">
                             {idea.category}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                             <User className="w-3 h-3" /> {idea.userName}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                             <Clock className="w-3 h-3" /> {new Date(idea.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{idea.title}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">{idea.description}</p>
                        <div className="flex items-center gap-6 pt-2">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-all">
                             <MessageSquare className="w-4 h-4" /> {idea.comments.length} comentários
                          </div>
                        </div>
                      </div>
                      
                      <div className="order-1 md:order-2 shrink-0 flex items-center md:flex-col justify-center gap-4 bg-white rounded-3xl p-6 md:min-w-[120px] shadow-sm group-hover:shadow-md transition-all border border-slate-100">
                        <div className="text-center">
                          <div className="text-3xl font-black text-slate-900">{idea.votes}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Votos</div>
                        </div>
                        <button 
                          onClick={(e) => handleVote(idea.id, e)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                            votedIdeas.includes(idea.id) 
                              ? 'bg-blue-600 text-white cursor-default' 
                              : 'bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp className="w-32 h-32 text-blue-500" /></div>
             <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-black tracking-tight">Ideias em Destaque</h3>
                <p className="text-slate-400 text-sm font-medium">As mais votadas entram no radar do nosso time técnico.</p>
                <div className="pt-4 space-y-4 border-t border-white/10">
                   {ideas.sort((a,b) => b.votes - a.votes).slice(0, 3).map((top, i) => (
                     <div key={top.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => setSelectedIdea(top)}>
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center font-black text-[10px]">{i+1}</div>
                        <div className="flex-grow">
                          <div className="text-[11px] font-black uppercase text-white/90 group-hover:text-blue-400 transition-colors">{top.title}</div>
                          <div className="text-[9px] font-bold text-blue-500">{top.votes} votos</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           </div>

           <div className="bg-white rounded-[3rem] p-10 border border-slate-200 space-y-6">
              <h3 className="text-xl font-black tracking-tight">O Fluxo da Inovação</h3>
              <div className="space-y-6">
                 {[
                   { t: "Você sugere", d: "Relate uma dor real do seu escritório ou dia a dia.", i: <Lightbulb className="w-4 h-4" /> },
                   { t: "Comunidade valida", d: "Outros usuários votam e comentam para dar peso à ideia.", i: <ThumbsUp className="w-4 h-4" /> },
                   { t: "Nós Construímos", d: "Ideias viáveis entram no pipeline de desenvolvimento.", i: <CheckCircle2 className="w-4 h-4" /> },
                   { t: "Todos Ganham", d: "Lançamos uma micro-ferramenta rápida e cirúrgica.", i: <Sparkles className="w-4 h-4" /> }
                 ].map((step, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                        {step.i}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{step.t}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Idea Detail Modal */}
      <AnimatePresence>
        {selectedIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIdea(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto scrollbar-hide">
                <button 
                  onClick={() => setSelectedIdea(null)}
                  className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                      {selectedIdea.category}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Postado por {selectedIdea.userName} em {new Date(selectedIdea.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">{selectedIdea.title}</h2>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedIdea.description}
                  </p>
                </div>

                <div className="flex items-center gap-8 py-8 border-y border-slate-100">
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-slate-900">{selectedIdea.votes}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de votos</div>
                  </div>
                  <button 
                    onClick={(e) => handleVote(selectedIdea.id, e)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      votedIdeas.includes(selectedIdea.id) 
                        ? 'bg-blue-600 text-white cursor-default' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl active:scale-95'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" /> {votedIdeas.includes(selectedIdea.id) ? 'Votado' : 'Apoiar esta ideia'}
                  </button>
                </div>

                {/* Comments Section */}
                <div className="space-y-8">
                  <h4 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" /> Comentários ({selectedIdea.comments.length})
                  </h4>
                  
                  <form onSubmit={handleAddComment} className="space-y-4">
                    <textarea 
                      placeholder="Adicione sua opinião ou sugestão de melhoria..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-bold min-h-[80px] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                      Comentar
                    </button>
                  </form>

                  <div className="space-y-6 pt-4">
                    {selectedIdea.comments.length > 0 ? (
                      selectedIdea.comments.map(comment => (
                        <div key={comment.id} className="space-y-2 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{comment.userName}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(comment.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                        <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm font-medium text-slate-400 italic">Nenhum comentário ainda. Seja o primeiro!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

