import React, { useState, useMemo, useEffect } from 'react';
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
  Download,
  Package,
  Link as LinkIcon,
  Factory,
  Check,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { HeroPadrao } from '../components/HeroPadrao';
import { NBS_DATA, NCM_DATA, CST_DATA } from '../data/reforma_data';

type ViewMode = 'item' | 'projection';

export default function Reforma() {
  const [viewMode, setViewMode] = useState<ViewMode>('item');
  const simulatorRef = React.useRef<HTMLDivElement>(null);

  const scrollToSimulator = () => {
    simulatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Hero Section */}
      <HeroPadrao 
        badge="EC 132/2023"
        title={<>Reforma Tributária <br /><span className="text-blue-500">IBS & CBS</span></>}
        description="Entenda, simule e antecipe o impacto da nova tributação sobre o seu negócio"
        ctaText="Simular Agora"
        onCtaClick={scrollToSimulator}
        visualContent={
          <div className="relative bg-slate-800 border border-slate-700 p-8 rounded-[40px] shadow-2xl">
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                   </div>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projection v2.6</div>
                </div>
                <div className="h-48 flex items-end gap-3">
                   {[40, 60, 45, 90, 65, 80, 100].map((h, i) => (
                     <div key={i} className="flex-1 bg-blue-600/40 border border-blue-500/30 rounded-t-xl" style={{ height: `${h}%` }}></div>
                   ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
                      <span className="text-[8px] font-black text-slate-500 uppercase">Carga Atual</span>
                      <div className="text-lg font-black text-white">27.25%</div>
                   </div>
                   <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
                      <span className="text-[8px] font-black text-blue-500 uppercase">Projeção IVA</span>
                      <div className="text-lg font-black text-blue-500">26.50%*</div>
                   </div>
                </div>
             </div>
          </div>
        }
      />

      {/* Educational Block */}
      <section className="py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">O que muda com a Reforma Tributária?</h2>
                 <div className="space-y-4 text-slate-500 font-medium leading-relaxed">
                    <p>
                      A Reforma Tributária cria o IVA (Imposto sobre Valor Agregado) Dual, composto pelo <span className="text-slate-900 dark:text-white font-bold">IBS (Imposto sobre Bens e Serviços)</span> de competência estadual/municipal e a <span className="text-slate-900 dark:text-white font-bold">CBS (Contribuição sobre Bens e Serviços)</span> de competência federal.
                    </p>
                    <p>
                      Este novo modelo substitui tributos atuais: PIS, COFINS, IPI, ICMS e ISS, eliminando a cumulatividade e simplificando a apuração.
                    </p>
                    <p>
                      A transição começa em <span className="text-blue-600 font-bold">2026</span> com alíquotas de teste e segue progressivamente até a extinção total dos impostos antigos em 2033.
                    </p>
                 </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800">
                 <ul className="space-y-4">
                    {[
                      "Simula a carga tributária no novo modelo",
                      "Compara com o cenário atual",
                      "Permite análise por NCM e NBS",
                      "Auxilia na formação de preço"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 group">
                         <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                            <Check className="w-4 h-4" />
                         </div>
                         <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{item}</span>
                      </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>
      </section>

      {/* Technical Bases */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Bases Técnicas e Tabelas Oficiais</h2>
              <p className="text-slate-500 font-medium">Consulte a documentação oficial e tabelas de conversão para o novo modelo.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[
                {
                  title: "Classificação Tributária (cClassTrib)",
                  desc: "Tabela oficial atualizada em janeiro de 2026 para identificação fiscal no IBS/CBS",
                  icon: BarChart3,
                  link: "https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=AVRVVz1Jgl4="
                },
                {
                  title: "Correlação NBS x cClassTrib",
                  desc: "Relaciona serviços (NBS) com os novos códigos tributários",
                  icon: FileText,
                  link: "https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc/anexoviii-correlacaoitemnbsindopcclasstrib_ibscbs_v1-00-00.xlsx"
                },
                {
                  title: "NCM e Unidade Tributável",
                  desc: "Tabela oficial de comércio exterior vigente a partir de 2026",
                  icon: Package,
                  link: "https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=b951nG/pOmY="
                },
                {
                  title: "TIPI – IPI",
                  desc: "Tabela com alíquotas do IPI por NCM",
                  icon: Factory,
                  link: "https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/legislacao/documentos-e-arquivos/tipi.xlsx"
                },
                {
                  title: "Nota Técnica 2025.002",
                  desc: "Alterações nos layouts da NF-e e NFC-e para a reforma tributária",
                  icon: LinkIcon,
                  link: "https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=IwLPdZ67F5M="
                }
              ].map((card, i) => (
                <a 
                  key={i} 
                  href={card.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] space-y-4 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-500/50 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                     <card.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{card.title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    <span>Acessar</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              ))}
           </div>
        </div>
      </section>

      {/* Top Selector Navigation */}
      <div ref={simulatorRef} className="pt-12 pb-8 flex justify-center">
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
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24"
        >
          {viewMode === 'item' ? <SimuladorPorItem /> : <SimuladorTransicao />}
        </motion.div>
      </AnimatePresence>

      {/* Final CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <LayoutGrid className="w-64 h-64 text-white" />
          </div>
          
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              Pronto para colocar a produtividade <br /> tributária em prática?
            </h2>
            <p className="text-blue-100/90 text-lg font-medium">
              Não pare apenas na simulação. No nosso marketplace você encontra ferramentas prontas para automatizar cada um desses cálculos.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/solucoes" 
                className="w-full sm:w-auto px-12 py-5 bg-white text-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all"
              >
                Explorar Soluções <ArrowRight className="w-5 h-5 inline ml-2" />
              </Link>
              <Link 
                to="/contato" 
                className="w-full sm:w-auto px-12 py-5 bg-blue-800/40 border border-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-800/60 transition-all"
              >
                Falar com Consultor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SimuladorPorItem() {
  const [tipo, setTipo] = useState<'ncm' | 'nbs'>('ncm');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('');
  const [aliquotaIPI, setAliquotaIPI] = useState('0');
  const [cst, setCst] = useState('');
  const [cclassTrib, setCclassTrib] = useState('');
  const [redIBS, setRedIBS] = useState(0);
  const [redCBS, setRedCBS] = useState(0);
  const [aliqIBS, setAliqIBS] = useState(0.9);
  const [aliqCBS, setAliqCBS] = useState(0.1);
  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState('0,00');
  const [resultados, setResultados] = useState<any>(null);

  const normalizarCodigo = (str: string) => {
    return (str || "").replace(/[^0-9]/g, '').replace(/^0+/, '');
  };

  const formatarMoeda = (valor: string) => {
    let v = valor.replace(/\D/g, '');
    if (v === '') return '';
    let numero = (parseInt(v, 10) / 100).toFixed(2);
    return numero.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  const parseMoeda = (valor: string) => {
    return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
  };

  // Busca descrição e inicializa CSTs quando o código muda
  useEffect(() => {
    const cod = normalizarCodigo(codigo);
    if (!cod) {
      setDescricao('');
      setUnidadeMedida('');
      setAliquotaIPI('0');
      return;
    }

    if (tipo === 'ncm') {
      const item = NCM_DATA.find(i => normalizarCodigo(i.codigo) === cod);
      if (item) {
        setDescricao(item.descricao);
        setUnidadeMedida(item.unidadeMedida);
        setAliquotaIPI(item.aliquotaIPI === 'NT' ? '0' : item.aliquotaIPI);
      } else {
        setDescricao('Código NCM não encontrado');
      }
    } else {
      const itens = NBS_DATA.filter(i => normalizarCodigo(i.codigo) === cod);
      if (itens.length > 0) {
        setDescricao(itens[0].descricao);
        // Se for NBS, o primeiro item pode definir o CST padrão
        if (itens[0].cst && !cst) {
          setCst(itens[0].cst);
        }
      } else {
        setDescricao('Código NBS não encontrado');
      }
    }
  }, [codigo, tipo]);

  // Lista de CSTs disponíveis baseada no tipo e nos dados
  const cstOptions = useMemo(() => {
    const map = new Map();
    if (tipo === 'nbs') {
      const cod = normalizarCodigo(codigo);
      const itens = NBS_DATA.filter(i => normalizarCodigo(i.codigo) === cod);
      itens.forEach(i => {
        if (i.cst) map.set(i.cst, i.descricaoCST || 'Tributação');
      });
      // Se não encontrou específicos para o código, mostra todos os da base
      if (map.size === 0) {
        CST_DATA.forEach(i => map.set(i.cst, i.descricaoCST));
      }
    } else {
      CST_DATA.forEach(i => map.set(i.cst, i.descricaoCST));
    }
    return Array.from(map.entries()).map(([val, label]) => ({ val, label }));
  }, [tipo, codigo]);

  // Lista de Classificações Tributárias baseada no CST
  const classTribOptions = useMemo(() => {
    if (!cst) return [];
    
    let itens: any[] = [];
    if (tipo === 'nbs') {
      const cod = normalizarCodigo(codigo);
      itens = NBS_DATA.filter(i => normalizarCodigo(i.codigo) === cod && i.cst === cst);
      // Se não encontrou correlação específica, pega da tabela geral
      if (itens.length === 0) {
        itens = CST_DATA.filter(i => i.cst === cst);
      }
    } else {
      itens = CST_DATA.filter(i => i.cst === cst);
    }

    const unique = new Map();
    itens.forEach(i => {
      unique.set(i.cclassTrib, i);
    });
    return Array.from(unique.values());
  }, [cst, tipo, codigo]);

  // Atualiza reduções quando a classificação muda
  useEffect(() => {
    if (cclassTrib) {
      const selected = classTribOptions.find(o => o.cclassTrib === cclassTrib);
      if (selected) {
        setRedIBS(selected.redIBS || 0);
        setRedCBS(selected.redCBS || 0);
      }
    }
  }, [cclassTrib, classTribOptions]);

  const handleCalcular = () => {
    const valUnit = parseMoeda(valorUnitario);
    const totalBase = valUnit * quantidade;

    if (totalBase <= 0) return;

    // Novo IVA
    const effIBS = aliqIBS * (1 - redIBS / 100);
    const effCBS = aliqCBS * (1 - redCBS / 100);
    const vIBS = totalBase * (effIBS / 100);
    const vCBS = totalBase * (effCBS / 100);

    // Sistema Atual (Estimado)
    const pisReal = 1.65;
    const cofinsReal = 7.60;
    const pisPresumido = 0.65;
    const cofinsPresumido = 3.00;

    let vIPI = 0;
    if (tipo === 'ncm') {
      vIPI = totalBase * (parseFloat(aliquotaIPI.replace(',', '.')) / 100 || 0);
    }

    setResultados({
      quantidade,
      valorUnitario: valUnit,
      totalBase,
      vIBS,
      vCBS,
      totalIVA: vIBS + vCBS,
      vIPI,
      lucroReal: totalBase * ((pisReal + cofinsReal) / 100),
      lucroPresumido: totalBase * ((pisPresumido + cofinsPresumido) / 100),
      aliquotaEfetivaIBS: effIBS,
      aliquotaEfetivaCBS: effCBS,
    });
  };

  const handleLimpar = () => {
    setCodigo('');
    setDescricao('');
    setUnidadeMedida('');
    setAliquotaIPI('0');
    setCst('');
    setCclassTrib('');
    setRedIBS(0);
    setRedCBS(0);
    setValorUnitario('0,00');
    setQuantidade(1);
    setResultados(null);
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Item</label>
              <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl gap-1">
                <button 
                  onClick={() => setTipo('ncm')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all",
                    tipo === 'ncm' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                   <Package className="w-3 h-3" /> Mercadoria (NCM)
                </button>
                <button 
                   onClick={() => setTipo('nbs')}
                   className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all",
                    tipo === 'nbs' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                   <Factory className="w-3 h-3" /> Serviço (NBS)
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código {tipo.toUpperCase()}</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder={tipo === 'ncm' ? "Ex: 01012100" : "Ex: 1.1502.10.00"} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm placeholder-slate-400" 
                />
                {codigo && (
                  <button onClick={() => setCodigo('')} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
                <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Completa</label>
            <textarea 
              readOnly 
              value={descricao}
              placeholder="Aguardando código..." 
              className="w-full h-24 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm resize-none text-slate-600 dark:text-slate-300 font-medium" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade Medida</label>
               <input readOnly value={unidadeMedida} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-slate-500 font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alíquota IPI (%)</label>
               <input readOnly value={aliquotaIPI} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-slate-500 font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CST IBS/CBS</label>
              <select 
                value={cst}
                onChange={(e) => setCst(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm appearance-none font-bold"
              >
                <option value="">-- Selecione --</option>
                {cstOptions.map(opt => (
                  <option key={opt.val} value={opt.val}>{opt.val} - {opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classificação Tributária</label>
              <select 
                value={cclassTrib}
                onChange={(e) => setCclassTrib(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm appearance-none font-bold"
              >
                <option value="">-- Selecione --</option>
                {classTribOptions.map(opt => (
                  <option key={opt.cclassTrib} value={opt.cclassTrib}>{opt.cclassTrib} - {opt.nomeClass}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redução IBS (%)</label>
              <input 
                type="number" 
                value={redIBS}
                onChange={(e) => setRedIBS(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-blue-600" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redução CBS (%)</label>
              <input 
                type="number" 
                value={redCBS}
                onChange={(e) => setRedCBS(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-blue-600" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantidade</label>
              <input 
                type="number" 
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Unitário (R$)</label>
              <input 
                type="text" 
                value={valorUnitario}
                onChange={(e) => setValorUnitario(formatarMoeda(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold" 
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
             <button 
               onClick={handleCalcular}
               className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
             >
                <RefreshCw className="w-4 h-4" /> Calcular Resultados
             </button>
             <button 
                onClick={handleLimpar}
                className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
             >
                Limpar
             </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2">
          {!resultados ? (
            <div className="h-full bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center">
                  <Calculator className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-xl font-black text-slate-400 tracking-tight">Pronto para Simular</h3>
               <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
                 Preencha os dados do item ao lado para ver o comparativo de carga tributária.
               </p>
            </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-slate-900 rounded-[40px] p-10 text-white space-y-8 shadow-2xl h-full"
            >
               <div>
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Novo Modelo IBS/CBS</h4>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end border-b border-white/5 pb-4">
                        <span className="text-slate-400 text-xs font-bold uppercase">Base de Cálculo</span>
                        <span className="text-xl font-black">{resultados.totalBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                           <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">IBS ({resultados.aliquotaEfetivaIBS.toFixed(2)}%)</span>
                           <div className="text-lg font-black text-blue-400">{resultados.vIBS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                           <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">CBS ({resultados.aliquotaEfetivaCBS.toFixed(2)}%)</span>
                           <div className="text-lg font-black text-blue-400">{resultados.vCBS.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        </div>
                     </div>
                     <div className="p-6 bg-blue-600 rounded-[28px] text-center">
                        <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest block mb-1">Total IVA Dual</span>
                        <div className="text-3xl font-black">{resultados.totalIVA.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-white/5">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estimativa Cenário Atual</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold">Lucro Real (9,25%)</span>
                        <span className="font-black">{resultados.lucroReal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold">Lucro Presumido (3,65%)</span>
                        <span className="font-black">{resultados.lucroPresumido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                     </div>
                     {tipo === 'ncm' && resultados.vIPI > 0 && (
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-amber-400 font-bold">IPI ({aliquotaIPI}%)</span>
                           <span className="font-black text-amber-400">{resultados.vIPI.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                     )}
                  </div>
               </div>

               <div className="bg-white/5 p-6 rounded-3xl space-y-3 border border-white/5">
                  <div className="flex items-center gap-3 text-blue-400">
                     <TrendingDown className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Análise de Impacto</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    No novo sistema, a cumulatividade é eliminada. Créditos de IBS/CBS pagos na aquisição serão integralmente recuperáveis.
                  </p>
               </div>
            </motion.div>
          )}
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

        {/* CTA to Solutions */}
        <div className="mt-12 bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 opacity-10"><ArrowRight className="w-40 h-40" /></div>
           <div className="relative z-10 space-y-6">
              <h3 className="text-3xl font-black tracking-tight leading-tight">Quer automatizar a <br /> sua conformidade fiscal?</h3>
              <p className="text-slate-400 max-w-xl mx-auto font-medium">Explore nossas MicroCaaS prontas para o novo sistema tributário.</p>
              <Link to="/solucoes" className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                Ver Soluções no Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
