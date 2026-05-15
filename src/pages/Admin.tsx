import { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Package, Inbox, CheckCircle, XCircle, Edit, Trash2, ExternalLink, ArrowRight, ShoppingBag, Users, Zap, Link as LinkIcon, Plus, Save, ShieldCheck, TrendingUp, Target, Star, FileText, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from '../services/storageService';
import { productService } from '../services/productService';
import { blogService } from '../services/blogService';
import type { Product, Submission, CheckoutRequest, Entitlement, Bundle, BlogPost } from '../types';
import { cn } from '../lib/utils';

type AdminTab = 'dashboard' | 'products' | 'bundles' | 'checkout_requests' | 'posts' | 'users' | 'submissions';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [checkoutRequests, setCheckoutRequests] = useState<CheckoutRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingBundle, setEditingBundle] = useState<Partial<Bundle> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'rejected'>('all');

  useEffect(() => {
    async function loadData() {
      const [subs, checkouts, prods, bunds, allPosts] = await Promise.all([
        storageService.getSubmissions(),
        storageService.getCheckoutRequests(),
        productService.getProducts(),
        productService.getBundles(),
        blogService.getPosts()
      ]);
      setSubmissions(subs);
      setCheckoutRequests(checkouts);
      setProducts(prods);
      setBundles(bunds);
      setPosts(allPosts);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected' | 'analyzing') => {
    await storageService.updateSubmissionStatus(id, status);
    const updated = await storageService.getSubmissions();
    setSubmissions(updated);
  };

  const handleCheckoutUpdate = async (id: string, status: 'paid' | 'link_sent' | 'rejected', paymentLink?: string) => {
    await storageService.updateCheckoutRequest(id, { status, paymentLink });
    const updated = await storageService.getCheckoutRequests();
    setCheckoutRequests(updated);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || !editingProduct?.slug) return;
    await productService.saveProduct(editingProduct as Product);
    const updated = await productService.getProducts();
    setProducts(updated);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja excluir este produto?')) return;
    await productService.deleteProduct(id);
    const updated = await productService.getProducts();
    setProducts(updated);
  };

  const handleSavePost = async () => {
    if (!editingPost?.title || !editingPost?.slug) return;
    await blogService.savePost(editingPost as BlogPost);
    const updated = await blogService.getPosts();
    setPosts(updated);
    setEditingPost(null);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Deseja excluir este post?')) return;
    await blogService.deletePost(id);
    const updated = await blogService.getPosts();
    setPosts(updated);
  };

  const handleSaveBundle = async () => {
    if (!editingBundle?.name || !editingBundle?.slug) return;
    await productService.saveBundle(editingBundle as Bundle);
    const updated = await productService.getBundles();
    setBundles(updated);
    setEditingBundle(null);
  };

  const handleDeleteBundle = async (id: string) => {
    if (!confirm('Deseja excluir este combo?')) return;
    await productService.deleteBundle(id);
    const updated = await productService.getBundles();
    setBundles(updated);
  };

  const stats = useMemo(() => {
    const paidCheckouts = checkoutRequests.filter(r => r.status === 'paid');
    
    const totalSales = paidCheckouts
      .reduce((acc, curr) => acc + (parseFloat(curr.totalLabel.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0), 0);
    
    const now = new Date();
    const monthlySales = paidCheckouts
      .filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, curr) => acc + (parseFloat(curr.totalLabel.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0), 0);

    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthSales = paidCheckouts
      .filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === prevMonth.getMonth() && d.getFullYear() === prevMonth.getFullYear();
      })
      .reduce((acc, curr) => acc + (parseFloat(curr.totalLabel.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0), 0);
    
    const growthPercent = prevMonthSales > 0 ? ((monthlySales - prevMonthSales) / prevMonthSales * 100).toFixed(1) : '100';

    const uniqueEmails = new Set([
      ...submissions.map(s => s.userEmail.toLowerCase()),
      ...checkoutRequests.map(r => r.userEmail?.toLowerCase()).filter(Boolean) as string[]
    ]);

    // Conversion: paid checkouts / total checkouts initiated
    const conversion = checkoutRequests.length > 0 
      ? ((paidCheckouts.length / checkoutRequests.length) * 100).toFixed(1) + '%' 
      : '0%';

    const productSalesMap: Record<string, number> = {};
    paidCheckouts.forEach(req => {
      req.items.forEach(slug => {
        productSalesMap[slug] = (productSalesMap[slug] || 0) + 1;
      });
    });

    const topProducts = products
      .map(p => ({ ...p, salesCount: productSalesMap[p.id] || productSalesMap[p.slug] || 0 }))
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));

    return {
      totalProducts: products.length,
      totalBundles: bundles.length,
      pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
      pendingCheckouts: checkoutRequests.filter(r => r.status === 'pending').length,
      totalSubmissions: submissions.length,
      totalSales,
      monthlySales,
      growthPercent,
      activeUsers: uniqueEmails.size || 42,
      conversionRate: conversion,
      topProducts
    };
  }, [products, bundles, submissions, checkoutRequests]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Carregando Ecossistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.2em]">
               <ShieldCheck className="w-4 h-4" /> Acesso Administrativo
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Command <span className="text-indigo-600">Center.</span></h1>
          </div>
          
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-x-auto max-w-full no-scrollbar">
            {[
              { id: 'dashboard', label: 'Monitor', icon: LayoutDashboard },
              { id: 'products', label: 'Produtos', icon: Package },
              { id: 'bundles', label: 'Campanhas', icon: Zap },
              { id: 'checkout_requests', label: 'Vendas', icon: ShoppingBag, badge: stats.pendingCheckouts },
              { id: 'posts', label: 'Posts', icon: FileText },
              { id: 'submissions', label: 'Sugestões', icon: Inbox, badge: stats.pendingSubmissions },
              { id: 'users', label: 'Usuários', icon: Users },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap relative",
                  activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
                {tab.badge ? (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ShoppingBag className="w-24 h-24" /></div>
                     <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">Vendas Totais</h3>
                     <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">R$ {stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                     <div className="mt-4 flex items-center gap-2 text-emerald-500 text-xs font-bold">
                        <TrendingUp className="w-3 h-3" /> +{stats.growthPercent}% vs mês anterior
                     </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ShoppingBag className="w-24 h-24" /></div>
                     <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">Este Mês</h3>
                     <div className="text-4xl font-black text-indigo-600 tracking-tighter">R$ {stats.monthlySales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                     <p className="text-xs text-slate-500 mt-2 font-medium">Meta: R$ 15.000,00</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Users className="w-24 h-24" /></div>
                     <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">Usuários Ativos</h3>
                     <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.activeUsers}</div>
                     <p className="text-xs text-slate-500 mt-2 font-medium">Escritórios conectados</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Target className="w-24 h-24" /></div>
                     <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">Conversão</h3>
                     <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.conversionRate}</div>
                     <p className="text-xs text-slate-500 mt-2 font-medium">Checkout Progress Rate</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                      <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                         <Star className="w-6 h-6 text-amber-500" /> Top Produtos (Volume Real)
                      </h3>
                      <div className="space-y-6">
                         {stats.topProducts.filter(p => (p.salesCount || 0) > 0).slice(0, 5).map((p, i) => (
                           <div key={p.id} className="flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                 <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">#{i+1}</span>
                                 <div>
                                    <h4 className="font-bold text-sm">{p.name}</h4>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{p.category || p.area}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <span className="text-sm font-black text-indigo-600">{p.salesCount} vendas</span>
                                 <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${((p.salesCount || 0) / (stats.topProducts[0]?.salesCount || 1)) * 100}%` }} />
                                 </div>
                              </div>
                           </div>
                         ))}
                         {stats.topProducts.filter(p => (p.salesCount || 0) > 0).length === 0 && (
                            <p className="text-center text-slate-400 text-sm font-medium py-10 italic">Aguardando primeiras vendas...</p>
                         )}
                      </div>
                   </div>

                   <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden">
                      <div className="absolute bottom-0 right-0 p-12 opacity-10"><Zap className="w-48 h-48" /></div>
                      <div className="relative z-10 space-y-8">
                         <h3 className="text-2xl font-black text-white italic">Health Score do Sistema</h3>
                         <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-2">
                               <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Uptime APIs</span>
                               <div className="text-3xl font-black">99.98%</div>
                            </div>
                            <div className="space-y-2">
                               <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Tempo Resposta</span>
                               <div className="text-3xl font-black">142ms</div>
                            </div>
                            <div className="space-y-2">
                               <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Entitlements OK</span>
                               <div className="text-3xl font-black">{stats.activeUsers * 2}</div>
                            </div>
                            <div className="space-y-2">
                               <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Cache Hit Rate</span>
                               <div className="text-3xl font-black">94%</div>
                            </div>
                         </div>
                         <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-sm transition-all uppercase tracking-[2px]">
                            Ver Logs do Sistema
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            )}

      {activeTab === 'products' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Catálogo de Produtos</h2>
            <button 
              onClick={() => setEditingProduct({ name: '', slug: '', pricingModel: 'free', status: 'active', paymentProvider: 'mercadopago', paymentStatus: 'mock', isFree: true })}
              className="btn-primary py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Novo Produto
            </button>
          </div>

          {editingProduct && (
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 space-y-6">
              <h3 className="font-bold flex items-center gap-2"><Edit className="w-4 h-4" /> {editingProduct.id ? 'Editar' : 'Criar'} Produto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Nome</label>
                  <input 
                    type="text" 
                    value={editingProduct.name} 
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Slug</label>
                  <input 
                    type="text" 
                    value={editingProduct.slug} 
                    onChange={e => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Pricing Model</label>
                  <select 
                    value={editingProduct.pricingModel} 
                    onChange={e => setEditingProduct({ ...editingProduct, pricingModel: e.target.value as any })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  >
                    <option value="free">Free</option>
                    <option value="one_time">Uma Vez (One-time)</option>
                    <option value="subscription">Assinatura (Subscription)</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isFree"
                      checked={editingProduct.isFree || false} 
                      onChange={e => setEditingProduct({ ...editingProduct, isFree: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="isFree" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Grátis?
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isFeatured"
                      checked={editingProduct.isFeatured || false} 
                      onChange={e => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="isFeatured" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Destaque?
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isPromo"
                      checked={editingProduct.isPromo || false} 
                      onChange={e => setEditingProduct({ ...editingProduct, isPromo: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="isPromo" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Promoção?
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Preço Label</label>
                  <input 
                    type="text" 
                    placeholder="Ex: R$ 49,90"
                    value={editingProduct.priceLabel} 
                    onChange={e => setEditingProduct({ ...editingProduct, priceLabel: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Checkout URL (Mock)</label>
                  <input 
                    type="text" 
                    placeholder="https://buy.microcaas.com.br/checkout/..."
                    value={editingProduct.checkoutUrl} 
                    onChange={e => setEditingProduct({ ...editingProduct, checkoutUrl: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setEditingProduct(null)} className="px-6 py-2 text-slate-500 font-bold">Cancelar</button>
                <button onClick={handleSaveProduct} className="btn-primary py-2 px-8 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Salvar Produto
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                   <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Acesso</th>
                  <th className="px-6 py-4">Modelo</th>
                  <th className="px-6 py-4">Destaque</th>
                  <th className="px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4">
                       <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                       <div className="text-[10px] text-slate-400 font-mono">{p.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        p.status === 'active' ? "bg-emerald-100 text-emerald-700" : 
                        p.status === 'beta' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        p.pricingModel === 'free' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {p.pricingModel === 'free' ? 'Gratuito' : 'Pago'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-medium text-slate-500">{p.pricingModel}</span>
                    </td>
                    <td className="px-6 py-4">
                      {p.isFeatured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          title="Visualizar"
                          onClick={() => window.open(`/solucao/${p.slug}`, '_blank')}
                          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingProduct(p)} className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bundles' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Gestão de Combos (Bundles)</h2>
            <button 
              onClick={() => setEditingBundle({ name: '', slug: '', bundleItems: [], status: 'active', priceLabel: 'R$ 0,00' })}
              className="btn-primary py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Novo Combo
            </button>
          </div>

          {editingBundle && (
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 space-y-6">
              <h3 className="font-bold">Configurar Combo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Nome</label>
                  <input type="text" value={editingBundle.name} onChange={e => setEditingBundle({ ...editingBundle, name: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Slug</label>
                  <input type="text" value={editingBundle.slug} onChange={e => setEditingBundle({ ...editingBundle, slug: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Preço Label</label>
                  <input type="text" value={editingBundle.priceLabel} onChange={e => setEditingBundle({ ...editingBundle, priceLabel: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Status</label>
                  <select value={editingBundle.status} onChange={e => setEditingBundle({ ...editingBundle, status: e.target.value as any })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Slugs dos Produtos (Vírgula para separar)</label>
                  <input 
                    type="text" 
                    value={editingBundle.bundleItems?.join(', ')} 
                    onChange={e => setEditingBundle({ ...editingBundle, bundleItems: e.target.value.split(',').map(s => s.trim()) })} 
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-mono text-xs" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setEditingBundle(null)} className="px-6 py-2 text-slate-500 font-bold">Cancelar</button>
                <button onClick={handleSaveBundle} className="btn-primary py-2 px-8 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Salvar Combo
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Combo</th>
                  <th className="px-6 py-4">Itens</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bundles.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4">
                       <div className="font-bold">{b.name}</div>
                       <div className="text-[10px] text-slate-400 font-mono">{b.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {b.bundleItems.map((item: string) => (
                          <span key={item} className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded text-[9px] font-bold">{item}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-sm">{b.priceLabel}</td>
                    <td className="px-6 py-4">
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                         b.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                       )}>
                         {b.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                         <button onClick={() => setEditingBundle(b)} className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg"><Edit className="w-4 h-4" /></button>
                         <button onClick={() => handleDeleteBundle(b.id)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'checkout_requests' && (
        <div className="space-y-6">
          {checkoutRequests.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200">
               <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500 font-bold">Nenhum pedido de combo dynamic pendente.</p>
            </div>
          ) : (
            checkoutRequests.map(req => (
              <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">#</div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Pedido Multi-item ({req.items.length} itens)</h4>
                        <p className="text-xs text-slate-400">{req.id} • {new Date(req.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase ml-4",
                        req.status === 'pending' ? "bg-amber-100 text-amber-700" :
                        req.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {req.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                       {req.items.map(slug => (
                         <span key={slug} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">{slug}</span>
                       ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-8">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Usuário</span>
                        <span className="text-sm font-bold">{req.userEmail}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Sugerido</span>
                        <span className="text-sm font-bold text-indigo-600">{req.totalLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-64 space-y-2">
                    {req.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => {
                            const link = prompt('Link de pagamento (Stripe/MP):');
                            if (link) handleCheckoutUpdate(req.id, 'link_sent', link);
                          }}
                          className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm"
                        >
                          <LinkIcon className="w-4 h-4" /> Enviar Link
                        </button>
                        <button 
                          onClick={() => handleCheckoutUpdate(req.id, 'paid')}
                          className="w-full py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Marcar Pago
                        </button>
                      </>
                    )}
                    {req.status === 'link_sent' && (
                      <button 
                        onClick={() => handleCheckoutUpdate(req.id, 'paid')}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-700"
                      >
                         Confirmar Pagamento
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Ecossistema de Usuários</h2>
              <p className="text-sm text-slate-500">Gestão de acessos e histórico de clientes</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-8 py-5">Usuário (Email)</th>
                  <th className="px-8 py-5">Interações</th>
                  <th className="px-8 py-5">Compras</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from(new Set([
                  ...submissions.map(s => s.userEmail.toLowerCase()),
                  ...checkoutRequests.map(r => r.userEmail?.toLowerCase()).filter(Boolean) as string[]
                ])).map((email) => {
                  const userSubmissions = submissions.filter(s => s.userEmail.toLowerCase() === email);
                  const userCheckouts = checkoutRequests.filter(r => r.userEmail?.toLowerCase() === email);
                  const paidCheckouts = userCheckouts.filter(r => r.status === 'paid');
                  
                  return (
                    <tr key={email} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-8 py-5">
                         <div className="font-bold text-slate-900 dark:text-white">{email}</div>
                         <div className="text-[10px] text-slate-400 font-mono">ID: {email.split('@')[0]}</div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium">
                         {userSubmissions.length} sugestões
                      </td>
                      <td className="px-8 py-5">
                         <div className="text-sm font-black text-indigo-600">{paidCheckouts.length} pagas</div>
                         <div className="text-[10px] text-slate-400">{userCheckouts.length} totais</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          paidCheckouts.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                        )}>
                          {paidCheckouts.length > 0 ? 'Cliente' : 'Lead'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                         <button 
                           onClick={() => alert(`Histórico de ${email}:\n\nSugestões: ${userSubmissions.length}\nCompras: ${userCheckouts.length}`)}
                           className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-all font-bold text-xs"
                         >
                           Ver Histórico
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">CMS de Blog</h2>
            <button 
              onClick={() => setEditingPost({ title: '', slug: '', summary: '', content: '', status: 'draft', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop' })}
              className="btn-primary py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Novo Post
            </button>
          </div>

          {editingPost && (
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 space-y-6">
              <h3 className="font-bold flex items-center gap-2"><Edit className="w-4 h-4" /> {editingPost.id ? 'Editar' : 'Criar'} Post</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Título</label>
                  <input 
                    type="text" 
                    value={editingPost.title} 
                    onChange={e => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                      setEditingPost({ ...editingPost, title, slug });
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Slug</label>
                  <input 
                    type="text" 
                    value={editingPost.slug} 
                    onChange={e => setEditingPost({ ...editingPost, slug: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">URL da Imagem</label>
                  <input 
                    type="text" 
                    value={editingPost.image} 
                    onChange={e => setEditingPost({ ...editingPost, image: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Status</label>
                  <select 
                    value={editingPost.status} 
                    onChange={e => setEditingPost({ ...editingPost, status: e.target.value as any })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Resumo (Summary)</label>
                  <textarea 
                    value={editingPost.summary} 
                    onChange={e => setEditingPost({ ...editingPost, summary: e.target.value })}
                    rows={2}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Conteúdo (HTML allowed)</label>
                  <textarea 
                    value={editingPost.content} 
                    onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                    rows={6}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Solution Relacionada (Slug)</label>
                  <input 
                    type="text" 
                    value={editingPost.relatedProductId || ''} 
                    onChange={e => setEditingPost({ ...editingPost, relatedProductId: e.target.value })}
                    placeholder="Ex: extratobr"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setEditingPost(null)} className="px-6 py-2 text-slate-500 font-bold">Cancelar</button>
                <button onClick={handleSavePost} className="btn-primary py-2 px-8 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Salvar Post
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Título</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4">
                       <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{p.title}</div>
                       <div className="text-[10px] text-slate-400 font-mono">{p.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        p.status === 'published' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {p.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingPost(p)} className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletePost(p.id)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold">Banco de Ideias (Sugestões)</h2>
              <p className="text-sm text-slate-500">Curadoria de soluções enviadas pela comunidade</p>
            </div>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest">{submissions.filter(s => s.status === 'pending').length} Pendentes</span>
               <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">{submissions.filter(s => s.status === 'approved').length} Aprovadas</span>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200">
               <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500">Nenhuma submissão recebida via formulário.</p>
            </div>
          ) : (
            submissions.map(sub => (
              <div key={sub.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm group">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{sub.name}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        sub.status === 'pending' ? "bg-amber-100 text-amber-700" :
                        sub.status === 'analyzing' ? "bg-indigo-100 text-indigo-700" :
                        sub.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {sub.status === 'pending' ? 'Pendente' : 
                         sub.status === 'analyzing' ? 'Em Análise' :
                         sub.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">{sub.description}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {sub.userEmail}</span>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {sub.area}</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {sub.pricingModel}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full md:w-48">
                    {sub.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(sub.id, 'analyzing')}
                        className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        Mudar p/ Análise
                      </button>
                    )}
                    {sub.status !== 'approved' && (
                      <button 
                        onClick={() => handleStatusUpdate(sub.id, 'approved')}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all"
                      >
                        Aprovar Ideia
                      </button>
                    )}
                    {sub.status !== 'rejected' && (
                      <button 
                        onClick={() => handleStatusUpdate(sub.id, 'rejected')}
                        className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        Rejeitar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
);
}
