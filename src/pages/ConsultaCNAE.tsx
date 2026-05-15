import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Zap, 
  CheckCircle2, 
  FileText, 
  Building2, 
  Briefcase, 
  Scale, 
  ShieldCheck, 
  Info,
  Layers,
  ArrowRight,
  Eraser,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cnaeService, CNAEData, IBGEResult } from '../services/cnaeService';

interface CNAEResultState {
  local: CNAEData;
  ibge: IBGEResult | null;
  classificacao: any;
  fiscal: {
    ie: string;
    im: string;
    ipi: string;
  };
}

export default function ConsultaCNAE() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CNAEData[]>([]);
  const [result, setResult] = useState<CNAEResultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = async (val: string) => {
    setSearch(val);
    if (val.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const items = await cnaeService.sugerir(val);
    setSuggestions(items);
    setShowSuggestions(items.length > 0);
  };

  const selecionarCNAE = async (found: CNAEData) => {
    setLoading(true);
    setShowSuggestions(false);
    setSearch(found.cnae);
    
    try {
      setError(null);
      const ibge = await cnaeService.buscarIBGE(found.cnae);
      
      let secao = "";
      if (ibge && ibge.secao) {
        secao = ibge.secao;
      } else {
        const d = parseInt(found.cnae.substring(0, 2), 10);
        if (d >= 1 && d <= 3) secao = "A";
        else if (d >= 5 && d <= 9) secao = "B";
        else if (d >= 10 && d <= 33) secao = "C";
        else if (d >= 45 && d <= 47) secao = "G";
        else secao = "M";
      }

      const classeCNAE = found.cnae.replace(/\D/g, "").substring(0, 5);
      const classificacao = cnaeService.classificar(secao, classeCNAE);

      // Fiscal logic
      const fiscal = {
        ie: ["A", "C", "G"].includes(secao) ? "Obrigatória" : "Não obrigatória",
        im: ["M","N","I","J","Q","R","S","T","L","H","P"].includes(secao) ? "Obrigatória" : "Não obrigatória",
        ipi: secao === "C" ? "Sim" : "Não"
      };

      setResult({
        local: found,
        ibge,
        classificacao,
        fiscal
      });
    } catch (err) {
      setError('Erro ao processar consulta.');
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setSearch('');
    setResult(null);
    setError(null);
    setSuggestions([]);
  };

  const aliquotasSimples: Record<string, { min: string, max: string }> = {
    "I":   { min: "4,0%",  max: "19,0%"  },
    "II":  { min: "4,5%",  max: "30,0%"  },
    "III": { min: "6,0%",  max: "33,0%"  },
    "IV":  { min: "4,5%",  max: "33,0%"  },
    "V":   { min: "15,5%", max: "30,5%"  }
  };

  const getFaixaAliquota = (anexo: string) => {
    if (anexo === "III ou V") {
      return "Anexo III (6%-33%) ou Anexo V (15.5%-30.5%) via Fator R";
    }
    const faixa = aliquotasSimples[anexo];
    return faixa ? `De ${faixa.min} a ${faixa.max}` : "Consulte Tabela";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-20">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-6 text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Search className="w-3 h-3" /> CNAE Intelligence
           </div>
           <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
             Consulta <span className="text-indigo-600">Estratégica.</span>
           </h1>
           <p className="text-lg text-slate-500 font-medium font-serif italic max-w-2xl mx-auto">
             Descubra o enquadramento fiscal, alíquotas do Simples Nacional e viabilidade MEI de forma automatizada.
           </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-2xl relative group">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
              <Layers className="w-48 h-48 text-indigo-600" />
           </div>

           <div className="relative z-10 flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
                <input 
                  type="text" 
                  value={search}
                  onChange={e => handleInputChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Digite o código (ex: 6201-5/00) ou descrição..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] pl-16 pr-8 py-6 text-xl font-black shadow-inner focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                />

                {/* Autocomplete Suggestions */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 top-full mt-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[32px] shadow-2xl shadow-indigo-200/50 dark:shadow-none overflow-hidden z-50 p-2"
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selecionarCNAE(s)}
                          className="w-full text-left p-6 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-colors group flex items-start gap-4"
                        >
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center font-black text-[12px] text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                            {s.cnae.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white text-base tracking-tight">{s.cnae}</div>
                            <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-widest mt-0.5">{s.descricao}</div>
                          </div>
                          <ArrowRight className="w-5 h-5 ml-auto text-slate-200 group-hover:text-indigo-600 transition-colors self-center" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button 
                onClick={limpar}
                className="px-8 py-6 bg-slate-900 dark:bg-slate-700 text-white rounded-[28px] font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                <Eraser className="w-4 h-4" /> Limpar
              </button>
           </div>

           <AnimatePresence>
             {error && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-8 p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl text-red-600 text-sm font-bold italic"
               >
                 {error}
               </motion.div>
             )}
           </AnimatePresence>

           {!result && !error && !loading && (
             <div className="mt-8 text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px]">
                <p className="text-slate-400 font-bold italic">Aguardando dados para análise tributária...</p>
             </div>
           )}

           {loading && (
             <div className="mt-8 flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
             </div>
           )}
        </div>

        {/* Results Grid */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Core Info */}
                <div className="lg:col-span-2 space-y-8">
                   <div className="p-10 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-indigo-600 rounded-3xl text-white">
                            <FileText className="w-8 h-8" />
                         </div>
                         <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Identificação Principal</div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{result.local.cnae}</h2>
                         </div>
                      </div>
                      <p className="text-xl font-bold text-slate-600 dark:text-slate-300 italic">{result.local.descricao}</p>
                      
                      {result.ibge && (
                        <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                          <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                            <Layers className="w-4 h-4" /> Notas Explicativas (IBGE)
                          </h4>
                          <div className="space-y-3">
                            {result.ibge.observacoes.slice(0, 3).map((obs, i) => (
                              <div key={i} className="flex gap-3 text-sm font-medium text-slate-500 dark:text-slate-400 italic">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <p>{obs}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                   </div>

                   {/* Simples e MEI Details */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[48px] text-white space-y-6 shadow-2xl shadow-indigo-200 dark:shadow-none">
                         <div className="flex items-center justify-between">
                            <Briefcase className="w-8 h-8" />
                            <div className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">Simples Nacional</div>
                         </div>
                         <div className="space-y-4">
                            <div>
                               <div className="text-[10px] uppercase font-black opacity-60">Anexo Sugerido</div>
                               <div className="text-3xl font-black italic">Anexo {result.classificacao.anexo}</div>
                            </div>
                            <div>
                               <div className="text-[10px] uppercase font-black opacity-60">Alíquota Estimada</div>
                               <div className="text-sm font-bold italic">{getFaixaAliquota(result.classificacao.anexo)}</div>
                            </div>
                            <div className="p-4 bg-white/10 rounded-2xl text-[11px] font-medium leading-relaxed italic border border-white/10">
                               Tributação baseada na LC nº 123/2006. {result.classificacao.fatorR === 'Sujeito ao Fator R' ? 'Sujeito à análise de folha (Fator R).' : ''}
                            </div>
                         </div>
                      </div>

                      <div className="p-10 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                         <div className="flex items-center justify-between">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">Enquadramento MEI</div>
                         </div>
                         <div className="space-y-4">
                            <div>
                               <div className="text-[10px] uppercase font-black text-slate-400">Permitido como MEI?</div>
                               <div className={`text-3xl font-black italic ${result.local.mei_ocupacao ? 'text-emerald-500' : 'text-slate-300'}`}>
                                 {result.local.mei_ocupacao ? 'Sim' : 'Não'}
                               </div>
                            </div>
                            {result.local.mei_ocupacao && (
                              <div>
                                 <div className="text-[10px] uppercase font-black text-slate-400">Ocupação Permitida</div>
                                 <div className="text-sm font-bold text-slate-600 dark:text-slate-300 italic">{result.local.mei_ocupacao}</div>
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                   <div className="p-8 bg-slate-900 dark:bg-indigo-900/20 rounded-[40px] text-white space-y-8">
                      <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 italic">Inteligência Fiscal</h3>
                      
                      <div className="space-y-6">
                         <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div className="text-[10px] uppercase font-bold text-slate-400">FPAS Principal</div>
                            <div className="text-lg font-black italic">{result.local.fpas || "Consulte"}</div>
                         </div>
                         <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Código Terceiros</div>
                            <div className="text-lg font-black italic">{result.local.terceiros_codigo || "0000"}</div>
                         </div>
                         <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Alíquota RAT</div>
                            <div className="text-lg font-black italic text-indigo-400">{result.local.rat_2010 || "1.0%"}</div>
                         </div>
                         <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Inscrição Estadual</div>
                            <div className="text-xs font-black italic">{result.fiscal.ie}</div>
                         </div>
                         <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Inscrição Municipal</div>
                            <div className="text-xs font-black italic">{result.fiscal.im}</div>
                         </div>
                         <div className="flex justify-between items-center">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Incidência IPI</div>
                            <div className="text-xs font-black italic">{result.fiscal.ipi}</div>
                         </div>
                      </div>

                      <button 
                        onClick={() => window.print()}
                        className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                      >
                         <Download className="w-4 h-4" /> Exportar Análise (PDF)
                      </button>
                   </div>

                   <div className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-600">
                         <Scale className="w-5 h-5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Base Legal</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">
                         Análise gerada conforme Lei Complementar nº 123/2006 e Resolução CGSN nº 140/2018. Sempre confirme os dados na Prefeitura e SEFAZ local.
                      </p>
                   </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

