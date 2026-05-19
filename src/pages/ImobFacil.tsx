import React, { useState } from 'react';
import { 
  Building2, 
  Home, 
  Users, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  Search, 
  Download,
  Calendar,
  DollarSign,
  PieChart,
  Settings,
  Plus,
  ArrowRight,
  ShoppingCart,
  Database,
  Briefcase,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useCart } from '../hooks/useCart';

export default function ImobFacil() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'contratos' | 'alugueis' | 'dimob'>('contratos');
  const [isProcessing, setIsProcessing] = useState(false);

  const stats = [
    { label: 'Contratos Ativos', value: '142', icon: FileText, color: 'text-blue-500' },
    { label: 'Taxa de Inadimplência', value: '4.2%', icon: TrendingUp, color: 'text-rose-500' },
    { label: 'Total Sob Gestão', value: 'R$ 2.4M', icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Imóveis Livres', value: '8', icon: Home, color: 'text-amber-500' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Professional Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Building2 className="w-6 h-6" /></div>
            <div>
               <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter italic">IMOB Fácil<span className="text-blue-600">.</span></h1>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Gestão Vertical Contábil Imobiliária</p>
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col text-right">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronismo Banco</span>
               <span className="text-xs font-black text-emerald-500 flex items-center gap-1 justify-end animate-pulse"><CheckCircle2 className="w-3 h-3" /> Conectado</span>
            </div>
            <button 
               onClick={async () => {
                 await addToCart({
                   sku: 'imob-facil',
                   title: 'IMOB Fácil - Plano Profissional',
                   price: 89.90,
                   metadata: { type: 'vertical_imob' }
                 }, {}, false);
                 navigate('/checkout');
               }}
               className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 dark:shadow-none"
            >
               Upgrade Pro
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
         <div className="mb-10">
            <Link to="/solucoes" className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6 hover:text-blue-600 transition-colors capitalize">
               <ArrowLeft className="w-3 h-3" /> Voltar às Soluções
            </Link>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {stats.map((s, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/50", s.color)}>
                       <s.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                       <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">{s.value}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white dark:bg-slate-900 rounded-[40px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                  {[
                    { id: 'contratos', label: 'Contratos Locação', icon: FileText },
                    { id: 'alugueis', label: 'Repasses & Aluguéis', icon: DollarSign },
                    { id: 'dimob', label: 'Módulo DIMOB', icon: Database },
                    { id: 'clients', label: 'Inquilinos & Propriet.', icon: Users }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === tab.id 
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/10" 
                          : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                       <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
               </div>

               <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform"><PieChart className="w-32 h-32 text-blue-500" /></div>
                  <div className="relative z-10 space-y-6">
                     <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest italic leading-none">Status DIMOB 2026</h3>
                     <p className="text-xl font-black italic tracking-tighter">85% das declarações prontas para envio.</p>
                     <p className="text-xs text-white/50">Faltam 12 fornecedores vincularem notas fiscais.</p>
                     <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all">Ver Pendências</button>
                  </div>
               </div>
            </div>

            {/* Main Operational View */}
            <div className="lg:col-span-3 space-y-8">
               <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-200 dark:border-slate-800 p-2 shadow-sm min-h-[600px] flex flex-col">
                  <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
                           {activeTab === 'contratos' && <><FileText className="w-7 h-7 text-blue-600" /> Gestão de Contratos</>}
                           {activeTab === 'alugueis' && <><DollarSign className="w-7 h-7 text-emerald-500" /> Controle de Repasses</>}
                           {activeTab === 'dimob' && <><Database className="w-7 h-7 text-blue-600" /> Declaração DIMOB</>}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Unidade: Imobiliária Central Brasília</p>
                     </div>
                     <div className="flex gap-3">
                        <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm"><Settings className="w-6 h-6" /></button>
                        <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 dark:shadow-none hover:bg-slate-900 transition-all flex items-center gap-3 active:scale-95">
                           <Plus className="w-5 h-5" /> Novo Registro
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 p-4">
                     <div className="h-full bg-slate-50 dark:bg-slate-800/40 rounded-[44px] border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                         <div className="p-8 space-y-8 overflow-auto no-scrollbar h-full">
                            {/* Contract List Mock */}
                            {[
                              { code: 'IM-0012', client: 'Carlos Silva', property: 'SCLN 102 Bloco B - Apt 204', value: 2400.00, status: 'Active', due: '12/Mês' },
                              { code: 'IM-0015', client: 'Mariana Costa', property: 'SQS 308 Bloco F - Apt 102', value: 3800.00, status: 'Pending', due: '05/Mês' },
                              { code: 'IM-0018', client: 'Roberto Sousa', property: 'SIG Qd 01 Lt 450 - Sala 10', value: 1650.00, status: 'Active', due: '15/Mês' },
                              { code: 'IM-0022', client: 'Anna Beatriz', property: 'CLSW 105 Bloco A - Apt 301', value: 3100.00, status: 'Active', due: '10/Mês' }
                            ].map((item, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className="bg-white dark:bg-slate-900 p-8 rounded-[36px] border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 hover:border-blue-300 transition-all cursor-pointer group"
                              >
                                 <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                       <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                       <div className="flex items-center gap-2">
                                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{item.client}</p>
                                          <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                            item.status === 'Active' ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
                                          )}>{item.status}</span>
                                       </div>
                                       <p className="text-[10px] font-bold text-slate-400 lowercase tracking-tight italic opacity-60">{item.property}</p>
                                    </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Aluguel Bruto</p>
                                       <p className="text-lg font-black text-blue-600 italic tracking-tighter leading-none">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-300 group-hover:text-blue-600 transition-colors">
                                       <ChevronRight className="w-6 h-6" />
                                    </button>
                                 </div>
                              </motion.div>
                            ))}
                         </div>
                     </div>
                  </div>

                  <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center rounded-b-[56px]">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Integração Office Contábil Sincronizada: 12:44:21</p>
                     <div className="flex gap-4">
                        <button className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-600 transition-all flex items-center gap-2"><Download className="w-4 h-4" /> Relatório Mês</button>
                        <button className="px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl italic tracking-widest">Processar Repasses</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
