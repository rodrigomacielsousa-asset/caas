import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Inbox, CheckCircle, XCircle, Edit, Trash2, ExternalLink, ArrowRight, ShoppingBag, Users, Zap, Link as LinkIcon, Plus, Save } from 'lucide-react';
import { storageService } from '../services/storageService';
import { productService } from '../services/productService';
import type { Product, Submission, CheckoutRequest, Entitlement, Bundle } from '../types';
import { cn } from '../lib/utils';

type AdminTab = 'dashboard' | 'products' | 'bundles' | 'submissions' | 'checkout_requests' | 'users';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [checkoutRequests, setCheckoutRequests] = useState<CheckoutRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Product Edit State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    async function loadData() {
      const [subs, checkouts, prods, bunds] = await Promise.all([
        storageService.getSubmissions(),
        storageService.getCheckoutRequests(),
        productService.getProducts(),
        productService.getBundles()
      ]);
      setSubmissions(subs);
      setCheckoutRequests(checkouts);
      setProducts(prods);
      setBundles(bunds);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
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

  const stats = {
    totalProducts: products.length,
    totalBundles: bundles.length,
    pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
    pendingCheckouts: checkoutRequests.filter(r => r.status === 'pending').length,
    totalSubmissions: submissions.length
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Portal Admin</h1>
          <p className="text-slate-500">Gestão do Ecossistema MicroCaaS</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === 'dashboard' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === 'products' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            <Package className="w-4 h-4" /> Produtos
          </button>
          <button 
            onClick={() => setActiveTab('bundles')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === 'bundles' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            <Zap className="w-4 h-4" /> Combos
          </button>
          <button 
            onClick={() => setActiveTab('checkout_requests')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === 'checkout_requests' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            <ShoppingBag className="w-4 h-4" /> Pedidos
            {checkoutRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('submissions')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === 'submissions' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            <Inbox className="w-4 h-4" /> Submissões
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === 'users' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            <Users className="w-4 h-4" /> Usuários
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Total MicroCaaS</h3>
            <div className="text-5xl font-bold text-indigo-600 tracking-tight">{stats.totalProducts}</div>
            <p className="text-sm text-slate-500 mt-2">No marketplace público</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Pendentes</h3>
            <div className="text-5xl font-bold text-amber-500 tracking-tight">{stats.pendingSubmissions}</div>
            <p className="text-sm text-slate-500 mt-2">Aguardando curadoria</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Histórico</h3>
            <div className="text-5xl font-bold text-emerald-500 tracking-tight">{stats.totalSubmissions}</div>
            <p className="text-sm text-slate-500 mt-2">Submissões totais recebidas</p>
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
                <div className="flex items-center gap-2 mt-6">
                  <input 
                    type="checkbox" 
                    id="isFree"
                    checked={editingProduct.isFree || false} 
                    onChange={e => setEditingProduct({ ...editingProduct, isFree: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="isFree" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Produto Gratuito? (isFree)
                  </label>
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
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Acesso</th>
                  <th className="px-6 py-4">Modelo</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{p.slug}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        p.isFree ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {p.isFree ? 'Gratuito' : 'Pago'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                         p.pricingModel === 'free' ? "bg-emerald-100 text-emerald-700" :
                         p.pricingModel === 'subscription' ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                       )}>
                         {p.pricingModel}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-sm">{p.priceLabel}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold">Gerenciar Combos (Bundles)</h3>
            <button className="btn-primary py-2 px-4 text-xs">Novo Combo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Itens Incluídos</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bundles.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{b.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {b.bundleItems.map((item: string) => (
                          <span key={item} className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded text-[9px] font-bold">{item}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-sm">{b.priceLabel}</td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase">{b.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Edit className="w-4 h-4" /></button>
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">Controle de Entitlements</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Em breve: Liste usuários e conceda acesso direto a soluções pagas (bypass de checkout).</p>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-6">
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
                        sub.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{sub.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
                      <span>👤 {sub.userEmail}</span>
                      <span>📁 {sub.area}</span>
                      <span>💰 {sub.pricingModel}</span>
                      <span>📅 {new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full md:auto">
                    {sub.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(sub.id, 'approved')}
                          className="flex items-center justify-center gap-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-105"
                        >
                          <CheckCircle className="w-4 h-4" /> Aprovar
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(sub.id, 'rejected')}
                          className="flex items-center justify-center gap-2 py-3 px-6 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-bold transition-all"
                        >
                          <XCircle className="w-4 h-4" /> Rejeitar
                        </button>
                      </>
                    )}
                    <button className="flex items-center justify-center gap-2 py-3 px-6 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-bold transition-all">
                      <Edit className="w-4 h-4" /> Editar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
