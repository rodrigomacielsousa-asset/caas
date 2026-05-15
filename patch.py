import sys

file_path = 'src/pages/ProductDetail.tsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

new_content = """                          {/* Scanners / Connectors Grid */}
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
                                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[28px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all font-sans"
                                 >
                                   <Printer className="w-4 h-4" /> Gerar Relatório de Conformidade
                                 </button>
                              </div>"""

# Line 917 to 1138 inclusive (0-indexed: 916 to 1137)
new_lines = lines[:916] + [new_content + "\n"] + lines[1138:]

with open(file_path, 'w') as f:
    f.writelines(new_lines)
