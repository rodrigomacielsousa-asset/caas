import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ArrowLeft, 
  ShoppingCart, 
  ShieldCheck, 
  Zap, 
  Star, 
  History,
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Globe,
  Sparkles,
  ArrowRight,
  Play,
  FileText,
  Activity,
  ArrowUpRight,
  HelpCircle,
  Package,
  Layers,
  CheckCircle,
  MessageSquare,
  Search,
  AlertTriangle,
  MapPin,
  Building2,
  Calendar,
  X,
  Printer,
  Box,
  Users,
  Gavel,
  CreditCard,
  Map,
  Lock,
  Wallet,
  Coins,
  Crown,
  Mail,
  Upload,
  FileSearch,
  AlertCircle,
  Info,
  DollarSign,
  PieChart,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Setup PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import { useCart } from '../contexts/CartContext';
import { products } from '../data/products';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, increment, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import type { Product } from '../types';

interface NormalizedCNPJProfile {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  situacaoCadastral: string;
  dataInicioAtividade?: string;
  dataSituacaoCadastral?: string;
  motivoSituacao?: string;
  cnaePrincipal?: { codigo?: string | number; descricao?: string };
  cnaesSecundarios?: Array<{ codigo?: string | number; descricao?: string }>;
  naturezaJuridica?: string;
  porte?: string;
  capitalSocial?: number | string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
  };
  contatos?: {
    email?: string;
    telefone1?: string;
    telefone2?: string;
  };
  simples?: {
    opcaoSimples?: boolean | null;
    dataOpcaoSimples?: string | null;
    dataExclusaoSimples?: string | null;
    opcaoMEI?: boolean | null;
    dataOpcaoMEI?: string | null;
    dataExclusaoMEI?: string | null;
  };
  qsa?: Array<{
    nome: string;
    qualificacao?: string;
    dataEntrada?: string;
    tipo?: string;
  }>;
}

interface ConnectorResult {
  status: 'ok' | 'pendente' | 'nao_verificado' | 'erro' | 'idle' | 'running';
  label: string;
  details: string[];
  evidence?: { kind: 'url' | 'file'; value: string };
  updatedAt?: number;
}

interface Connector {
  id: string;
  name: string;
  type: 'api' | 'assisted' | 'upload';
}

// Normalizers
const normalizeBrasilAPI = (data: any): NormalizedCNPJProfile => ({
  cnpj: data.cnpj,
  razaoSocial: data.razao_social,
  nomeFantasia: data.nome_fantasia,
  situacaoCadastral: data.descricao_situacao_cadastral,
  dataInicioAtividade: data.data_inicio_atividade,
  dataSituacaoCadastral: data.data_situacao_cadastral,
  motivoSituacao: data.descricao_motivo_situacao_cadastral,
  cnaePrincipal: { codigo: data.cnae_fiscal, descricao: data.cnae_fiscal_descricao },
  cnaesSecundarios: data.cnaes_secundarios?.map((c: any) => ({ codigo: c.codigo, descricao: c.descricao })),
  naturezaJuridica: data.natureza_juridica,
  porte: data.porte,
  capitalSocial: data.capital_social,
  endereco: {
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento,
    bairro: data.bairro,
    municipio: data.municipio,
    uf: data.uf,
    cep: data.cep,
  },
  contatos: {
    email: data.email,
    telefone1: data.ddd_telefone_1,
    telefone2: data.ddd_telefone_2,
  },
  simples: {
    opcaoSimples: data.opcao_pelo_simples,
    dataOpcaoSimples: data.data_opcao_pelo_simples,
    dataExclusaoSimples: data.data_exclusao_do_simples,
    opcaoMEI: data.opcao_pelo_mei,
    dataOpcaoMEI: data.data_opcao_pelo_mei,
    dataExclusaoMEI: data.data_exclusao_do_mei,
  },
  qsa: data.qsa?.map((s: any) => ({
    nome: s.nome_socio,
    qualificacao: s.qualificacao_socio,
    dataEntrada: s.data_entrada_sociedade,
    tipo: s.identificador_de_socio === 2 ? 'PF' : 'PJ'
  }))
});

const normalizeMinhaReceita = (data: any): NormalizedCNPJProfile => ({
  cnpj: data.cnpj,
  razaoSocial: data.razao_social,
  nomeFantasia: data.nome_fantasia,
  situacaoCadastral: data.descricao_situacao_cadastral,
  dataInicioAtividade: data.data_inicio_atividade,
  dataSituacaoCadastral: data.data_situacao_cadastral,
  motivoSituacao: data.descricao_motivo_situacao_cadastral,
  cnaePrincipal: { codigo: data.cnae_fiscal, descricao: data.cnae_fiscal_descricao },
  naturezaJuridica: data.natureza_juridica,
  porte: data.porte,
  capitalSocial: data.capital_social,
  endereco: {
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento,
    bairro: data.bairro,
    municipio: data.municipio,
    uf: data.uf,
    cep: data.cep,
  },
  contatos: {
     email: data.email,
     telefone1: data.telefone1,
     telefone2: data.telefone2
  },
  simples: {
    opcaoSimples: data.opcao_pelo_simples,
    opcaoMEI: data.opcao_pelo_mei,
  },
  qsa: data.qsa?.map((s: any) => ({
    nome: s.nome_socio,
    qualificacao: s.qualificacao_socio,
  }))
});

