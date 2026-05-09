import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Settings, 
  ExternalLink, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  Filter,
  User as UserIcon,
  Zap,
  LayoutGrid,
  Mail,
  ArrowRight
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { dbService } from '../services/dbService';
import { productService } from '../services/productService';
import type { Product, CheckoutRequest } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface OrderHistory {
  id: string;
  items: string[];
  totalLabel: string;
  status: string;
  createdAt: string;
  userEmail?: string;
}

export default function Dashboard() {
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        const mock = localStorage.getItem('mock_user');
        setUser(mock ? JSON.parse(mock) : null);
      } else {
        setUser(u);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;

      try {
        const [allProds, allOrders] = await Promise.all([
          productService.getProducts(),
          dbService.getCollection<OrderHistory>('orders')
        ]);

        // Filtrar ordens do usuário atual
        const userOrders = allOrders.filter(o => o.userEmail === user.email);
        setOrders(userOrders);

        // Identificar produtos que o usuário possui acesso
        // (Acesso gratuito + Produtos comprados)
        const purchasedSlugs = userOrders
          .filter(o => o.status === 'paid')
          .flatMap(o => o.items);

        const accessible = allProds.filter(p => p.isFree || purchasedSlugs.includes(p.slug));
        setActiveProducts(accessible);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
           <LayoutGrid className="w-12 h-12 text-indigo-600 mb-4" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Preparando seu workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[32px] flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Acesso Negado</h2>
          <p className="text-slate-500 max-w-xs mx-auto">Você precisa estar logado para acessar seu Dashboard.</p>
          <Link to="/login" className="btn-primary py-4 px-8 inline-block">Fazer Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Profile Area */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-200 dark:shadow-none">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Olá, {user?.displayName?.split(' ')[0] || 'Usuário'}</h1>
                <div className="flex gap-4 text-sm font-medium text-slate-500">
                   <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {user?.email}</span>
                   <span className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> {activeProducts.length} Ferramentas</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all"><Settings className="w-4 h-4" /> Configurações</button>
               <Link to="/microcaas" className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-indigo-200 shadow-lg hover:bg-indigo-700 transition-all">Consumir Créditos</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main List: Active Tools */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                Minhas Ferramentas <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">{activeProducts.length}</span>
              </h2>
              <div className="flex gap-2">
                 <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"><Filter className="w-4 h-4" /></button>
                 <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {activeProducts.length === 0 ? (
                 <div className="col-span-2 py-24 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-slate-400 font-bold">Você ainda não possui ferramentas pagas.</p>
                    <Link to="/microcaas" className="text-indigo-600 text-sm font-bold mt-4 inline-block hover:underline">Explorar Marketplace</Link>
                 </div>
               ) : (
                 activeProducts.map((p) => (
                   <motion.div
                    whileHover={{ y: -5 }}
                    key={p.id}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
                   >
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                           <Zap className="w-7 h-7" />
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                          p.isFree ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
                        )}>
                          {p.isFree ? 'Gratuito' : 'Licenciado'}
                        </span>
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{p.name}</h3>
                     <p className="text-sm text-slate-500 mb-8 line-clamp-2">{p.description}</p>
                     
                     <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Último acesso: 2h atrás</span>
                        <Link 
                          to={p.liveUrl || `/app/${p.slug}`}
                          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-all"
                        >
                          Acessar <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                     </div>
                   </motion.div>
                 ))
               )}
            </div>
          </div>

          {/* Right Sidebar: History & Billing */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
               <h3 className="font-bold mb-6 flex items-center gap-2">
                 <CreditCard className="w-5 h-5 text-indigo-600" /> Histórico de Pedidos
               </h3>
               {orders.length === 0 ? (
                 <p className="text-sm text-slate-400 py-8 text-center italic">Sem transações registradas.</p>
               ) : (
                 <div className="space-y-6">
                   {orders.map(order => (
                     <div key={order.id} className="flex justify-between items-start group cursor-pointer">
                       <div className="flex gap-4">
                         <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-all">
                            <ShoppingBag className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Pedido #{order.id?.slice(-4).toUpperCase()}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                         </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{order.totalLabel}</p>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 mt-1 justify-end",
                            order.status === 'paid' ? "text-emerald-500" : "text-amber-500"
                          )}>
                            {order.status === 'paid' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                            {order.status}
                          </span>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
               <button className="w-full mt-8 py-3 text-xs font-bold text-slate-400 hover:text-indigo-600 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-100 transition-all">Ver faturas em PDF</button>
            </div>

            <div className="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden">
               {/* Decor circles */}
               <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
               <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-600/30 rounded-full blur-2xl" />
               
               <div className="relative z-10">
                  <h4 className="text-lg font-black leading-tight mb-4 tracking-tight">Vantagens VIP <br /> MicroCaaS</h4>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Suporte em 4h via WhatsApp",
                      "Acesso antecipado a betas",
                      "Workshop mensal exclusivo"
                    ].map(v => (
                      <li key={v} className="flex items-center gap-2 text-xs font-medium text-indigo-200">
                         <div className="w-1 h-1 bg-white rounded-full" /> {v}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-bold flex items-center justify-center gap-2 group">
                    Explorar Bundles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                     <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Segurança</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Autenticação MFA ativa</p>
                  </div>
               </div>
               <button className="p-2 text-slate-400 hover:text-indigo-600"><Download className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
