import React, { useState } from 'react';
import { 
  CreditCard, 
  Upload, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  Filter,
  BarChart3,
  Calendar,
  Building2,
  DollarSign,
  Zap,
  ShoppingCart,
  Database,
  RefreshCw,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useCart } from '../hooks/useCart';

export default function ExtratoCartoes() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'conciliacao' | 'vendas' | 'taxas'>('conciliacao');
  const [results, setResults] = useState<any[]>([]);

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setResults([
        { date: '12/05/2026', operator: 'Stone', bruteValue: 4500.00, netValue: 4320.00, fee: 180.00, status: 'divergent', reason: 'Taxa superior ao contrato (4% vs 3.2%)' },
        { date: '13/05/2026', operator: 'PagSeguro', bruteValue: 1200.00, netValue: 1140.00, fee: 60.00, status: 'matched', reason: 'Conciliado 100%' },
        { date: '14/05/2026', operator: 'Getnet', bruteValue: 2800.00, netValue: 2688.00, fee: 112.00, status: 'matched', reason: 'Conciliado 100%' }
      ]);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-2 px-6 flex justify-between items-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
         <div className="flex items-center gap-4 text-[10px] font-black text-white/90 uppercase tracking-[0.25em] relative z-10">
            <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin-slow" /> Sincronismo Stone: Ativo</span>
            <span className="hidden md:block opacity-40">|</span>
            <span className="hidden md:flex items-center gap-1"><CreditCard className="w-3 h-3" /> Getnet v3.0</span>
         </div>
         <div className="text-[10px] font-black text-white/50 uppercase tracking-widest relative z-10">Card Engine v3</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 group hover:rotate-6 transition-transform">
              <CreditCard className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <Link to="/solucoes" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-2 hover:translate-x-1 transition-all">
                <ArrowLeft className="w-3 h-3" /> Catálogo de Soluções
              </Link>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic uppercase">Extrato Cartões<span className="text-blue-500">.</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                <Database className="w-4 h-4" /> Conciliador Automático de Adquirentes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assinatura</p>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800">
                Plano Standard
              </p>
            </div>
            <button 
               onClick={async () => {
                 await addToCart({
                   sku: 'extrato-cartoes',
                   title: 'Extrato de Cartões - Mensal',
                   price: 97.00,
                   metadata: { type: 'card_reconciliation' }
                 }, {}, false);
                 navigate('/checkout');
               }}
               className="bg-slate-900 dark:bg-blue-600 hover:bg-black p-5 rounded-2xl text-white shadow-xl transition-all active:scale-95 group"
             >
               <ShoppingCart className="w-6 h-6 group-hover:rotate-12 transition-transform" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Summary Sidebar */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Visão Geral Mês</h3>
                    <div className="space-y-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bruto</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">R$ 8.500,00</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Líquido</p>
                          <p className="text-2xl font-black text-emerald-500 italic tracking-tighter">R$ 8.148,00</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    {[
                      { id: 'conciliacao', label: 'Conciliação', icon: RefreshCw },
                      { id: 'vendas', label: 'Lista de Vendas', icon: Database },
                      { id: 'taxas', label: 'Auditoria de Taxas', icon: AlertCircle }
                    ].map(t => (
                      <button 
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={cn(
                          "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                          activeTab === t.id 
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" 
                            : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                      >
                        <span className="flex items-center gap-3"><t.icon className="w-4 h-4" /> {t.label}</span>
                        <ChevronRight className={cn("w-3 h-3 opacity-20", activeTab === t.id && "opacity-100")} />
                      </button>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform rotate-12"><Zap className="w-32 h-32 text-blue-500" /></div>
                 <div className="relative z-10 space-y-6">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">IA Insight</p>
                    <h4 className="text-xl font-black italic tracking-tighter leading-tight">Detectamos 2 taxas divergentes na Stone este mês.</h4>
                    <p className="text-xs text-white/50 font-medium">Economia potencial: R$ 42,90.</p>
                 </div>
              </div>
           </div>

           {/* Main View */}
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-200 dark:border-slate-800 p-2 shadow-sm min-h-[650px] flex flex-col overflow-hidden">
                 <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
                           {activeTab === 'conciliacao' && <><RefreshCw className="w-6 h-6 text-blue-600" /> Conciliação Bancária</>}
                           {activeTab === 'vendas' && <><Database className="w-6 h-6 text-blue-600" /> Histórico de Vendas</>}
                           {activeTab === 'taxas' && <><AlertCircle className="w-6 h-6 text-rose-500" /> Auditoria de Taxas</>}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Vínculo: Bradesco x Stone/Getnet</p>
                    </div>

                    <button 
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      {isProcessing ? 'Sincronizando...' : 'Iniciar Sincronismo'}
                    </button>
                 </div>

                 <div className="flex-1 p-2">
                    <div className="h-full bg-slate-50 dark:bg-slate-800/30 rounded-[44px] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
                       <AnimatePresence mode="wait">
                          {results.length === 0 ? (
                            <motion.div 
                              key="empty"
                              initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6"
                            >
                               <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-200 shadow-xl">
                                  <CreditCard className="w-12 h-12" />
                               </div>
                               <div className="space-y-2">
                                  <h3 className="text-xl font-black text-slate-400 uppercase italic">Aguardando Importação</h3>
                                  <p className="text-sm text-slate-400 max-w-xs mx-auto">Importe o extrato da adquirente ou conecte via API para conferir as taxas.</p>
                               </div>
                            </motion.div>
                          ) : (
                            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-auto no-scrollbar">
                               <table className="w-full text-left">
                                  <thead className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
                                     <tr>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Data / Op</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Análise</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Vlr Bruto</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Ação</th>
                                     </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                     {results.map((r, idx) => (
                                       <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800/80 transition-colors group">
                                          <td className="px-10 py-6 whitespace-nowrap">
                                             <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                   <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                   <p className="text-xs font-black text-slate-900 dark:text-white">{r.operator}</p>
                                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.date}</p>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-10 py-6">
                                             <div className="space-y-1">
                                                <div className={cn(
                                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                  r.status === 'matched' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                )}>
                                                   {r.status === 'matched' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                   {r.status === 'matched' ? 'Conciliado' : 'Divergente'}
                                                </div>
                                                <p className="text-[10px] font-medium text-slate-400 leading-tight">{r.reason}</p>
                                             </div>
                                          </td>
                                          <td className="px-10 py-6 text-right whitespace-nowrap">
                                             <p className="text-sm font-black text-slate-900 dark:text-white italic">R$ {r.bruteValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                             <p className="text-[9px] font-bold text-emerald-500 uppercase">Líq: R$ {r.netValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                          </td>
                                          <td className="px-10 py-6 text-right">
                                             <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                                          </td>
                                       </tr>
                                     ))}
                                  </tbody>
                               </table>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>

                 {/* Bottom Bar */}
                 <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                       <div className="flex -space-x-4">
                          {['Stone', 'Getnet', 'PagSeguro', 'Cielo'].map((op, i) => (
                            <div key={op} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase shadow-sm z-[i]">{op[0]}</div>
                          ))}
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Conexão Ativa com 4 Adquirentes</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                       <button className="flex-1 md:flex-none px-10 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-600 transition-all flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Exportar</button>
                       <button className="flex-1 md:flex-none px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 dark:shadow-none italic tracking-[0.1em]">Lançar no Office</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