const normalizeCnpjWS = (data: any): NormalizedCNPJProfile => {
  const est = data.estabelecimento || {};
  return {
    cnpj: data.cnpj || est.cnpj,
    razaoSocial: data.razao_social,
    nomeFantasia: est.nome_fantasia,
    situacaoCadastral: est.situacao_cadastral,
    dataInicioAtividade: est.data_inicio_atividade,
    naturezaJuridica: data.natureza_juridica?.descricao,
    porte: data.porte?.descricao,
    capitalSocial: data.capital_social,
    endereco: {
      logradouro: est.logradouro,
      numero: est.numero,
      complemento: est.complemento,
      bairro: est.bairro,
      municipio: est.cidade?.nome,
      uf: est.estado?.sigla,
      cep: est.cep,
    },
    simples: {
      opcaoSimples: data.simples?.optante === 'Sim',
      opcaoMEI: data.mei?.optante === 'Sim',
    },
    qsa: data.socios?.map((s: any) => ({
      nome: s.nome,
      qualificacao: s.qualificacao_socio_descricao,
    }))
  };
};

const fetchCNPJProfile = async (cnpjNumeros: string): Promise<NormalizedCNPJProfile> => {
  // Chain: BrasilAPI -> Minha Receita -> CNPJ.ws
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjNumeros}`);
    if (res.ok) return normalizeBrasilAPI(await res.json());
  } catch (e) { console.warn('BrasilAPI failed'); }

  try {
    const res = await fetch(`https://minhareceita.org/${cnpjNumeros}`);
    if (res.ok) return normalizeMinhaReceita(await res.json());
  } catch (e) { console.warn('MinhaReceita failed'); }

  try {
    const res = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjNumeros}`);
    if (res.ok) return normalizeCnpjWS(await res.json());
  } catch (e) { console.warn('CNPJ.ws failed'); }

  throw new Error("Não foi possível consultar este CNPJ agora. Tente novamente.");
};

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  const product = products.find(p => p.slug === slug);

  if (!product) {
    return <Navigate to="/solucoes" replace />;
  }

  // Estados para CheckCNPJ 360
  const [cnpjInput, setCnpjInput] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cnpjData, setCnpjData] = useState<NormalizedCNPJProfile | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  // Scanners State
  const [connectorResults, setConnectorResults] = useState<Record<string, ConnectorResult>>({
    'profile': { status: 'idle', label: 'AGUARDANDO', details: [] },
    'federal': { status: 'idle', label: 'AGUARDANDO', details: [] },
    'rfb_docs': { status: 'idle', label: 'AGUARDANDO', details: [] },
    'cndt': { status: 'idle', label: 'AGUARDANDO', details: [] },
    'tcu': { status: 'idle', label: 'AGUARDANDO', details: [] },
  });

  const connectors: Connector[] = [
    { id: 'profile', name: 'Perfil Cadastral', type: 'api' },
    { id: 'federal', name: 'Certidão Conjunta RFB/PGFN', type: 'assisted' },
    { id: 'rfb_docs', name: 'Consulta 2ª Via Certidões', type: 'assisted' },
    { id: 'cndt', name: 'Certidão Trabalhista (CNDT)', type: 'assisted' },
    { id: 'tcu', name: 'Consulta TCU Consolidada', type: 'assisted' },
  ];
  
  // User Data State
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number>(0);
  const [isUserPremium, setIsUserPremium] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCredits(userData.credits || 0);
          setIsUserPremium(userData.isPro || false);
        } else {
          // If profile doesn't exist, create one with 0 credits
          await setDoc(userRef, {
            uid: u.uid,
            email: u.email,
            credits: 0,
            isPro: false,
            createdAt: serverTimestamp()
          }, { merge: true });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCheckCNPJ = async () => {
    const cleanCnpj = cnpjInput.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      setApiError('CNPJ inválido. Digite os 14 números.');
      return;
    }

    setIsConsulting(true);
    setApiError(null);
    setCnpjData(null);
    setIsPremium(false);
    
    // Reset connectors
    setConnectorResults({
      'profile': { status: 'running', label: 'SCANNEANDO', details: [] },
      'federal': { status: 'idle', label: 'AGUARDANDO', details: [] },
      'rfb_docs': { status: 'idle', label: 'AGUARDANDO', details: [] },
      'cndt': { status: 'idle', label: 'AGUARDANDO', details: [] },
      'tcu': { status: 'idle', label: 'AGUARDANDO', details: [] },
    });

    try {
      const data = await fetchCNPJProfile(cleanCnpj);
      setCnpjData(data);
      
      setConnectorResults(prev => ({
        ...prev,
        'profile': { 
          status: 'ok', 
          label: 'OK', 
          details: [`Empresa: ${data.razaoSocial}`, `Situação: ${data.situacaoCadastral}`] 
        },
        'federal': { status: 'nao_verificado', label: 'NÃO VERIFICADO', details: ['Requer ação assistida ou upload.'], evidence: { kind: 'url', value: 'https://www.gov.br/pt-br/servicos/emitir-certidao-de-regularidade-fiscal' } },
        'rfb_docs': { status: 'nao_verificado', label: 'NÃO VERIFICADO', details: ['Consulta de 2ª via pendente.'], evidence: { kind: 'url', value: 'https://www.gov.br/pt-br/servicos/consultar-certidoes-emitidas-pela-receita-federal-e-ou-procuradoria-geral-da-fazenda-nacional' } },
        'cndt': { status: 'nao_verificado', label: 'NÃO VERIFICADO', details: ['Requer consulta ao TST.'], evidence: { kind: 'url', value: 'http://cndt-certidao.tst.jus.br/inicio.faces' } },
        'tcu': { status: 'nao_verificado', label: 'NÃO VERIFICADO', details: ['Base TCU não consultada.'], evidence: { kind: 'url', value: 'https://certidoes-apf.apps.tcu.gov.br/' } },
      }));

      // Auto-scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('scanner-dashboard');
        if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setApiError("Não foi possível consultar agora. Tente novamente.");
      setConnectorResults(prev => ({
        ...prev,
        'profile': { status: 'erro', label: 'ERRO', details: [err.message] }
      }));
    } finally {
      setIsConsulting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeUploadId) return;

    // Start loading state for this connector
    setConnectorResults(prev => ({
      ...prev,
      [activeUploadId]: { ...prev[activeUploadId], status: 'running', label: 'LENDO PDF...' }
    }));

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + ' ';
        }

        const text = fullText.toUpperCase();
        let status: 'ok' | 'pendente' | 'nao_verificado' = 'nao_verificado';
        let label = 'NÃO IDENTIFICADO';
        let details = ['Leitura realizada, mas padrão não reconhecido.'];

        if (text.includes('CERTIDÃO NEGATIVA')) {
          status = 'ok';
          label = 'CND';
          details = ['Nenhuma pendência encontrada no documento anexado.'];
        } else if (text.includes('POSITIVA COM EFEITOS DE NEGATIVA')) {
          status = 'ok';
          label = 'CPEN';
          details = ['Existem pendências, mas estão com exigibilidade suspensa ou garantidas.'];
        } else if (text.includes('CERTIDÃO POSITIVA')) {
          status = 'pendente';
          label = 'POSITIVA';
          details = ['Foram encontradas pendências restritivas no documento.'];
        }

        setConnectorResults(prev => ({
          ...prev,
          [activeUploadId]: { 
            status, 
            label, 
            details, 
            evidence: { kind: 'file', value: file.name },
            updatedAt: Date.now()
          }
        }));
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setConnectorResults(prev => ({
        ...prev,
        [activeUploadId]: { status: 'erro', label: 'ERRO NA LEITURA', details: ['Falha ao processar o arquivo PDF.'] }
      }));
    } finally {
      setActiveUploadId(null);
    }
  };

  const calculateDetailedScore = (profile: NormalizedCNPJProfile | null) => {
    if (!profile) return { score: 100, deductions: [] };
    
    let score = 100;
    const deductions: Array<{ label: string; value: number }> = [];

    // 1) Situação cadastral não ATIVA => -60
    if (profile.situacaoCadastral !== "ATIVA") {
      score -= 60;
      deductions.push({ label: 'Situação cadastral não ativa', value: 60 });
    }

    // Connectors impact (Rule 5)
    // Se Certidão Conjunta POSITIVA => -50
    if (connectorResults.federal.status === 'pendente') {
      score -= 50;
      deductions.push({ label: 'Certidão Federal Positiva', value: 50 });
    }
    // Se CNDT POSITIVA => -40
    if (connectorResults.cndt.status === 'pendente') {
      score -= 40;
      deductions.push({ label: 'Certidão Trabalhista Positiva', value: 40 });
    }
    // Se "nao_verificado" em Conjunta ou CNDT => -15 cada
    if (connectorResults.federal.status === 'nao_verificado') {
      score -= 15;
      deductions.push({ label: 'Federal não verificada', value: 15 });
    }
    if (connectorResults.cndt.status === 'nao_verificado') {
      score -= 15;
      deductions.push({ label: 'Trabalhista não verificada', value: 15 });
    }

    score = Math.max(0, Math.min(100, score));
    return { score, deductions };
  };

  const analysis = useMemo(() => {
    if (!cnpjData) return null;
    
    const { score, deductions } = calculateDetailedScore(cnpjData);
    // >=80: REGULAR, 60-79: ATENÇÃO, <60: IRREGULAR (Rule 5)
    const statusGeral = score >= 80 ? 'REGULAR' : score >= 60 ? 'ATENÇÃO' : 'IRREGULAR';
    const operationalRisk = score >= 80 ? 'Baixo' : score >= 60 ? 'Médio' : 'Alto';

    let observation = 'Estrutura robusta e histórico estável.';
    if (cnpjData.situacaoCadastral !== 'ATIVA') observation = 'Risco crítico: Situação cadastral não ativa.';
    else if (score < 60) observation = 'Vários indicadores sugerem cautela operacional elevada.';
    else if (score < 80) observation = 'Alguns indicadores sugerem cautela operacional.';

    // Calculate time for display
    let yearsFloor = 0;
    let months = 0;
    if (cnpjData.dataInicioAtividade) {
      const openingDate = new Date(cnpjData.dataInicioAtividade);
      const today = new Date();
      const diff = today.getTime() - openingDate.getTime();
      yearsFloor = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
      months = Math.floor((diff / (1000 * 60 * 60 * 24 * 30.44)) % 12);
    }

    return {
      score,
      statusGeral,
      operationalRisk,
      yearsFloor,
      months,
      observation,
      deductions
    };
  }, [cnpjData, connectorResults]);

  const handleUnlockPremium = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/solucoes/${slug}` } });
      return;
    }

    if (isUserPremium) {
      setIsPremium(true);
      return;
    }

    if (credits > 0) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          credits: increment(-1)
        });
        
        // Log consultation
        const logRef = doc(collection(db, 'logs', user.uid, 'consultas'), `${Date.now()}`);
        await setDoc(logRef, {
          cnpj: cnpjData?.cnpj,
          timestamp: serverTimestamp(),
          status: 'success'
        });

        setCredits(prev => prev - 1);
        setIsPremium(true);
      } catch (err) {
        console.error('Charge error:', err);
        setApiError('Erro ao processar créditos. Tente novamente.');
      }
    } else {
      // Open checkout or payment modal
      addItem({
        id: 'credit-single',
        slug: 'credit-single',
        name: 'Crédito Consulta Avulsa - CheckCNPJ 360',
        price: 9,
        priceLabel: 'R$ 9,00',
        type: 'individual',
        pricingModel: 'one_time'
      });
      navigate('/checkout');
    }
  };

  const handleCTA = () => {
    if (product.pricing.ctaAction === 'checkout') {
      addItem({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.pricing.priceValue,
        priceLabel: product.pricing.priceLabel,
        type: 'individual',
        pricingModel: product.pricingModel
      });
      navigate('/checkout');
    } else if (product.pricing.ctaAction === 'contact') {
      navigate('/contato', { state: { product: product.name } });
    } else if (product.pricing.ctaAction === 'open_app') {
       if (product.liveUrl) {
         navigate(product.liveUrl);
       } else {
         navigate(`/solucoes/${product.slug}`);
       }
       window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Hero Section */}
      {/* Search Here */}
      {/* Hero CNPJ Search */}
      {product.slug === 'checkcnpj-360' && (
        <div className="bg-slate-50 border-b border-slate-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm max-w-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={cnpjInput}
                    onChange={(e) => setCnpjInput(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-slate-900 outline-none focus:border-blue-600 transition-all font-mono"
                  />
                </div>
                <button 
                  onClick={handleCheckCNPJ}
                  disabled={isConsulting}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all disabled:opacity-50 min-w-[120px]"
                >
                  {isConsulting ? <Clock className="w-4 h-4 animate-spin mx-auto" /> : 'Consultar'}
                </button>
              </div>
              {apiError && <p className="text-[10px] font-bold text-rose-500 mt-2 ml-4 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {apiError}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="bg-white border-b border-slate-200 pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <Link to="/solucoes" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest mb-12">
              <ArrowLeft className="w-4 h-4" /> Catálogo de Soluções
           </Link>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-10">
                 <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{product.category}</span>
                    {product.badges.map(badge => (
                      <span key={badge} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{badge}</span>
                    ))}
                 </div>

                 <div className="space-y-6">
                   <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{product.name}</h1>
                   <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-xl">
                     {product.longDescription}
                   </p>
                 </div>
                 
                 <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600"><CheckCircle className="w-5 h-5" /></div>
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400">Homologado 2026</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600"><ShieldCheck className="w-5 h-5" /></div>
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400">Dados Segregados</span>
                    </div>
                 </div>
              </div>

              {/* Pricing Card */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-slate-900 rounded-[48px] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group border border-white/5"
              >
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Zap className="w-48 h-48 group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  
                  <div className="relative z-10 space-y-10">
                     <div className="space-y-2">
                        <div className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">{product.pricingModel === 'subscription' ? 'Assinatura' : product.pricingModel === 'one_time' ? 'Pagamento Único' : product.pricingModel === 'free' ? 'Gratuitous' : 'Especialista'}</div>
                        <div className="text-6xl font-black tracking-tighter text-white">{product.pricing.priceLabel}</div>
                        <p className="text-sm text-slate-400 font-medium">{product.pricing.ctaAction === 'checkout' ? 'Ativação imediata pós-checkout.' : 'Consulte condições com nosso time.'}</p>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 opacity-60">O que você recebe:</h4>
                        <ul className="grid grid-cols-1 gap-3">
                           {product.pricing.includes.map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-sm font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {item}</li>
                           ))}
                        </ul>
                     </div>

                     <div className="space-y-4">
                        <button 
                           onClick={handleCTA}
                           className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all shadow-xl active:scale-95 group/btn"
                        >
                           {product.pricing.ctaAction === 'checkout' ? <ShoppingCart className="w-6 h-6" /> : product.pricing.ctaAction === 'contact' ? <MessageSquare className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                           {product.pricing.ctaAction === 'open_app' ? 'Testar agora' : product.pricing.ctaText}
                           <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </button>
                        <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suporte técnico especializado incluso</p>
                     </div>
                  </div>
              </motion.div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-32">
         {/* Sales Sections: Dor / Solução / Resultado */}
         <section className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-200 pb-24">
            <div className="p-12 bg-white rounded-[48px] border border-slate-100 space-y-6 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-[0.9]">O Problema <br />que resolvemos</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-lg">
                  {product.shortDescription || "Processos manuais lentos que drenam a lucratividade."}
                </p>
              </div>
            </div>

            <div className="p-12 bg-white rounded-[48px] border border-slate-100 space-y-6 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Zap className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-[0.9]">A Solução <br />Inteligente</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-lg">
                  Automação cirúrgica de {product.name}, garantindo precisão absoluta e agilidade.
                </p>
              </div>
            </div>

            <div className="p-12 bg-white rounded-[48px] border border-slate-100 space-y-6 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-[0.9]">O Resultado <br />Direto</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-lg">
                  {product.impactPhrase || "Recupere horas de tempo produtivo e elimine o estresse."}
                </p>
              </div>
            </div>
         </section>

         {/* Para quem é / Como funciona */}
         <section className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
               <div className="space-y-4">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Para quem é?</h2>
                 <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    Esta solução foi projetada especialmente para escritórios de contabilidade que buscam escala sem aumentar o head-count, ou empresas que precisam de conformidade rigorosa.
                 </p>
               </div>

               <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform duration-700"><CheckCircle2 className="w-48 h-48" /></div>
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-600" /> Benefícios Chave
                  </h3>
                  <ul className="space-y-6">
                     {[
                       "Redução de erros manuais em até 95%",
                       "Conformidade total com o CPC e RFB",
                       "Velocidade de processamento em tempo real",
                       "Integração via API e formatos universais"
                     ].map((benefit, i) => (
                       <li key={i} className="flex items-start gap-4">
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /></div>
                          <span className="text-sm font-bold text-slate-700">{benefit}</span>
                       </li>
                     ))}
                  </ul>
               </div>
            </div>

            <div className="space-y-8">
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Como funciona?</h2>
               <div className="space-y-4">
                  {product.howToUse.map((step, i) => (
                    <div key={i} className="flex gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
                       <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-blue-200 group-hover:scale-110 transition-all">{i + 1}</div>
                       <div className="pt-2">
                          <p className="text-lg font-bold text-slate-800">{step}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Inputs / Outputs */}
         <section className="bg-slate-900 rounded-[64px] p-12 md:p-24 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-16">
               <div className="lg:col-span-1 space-y-6">
                  <h2 className="text-5xl font-black tracking-tighter leading-none">O fluxo <br />de dados.</h2>
                  <p className="text-lg text-indigo-200/60 font-medium">Entenda exatamente o que você fornece e o que recebe como entrega final.</p>
               </div>
               
               <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><ArrowUpRight className="w-5 h-5 text-white" /></div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Entradas (Inputs)</h4>
                     </div>
                     <ul className="space-y-3">
                        {product.inputs.map((input, i) => (
                          <li key={i} className="text-xl font-black text-white/90 pb-2 border-b border-white/5">{input}</li>
                        ))}
                     </ul>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center rotate-90"><ArrowUpRight className="w-5 h-5 text-white" /></div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500">Saídas (Outputs)</h4>
                     </div>
                     <ul className="space-y-3">
                        {product.outputs.map((output, i) => (
                          <li key={i} className="text-xl font-black text-white/90 pb-2 border-b border-white/5">{output}</li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
         </section>

         {/* Internal App: CheckCNPJ 360 Logic */}
         {product.slug === 'checkcnpj-360' && (
           <div className="mt-40 mb-32">
             <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[64px] overflow-hidden shadow-2xl">
               <div className="grid grid-cols-1 lg:grid-cols-12">
                 <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-12 lg:p-20 border-r border-slate-200 dark:border-slate-800">
                   <div className="space-y-8">
                     <div className="inline-flex px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                       Live Analyzer 360
                     </div>
                     <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight italic">
                       Diagnóstico <br /> de Conformidade.
                     </h2>
                     <p className="text-lg text-slate-500 font-medium italic font-serif">
                       Insira um CNPJ para iniciar o escaneamento em tempo real nas bases oficiais.
                     </p>
                     
                     <div className="space-y-4">
                       <div className="relative group">
                         <Search className={cn(
                           "absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors",
                           isConsulting ? "text-indigo-600 animate-pulse" : "text-slate-400 group-focus-within:text-indigo-600"
                         )} />
                         <input 
                           type="text" 
                           value={cnpjInput}
                           onChange={(e) => setCnpjInput(e.target.value)}
                           placeholder="00.000.000/0001-00"
                           className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-3xl pl-16 pr-6 py-6 text-xl font-black text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-600 focus:ring-8 focus:ring-indigo-600/5 placeholder:text-slate-200 dark:placeholder:text-slate-800" 
                         />
                       </div>
                       
                       {apiError && (
                         <motion.div 
                           initial={{ opacity: 0, y: -10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold"
                         >
                           <AlertTriangle className="w-4 h-4" /> {apiError}
                         </motion.div>
                       )}
 
                       <button 
                         onClick={handleCheckCNPJ}
                         disabled={isConsulting}
                         className={cn(
                           "w-full py-6 rounded-3xl font-black uppercase text-sm tracking-widest transition-all overflow-hidden relative group",
                           isConsulting ? "bg-slate-100 text-slate-400 cursor-wait" : "bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-slate-900"
                         )}
                       >
                         <span className="relative z-10 flex items-center justify-center gap-3">
                           {isConsulting ? <Clock className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                           {isConsulting ? 'Consultando...' : 'Consultar'}
                         </span>
                       </button>
                     </div>
                   </div>
                 </div>
 
                 <div className="lg:col-span-7 p-12 lg:p-20 relative">
                    <AnimatePresence mode="wait">
                      {!cnpjData && !isConsulting ? (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full flex flex-col items-center justify-center text-center space-y-6"
                        >
                          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-300">
                            <Box className="w-12 h-12" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-400 tracking-tight">Aguardando dados...</h3>
                            <p className="text-sm text-slate-400 font-medium font-serif italic">Os resultados aparecerão aqui após a consulta.</p>
                          </div>
                        </motion.div>
                      ) : isConsulting ? (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full flex flex-col items-center justify-center space-y-8"
                        >
                          <div className="relative">
                            <div className="w-32 h-32 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
                            <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Escaneando Redes Oficiais</h3>
                            <p className="text-xs text-slate-400 font-bold animate-pulse">VERIFICANDO RECEITA FEDERAL | SINTEGRA | CADIN</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          id="scanner-dashboard"
                          key="result"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-12"
                        >
                          {/* Dashboard Header */}
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-slate-100 dark:border-slate-800">
                            <div className="space-y-3">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="w-3 h-3" /> Identificação Jurídica
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-tight">{cnpjData?.razaoSocial}</h3>
                                {cnpjData?.nomeFantasia && (
                                  <p className="text-xs font-bold text-slate-400 italic">"{cnpjData.nomeFantasia}"</p>
                                )}
                              </div>
                              <p className="inline-block px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl text-sm font-black">{cnpjData?.cnpj}</p>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Situação</div>
                                <div className={cn(
                                  "px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg",
                                  cnpjData?.situacaoCadastral === 'ATIVA' ? "bg-emerald-500 shadow-emerald-100" : "bg-rose-500 shadow-rose-100"
                                )}>
                                  {cnpjData?.situacaoCadastral}
                                </div>
                              </div>
                              <div className="h-12 w-px bg-slate-200 dark:bg-slate-800" />
                              <div className="text-center">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendências</div>
                                <div className="text-lg font-black text-slate-900 dark:text-white uppercase">
                                  {isPremium ? (
                                    Object.values(connectorResults).filter((r: any) => r.status === 'pendente').length
                                  ) : (
                                    <span className="text-slate-200 blur-[2px]">***</span>
                                  )}
                                </div>
                              </div>
                          </div>

                          {/* Scanners / Connectors Grid */}
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Activity className="w-4 h-4 text-indigo-600" /> Scanner de Agentes (Connectors)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {connectors.map(conn => {
                                const res = connectorResults[conn.id];
                                const isLocked = !isPremium && conn.id !== 'profile';

                                return (
                                  <div 
                                    key={conn.id} 
                                    className={cn(
                                      "relative group p-6 rounded-3xl border transition-all",
                                      isLocked 
                                        ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 grayscale opacity-60" 
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 shadow-sm"
                                    )}
                                  >
                                    <div className="space-y-4">
                                      <div className="flex justify-between items-start">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{conn.name}</span>
                                        <div className={cn(
                                          "w-2 h-2 rounded-full",
                                          res.status === 'ok' ? "bg-emerald-500" :
                                          res.status === 'pendente' ? "bg-rose-500" :
                                          res.status === 'nao_verificado' ? "bg-amber-500" :
                                          res.status === 'running' ? "bg-indigo-600 animate-pulse" : "bg-slate-300"
                                        )} />
                                      </div>

                                      <div className="flex items-end justify-between gap-2">
                                        <div className="space-y-1">
                                          <div className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[120px]">
                                            {isLocked ? 'BLOQUEADO' : res.label}
                                          </div>
                                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                            {res.status === 'running' ? 'Processando...' : conn.type.toUpperCase()}
                                          </div>
                                        </div>
                                        {isLocked ? (
                                          <Lock className="w-4 h-4 text-slate-400" />
                                        ) : (
                                          <div className="flex gap-2">
                                            {res.evidence?.kind === 'url' && (
                                              <a 
                                                href={res.evidence.value} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                              >
                                                <ExternalLink className="w-4 h-4" />
                                              </a>
                                            )}
                                            {(conn.type === 'assisted' || conn.type === 'upload') && (
                                              <button 
                                                onClick={() => {
                                                  setActiveUploadId(conn.id);
                                                  fileInputRef.current?.click();
                                                }}
                                                className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 hover:bg-slate-900 hover:text-white transition-colors"
                                              >
                                                <Upload className="w-4 h-4" />
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Hidden Input for Files */}
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept=".pdf"
                            className="hidden" 
                          />
                        </div>
 
                         {!isPremium ? (
                           <div className="relative group">
                             <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[8px] z-10 flex items-center justify-center p-8 rounded-[40px] border-2 border-dashed border-indigo-200 dark:border-indigo-900/50">
                               <div className="text-center space-y-6 max-w-sm">
                                 <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200 dark:shadow-none animate-bounce">
                                   <ShieldCheck className="w-8 h-8" />
                                 </div>
                                 <div className="space-y-2">
                                   <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Scanner de Pendências</h4>
                                   <p className="text-sm text-slate-500 font-medium italic">Desbloqueie o diagnóstico detalhado para ver score, restrições federais, trabalhistas e relatório de risco.</p>
                                 </div>
                                 <div className="flex flex-col gap-3">
                                   <button 
                                     onClick={handleUnlockPremium}
                                     className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
                                   >
                                     Desbloquear análise completa
                                   </button>
                                   <div className="grid grid-cols-2 gap-4">
                                     <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase italic"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Score Completo</div>
                                     <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase italic"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Scanner PGFN</div>
                                     <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase italic"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Relatório PDF</div>
                                     <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase italic"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Upload de Certidões</div>
                                   </div>
                                 </div>
                               </div>
                             </div>
 
                             {/* Masked Data Preview */}
                             <div className="space-y-12 opacity-30 select-none pointer-events-none grayscale">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-6">
                                     <h4 className="text-[10px] font-black text-slate-400 uppercase">Dados Empresa</h4>
                                     <div className="h-20 bg-slate-100 rounded-2xl" />
                                  </div>
                                  <div className="space-y-6">
                                     <h4 className="text-[10px] font-black text-slate-400 uppercase">Endereço</h4>
                                     <div className="h-20 bg-slate-100 rounded-2xl" />
                                  </div>
                               </div>
                               <div className="h-32 bg-slate-100 rounded-3xl" />
                             </div>
                           </div>
                         ) : (
                           <>
                             {/* Blocks Grid */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Empresa Block */}
                                <div className="space-y-6">
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                      <Building2 className="w-4 h-4 text-indigo-600" /> Dados da Empresa
                                   </h4>
                                   <div className="space-y-4">
                                      <div className="flex gap-4">
                                         <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0"><Calendar className="w-5 h-5" /></div>
                                         <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fundação / Tempo</div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                                               {cnpjData?.dataInicioAtividade} ({analysis?.yearsFloor} anos e {analysis?.months} meses)
                                            </div>
                                         </div>
                                      </div>
                                      <div className="flex gap-4">
                                         <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0"><Layers className="w-5 h-5" /></div>
                                         <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza Jurídica</div>
                                            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{cnpjData?.naturezaJuridica}</div>
                                         </div>
                                      </div>
                                      <div className="flex gap-4">
                                         <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0"><CreditCard className="w-5 h-5" /></div>
                                         <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Social / Porte</div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                                               R$ {cnpjData?.capitalSocial?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — {cnpjData?.porte}
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                </div>
 
                                {/* Endereço Block */}
                                <div className="space-y-6">
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                      <Map className="w-4 h-4 text-indigo-600" /> Endereço Sede
                                   </h4>
                                   <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3">
                                       <div className="flex items-start gap-3">
                                          <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                             <p className="font-bold text-slate-900 dark:text-white">{cnpjData?.endereco?.logradouro}, {cnpjData?.endereco?.numero}</p>
                                             {cnpjData?.endereco?.complemento && <p>{cnpjData.endereco.complemento}</p>}
                                             <p>{cnpjData?.endereco?.bairro}</p>
                                             <p>{cnpjData?.endereco?.municipio} - {cnpjData?.endereco?.uf}</p>
                                             <p className="text-xs pt-1 opacity-60">CEP: {cnpjData?.endereco?.cep}</p>
                                          </div>
                                       </div>
                                   </div>
                                </div>
                             </div>
 
                             {/* Sócios Block */}
                             <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                   <Users className="w-4 h-4 text-indigo-600" /> Quadro de Sócios e Administradores (QSA)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {cnpjData?.qsa && cnpjData.qsa.length > 0 ? (
                                      cnpjData.qsa.map((socio, idx) => (
                                         <div key={idx} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                                               <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                               <div className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">{socio.nome}</div>
                                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{socio.qualificacao}</div>
                                            </div>
                                         </div>
                                      ))
                                   ) : (
                                      <div className="md:col-span-2 p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl text-center">
                                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Informação de QSA não disponível nesta consulta rápida.</p>
                                      </div>
                                   )}
                                </div>
                             </div>
 
                             {/* Diagnóstico Advanced */}
                             {analysis && (
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="p-8 bg-slate-900 text-white rounded-[40px] md:col-span-2">
                                     <div className="flex items-center gap-3 mb-6">
                                       <Sparkles className="w-6 h-6 text-indigo-400" />
                                       <span className="text-xs font-black uppercase tracking-widest text-indigo-200">Diagnóstico Estratégico</span>
                                     </div>
                                     <div className="space-y-6">
                                        <div>
                                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Observação do Analista</div>
                                           <p className="text-lg font-bold italic font-serif leading-relaxed">
                                             "{analysis.observation}"
                                           </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                                           <div>
                                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risco Operacional</div>
                                              <div className={cn(
                                                 "text-xl font-black uppercase italic",
                                                 analysis.operationalRisk === 'Baixo' ? "text-emerald-400" : analysis.operationalRisk === 'Médio' ? "text-amber-400" : "text-rose-400"
                                              )}>
                                                 {analysis.operationalRisk}
                                              </div>
                                           </div>
                                           <div>
                                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Maturidade</div>
                                              <div className="text-xl font-black uppercase italic text-indigo-400">
                                                 {analysis.yearsFloor >= 5 ? 'Consolidada' : analysis.yearsFloor >= 2 ? 'Em Expansão' : 'Startup/Nova'}
                                              </div>
                                           </div>
                                        </div>
                                     </div>
                                  </div>
 
                                  <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[40px] flex flex-col justify-between border border-indigo-100/50 dark:border-indigo-900/30">
                                     <div className="space-y-4">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Gavel className="w-6 h-6" /></div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tighter italic">Compliance <br /> Fiscal 360</h4>
                                     </div>
                                     <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-relaxed">Status da situação cadastral validado na base Receita Federal.</p>
                                        <div className="text-xs font-black text-indigo-600 uppercase tracking-widest">{cnpjData?.situacaoCadastral}</div>
                                      </div>
                                   </div>
                                </div>
                             )}

                             {/* Verification Cards */}
                             <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultas em Bases Externas (Deep-Link)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                   {[
                                     { label: 'Receita Federal', url: 'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/Cnpjreva_Solicitacao.asp' },
                                     { label: 'CNDT Certidão', url: 'https://cndt-certidao.tst.jus.br/inicio.faces' },
                                     { label: 'PGFN / Débitos', url: 'https://solucoes.receita.fazenda.gov.br/Servicos/CertidaoInternet/PJ/emitir/' },
                                     { label: 'TCU / Licitante', url: 'https://certidoes-apf.apps.tcu.gov.br/' }
                                   ].map((v, i) => (
                                     <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 flex flex-col items-center text-center space-y-4 shadow-sm group hover:border-indigo-200 transition-all">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 h-8 flex items-center">{v.label}</span>
                                        <a 
                                           href={v.url} 
                                           target="_blank" 
                                           rel="noreferrer"
                                           className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                           Verificar <ExternalLink className="w-3 h-3" />
                                        </a>
                                     </div>
                                   ))}
                                </div>
                             </div>

                             {/* Intelligent Extensions */}
                             <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                   <Sparkles className="w-4 h-4 text-amber-500" /> Extensões Inteligentes (2026 Ecosystem)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <Link 
                                      to={`/solucoes/honorarios-pro?data=${encodeURIComponent(JSON.stringify(cnpjData))}`}
                                      className="bg-slate-900 text-white rounded-[32px] p-8 flex items-center justify-between group hover:scale-[1.02] transition-all shadow-xl"
                                   >
                                      <div className="flex items-center gap-6">
                                         <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                            <DollarSign className="w-8 h-8 text-white" />
                                         </div>
                                         <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Honorários Pro</h5>
                                            <p className="text-sm font-bold opacity-80 leading-tight">Simular Honorários <br />para este Perfil</p>
                                         </div>
                                      </div>
                                      <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-amber-500 transition-colors" />
                                   </Link>

                                   <Link 
                                      to={`/solucoes/valida-empresa?data=${encodeURIComponent(JSON.stringify(cnpjData))}`}
                                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm"
                                   >
                                      <div className="flex items-center gap-6">
                                         <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                            <PieChart className="w-8 h-8 text-white" />
                                         </div>
                                         <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">Valida Empresa</h5>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Análise de Viabilidade <br />Tributária / Financeira</p>
                                         </div>
                                      </div>
                                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                   </Link>

                                   <Link 
                                      to={`/solucoes/propostas-contratos?data=${encodeURIComponent(JSON.stringify(cnpjData))}`}
                                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm"
                                   >
                                      <div className="flex items-center gap-6">
                                         <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                            <FileText className="w-8 h-8 text-white" />
                                         </div>
                                         <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Contratos Pro</h5>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Gerar Proposta e <br />Contrato de Serviço</p>
                                         </div>
                                      </div>
                                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                   </Link>

                                   <Link 
                                      to={`/solucoes/office-contabil?data=${encodeURIComponent(JSON.stringify(cnpjData))}`}
                                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm"
                                   >
                                      <div className="flex items-center gap-6">
                                         <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                            <Briefcase className="w-8 h-8 text-indigo-600" />
                                         </div>
                                         <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Office Contábil</h5>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Cadastrar no <br />Meu Escritório</p>
                                         </div>
                                      </div>
                                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                   </Link>
                                </div>
                             </div>

                             {analysis && (
                               <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800">
                                 <div className="flex items-center gap-2 mb-4">
                                   <Activity className="w-4 h-4 text-indigo-600" />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Atividade Econômica / CNAE</span>
                                 </div>
                                 <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic pr-12">
                                    {cnpjData?.cnaePrincipal?.descricao}
                                 </p>
                               </div>
                             )}
 
                             <div className="pt-6">
                                <button 
                                 onClick={() => setShowReport(true)}
                                 className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[28px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
                                >
                                  <Printer className="w-4 h-4" /> Gerar Relatório de Conformidade
                                </button>
                             </div>
                           </>
                         )}
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* FAQ Section */}
         <section className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
               <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Perguntas Frequentes</h2>
               <p className="text-slate-500 font-medium">Tire suas dúvidas rápidas sobre o {product.name}.</p>
            </div>
            
            <div className="space-y-4">
               {product.faq?.map((item, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                       <HelpCircle className="w-5 h-5 text-indigo-600" /> {item.q}
                    </h4>
                    <p className="text-slate-500 font-medium leading-relaxed pl-8">{item.a}</p>
                 </div>
               ))}
               {!product.faq && (
                 <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                       <HelpCircle className="w-5 h-5 text-indigo-600" /> Como é feito o suporte?
                    </h4>
                    <p className="text-slate-500 font-medium leading-relaxed pl-8">O suporte é feito via canais digitais (E-mail e WhatsApp) por especialistas contábeis de segunda a sexta, em horário comercial.</p>
                 </div>
               )}
            </div>
         </section>

         {/* Related Products / Cross-sell */}
         <section className="pt-24 border-t border-slate-200 dark:border-slate-800 space-y-12">
            <div className="flex items-end justify-between">
               <div className="space-y-4">
                 <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Quem usa este parceiro também usa:</h2>
                 <p className="text-slate-500 font-medium italic font-serif">Soluções que potencializam o seu fluxo de trabalho atual.</p>
               </div>
               <Link to="/solucoes" className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                  Ver todo o catálogo <ChevronRight className="w-4 h-4" />
               </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
               {products
                 .filter(p => product.relatedProducts.includes(p.slug))
                 .slice(0, 3)
                 .map(p => (
                    <Link key={p.id} to={`/solucoes/${p.slug}`} className="bg-white dark:bg-slate-900 rounded-[48px] p-12 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group block text-left relative overflow-hidden">
                       <h4 className="text-2xl font-black mb-2 group-hover:text-blue-600 transition-colors tracking-tight leading-tight">{p.name}</h4>
                       <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-6">{p.shortDescription}</p>
                       <div className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                          Ver Exemplo Real <ArrowRight className="w-4 h-4" />
                       </div>
                    </Link>
                 ))
               }
            </div>
         </section>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReport(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-12 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tighter">Relatório Consolidado</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Extraído em: {new Date().toLocaleString('pt-BR')}</p>
                  </div>
                  <button onClick={() => setShowReport(false)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl space-y-4 font-mono text-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-400 uppercase tracking-widest font-bold">Empresa</span>
                    <span className="font-black text-slate-900 dark:text-white">{cnpjData?.razaoSocial}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-400 uppercase tracking-widest font-bold">CNPJ</span>
                    <span className="font-black text-slate-900 dark:text-white">{cnpjData?.cnpj}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-400 uppercase tracking-widest font-bold">Situação</span>
                    <span className="font-black text-indigo-600">{cnpjData?.situacaoCadastral}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-400 uppercase tracking-widest font-bold">Risco</span>
                    <span className="font-black text-indigo-600 uppercase italic">{analysis?.operationalRisk}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-400 uppercase tracking-widest font-bold">Score</span>
                    <span className="font-black text-indigo-600">{analysis?.score}/100</span>
                  </div>
                  <div className="pt-4">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">Conclusão Heurística</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Auditoria realizada via CheckCNPJ 360 Core. A empresa apresenta status <span className="font-black text-indigo-600">{analysis?.statusGeral}</span> e score de risco nível <span className="font-black uppercase">{analysis?.operationalRisk}</span>. Recomendamos conferência manual na RFB caso o score seja inferior a 60.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
                >
                  <Printer className="w-4 h-4" /> Imprimir Documento
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
