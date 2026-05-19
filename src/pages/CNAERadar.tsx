import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { products } from '../data/products';
import { 
  Search, 
  MapPin, 
  Zap, 
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  X,
  Building2,
  ExternalLink,
  ChevronLeft,
  Phone,
  Mail,
  User,
  Info,
  Database,
  Code,
  Lock,
  Scale,
  TrendingUp,
  CreditCard,
  Download,
  CheckCircle2,
  Sparkles,
  Package
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface CompanyProfile {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral: string;
  data_situacao: string;
  data_inicio_atividade: string;
  cnae_principal: { codigo: string; descricao: string };
  cnaes_secundarios: { codigo: string; descricao: string }[];
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  contatos: { telefones: string[]; email?: string };
  qsa: { nome: string; qualificacao: string; data_entrada: string; documento_mascarado?: string }[];
  simples?: string;
  mei?: string;
  capital_social?: string;
  porte?: string;
  natureza_juridica?: string;
}

interface LookupResponse {
  ok: boolean;
  cnpj: string;
  profile: CompanyProfile | null;
  warnings: string[];
  errors: { source: string; status: number; message: string }[];
  sources: any;
  meta: {
    cacheHit: boolean;
    fetchedAt: string;
    usedSources: string[];
    from?: string;
  };
  error?: string; // root error if any
}

export default function CNPJLookup() {
  const { addToCart, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();
  const [cnpjInput, setCnpjInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<LookupResponse | null>(null);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cadastro' | 'atividades' | 'socios' | 'contato' | 'governo' | 'json'>('cadastro');
  const [healthData, setHealthData] = useState<any>(null);
  const [govData, setGovData] = useState<any>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatCnpj = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 14);
    if (raw.length <= 2) return raw;
    if (raw.length <= 5) return `${raw.slice(0, 2)}.${raw.slice(2)}`;
    if (raw.length <= 8) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`;
    if (raw.length <= 12) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8)}`;
    return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}`;
  };

  // Parse success from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const cnpjFromUrl = params.get('cnpj');
      if (cnpjFromUrl) {
        const formatted = formatCnpj(cnpjFromUrl);
        setCnpjInput(formatted);
        // Trigger search automatically
        handleSearchSilently(cnpjFromUrl);
      }
    }
  }, []);

  const handleSearchSilently = async (cleanCnpj: string) => {
    setLoading(true);
    try {
      const [fetchResponse, govResponse] = await Promise.all([
        fetch(`/api/cnpj/lookup?cnpj=${cleanCnpj}`),
        fetch(`/api/cnpj/governo?cnpj=${cleanCnpj}`)
      ]);
      const data = await fetchResponse.json();
      const gData = await govResponse.json();
      setResponse(data);
      setGovData(gData);
      setActiveTab('cadastro');
    } catch (err) {
      console.error("Silent search failed");
    } finally {
      setLoading(false);
    }
  };

  const formatDateBR = (dateStr: string | undefined) => {
    if (!dateStr || dateStr === 'N/A') return "—";
    try {
      const clean = dateStr.split('T')[0];
      if (clean.includes('-')) {
        const parts = clean.split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
          return clean.split('-').reverse().join('/');
        }
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const formatCurrencyBRL = (value: any) => {
    const num = parseFloat(String(value).replace(',', '.'));
    if (isNaN(num) || num === 0) return "Não informado";
    return num.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: num % 1 === 0 ? 0 : 2
    });
  };

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/cnpj/health');
        const data = await res.json();
        setHealthData(data);
      } catch (e) {
        console.error("Health fetch failed");
      }
    };
    fetchHealth();

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (response?.ok && user) {
      fetch(`/api/cnpj/check-access?cnpj=${response.cnpj}&userId=${user.uid}`)
        .then(r => r.json())
        .then(data => setHasPaid(data.hasPaid))
        .catch(() => setHasPaid(false));
    } else {
      setHasPaid(false);
    }
  }, [response, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpjInput(formatCnpj(e.target.value));
    if (!e.target.value) {
      setResponse(null);
      setErrorHeader(null);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCnpj = cnpjInput.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      setErrorHeader("O CNPJ deve ter 14 dígitos.");
      return;
    }

    setLoading(true);
    setErrorHeader(null);
    setResponse(null);
    setGovData(null);
    
    try {
      const [fetchResponse, govResponse] = await Promise.all([
        fetch(`/api/cnpj/lookup?cnpj=${cleanCnpj}`),
        fetch(`/api/cnpj/governo?cnpj=${cleanCnpj}`)
      ]);

      const data = await fetchResponse.json();
      const gData = await govResponse.json();
      
      setResponse(data);
      setGovData(gData);

      if (!data.ok) {
        setErrorHeader(data.error || "A consulta não retornou resultados");
      } else {
        setActiveTab('cadastro');
      }
    } catch (err: any) {
      setErrorHeader("Falha crítica na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!profile) return;
    setIsAdding(true);
    try {
      await addToCart({
        sku: "cnpj_dossier",
        title: `Dossiê Completo CNPJ: ${profile.cnpj}`,
        price: 4.99,
        metadata: { cnpj: profile.cnpj, companyName: profile.razao_social, type: 'individual' }
      }, { cnpj: profile.cnpj, companyName: profile.razao_social }, false);
      navigate('/checkout');
    } catch (e) {
      alert("Erro ao adicionar ao carrinho");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!profile) return;
    setIsDownloading(true);
    try {
      const resp = await fetch(`/api/cnpj/pdf?cnpj=${profile.cnpj}&userId=${user?.uid || ''}`);
      if (!resp.ok) throw new Error("Erro ao baixar PDF");
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dossie_${profile.cnpj}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Falha no download: " + (e instanceof Error ? e.message : "Erro desconhecido"));
    } finally {
      setIsDownloading(false);
    }
  };

  const profile = response?.profile;
  const recommendations = products
    .filter(p => p.slug !== 'cnae-radar' && p.status === 'active')
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="pt-24 pb-20 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-full bg-blue-600/10 blur-[120px] -z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mb-12">
            <Link to="/solutions" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Voltar ao Catalogo Completo
            </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Base de Dados Oficial Agregada
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
              Consulta <span className="text-blue-500">CNPJ.</span>
            </h1>
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white p-4 rounded-[32px] shadow-2xl flex flex-col md:flex-row gap-4 relative mt-10">
              <div className="flex-1 relative">
                <Building2 className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={cnpjInput}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0001-91"
                  className="w-full pl-14 pr-12 py-5 bg-slate-50 border-none rounded-2xl outline-none text-slate-900 font-bold placeholder:font-medium text-lg"
                />
                {cnpjInput && (
                  <button 
                    type="button"
                    onClick={() => { setCnpjInput(''); setResponse(null); setErrorHeader(null); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-2 bg-slate-200/50 hover:bg-slate-200 rounded-full transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button 
                type="submit"
                disabled={loading || cnpjInput.length < 14}
                className={cn(
                  "bg-blue-600 hover:bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-3",
                  loading && "animate-pulse"
                )}
              >
                {loading ? 'Consultando...' : 'Consultar'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Content Area */}
      <section className="py-12 -mt-10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <AnimatePresence mode="wait">
            {!response && !loading && !errorHeader && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[40px] border border-slate-100 p-20 text-center space-y-6 shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto">
                  <Search className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Pronto para consultar</h3>
                  <p className="text-slate-500 font-medium">Informe um CNPJ acima para carregar a ficha completa.</p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[40px] border border-slate-100 p-32 text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <Building2 className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-900 font-black uppercase text-xs tracking-widest">Orquestrando Fontes de Dados...</p>
              </motion.div>
            )}

            {(errorHeader || (response && !response.ok)) && (
              <motion.div key="error" className="max-w-3xl mx-auto">
                <div className="bg-white rounded-[40px] border border-red-100 p-12 text-center space-y-8 shadow-2xl">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Consulta Falhou</h3>
                    <p className="text-red-600 font-bold px-4">{errorHeader}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {profile && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Header Card */}
                <div className="bg-white rounded-[48px] p-10 md:p-14 border border-slate-100 shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
                    <div className="flex-1 space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          profile.situacao_cadastral?.includes('ATIVA') ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          Status: {profile.situacao_cadastral}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                          CNPJ: {profile.cnpj}
                        </span>
                        {hasPaid && (
                           <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                             <CheckCircle2 className="w-3 h-3" /> Conteúdo Desbloqueado
                           </span>
                        )}
                      </div>
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-2">
                          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase">
                            {profile.razao_social}
                          </h2>
                          {profile.nome_fantasia && (
                            <p className="text-xl md:text-2xl text-blue-600 font-bold uppercase tracking-tight">
                              {profile.nome_fantasia}
                            </p>
                          )}
                        </div>
                        {hasPaid && (
                          <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="shrink-0 h-14 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all self-start md:self-center"
                          >
                            <Download className="w-4 h-4" />
                            {isDownloading ? 'Gerando...' : 'Baixar Dossiê PDF'}
                          </button>
                        )}
                      </div>
                      <div className={cn(
                        "grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-50 transition-all",
                        !hasPaid && "blur-md select-none opacity-50"
                      )}>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Início Atividade</p>
                          <p className="text-sm font-bold text-slate-900">{formatDateBR(profile.data_inicio_atividade)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidade/UF</p>
                          <p className="text-sm font-bold text-slate-900">{profile.endereco?.municipio} - {profile.endereco?.uf}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Social</p>
                          <p className="text-sm font-bold text-slate-900">{formatCurrencyBRL(profile.capital_social)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Porte</p>
                          <p className="text-sm font-bold text-slate-900 uppercase">{profile.porte || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs & Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">
                   <div className="md:col-span-3 space-y-2">
                      {[
                        { id: 'cadastro', label: 'Cadastro Base', icon: Info },
                        { id: 'governo', label: 'Relação com Órgãos', icon: Scale },
                        { id: 'atividades', label: 'CNAEs e Atividades', icon: Zap },
                        { id: 'socios', label: 'Quadro de Sócios', icon: User },
                        { id: 'contato', label: 'Endereço e Contato', icon: Phone },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={cn(
                            "w-full px-6 py-4 rounded-2xl flex items-center gap-4 transition-all text-sm font-black uppercase tracking-widest relative group",
                            activeTab === tab.id 
                              ? "bg-blue-600 text-white shadow-xl translate-x-2" 
                              : "bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          )}
                        >
                          <tab.icon className="w-4 h-4" />
                          <span className="flex-1 text-left">{tab.label}</span>
                          {!hasPaid && <Lock className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />}
                        </button>
                      ))}
                   </div>

                   <div className="md:col-span-9 relative min-h-[500px]">
                      <div className={cn(
                        "bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm min-h-[500px] transition-all relative",
                        !hasPaid && "blur-xl select-none"
                      )} style={{ pointerEvents: hasPaid ? 'auto' : 'none' }}>
                        <AnimatePresence mode="wait">
                          {activeTab === 'cadastro' && (
                            <motion.div key="cadastro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter border-b border-slate-50 pb-6">Informações Gerais</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Razão Social</p>
                                  <p className="text-lg font-bold text-slate-900 uppercase">{profile.razao_social}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Estimado</p>
                                  <p className="text-lg font-bold text-blue-600 uppercase">{formatCurrencyBRL(profile.capital_social)}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data da Situação</p>
                                  <p className="text-lg font-bold text-slate-900">{formatDateBR(profile.data_situacao)}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza Jurídica</p>
                                  <p className="text-lg font-bold text-slate-900 uppercase">{profile.natureza_juridica || 'Não informado'}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {activeTab === 'governo' && (
                            <motion.div key="governo" className="p-20 text-center space-y-4">
                              <Scale className="w-12 h-12 text-slate-200 mx-auto" />
                              <h4 className="text-xl font-black text-slate-900 uppercase">Inteligência Governamental</h4>
                              <p className="text-slate-500">Dados de licitações, contratos e empenhos públicos vinculados ao CNPJ.</p>
                            </motion.div>
                          )}

                          {activeTab === 'atividades' && (
                             <motion.div key="atividades" className="space-y-8">
                                <div className="p-6 bg-blue-50 rounded-2xl">
                                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{profile.cnae_principal.codigo}</p>
                                  <p className="text-lg font-bold text-blue-900 uppercase">{profile.cnae_principal.descricao}</p>
                                </div>
                                {profile.cnaes_secundarios.map((c, i) => (
                                  <div key={i} className="flex gap-4 border-l-2 border-slate-100 pl-4">
                                    <span className="text-[10px] font-black text-slate-400">{c.codigo}</span>
                                    <p className="text-sm font-bold text-slate-700 uppercase">{c.descricao}</p>
                                  </div>
                                ))}
                             </motion.div>
                          )}

                          {activeTab === 'socios' && (
                             <motion.div key="socios" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {profile.qsa.map((s, i) => (
                                  <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                                    <p className="text-xs font-black text-slate-900 uppercase">{s.nome}</p>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{s.qualificacao}</p>
                                  </div>
                                ))}
                             </motion.div>
                          )}

                          {activeTab === 'contato' && (
                            <motion.div key="contato" className="space-y-6">
                               <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-4">
                                 <div className="flex gap-4">
                                    <MapPin className="text-blue-400 shrink-0" />
                                    <p className="text-lg font-bold uppercase">{profile.endereco.logradouro}, {profile.endereco.numero} - {profile.endereco.municipio}/{profile.endereco.uf}</p>
                                 </div>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Paywall Overlay */}
                      {!hasPaid && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 pointer-events-none">
                           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-12 max-w-lg w-full text-center space-y-8 pointer-events-auto">
                              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
                                <Lock className="w-10 h-10" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Desbloquear Dados</h3>
                                <p className="text-slate-500 font-medium">CNAE completo, sócios, contatos e inteligência empresarial.</p>
                              </div>
                              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                <p className="text-blue-600 font-black text-2xl">R$ 4,99</p>
                              </div>
                              <button onClick={handleAddToCart} disabled={isAdding} className="w-full py-6 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                                {isAdding ? 'Adicionando...' : 'Desbloquear Agora'}
                              </button>
                           </motion.div>
                        </div>
                      )}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recommendations */}
          {profile && (
            <div className="mt-20 space-y-8">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Quem comprou este também comprou</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map(p => (
                  <div key={p.id} className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-blue-200 transition-all flex flex-col justify-between h-full group">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{p.category}</p>
                        <h4 className="text-base font-bold text-slate-900 leading-tight mb-2">{p.subtitle}</h4>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        await addToCart({ sku: p.slug, title: p.subtitle, price: p.pricing.priceValue || 59 }, {}, false);
                        navigate('/checkout');
                      }} 
                      className="mt-6 w-full py-3 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Adicionar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer Disclaimer */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-blue-600 mx-auto" />
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Bases Públicas Oficiais</h2>
          <p className="text-slate-500 font-medium leading-relaxed">Este sistema agrega dados abertos disponibilizados pelo Governo Federal e órgãos reguladores.</p>
        </div>
      </section>
    </div>
  );
}
