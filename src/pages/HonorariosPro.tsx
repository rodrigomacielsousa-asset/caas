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
  Crown,
  Lock,
  Zap,
  Activity,
  History,
  FileText,
  Search,
  Loader2,
  Users,
  Star,
  Clock,
  MapPin,
  ClipboardCheck,
  Receipt,
  ShieldCheck,
  Printer,
  Download,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

export default function HonorariosPro() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyType: 'ME',
    cnae: '',
    cnaeDesc: '',
    revenue: '',
    employees: '0',
    taxRegime: 'Simples Nacional',
    noteVolume: 'medio',
    fiscalComplexity: 'media',
    hasPayroll: false,
    partners: '1',
    state: 'SP',
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [credits, setCredits] = useState(1);

  // CNAE Autocomplete State
  const [cnaeList, setCnaeList] = useState<CNAE[]>([]);
  const [suggestions, setSuggestions] = useState<CNAE[]>([]);
  const [isSearchingCnae, setIsSearchingCnae] = useState(false);
  const [showCnaeDropdown, setShowCnaeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load data from search if available
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
          companyType: data.porte === 'DEMAIS' ? 'LTDA' : data.porte || 'ME',
          revenue: data.capitalSocial ? (data.capitalSocial / 10).toString() : '', // Guessing revenue from capital social
          state: data.endereco?.uf || 'SP',
        }));
      } catch (e) {
        console.error("Error parsing CNPJ data for honorarios", e);
      }
    }
  }, [location]);

  // Fetch CNAE list
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

  const calculateFees = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setShowResult(true);
      document.getElementById('fee-result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
  };

  const results = useMemo(() => {
    const revenue = parseFloat(formData.revenue) || 0;
    const employees = parseInt(formData.employees) || 0;
    
    // PROVIDED CALCULATION LOGIC
    let base = 300;

    // faturamento
    if (revenue > 50000) base += 200;
    if (revenue > 100000) base += 300;
    if (revenue > 200000) base += 500;

    // funcionários
    base += employees * 50;

    // complexidade
    if (formData.fiscalComplexity === "alta") base += 200;
    if (formData.fiscalComplexity === "media") base += 100;

    // folha
    if (formData.hasPayroll) base += 150;

    // volume de notas
    if (formData.noteVolume === "alto") base += 200;
    if (formData.noteVolume === "medio") base += 100;

    const idealFee = base;
    const minFee = base * 0.8;
    const premiumFee = base * 1.3;

    // Intelligence
    let complexityLabel: 'Simples' | 'Moderado' | 'Complexo' = 'Simples';
    if (formData.fiscalComplexity === 'alta' || employees > 10 || revenue > 100000) {
      complexityLabel = 'Complexo';
    } else if (formData.fiscalComplexity === 'media' || employees > 3 || revenue > 50000) {
      complexityLabel = 'Moderado';
    }

    const operationalRisk = complexityLabel === 'Complexo' ? 'Alto' : complexityLabel === 'Moderado' ? 'Médio' : 'Baixo';
    const estimatedHours = Math.ceil(base / 100);

    const automatedAnalysis = `Cliente com ${complexityLabel.toLowerCase()} complexidade operacional, ${employees > 0 ? `com gestão de ${employees} funcionários,` : 'sem funcionários registrados,'} ${formData.noteVolume === 'alto' ? 'alto volume de movimentação fiscal' : 'movimentação estável'}. O honorário sugerido de ${formatCurrency(base)} garante a cobertura dos custos operacionais e margem de segurança.`;

    return {
      ideal: idealFee,
      min: minFee,
      premium: premiumFee,
      complexity: complexityLabel,
      risk: operationalRisk,
      hours: estimatedHours,
      analysis: automatedAnalysis,
      margin: 0.35, // Estimated 35% margin for the accountant
      effort: complexityLabel === 'Complexo' ? 'Intenso' : complexityLabel === 'Moderado' ? 'Regular' : 'Leve'
    };
  }, [formData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <Link to="/solucoes" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest mb-12">
              <ArrowLeft className="w-4 h-4" /> Catálogo de Soluções
           </Link>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Crown className="w-3 h-3" /> Professional Accountant Tool
                 </div>
                 <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85]">
                    Honorários <br /><span className="text-amber-600 italic">Pro.</span>
                 </h1>
                 <p className="text-xl text-slate-500 font-medium font-serif italic max-w-md">
                    Calcule honorários lucrativos, gere propostas irresistíveis e pare de perder dinheiro com precificação errada.
                 </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                 <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Base</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">Atualizada</div>
                 </div>
                 <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Algoritmo</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">Risk-Based</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-10">
              
              {/* Credits Indicator */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Créditos de Análise</span>
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white">{credits} Disponíveis</div>
              </div>

              <div className="space-y-8">
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 font-black text-xs">01</div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Perfil do Cliente</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Empresa</label>
                        <select 
                          value={formData.companyType}
                          onChange={(e) => setFormData({...formData, companyType: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                        >
                          <option value="MEI">MEI</option>
                          <option value="ME">ME</option>
                          <option value="EPP">EPP</option>
                          <option value="LTDA">LTDA</option>
                          <option value="SA">S/A</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Regime Tributário</label>
                        <select 
                          value={formData.taxRegime}
                          onChange={(e) => setFormData({...formData, taxRegime: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                        >
                          <option value="Simples Nacional">Simples Nacional</option>
                          <option value="Lucro Presumido">Lucro Presumido</option>
                          <option value="Lucro Real">Lucro Real</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2" ref={dropdownRef}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Atividade (CNAE)</label>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={formData.cnae}
                          onChange={handleCnaeChange}
                          autoComplete="off"
                          placeholder="Código ou Descrição..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                        />
                        {showCnaeDropdown && suggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                            {suggestions.map(s => (
                              <button 
                                key={s.id}
                                onClick={() => selectCnae(s)}
                                className="w-full text-left p-4 hover:bg-amber-50 dark:hover:bg-amber-900/30 border-b border-slate-50 dark:border-slate-800 last:border-none transition-colors"
                              >
                                <div className="text-[10px] font-black text-amber-600 mb-1">{s.id}</div>
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{s.descricao}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {formData.cnaeDesc && <div className="text-[9px] font-bold text-amber-600 uppercase px-1">{formData.cnaeDesc}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fat. Mensal (R$)</label>
                        <input 
                          type="number"
                          value={formData.revenue}
                          onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                          placeholder="0,00"
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Funcionários</label>
                        <input 
                          type="number"
                          value={formData.employees}
                          onChange={(e) => setFormData({...formData, employees: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 font-black text-xs">02</div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Dificuldade Operacional</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Volume de Notas</label>
                        <select 
                          value={formData.noteVolume}
                          onChange={(e) => setFormData({...formData, noteVolume: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                        >
                          <option value="baixo">Baixo</option>
                          <option value="medio">Médio</option>
                          <option value="alto">Alto</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Complexidade Fiscal</label>
                        <select 
                          value={formData.fiscalComplexity}
                          onChange={(e) => setFormData({...formData, fiscalComplexity: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                        >
                          <option value="baixa">Baixa</option>
                          <option value="media">Média</option>
                          <option value="alta">Alta</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-slate-400"><Users className="w-4 h-4" /></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tem Folha?</span>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, hasPayroll: !formData.hasPayroll})}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-300",
                          formData.hasPayroll ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                         <div className={cn(
                           "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                           formData.hasPayroll ? "left-7" : "left-1"
                         )} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Sócios</label>
                        <input 
                          type="number"
                          value={formData.partners}
                          onChange={(e) => setFormData({...formData, partners: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                        <select 
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                        >
                          {['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'].map(uf => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <button 
                  onClick={calculateFees}
                  disabled={isCalculating || !formData.revenue}
                  className="w-full py-6 bg-amber-500 text-white rounded-[24px] font-black uppercase text-sm tracking-widest shadow-xl shadow-amber-200 dark:shadow-none hover:bg-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group font-sans"
                >
                  {isCalculating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Calcular Honorários <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div id="fee-result-section" className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!showResult && !isCalculating ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] bg-white dark:bg-slate-900/50 rounded-[48px] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 mb-8">
                     <Calculator className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-400">Pronto para precificar?</h3>
                  <p className="text-sm text-slate-400 font-medium italic font-serif mt-2">Defina as variáveis do cliente ao lado para ver a proposta.</p>
                </motion.div>
              ) : isCalculating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] bg-white dark:bg-slate-900 rounded-[48px] border border-amber-100 dark:border-amber-900/30 flex flex-col items-center justify-center space-y-8 shadow-2xl"
                >
                  <div className="relative">
                    <div className="w-32 h-32 border-8 border-slate-100 dark:border-slate-800 rounded-full" />
                    <div className="absolute inset-0 border-8 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-amber-500 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Otimizando Valor</h3>
                    <p className="text-[10px] text-slate-400 font-bold animate-pulse mt-2 uppercase">ANALISANDO RISCO | COMPLEXIDADE | TEMPO ESTIMADO</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  {/* Recommended Fee Highlight */}
                  <div className="bg-slate-900 p-12 rounded-[56px] text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12">
                       <DollarSign className="w-64 h-64" />
                    </div>
                    
                    <div className="relative z-10 space-y-10">
                      <div className="flex justify-between items-start">
                         <div className="space-y-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg"><Star className="w-6 h-6 text-white fill-white" /></div>
                               <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Honorário Sugerido (Ideal)</span>
                            </div>
                            <h2 className="text-7xl font-black tracking-tighter italic leading-none">{formatCurrency(results.ideal)}<span className="text-lg font-bold text-slate-400 uppercase tracking-widest not-italic ml-4">/mês</span></h2>
                         </div>
                         <div className={cn(
                           "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                           results.complexity === 'Complexo' ? "border-rose-500 text-rose-500 bg-rose-500/10" : 
                           results.complexity === 'Moderado' ? "border-amber-500 text-amber-500 bg-amber-500/10" : 
                           "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                         )}>
                           Perfil {results.complexity}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/10">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faixa de Mercado Recomendada</h4>
                            <div className="flex items-center gap-6">
                               <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mínimo</div>
                                  <div className="text-lg font-black">{formatCurrency(results.min)}</div>
                               </div>
                               <div className="h-8 w-px bg-white/10" />
                               <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Premium</div>
                                  <div className="text-lg font-black text-amber-500">{formatCurrency(results.premium)}</div>
                               </div>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Duração Est.</div>
                               <div className="text-sm font-black flex items-center gap-2"><Clock className="w-3 h-3" /> {results.hours}h /mês</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risco Op.</div>
                               <div className={cn(
                                 "text-sm font-black flex items-center gap-2",
                                 results.risk === 'Alto' ? "text-rose-400" : results.risk === 'Médio' ? "text-amber-400" : "text-emerald-400"
                               )}><Activity className="w-3 h-3" /> {results.risk}</div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Automated Strategic Analysis */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[48px] shadow-sm space-y-6">
                     <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Análise Estratégica Automática</h4>
                     </div>
                     <p className="text-lg font-medium font-serif italic text-slate-600 dark:text-slate-400 leading-relaxed pr-8 line-clamp-3">
                        "{results.analysis}"
                     </p>
                  </div>

                  {/* Premium Scenarios Card */}
                  <div className="relative group">
                     <div className={cn(
                       "bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-500 p-10 rounded-[48px] space-y-8 transition-all overflow-hidden",
                       !isPremium && "blur-[4px] select-none pointer-events-none"
                     )}>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Crown className="w-6 h-6 text-amber-500" />
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Simulação Avançada de Margem</h4>
                           </div>
                           <div className="px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Premium Only</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/50 shadow-sm space-y-2">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cenário Conservador</div>
                              <div className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(results.min)}</div>
                              <div className="text-[9px] font-bold text-rose-500 uppercase italic">Margem: ~20%</div>
                           </div>
                           <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-500 shadow-xl space-y-2 relative scale-105">
                              <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Cenário Ideal</div>
                              <div className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(results.ideal)}</div>
                              <div className="text-[9px] font-bold text-emerald-500 uppercase italic">Margem: ~45%</div>
                           </div>
                           <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/50 shadow-sm space-y-2">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cenário Premium</div>
                              <div className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(results.premium)}</div>
                              <div className="text-[9px] font-bold text-blue-500 uppercase italic">Margem: +60%</div>
                           </div>
                        </div>
                     </div>

                     {!isPremium && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm rounded-[48px]">
                           <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-amber-200 dark:shadow-none mb-6 animate-bounce">
                              <Lock className="w-8 h-8" />
                           </div>
                           <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2 italic">Desbloqueie o Pro</h4>
                           <p className="text-sm text-slate-500 font-medium italic text-center max-w-xs mb-8">Veja cenários de lucro, margem estimada e esforço necessário.</p>
                           <button 
                             onClick={() => setIsPremium(true)}
                             className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg font-sans"
                           >
                              Desbloquear com 1 Crédito
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Proposal Generation Trigger */}
                  <div className="bg-amber-500 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-white"><FileText className="w-8 h-8" /></div>
                        <div className="text-white">
                           <h4 className="text-xl font-black uppercase tracking-tighter italic">Proposta Automática</h4>
                           <p className="text-xs font-bold uppercase tracking-widest opacity-80">Gere o documento completo em PDF</p>
                        </div>
                     </div>
                     <button 
                       disabled={!isPremium}
                       onClick={() => {
                         const searchParams = new URLSearchParams(location.search);
                         const cnpjData = searchParams.get('data');
                         navigate(`/solucoes/propostas-contratos?fee=${results.ideal}${cnpjData ? `&data=${cnpjData}` : ''}`);
                       }}
                       className="px-10 py-5 bg-white text-amber-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group font-sans"
                     >
                        Gerar Proposta Profissional <ArrowRight className="w-5 h-5 inline ml-2 group-hover:translate-x-1 transition-transform" />
                     </button>
                     
                     <button 
                       disabled={!isPremium}
                       onClick={() => {
                         const searchParams = new URLSearchParams(location.search);
                         const cnpjData = searchParams.get('data');
                         navigate(`/solucoes/office-contabil?margin=${results.marginReal}&fee=${results.ideal}${cnpjData ? `&data=${cnpjData}` : ''}`);
                       }}
                       className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-white hover:text-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed group font-sans border border-slate-700"
                     >
                        Cadastrar no Office <Briefcase className="w-5 h-5 inline ml-2 group-hover:rotate-12 transition-transform" />
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Monetization / Packages - Fixed at bottom for free users */}
      {!isPremium && showResult && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-[100]"
        >
           <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl border border-white/10 flex items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg"><Crown className="w-6 h-6" /></div>
                 <div>
                    <h5 className="font-black uppercase text-[10px] tracking-widest text-amber-500">Pacote Upgrade</h5>
                    <div className="text-sm font-bold">10 Análises Avançadas por R$ 29,90</div>
                 </div>
              </div>
              <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">
                 Comprar Créditos
              </button>
           </div>
        </motion.div>
      )}
    </div>
  );
}
