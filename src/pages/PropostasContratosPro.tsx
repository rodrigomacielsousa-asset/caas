import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Download, 
  Printer, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  User, 
  Mail, 
  CreditCard,
  Briefcase,
  Layers,
  Lock,
  Crown,
  Share2,
  ChevronRight,
  ShieldCheck,
  FileCheck
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

export default function PropostasContratosPro() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    responsibleName: '',
    email: '',
    serviceType: 'Contabilidade Mensal',
    monthlyValue: '',
    extraClauses: ''
  });

  const [step, setStep] = useState(1); // 1: Input, 2: Preview
  const [activeTab, setActiveTab] = useState<'proposta' | 'contrato'>('proposta');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Integration from Honorários Pro
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const dataRaw = searchParams.get('data');
    const feeRaw = searchParams.get('fee');
    
    if (dataRaw) {
      try {
        const data = JSON.parse(decodeURIComponent(dataRaw));
        setFormData(prev => ({
          ...prev,
          companyName: data.razaoSocial || prev.companyName,
          cnpj: data.cnpj || prev.cnpj,
        }));
      } catch (e) { console.error(e); }
    }
    
    if (feeRaw) {
      setFormData(prev => ({ ...prev, monthlyValue: feeRaw }));
    }
  }, [location]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setStep(2);
    }, 1500);
  };

  const proposalContent = useMemo(() => {
    return {
      title: "Proposta de Serviços Contábeis",
      intro: `Prezado(a) ${formData.responsibleName},\n\nApresentamos nossa proposta comercial para a prestação de serviços de ${formData.serviceType} para a empresa ${formData.companyName}.`,
      scope: `O escopo de trabalho contempla:\n- Apuração de tributos (Federal, Estadual e Municipal)\n- Escrituração contábil digital\n- Gestão de folha de pagamento e obrigações acessórias\n- Assessoria consultiva estratégica`,
      investment: `O investimento mensal para os serviços descritos é de ${formatCurrency(parseFloat(formData.monthlyValue) || 0)}.`,
      conditions: `Validade da proposta: 15 dias.\nForma de pagamento: Boleto bancário ou PIX.`
    };
  }, [formData]);

  const contractContent = useMemo(() => {
    return {
      title: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS CONTÁBEIS",
      clauses: [
        { title: "OBJETO", content: `O presente contrato tem por objeto a prestação de serviços de ${formData.serviceType} à CONTRATANTE ${formData.companyName}, CNPJ ${formData.cnpj}.` },
        { title: "OBRIGAÇÕES DA CONTRATADA", content: "A CONTRATADA compromete-se a executar os serviços de apuração fiscal, contabilidade e departamento pessoal seguindo a legislação vigente." },
        { title: "OBRIGAÇÕES DA CONTRATANTE", content: "A CONTRATANTE deverá fornecer toda a documentação necessária até o 5º dia útil de cada mês." },
        { title: "VIGÊNCIA E RESCISÃO", content: "O presente contrato terá vigência de 12 meses, podendo ser rescindido por qualquer das partes mediante aviso prévio de 30 dias." }
      ]
    };
  }, [formData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado para a área de transferência!");
  };

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
                    <Sparkles className="w-3 h-3" /> Sales Enablement Tool
                 </div>
                 <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85]">
                    Propostas & <br /><span className="text-indigo-600 italic">Contratos.</span>
                 </h1>
                 <p className="text-xl text-slate-500 font-medium font-serif italic max-w-md">
                    Gere documentos profissionais em segundos e feche mais contratos com segurança jurídica e comercial.
                 </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                 <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Base</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">Profissional</div>
                 </div>
                 <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Formatos</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">PDF / DOCX</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Form Side */}
              <div className="lg:col-span-12">
                <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {/* Section 1: Client Data */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">01</div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Dados do Cliente</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                             <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                                <input 
                                  type="text"
                                  value={formData.companyName}
                                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 transition-all"
                                  placeholder="Nome da Empresa"
                                />
                             </div>
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                             <input 
                               type="text"
                               value={formData.cnpj}
                               onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                               className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 transition-all"
                               placeholder="00.000.000/0000-00"
                             />
                           </div>
                        </div>
                      </div>

                      {/* Section 2: Responsibility */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">02</div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Responsável</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                             <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                                <input 
                                  type="text"
                                  value={formData.responsibleName}
                                  onChange={(e) => setFormData({...formData, responsibleName: e.target.value})}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 transition-all"
                                  placeholder="Nome do Pessoa"
                                />
                             </div>
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                             <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                                <input 
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 transition-all"
                                  placeholder="contato@empresa.com.br"
                                />
                             </div>
                           </div>
                        </div>
                      </div>

                      {/* Section 3: Proposal Details */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">03</div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Serviço & Honorário</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Serviço</label>
                             <select 
                               value={formData.serviceType}
                               onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                               className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 transition-all appearance-none"
                             >
                               <option>Contabilidade Mensal</option>
                               <option>Consultoria Estratégica</option>
                               <option>Gestão de Folha</option>
                               <option>Abertura de Empresa</option>
                             </select>
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Mensal (R$)</label>
                             <div className="relative group">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                                <input 
                                  type="number"
                                  value={formData.monthlyValue}
                                  onChange={(e) => setFormData({...formData, monthlyValue: e.target.value})}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 transition-all font-mono"
                                  placeholder="0.00"
                                />
                             </div>
                             {location.search.includes('fee') && (
                               <div className="text-[9px] font-black text-indigo-600 uppercase mt-1 italic flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Sincronizado do Honorários Pro
                               </div>
                             )}
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={handleGenerate}
                        disabled={!formData.companyName || !formData.monthlyValue || isGenerating}
                        className="w-full py-8 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-widest text-lg shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-slate-900 transition-all flex items-center justify-center gap-4 group"
                      >
                         {isGenerating ? (
                           <Loader2 className="w-6 h-6 animate-spin" />
                         ) : (
                           <>Gerar Documentos Profissionais <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></>
                         )}
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Tabs */}
              <div className="flex items-center justify-center gap-4">
                 <button 
                   onClick={() => setActiveTab('proposta')}
                   className={cn(
                     "px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
                     activeTab === 'proposta' ? "bg-slate-900 text-white shadow-xl" : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800"
                   )}
                 >
                    Apresentação Proposta
                 </button>
                 <button 
                   onClick={() => setActiveTab('contrato')}
                   className={cn(
                     "px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
                     activeTab === 'contrato' ? "bg-slate-900 text-white shadow-xl" : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800"
                   )}
                 >
                    Contrato Prestação
                 </button>
              </div>

              {/* Document Container */}
              <div className="bg-white dark:bg-slate-900 rounded-[56px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                 {/* Toolbar */}
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <button 
                         onClick={() => setStep(1)}
                         className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                       >
                          <ArrowLeft className="w-5 h-5" />
                       </button>
                       <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Editor Visual (Beta)</div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => copyToClipboard(activeTab === 'proposta' ? proposalContent.intro + "\n\n" + proposalContent.scope : contractContent.title)}
                         className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                       >
                          <Copy className="w-4 h-4" /> Copiar Texto
                       </button>
                       <button 
                         onClick={() => alert("Gerando PDF Premium...")}
                         className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-slate-900 transition-all flex items-center gap-2"
                       >
                          <Download className="w-4 h-4" /> Gerar PDF
                       </button>
                    </div>
                 </div>

                 {/* Content Surface */}
                 <div className="p-12 md:p-24 bg-slate-50/30 dark:bg-slate-950/30 relative">
                    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-12 md:p-20 shadow-xl rounded-[16px] border border-slate-100 dark:border-slate-800 min-h-[800px] font-serif">
                       {activeTab === 'proposta' ? (
                         <div className="space-y-12">
                            <div className="text-center space-y-4">
                               <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white"><FileCheck className="w-10 h-10" /></div>
                               <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{proposalContent.title}</h2>
                               <div className="h-1 w-20 bg-indigo-600 mx-auto" />
                            </div>

                            <p className="text-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{proposalContent.intro}</p>

                            <div className="space-y-4">
                               <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Escopo de Trabalho</h4>
                               <p className="text-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">{proposalContent.scope}</p>
                            </div>

                            <div className="p-10 border-4 border-slate-100 dark:border-slate-800 rounded-3xl text-center">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Investimento Estimado</h4>
                               <div className="text-4xl font-black text-slate-900 dark:text-white mb-2 italic">{formatCurrency(parseFloat(formData.monthlyValue) || 0)} <span className="text-sm font-bold text-slate-400 uppercase tracking-widest not-italic">/ mês</span></div>
                               <p className="text-sm text-slate-500 font-medium">{proposalContent.conditions}</p>
                            </div>

                            <div className="pt-20 text-center space-y-4">
                               <div className="w-48 h-px bg-slate-200 mx-auto" />
                               <p className="text-[10px] font-black uppercase text-slate-400">{formData.companyName}</p>
                            </div>
                         </div>
                       ) : (
                         <div className="space-y-12">
                            <div className="text-center space-y-4">
                               <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{contractContent.title}</h2>
                               <div className="h-1 w-20 bg-slate-900 dark:bg-white mx-auto" />
                            </div>

                            <div className="space-y-8">
                               {contractContent.clauses.map((clause, i) => (
                                 <div key={i} className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cláusula {i+1}ª - {clause.title}</h4>
                                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed text-justify px-4">{clause.content}</p>
                                 </div>
                               ))}
                            </div>

                            {/* Premium Feature: Custom Clauses */}
                            <div className="relative group">
                               <div className={cn(
                                 "space-y-4 transition-all",
                                 !isPremium && "blur-[6px] select-none pointer-events-none opacity-50"
                               )}>
                                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Cláusulas Personalizadas</h4>
                                  <textarea 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-amber-200 rounded-2xl p-6 font-medium text-slate-700 h-32 focus:ring-4 focus:ring-amber-500/10 outline-none"
                                    placeholder="Adicione suas cláusulas extras aqui..."
                                    value={formData.extraClauses}
                                    onChange={(e) => setFormData({...formData, extraClauses: e.target.value})}
                                  />
                               </div>
                               {!isPremium && (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20">
                                    <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-xl"><Crown className="w-6 h-6" /></div>
                                    <h5 className="text-sm font-black uppercase tracking-widest mb-1">Cláusulas Extras (Pro)</h5>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-tighter">Edite o contrato completo e adicione proteções extras</p>
                                    <button 
                                      onClick={() => setIsPremium(true)}
                                      className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                    >
                                       Desbloquear Edição
                                    </button>
                                 </div>
                               )}
                            </div>

                            <div className="grid grid-cols-2 gap-20 pt-32">
                               <div className="space-y-4 text-center">
                                  <div className="h-px bg-slate-200" />
                                  <p className="text-[10px] font-black uppercase">Contratante</p>
                               </div>
                               <div className="space-y-4 text-center">
                                  <div className="h-px bg-slate-200" />
                                  <p className="text-[10px] font-black uppercase">Contratada</p>
                               </div>
                            </div>
                         </div>
                       )}
                    </div>

                    {/* Watermark for Free version */}
                    {!isPremium && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-35deg] pointer-events-none opacity-[0.03] select-none">
                         <div className="text-[120px] font-black leading-none uppercase">MicroCaaS<br />PREVIEW</div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Action Footer */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-12 bg-slate-900 rounded-[40px] text-white overflow-hidden relative shadow-2xl">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><ShieldCheck className="w-64 h-64 text-indigo-500" /></div>
                 <div className="flex items-center gap-6 relative z-10 text-center md:text-left">
                    <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center"><Download className="w-8 h-8 text-white" /></div>
                    <div>
                       <h4 className="text-xl font-black uppercase tracking-tighter italic">Pacote Pronto para Fechamento</h4>
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Salve todos os documentos em um único envelope digital</p>
                    </div>
                 </div>
                 <div className="flex gap-4 relative z-10">
                    <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-xl">
                       Baixar Conjunto Completo
                    </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
