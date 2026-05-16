import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Zap, 
  ArrowUpRight,
  Target,
  BarChart3,
  FileText,
  Clock,
  Info,
  Calendar,
  ChevronDown,
  LayoutGrid,
  RefreshCw,
  Trash2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type ViewMode = 'item' | 'projection';

export default function Reforma() {
  const [viewMode, setViewMode] = useState<ViewMode>('item');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Top Selector Navigation */}
      <div className="pt-32 pb-8 flex justify-center">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-1">
          <button 
            onClick={() => setViewMode('item')}
            className={cn(
              "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
              viewMode === 'item' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Calculator className="w-4 h-4" /> Por Item (NCM/NBS)
          </button>
          <button 
            onClick={() => setViewMode('projection')}
            className={cn(
              "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
              viewMode === 'projection' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <BarChart3 className="w-4 h-4" /> Projeção de Transição
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {viewMode === 'item' ? <SimuladorPorItem /> : <SimuladorTransicao />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SimuladorPorItem() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3">
           <Calculator className="w-10 h-10 text-blue-600" />
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Simulador <span className="text-blue-600 uppercase">IBS / CBS</span></h1>
        </div>
        <p className="text-slate-500 font-medium leading-relaxed">
          Ferramenta avançada para simulação da carga tributária na transição para o novo sistema nacional (EC 132/23).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-10 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-6">
             <Search className="w-5 h-5 text-blue-600" />
             <h3 className="text-lg font-black text-slate-900 dark:text-white">Identificação do Item</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Item</label>
              <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl gap-1">
                <button className="flex-1 py-2 bg-white dark:bg-slate-700 text-blue-600 shadow-sm rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2">
                   <LayoutGrid className="w-3 h-3" /> Mercadoria (NCM)
                </button>
                <button className="flex-1 py-2 text-slate-400 text-[10px] font-black uppercase flex items-center justify-center gap-2">
                   <Clock className="w-3 h-3" /> Serviço (NBS)
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código NCM</label>
              <div className="relative">
                <input type="text" placeholder="Ex: 01012100" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm placeholder-slate-400" />
                <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</label>
            <textarea readOnly placeholder="Aguardando código..." className="w-full h-24 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm resize-none text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CST IBS/CBS</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm appearance-none">
                <option>-- Selecione --</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classificação Tributária</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm appearance-none">
                <option>-- Selecione --</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redução IBS (%)</label>
              <input type="number" defaultValue="0" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redução CBS (%)</label>
              <input type="number" defaultValue="0" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantidade</label>
              <input type="number" defaultValue="1" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Unitário (R$)</label>
              <input type="text" defaultValue="0,00" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
             <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                <RefreshCw className="w-4 h-4" /> Calcular Resultados
             </button>
             <button className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all">
                Limpar
             </button>
          </div>
        </div>

        {/* Right Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center space-y-6">
           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center">
              <Calculator className="w-10 h-10 text-slate-300" />
           </div>
           <h3 className="text-xl font-black text-slate-400 tracking-tight">Pronto para Simular</h3>
           <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
             Preencha os dados do item ao lado para ver o comparativo de carga tributária.
           </p>
        </div>
      </div>
    </div>
  );
}

function SimuladorTransicao() {
  const [faturamento, setFaturamento] = useState(200000);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Controls */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 h-full">
           <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Parâmetros da Empresa</h3>
           </div>

           <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Anual (R$)</label>
                <input 
                  type="number" 
                  value={faturamento} 
                  onChange={(e) => setFaturamento(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold" 
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custos IVA (R$)</label>
                   <input type="number" defaultValue="0" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custos ICME (R$)</label>
                   <input type="number" defaultValue="0" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setor de Atividade</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm appearance-none font-bold">
                   <option>Padrão</option>
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regime Tributário Atual</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm appearance-none font-bold">
                   <option>Lucro Real</option>
                </select>
             </div>

             <div className="pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carga Tributária Atual Manual</span>
                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full relative cursor-pointer">
                   <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1" />
                </div>
             </div>
           </div>

           <div className="bg-slate-950 rounded-3xl p-6 text-white space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Regra de Transição</h4>
              <div className="flex gap-4">
                 <div className="flex-1 space-y-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Início</span>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs font-bold">
                       2026 <ChevronDown className="w-3 h-3" />
                    </div>
                 </div>
                 <div className="flex-1 space-y-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Término</span>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs font-bold">
                       2033 <ChevronDown className="w-3 h-3" />
                    </div>
                 </div>
              </div>
              <p className="text-[8px] text-slate-500 italic leading-relaxed">
                 A transição do ICMS e ISS ocorrerá gradualmente entre 2029 e 2032, com extinção completa em 2033. CBS e IBS iniciam em 2026.
              </p>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
           <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Simulador de Transição <span className="text-blue-600">Reforma Tributária</span></h2>
              <p className="text-sm text-slate-500 font-medium">Acompanhe a evolução da carga tributária de 2026 a 2033 (IVA Dual).</p>
           </div>
           <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4 text-emerald-500" /> Exportar Relatório
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-2">Alíquota Inicial (2026)</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">30.90%</div>
              <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">Carga Efetiva Combinada</p>
           </div>
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-2">Alíquota Final (2033)</h3>
              <div className="text-3xl font-black text-blue-600 tracking-tighter">54.75%</div>
              <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">Estimativa Fluxo de Caixa</p>
           </div>
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-2">Variação Projetada</h3>
              <div className="text-3xl font-black text-rose-500 tracking-tighter">23.85%</div>
              <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">Diferencial Pontos Percentuais</p>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
           <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Projeção de Substituição Tributária</h3>
           </div>
           <div className="h-[300px] flex items-end gap-6 px-12 pt-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-800/10 -m-10" />
              <div className="flex-1 h-3/4 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-3xl relative z-10 group cursor-pointer hover:scale-105 transition-transform" />
              <div className="flex-1 h-[85%] bg-gradient-to-t from-blue-600/90 to-blue-400/90 rounded-t-3xl relative z-10 opacity-80" />
              <div className="flex-1 h-[90%] bg-gradient-to-t from-blue-600/80 to-blue-400/80 rounded-t-3xl relative z-10 opacity-70" />
              <div className="flex-1 h-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-3xl relative z-10 shadow-2xl shadow-blue-100" />
              <div className="absolute top-0 right-0 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest p-10 group">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600" /> Novo IVA (IBS+CBS)</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-200" /> Tributos Atuais</div>
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
           <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Quadro Evolutivo de Transição</h3>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-b border-slate-50 dark:border-slate-800">
                       <th className="pb-4 px-4">Ano</th>
                       <th className="pb-4 px-4">Fator</th>
                       <th className="pb-4 px-4">Subtotal IVA</th>
                       <th className="pb-4 px-4">Subtotal Atual</th>
                       <th className="pb-4 px-4">Total (R$)</th>
                       <th className="pb-4 px-4">Efetiva</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                    {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033].map((ano, i) => (
                      <tr key={ano} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <td className="py-4 px-4 font-black">{ano}</td>
                        <td className="py-4 px-4 text-xs">
                          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded text-[10px] font-bold">{(i + 1) * 10}%</span>
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-medium">R$ {(ano * 2.5).toLocaleString('pt-BR')}</td>
                        <td className="py-4 px-4 text-slate-500 font-medium">R$ {(ano * 8.2).toLocaleString('pt-BR')}</td>
                        <td className="py-4 px-4 font-black text-slate-900 dark:text-white">R$ {(ano * 10.7 + i * 200).toLocaleString('pt-BR')}</td>
                        <td className="py-4 px-4">
                           <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${30 + i * 3}%` }} />
                              </div>
                              <span className="text-[10px] font-black">{30 + i * 3}%</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-[40px] p-10 border border-amber-100 dark:border-amber-900/30 flex gap-6">
           <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
           <div className="space-y-2">
              <h4 className="text-sm font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest">Nota Legal Importante</h4>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 font-medium leading-relaxed">
                Este simulador é baseado nas premissas da Emenda Constitucional 132/2023 e nos textos do PLP 68/2024. As alíquotas reais de IBS e CBS serão fixadas por lei ordinária e resoluções do Comitê Gestor e Receita Federal. O fator de transição pode sofrer ajustes conforme a regulamentação final.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
