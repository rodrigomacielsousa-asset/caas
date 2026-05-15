import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  DollarSign, 
  Briefcase, 
  Building2, 
  PieChart, 
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Crown,
  Lock,
  Zap,
  Activity,
  History,
  FileText,
  Search,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

// Helper for currency formatting
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface CNAE {
  id: string;
  descricao: string;
}

export default function ValidaEmpresa() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    cnae: '',
    cnaeDesc: '',
    revenue: '',
    costs: '',
    payroll: '',
    state: 'SP',
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // CNAE Autocomplete State
  const [cnaeList, setCnaeList] = useState<CNAE[]>([]);
  const [suggestions, setSuggestions] = useState<CNAE[]>([]);
  const [isSearchingCnae, setIsSearchingCnae] = useState(false);
  const [showCnaeDropdown, setShowCnaeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch CNAE list from IBGE on mount
  useEffect(() => {
    const fetchCnae = async () => {
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v2/cnae/subclasses');
        const data = await response.json();
        setCnaeList(data.map((item: any) => ({
          id: item.id,
          descricao: item.descricao
        })));
      } catch (error) {
        console.error('Error fetching CNAE:', error);
      }
    };
    fetchCnae();
  }, []);

  // Load data from deep-link if available
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cnpjDataRaw = searchParams.get('data');
    if (cnpjDataRaw) {
      try {
        const data = JSON.parse(decodeURIComponent(cnpjDataRaw));
        setFormData(prev => ({
          ...prev,
          cnae: data.cnaePrincipal?.id || '',
          cnaeDesc: data.cnaePrincipal?.descricao || '',
          state: data.endereco?.uf || 'SP',
        }));
      } catch (e) {
        console.error("Error parsing CNPJ data for Valida Empresa", e);
      }
    }
  }, [location]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCnaeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCnaeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, cnae: value, cnaeDesc: '' }));
    
    if (value.length > 2) {
      setIsSearchingCnae(true);
      const filtered = cnaeList.filter(item => 
        item.id.includes(value.replace(/\D/g, '')) || 
        item.descricao.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setSuggestions(filtered);
      setShowCnaeDropdown(true);
      setIsSearchingCnae(false);
    } else {
      setSuggestions([]);
      setShowCnaeDropdown(false);
    }
  };

  const selectCnae = (selected: CNAE) => {
    setFormData(prev => ({ 
      ...prev, 
      cnae: selected.id, 
      cnaeDesc: selected.descricao 
    }));
    setShowCnaeDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateViability = () => {
    setIsCalculating(true);
    // Simulate calculation time
    setTimeout(() => {
      setIsCalculating(false);
      setShowResult(true);
      // Scroll to result
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
  };

  const results = useMemo(() => {
    const revenue = parseFloat(formData.revenue) || 0;
    const costs = parseFloat(formData.costs) || 0;
    const payroll = parseFloat(formData.payroll) || 0;

    // Simplified Simples Nacional calculation (2026 Estimated)
    // Using a dynamic effective rate based on monthly revenue * 12
    const annualRevenue = revenue * 12;
    let effectiveRate = 0.06; // Base starts at 6% (Anexo III)

    if (annualRevenue > 180000) effectiveRate = 0.082;
    if (annualRevenue > 360000) effectiveRate = 0.105;
    if (annualRevenue > 720000) effectiveRate = 0.123;
    if (annualRevenue > 1800000) effectiveRate = 0.145;
    if (annualRevenue > 3600000) effectiveRate = 0.168;

    const taxAmount = revenue * effectiveRate;
    const totalExpenses = costs + payroll + taxAmount;
    const netProfit = revenue - totalExpenses;
    const margin = revenue > 0 ? (netProfit / revenue) : 0;
    const taxPercentage = effectiveRate * 100;

    let classification: 'viable' | 'attention' | 'not_recommended' = 'not_recommended';
    if (margin > 0.2) classification = 'viable';
    else if (margin >= 0.1) classification = 'attention';

    // Advanced Analysis (Premium)
    const taxLoad = taxPercentage > 15 ? 'Alta' : taxPercentage < 8 ? 'Baixa' : 'Moderada';
    const operationalRisk = (costs / revenue) > 0.5 ? 'Alto' : (costs / revenue) > 0.3 ? 'Médio' : 'Baixo';
    const dependency = margin < 0.15 ? 'Alta' : 'Baixa';
    const breakEvenPoint = (costs + payroll) / (1 - effectiveRate);

    // Scenarios
    const optimisticRevenue = revenue * 1.2;
    const optimisticProfit = optimisticRevenue - (optimisticRevenue * effectiveRate) - costs - payroll;
    
    const pessimisticRevenue = revenue * 0.8;
    const pessimisticProfit = pessimisticRevenue - (pessimisticRevenue * effectiveRate) - costs - payroll;

    return {
      revenue,
      costs,
      payroll,
      taxAmount,
      netProfit,
      margin,
      taxPercentage,
      classification,
      analysis: {
        taxLoad,
        operationalRisk,
        dependency,
        breakEvenPoint
      },
      scenarios: {
        optimistic: { revenue: optimisticProfit, label: 'Otimista (+20% Vendas)' },
        pessimistic: { revenue: pessimisticProfit, label: 'Pessimista (-20% Vendas)' }
      }
    };
  }, [formData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <Link to="/solucoes" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest mb-12">
              <ArrowLeft className="w-4 h-4" /> Catálogo de Soluções
           </Link>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" /> New Ecosystem Tool 2026
                 </div>
                 <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85]">
                    Valida <br /><span className="text-indigo-600 italic">Empresa.</span>
                 </h1>
                 <p className="text-xl text-slate-500 font-medium font-serif italic max-w-md">
                    Descubra se sua ideia de negócio é financeiramente viável antes de emitir o primeiro CNPJ.
                 </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                 <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precisão</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">98.4%</div>
                 </div>
                 <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Atualização</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">Tabelas 2026</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Configurações do Negócio</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Preencha as premissas básicas para análise</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNAE Principal</label>
                  <div className="relative group" ref={dropdownRef}>
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text"
                      name="cnae"
                      value={formData.cnae}
                      onChange={handleCnaeChange}
                      autoComplete="off"
                      placeholder="Busque por código ou descrição..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-12 py-4 font-bold focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all"
                    />
                    {isSearchingCnae && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                      </div>
                    )}
                    
                    {/* Autocomplete Dropdown */}
                    <AnimatePresence>
                      {showCnaeDropdown && suggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl z-[60] overflow-hidden max-h-60 overflow-y-auto"
                        >
                          {suggestions.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectCnae(item)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-50 dark:border-slate-800 last:border-none transition-colors group"
                            >
                              <div className="flex justify-between items-start gap-3">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                  {item.id.replace(/^(\d{4})(\d)(\d{2})$/, "$1-$2/$3")}
                                </span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex-1 leading-tight group-hover:text-indigo-600 transition-colors">
                                  {item.descricao}
                                </span>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {formData.cnaeDesc && (
                    <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                      <div className="flex gap-2 items-start">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="text-[10px] font-bold text-indigo-600/80 uppercase leading-relaxed font-serif italic">
                          {formData.cnaeDesc}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Faturamento Mensal</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        type="number"
                        name="revenue"
                        value={formData.revenue}
                        onChange={handleInputChange}
                        placeholder="0,00"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 font-bold focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custos Mensais</label>
                    <div className="relative group">
                      <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        type="number"
                        name="costs"
                        value={formData.costs}
                        onChange={handleInputChange}
                        placeholder="0,00"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 font-bold focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Folha de Pagamento</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        type="number"
                        name="payroll"
                        value={formData.payroll}
                        onChange={handleInputChange}
                        placeholder="Total CLT + PL"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 font-bold focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado (UF)</label>
                    <select 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all"
                    >
                      {['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ) )}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={calculateViability}
                  disabled={isCalculating || !formData.revenue}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isCalculating ? (
                    <>
                      <Activity className="w-5 h-5 animate-pulse" /> Processando Inteligência...
                    </>
                  ) : (
                    <>
                      Calcular Viabilidade <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div id="result-section" className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!showResult && !isCalculating ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-slate-100/50 dark:bg-slate-900/50 rounded-[48px] border-4 border-dashed border-slate-200 dark:border-slate-800"
                >
                  <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                    <PieChart className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-400">Aguardando dados...</h3>
                  <p className="text-sm text-slate-400 font-medium italic font-serif">Defina as premissas ao lado para iniciar o diagnóstico.</p>
                </motion.div>
              ) : isCalculating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-8 bg-white dark:bg-slate-900 rounded-[48px] border border-indigo-100 dark:border-indigo-900/30 shadow-2xl"
                >
                  <div className="relative">
                    <div className="w-32 h-32 border-8 border-slate-100 dark:border-slate-800 rounded-full" />
                    <div className="absolute inset-0 border-8 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                    <Zap className="absolute inset-0 m-auto w-10 h-10 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Analisando Cenários</h3>
                    <p className="text-xs text-slate-400 font-bold animate-pulse">PROCESSANDO SIMPLES NACIONAL | FATOR R | MARGEM LÍQUIDA</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="result"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-6"
                >
                  {/* Status Indicator Card */}
                  <div className={cn(
                    "p-8 md:p-12 rounded-[48px] border-l-[12px] shadow-2xl transition-all",
                    results.classification === 'viable' 
                      ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500" 
                      : results.classification === 'attention' 
                        ? "bg-amber-50 dark:bg-amber-900/10 border-amber-500" 
                        : "bg-rose-50 dark:bg-rose-900/10 border-rose-500"
                  )}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             {results.classification === 'viable' && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                             {results.classification === 'attention' && <AlertTriangle className="w-8 h-8 text-amber-500" />}
                             {results.classification === 'not_recommended' && <XCircle className="w-8 h-8 text-rose-500" />}
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Classificação Final</span>
                          </div>
                          <h2 className={cn(
                            "text-5xl font-black tracking-tighter uppercase italic",
                            results.classification === 'viable' ? "text-emerald-600" : results.classification === 'attention' ? "text-amber-600" : "text-rose-600"
                          )}>
                             {results.classification === 'viable' && "Negócio Viável"}
                             {results.classification === 'attention' && "Alerta de Margem"}
                             {results.classification === 'not_recommended' && "Não Recomendado"}
                          </h2>
                          <p className="text-slate-600 dark:text-slate-400 font-medium font-serif italic max-w-sm leading-relaxed">
                            {results.classification === 'viable' && "As premissas indicam uma operação saudável com boa retenção de lucro após impostos."}
                            {results.classification === 'attention' && "A margem está apertada. Considere revisar custos fixos ou aumentar o ticket médio."}
                            {results.classification === 'not_recommended' && "O modelo atual consome a maior parte da receita em operação e impostos. Risco alto."}
                          </p>
                       </div>
                       
                       <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm flex flex-col items-center">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Margem Líquida</div>
                          <div className={cn(
                            "text-6xl font-black tracking-tighter italic",
                            results.classification === 'viable' ? "text-emerald-500" : results.classification === 'attention' ? "text-amber-500" : "text-rose-500"
                          )}>
                            {(results.margin * 100).toFixed(1)}%
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Financial Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lucro Líquido (Mês)</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                          {formatCurrency(results.netProfit)}
                        </div>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Imposto Estimado</div>
                        <div className="text-2xl font-black text-indigo-600 italic tracking-tighter">
                          {formatCurrency(results.taxAmount)}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1 transition-all">
                           Efetiva: {results.taxPercentage.toFixed(2)}%
                        </div>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Checkout de Custos</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                          {formatCurrency(results.revenue - results.netProfit)}
                        </div>
                     </div>
                  </div>

                  {/* Intelligence & Advanced Analysis */}
                  <div className="bg-slate-900 p-12 rounded-[56px] text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Activity className="w-48 h-48" />
                     </div>
                     
                     <div className="relative z-10 space-y-12">
                        <div className="flex items-center gap-3">
                           <Sparkles className="w-6 h-6 text-indigo-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Inteligência de Mercado Analytics</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           <div className="space-y-6">
                              <h4 className="text-xl font-bold flex items-center gap-2">
                                 <History className="w-5 h-5 text-indigo-400" /> Diagnóstico Base
                              </h4>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carga Tributária</span>
                                    <span className={cn(
                                      "text-sm font-black uppercase",
                                      results.analysis.taxLoad === 'Baixa' ? "text-emerald-400" : results.analysis.taxLoad === 'Alta' ? "text-rose-400" : "text-amber-400"
                                    )}>{results.analysis.taxLoad}</span>
                                 </div>
                                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risco Operacional</span>
                                    <span className={cn(
                                      "text-sm font-black uppercase",
                                      results.analysis.operationalRisk === 'Baixo' ? "text-emerald-400" : results.analysis.operationalRisk === 'Alto' ? "text-rose-400" : "text-amber-400"
                                    )}>{results.analysis.operationalRisk}</span>
                                 </div>
                                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dependência Receita</span>
                                    <span className={cn(
                                      "text-sm font-black uppercase",
                                      results.analysis.dependency === 'Baixa' ? "text-emerald-400" : "text-rose-400"
                                    )}>{results.analysis.dependency}</span>
                                 </div>
                              </div>
                           </div>

                           {!isPremium ? (
                             <div className="flex flex-col justify-center items-center text-center p-8 bg-white/5 rounded-[40px] border border-white/10 space-y-6">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Lock className="w-6 h-6 text-white" /></div>
                                <div className="space-y-2">
                                   <h5 className="font-black uppercase text-sm tracking-widest">Análise Premium Bloqueada</h5>
                                   <p className="text-xs text-slate-400 font-serif italic">Desbloqueie cenários preditivos e auditoria tributária completa.</p>
                                </div>
                                <button 
                                  onClick={() => setIsPremium(true)}
                                  className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                   Desbloquear Agora
                                </button>
                             </div>
                           ) : (
                             <motion.div 
                               initial={{ opacity: 0, scale: 0.95 }}
                               animate={{ opacity: 1, scale: 1 }}
                               className="space-y-6"
                             >
                                <h4 className="text-xl font-bold flex items-center gap-2">
                                   <Crown className="w-5 h-5 text-amber-400" /> Cenários Preditivos
                                </h4>
                                <div className="space-y-4">
                                   <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                      <div className="flex justify-between items-start mb-2">
                                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{results.scenarios.optimistic.label}</span>
                                         <TrendingUp className="w-4 h-4 text-emerald-400" />
                                      </div>
                                      <div className="text-xl font-black text-white">{formatCurrency(results.scenarios.optimistic.revenue)} <span className="text-xs font-medium text-slate-400 uppercase">/mês</span></div>
                                   </div>
                                   <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                      <div className="flex justify-between items-start mb-2">
                                         <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">{results.scenarios.pessimistic.label}</span>
                                         <TrendingUp className="w-4 h-4 text-rose-400 rotate-180" />
                                      </div>
                                      <div className="text-xl font-black text-white">{formatCurrency(results.scenarios.pessimistic.revenue)} <span className="text-xs font-medium text-slate-400 uppercase">/mês</span></div>
                                   </div>
                                </div>
                             </motion.div>
                           )}
                        </div>

                        {isPremium && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 bg-indigo-600 rounded-[40px] space-y-6"
                          >
                             <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6" />
                                <h4 className="text-xl font-bold">Recomendação Estratégica</h4>
                             </div>
                             <p className="text-lg leading-relaxed font-serif italic font-medium">
                                "Baseado no faturamento de {formatCurrency(results.revenue)} e na sua carga tributária de {results.taxPercentage.toFixed(1)}%, recomendamos focar na redução de custos fixos em pelo menos 15% para atingir o ponto de equilíbrio de {formatCurrency(results.analysis.breakEvenPoint)} mais rapidamente. O regime Simples Nacional ainda é o mais indicado, mas acompanhe o limite de faturamento anual."
                             </p>
                          </motion.div>
                        )}
                     </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={() => window.print()}
                      className="w-full py-5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[28px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-300 transition-all"
                    >
                      <FileText className="w-4 h-4" /> Exportar Diagnóstico em PDF
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
