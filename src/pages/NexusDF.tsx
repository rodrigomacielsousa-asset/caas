import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Globe, 
  ArrowLeft, 
  Sparkles, 
  LayoutDashboard, 
  Map as MapIcon, 
  ClipboardList, 
  FileText, 
  Download, 
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Plus,
  Trash2,
  Search,
  Languages,
  ArrowRightLeft,
  FileCheck,
  Box,
  ShieldCheck,
  CheckSquare,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { cn } from '../lib/utils';

// --- I18N DICTIONARY & GLOSSARY ---
const TRANSLATIONS = {
  pt: {
    title: "Nexus DF",
    subtitle: "Demonstrações Financeiras + Notas Explicativas (CPC PME e CPC Full)",
    back: "Voltar para o Marketplace",
    disclaimer: "Gerado automaticamente; requer revisão profissional antes de emissão oficial.",
    lang: "Português",
    tabs: {
      upload: "1. Importação",
      mapping: "2. Mapeamento",
      statements: "3. Demonstrações",
      notes: "4. Notas Explicativas",
      export: "5. Exportação"
    },
    upload: {
      title: "Importar Balancete",
      drop: "Arraste o arquivo .xlsx ou .csv aqui",
      config: "Configuração de Colunas",
      selectLang: "Idioma da Demonstração"
    },
    statements: {
      bp: "Balanço Patrimonial",
      dre: "DRE - Resultado",
      dra: "DRA - Abrangente",
      dmpl: "DMPL - Mutações PL",
      dfc: "DFC - Fluxo de Caixa",
      ativo: "Ativo",
      passivo: "Passivo e PL",
      current: "Ano Atual",
      prior: "Ano Anterior",
      totalAtivo: "TOTAL DO ATIVO",
      totalPassivo: "TOTAL PASSIVO + PL",
      difference: "Diferença",
      ok: "Equilibrado",
      error: "Divergente"
    },
    notes: {
      title: "Notas Explicativas",
      pending: "Pendências de Preenchimento",
      validations: "Reconciliações e Validações",
      generate: "Gerar Notas em"
    },
    glossary: {
      caixa: "Caixa e equivalentes de caixa",
      receber: "Contas a receber de clientes",
      estoque: "Estoques",
      imobilizado: "Imobilizado líquido",
      fornecedor: "Fornecedores",
      capital: "Capital social",
      receita: "Receita líquida",
      custo: "Custo das vendas",
      lucro: "Lucro líquido do exercício"
    }
  },
  en: {
    title: "Nexus DF",
    subtitle: "Financial Statements + Footnotes (CPC PME & IFRS)",
    back: "Back to Marketplace",
    disclaimer: "Automatically generated; requires professional review before official issuance.",
    lang: "English",
    tabs: {
      upload: "1. Import",
      mapping: "2. Mapping",
      statements: "3. Statements",
      notes: "4. Footnotes",
      export: "5. Export"
    },
    upload: {
      title: "Import Trial Balance",
      drop: "Drop .xlsx or .csv file here",
      config: "Column Configuration",
      selectLang: "Statement Language"
    },
    statements: {
      bp: "Balance Sheet",
      dre: "Income Statement (P&L)",
      dra: "Comprehensive Income",
      dmpl: "Statement of Equity",
      dfc: "Cash Flow (Indirect)",
      ativo: "Assets",
      passivo: "Liabilities & Equity",
      current: "Current Year",
      prior: "Prior Year",
      totalAtivo: "TOTAL ASSETS",
      totalPassivo: "TOTAL LIABILITIES + EQUITY",
      difference: "Difference",
      ok: "Balanced",
      error: "Imbalanced"
    },
    notes: {
      title: "Notes to Financial Statements",
      pending: "Incomplete Data / Pending",
      validations: "Reconciliations & Validations",
      generate: "Generate Notes in"
    },
    glossary: {
      caixa: "Cash and cash equivalents",
      receber: "Trade accounts receivable",
      estoque: "Inventories",
      imobilizado: "Property, plant and equipment, net",
      fornecedor: "Suppliers / Trade accounts payable",
      capital: "Share capital",
      receita: "Revenue",
      custo: "Cost of sales",
      lucro: "Net income for the year"
    }
  }
};

// --- SYSTEM CONSTANTS (MODEL COA & MAPPING RULES) ---
const MODEL_COA = [
  { code: '1', name: 'ATIVO', type: 'GRUPO', nature: 'DEVEDORA' },
  { code: '1.1', name: 'Ativo Circulante', type: 'GRUPO', nature: 'DEVEDORA' },
  { code: '1.1.1', name: 'Caixa e equivalentes de caixa', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.1.01', name: 'Caixa Geral', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.1.02', name: 'Bancos Conta Movimento', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.1.03', name: 'Numerários em trânsito', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.1.04', name: 'Aplicações financeiras de curto prazo', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.2', name: 'Títulos e valores mobiliários', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.3', name: 'Instrumentos financeiros derivativos (Ativo)', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.4', name: 'Contas a receber de clientes', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.4.01', name: 'Clientes - Mercado Interno', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.4.02', name: 'Clientes - Exportação', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.4.03', name: '(-) Provisão perdas esperadas (PEC/PDD)', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.1.6', name: 'Estoques', type: 'ATIVO', nature: 'DEVEDORA' },
  { code: '1.2.9', name: 'Imobilizado', type: 'ATIVO', nature: 'DEVEDORA' },
];

const MAPPING_RULES = {
  version: "1.4",
  lineDictionary: [
    { codePrefix: "1.1.1", lineId: "1.1.01", noteId: "NOTE_CASH" },
    { codePrefix: "1.1.2", lineId: "1.1.02", noteId: "NOTE_SECURITIES" },
    { codePrefix: "1.1.3", lineId: "1.1.03", noteId: "NOTE_DERIVATIVES" },
    { codePrefix: "1.1.4", lineId: "1.1.04", noteId: "NOTE_AR" },
    { codePrefix: "1.1.6", lineId: "1.1.05", noteId: "NOTE_INVENTORIES" },
    { codePrefix: "1.1.7", lineId: "1.1.06", noteId: "NOTE_TAXES_REC" },
    { codePrefix: "1.1.8", lineId: "1.1.07", noteId: "NOTE_OTHER" },
    { codePrefix: "1.2.4", lineId: "1.2.06", noteId: "NOTE_TAX_DIF" },
    { codePrefix: "1.2.6", lineId: "1.2.07", noteId: "NOTE_INV_PROP" },
    { codePrefix: "1.2.7", lineId: "1.2.05", noteId: "NOTE_BIO" },
    { codePrefix: "1.2.8", lineId: "1.2.04", noteId: "NOTE_LEASES" },
    { codePrefix: "1.2.9", lineId: "1.2.03", noteId: "NOTE_PPE" },
    { codePrefix: "2.1.1", lineId: "2.1.01", noteId: "NOTE_AP" },
    { codePrefix: "2.1.2", lineId: "2.1.02", noteId: "NOTE_DEBT" },
    { codePrefix: "2.1.3", lineId: "2.1.03", noteId: "NOTE_TAX_PAYABLE" },
    { codePrefix: "2.1.4", lineId: "2.1.04", noteId: "NOTE_PAYROLL" },
    { codePrefix: "2.1.5", lineId: "2.1.05", noteId: "NOTE_LEASES" },
    { codePrefix: "2.2.2", lineId: "2.2.02", noteId: "NOTE_TAX_DIF" },
    { codePrefix: "3.1", lineId: "2.3.01", noteId: "NOTE_EQUITY" },
    { codePrefix: "3.3", lineId: "2.3.02", noteId: "NOTE_EQUITY" },
    { codePrefix: "3.4", lineId: "2.3.02", noteId: "NOTE_EQUITY" },
    { codePrefix: "3.7", lineId: "2.3.02", noteId: "NOTE_EQUITY" },
    { codePrefix: "3.8", lineId: "2.3.03", noteId: "NOTE_EQUITY" },
    { codePrefix: "4.1", lineId: "3.01", noteId: "NOTE_REVENUE" },
    { codePrefix: "4.3", lineId: "3.05.01", noteId: "NOTE_FINANCE" },
    { codePrefix: "4.4", lineId: "3.04.05", noteId: "NOTE_OTHER_OP" },
    { codePrefix: "5.1", lineId: "3.02", noteId: "NOTE_COSTS" },
    { codePrefix: "5.2", lineId: "3.04.01", noteId: "NOTE_SALES" },
    { codePrefix: "5.3", lineId: "3.04.02", noteId: "NOTE_GA" },
    { codePrefix: "5.5", lineId: "3.04.03", noteId: "NOTE_LOGISTICS" },
    { codePrefix: "5.6", lineId: "3.05.02", noteId: "NOTE_FINANCE" },
    { codePrefix: "5.7", lineId: "3.04.05", noteId: "NOTE_OTHER_OP" },
    { codePrefix: "5.8", lineId: "3.06.01", noteId: "NOTE_TAX_RESULT" },
    { codePrefix: "5.9", lineId: "3.06.02", noteId: "NOTE_TAX_RESULT" },
    { codePrefix: "5.10", lineId: "3.04.04", noteId: "NOTE_DEPR" },
  ]
};

// --- TYPES ---
interface AccountTrace {
  matchedBy: 'exact' | 'prefix' | 'keyword' | 'ai' | 'manual' | 'none';
  matchedKey?: string;
  confidence: number;
}

interface Account {
  code: string;
  name: string;
  begin: number;
  debit: number;
  credit: number;
  end: number;
  year: 'current' | 'prior';
  mappedTo?: string;
  trace?: AccountTrace;
  multiplier: number;
  rawCode?: string;
  reason?: 'UNMAPPED' | 'SERIAL_DATE_BLOCKED' | 'NO_STATEMENT_TARGET';
}

// --- STATEMENT STRUCTURE DEFINITIONS ---
const STRUCTURE = {
  BP_ATIVO: [
    { id: '1.1', label: 'Ativo Circulante', isHeader: true },
    { id: '1.1.01', label: 'Caixa e equivalentes de caixa', indent: 1 },
    { id: '1.1.02', label: 'Títulos e valores mobiliários', indent: 1 },
    { id: '1.1.03', label: 'Instrumentos financeiros derivativos (Ativo - AC)', indent: 1 },
    { id: '1.1.04', label: 'Contas a receber de clientes', indent: 1 },
    { id: '1.1.05', label: 'Estoques', indent: 1 },
    { id: '1.1.06', label: 'TRIBUTOS A RECUPERAR', indent: 1 },
    { id: '1.1.07', label: 'Outros créditos', indent: 1 },
    { id: '1.1.TOTAL', label: 'Total Ativo Circulante', isTotal: true },
    { id: '1.2', label: 'Ativo Não Circulante', isHeader: true },
    { id: '1.2.01', label: 'Depósitos judiciais', indent: 1 },
    { id: '1.2.02', label: 'Investimentos em coligadas', indent: 1 },
    { id: '1.2.03', label: 'Imobilizado líquido', indent: 1 },
    { id: '1.2.04', label: 'Direito de uso (arrendamento)', indent: 1 },
    { id: '1.2.05', label: 'ATIVO BIOLÓGICO', indent: 1 },
    { id: '1.2.06', label: 'Imposto de renda e contribuição social diferidos (Ativo)', indent: 1 },
    { id: '1.2.07', label: 'Propriedades para investimento', indent: 1 },
    { id: '1.2.08', label: 'Intangível líquido', indent: 1 },
    { id: '1.2.TOTAL', label: 'Total Ativo Não Circulante', isTotal: true },
    { id: '1.TOTAL', label: 'TOTAL DO ATIVO', isTotal: true, highlight: true },
  ],
  BP_PASSIVO: [
    { id: '2.1', label: 'Passivo Circulante', isHeader: true },
    { id: '2.1.01', label: 'Fornecedores', indent: 1 },
    { id: '2.1.02', label: 'Empréstimos e financiamentos (CP)', indent: 1 },
    { id: '2.1.03', label: 'Obrigações tributárias e derivativos (CP)', indent: 1 },
    { id: '2.1.04', label: 'Obrigações trabalhistas', indent: 1 },
    { id: '2.1.05', label: 'Passivo de arrendamento (CP)', indent: 1 },
    { id: '2.1.06', label: 'Dividendos e JCP a pagar', indent: 1 },
    { id: '2.1.07', label: 'Provisões de curto prazo', indent: 1 },
    { id: '2.1.TOTAL', label: 'Total Passivo Circulante', isTotal: true },
    { id: '2.2', label: 'Passivo Não Circulante', isHeader: true },
    { id: '2.2.01', label: 'Empréstimos e financiamentos (LP)', indent: 1 },
    { id: '2.2.02', label: 'Arrendamento (LP)', indent: 1 },
    { id: '2.2.03', label: 'Imposto de renda diferido (Passivo)', indent: 1 },
    { id: '2.2.04', label: 'Provisões para contingências', indent: 1 },
    { id: '2.2.TOTAL', label: 'Total Passivo Não Circulante', isTotal: true },
    { id: '2.PASSIVO_TOTAL', label: 'TOTAL DO PASSIVO', isTotal: true },
    { id: '2.3', label: 'Patrimônio Líquido', isHeader: true },
    { id: '2.3.01', label: 'Capital social integralizado', indent: 1 },
    { id: '2.3.02', label: 'Reservas de lucro e capital', indent: 1 },
    { id: '2.3.03', label: 'Lucros ou prejuízos acumulados', indent: 1 },
    { id: '2.3.TOTAL', label: 'TOTAL DO PL', isTotal: true },
    { id: '2.TOTAL', label: 'TOTAL PASSIVO + PL', isTotal: true, highlight: true },
  ],
  DRE: [
    { id: '3.01', label: '(+) Receita Bruta de Vendas e Serviços', isHeader: false },
    { id: '3.01.02', label: '(-) Impostos s/ vendas (ICMS/PIS/COFINS/ISS)', indent: 1 },
    { id: '3.01.SUBTOTAL', label: '(=) RECEITA LÍQUIDA DE VENDAS E SERVIÇOS', isTotal: true },
    { id: '3.02', label: '(-) Custo dos Produtos e Mercadorias Vendidas (CMV)', indent: 0 },
    { id: '3.02.SUBTOTAL', label: '(=) LUCRO BRUTO', isTotal: true },
    { id: '3.04.01', label: '(-) Despesas com vendas', indent: 1 },
    { id: '3.04.02', label: '(-) Despesas Gerais e Administrativas', indent: 1 },
    { id: '3.04.03', label: '(-) Despesas Logísticas', indent: 1 },
    { id: '3.04.04', label: '(-) Depreciações e Amortizações', indent: 1 },
    { id: '3.04.05', label: '(+/-) Outras receitas (desp.) operacionais líquidas', indent: 1 },
    { id: '3.04.SUBTOTAL', label: '(=) LUCRO OPERACIONAL', isTotal: true },
    { id: '3.05.01', label: '(+) Receitas Financeiras', indent: 1 },
    { id: '3.05.02', label: '(-) Despesas Financeiras', indent: 1 },
    { id: '3.05.SUBTOTAL', label: '(=) RESULTADO FINANCEIRO LÍQUIDO', isTotal: true },
    { id: '3.05.LAIR', label: '(=) LUCRO ANTES DO IR E CS', isTotal: true },
    { id: '3.06.01', label: '(-) IR e CSLL Corrente', indent: 1 },
    { id: '3.06.02', label: '(-) IR e CSLL Diferido', indent: 1 },
    { id: '3.06.03', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', isTotal: true, highlight: true },
  ]
};

// --- MOCK DATA ---
const MOCK_TB: Account[] = [
  { code: '1.1.1.01', name: 'Caixa Geral', begin: 280000, debit: 38634, credit: 8634, end: 310000, year: 'current', multiplier: 1 },
  { code: '1.1.1.02', name: 'Bancos Conta Movimento', begin: 620000, debit: 62180, credit: 12180, end: 670000, year: 'current', multiplier: 1 },
  { code: '1.1.4.01', name: 'Clientes Nacionais', begin: 1300000, debit: 126220, credit: 26220, end: 1400000, year: 'current', multiplier: 1 },
  { code: '1.1.6.01', name: 'Estoques - Mercadorias', begin: 3200000, debit: 972550, credit: 722550, end: 3450000, year: 'current', multiplier: 1 },
  { code: '2.1.1.01', name: 'Fornecedores Diversos', begin: -2700000, debit: 748980, credit: 598980, end: -2550000, year: 'current', multiplier: 1 },
  { code: '3.1.1.01', name: 'Capital Social Integralizado', begin: -6500000, debit: 0, credit: 0, end: -6500000, year: 'current', multiplier: 1 },
  { code: '4.1.01.01', name: 'Receita de Venda de Mercadorias', begin: 0, debit: 0, credit: 1850000, end: -1850000, year: 'current', multiplier: 1 },
  { code: '5.1.01.01', name: 'Custo das Mercadorias Vendidas', begin: 0, debit: 1190000, credit: 0, end: 1190000, year: 'current', multiplier: 1 },
];

export default function NexusDF() {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [activeTab, setActiveTab] = useState<'upload' | 'mapping' | 'statements' | 'notes' | 'export'>('upload');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStatementTab, setActiveStatementTab] = useState<'BP' | 'DRE' | 'DRA' | 'DMPL' | 'DFC' | 'DEBUG' | 'RATIOS'>('BP');
  const [showOnlyCurrentYear, setShowOnlyCurrentYear] = useState(false);

  const [notesContent, setNotesContent] = useState<Record<string, string>>({});
  const [isNotesInitialized, setIsNotesInitialized] = useState(false);

  const formatCurrency = (val: number) => {
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const parts = absVal.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formatted = parts.join(',');
    return isNegative ? `-${formatted}` : formatted;
  };

  const calculateLineValue = useCallback((targetId: string, year: 'current' | 'prior'): number => {
    return statementsState[year].lineValues[targetId] || 0;
  }, [accounts, mapping]); // Optimized via statementState

  const t = TRANSLATIONS[lang];

  // --- LOGIC: MASTER STATEMENTS STATE ---
  const allLines = useMemo(() => {
    return [...STRUCTURE.BP_ATIVO, ...STRUCTURE.BP_PASSIVO, ...STRUCTURE.DRE];
  }, []);

  const statementsState = useMemo(() => {
    const calculateYear = (pYear: 'current' | 'prior') => {
      const yearAccounts = accounts.filter(a => a.year === pYear);
      const lineValues: Record<string, number> = {};
      
      // 1. Initial Mapping & Signed Sum Calculation
      allLines.forEach(l => {
        if (!l.isTotal && !l.isHeader) {
          let val = yearAccounts
            .filter(a => mapping[a.code] === l.id)
            .reduce((s, a) => s + a.end, 0);
          
          lineValues[l.id] = val;
        }
      });

      // Technical Check: DRE Result from TB
      const dreAccounts = yearAccounts.filter(a => a.code.startsWith('4') || a.code.startsWith('5'));
      const tbDreResult = -dreAccounts.reduce((s, a) => s + a.end, 0);

      // 2. DRE Calculation (Independent)
      const dreInternal = ['3.01', '3.01.02', '3.02', '3.04.01', '3.04.02', '3.04.03', '3.04.04', '3.04.05', '3.05.01', '3.05.02', '3.06.01', '3.06.02'];
      const dreDisplayValues: Record<string, number> = {};
      
      dreInternal.forEach(id => {
        let raw = lineValues[id] || 0;
        if (id === '3.01' || id === '3.05.01') {
          dreDisplayValues[id] = Math.abs(raw);
        } else if (id === '3.04.05') {
          // Normalização: Ganhos - Perdas
          dreDisplayValues[id] = -raw; 
        } else {
          dreDisplayValues[id] = -Math.abs(raw);
        }
      });

      dreDisplayValues['3.01.SUBTOTAL'] = (dreDisplayValues['3.01'] || 0) + (dreDisplayValues['3.01.02'] || 0);
      dreDisplayValues['3.02.SUBTOTAL'] = dreDisplayValues['3.01.SUBTOTAL'] + (dreDisplayValues['3.02'] || 0);
      dreDisplayValues['3.04.SUBTOTAL'] = (dreDisplayValues['3.02.SUBTOTAL'] || 0) + 
                                          (dreDisplayValues['3.04.01'] || 0) + 
                                          (dreDisplayValues['3.04.02'] || 0) + 
                                          (dreDisplayValues['3.04.03'] || 0) + 
                                          (dreDisplayValues['3.04.04'] || 0) + 
                                          (dreDisplayValues['3.04.05'] || 0);
      dreDisplayValues['3.05.SUBTOTAL'] = (dreDisplayValues['3.05.01'] || 0) + (dreDisplayValues['3.05.02'] || 0);
      dreDisplayValues['3.05.LAIR'] = (dreDisplayValues['3.04.SUBTOTAL'] || 0) + (dreDisplayValues['3.05.SUBTOTAL'] || 0);
      const netIncome = dreDisplayValues['3.05.LAIR'] + (dreDisplayValues['3.06.01'] || 0) + (dreDisplayValues['3.06.02'] || 0);
      dreDisplayValues['3.06.03'] = netIncome;

      Object.assign(lineValues, dreDisplayValues);

      // BP Bridge
      const assetSigned = STRUCTURE.BP_ATIVO.filter(l => l.id.startsWith('1.') && !l.isHeader && !l.isTotal).reduce((s, l) => s + (lineValues[l.id] || 0), 0);
      const passivSigned = STRUCTURE.BP_PASSIVO.filter(l => (l.id.startsWith('2.1.') || l.id.startsWith('2.2.')) && !l.isTotal).reduce((s, l) => s + (lineValues[l.id] || 0), 0);
      const plBaseSigned = STRUCTURE.BP_PASSIVO.filter(l => l.id.startsWith('2.3.') && !l.isTotal).reduce((s, l) => s + (lineValues[l.id] || 0), 0);
      const bridge = -(assetSigned + passivSigned + plBaseSigned);
      lineValues['2.3.03'] = (lineValues['2.3.03'] || 0) + bridge;

      // Totals
      lineValues['1.1.TOTAL'] = STRUCTURE.BP_ATIVO.filter(l => l.id.startsWith('1.1.') && !l.isTotal).reduce((s, l) => s + (lineValues[l.id] || 0), 0);
      lineValues['1.2.TOTAL'] = STRUCTURE.BP_ATIVO.filter(l => l.id.startsWith('1.2.') && !l.isTotal).reduce((s, l) => s + (lineValues[l.id] || 0), 0);
      lineValues['1.TOTAL'] = lineValues['1.1.TOTAL'] + lineValues['1.2.TOTAL'];
      lineValues['2.1.TOTAL'] = STRUCTURE.BP_PASSIVO.filter(l => l.id.startsWith('2.1.') && !l.isTotal).reduce((s, l) => s + (lineValues[l.id] || 0), 0);
      lineValues['2.2.TOTAL'] = STRUCTURE.BP_PASSIVO.filter(l => l.id.startsWith('2.2.') && !l.isTotal).reduce((s, l) => s + (lineValues[l.id] || 0), 0);
      lineValues['2.PASSIVO_TOTAL'] = lineValues['2.1.TOTAL'] + lineValues['2.2.TOTAL'];
      lineValues['2.3.TOTAL'] = STRUCTURE.BP_PASSIVO.filter(l => l.id.startsWith('2.3.') && !l.isTotal).reduce((s, l) => s + (lineValues[l.id] || 0), 0);
      lineValues['2.TOTAL'] = lineValues['2.PASSIVO_TOTAL'] + lineValues['2.3.TOTAL'];

      const totalAtivo = Math.abs(lineValues['1.TOTAL']);
      const totalPassivPL = Math.abs(lineValues['2.PASSIVO_TOTAL']) + Math.abs(lineValues['2.3.TOTAL']);
      const dpv = Math.abs(lineValues['3.04.04'] || 0);

      return {
        lineValues,
        tbSum: yearAccounts.reduce((s, a) => s + a.end, 0),
        assetSum: totalAtivo,
        passivSum: totalPassivPL,
        bpGap: totalAtivo - totalPassivPL,
        netIncome,
        tbDreResult,
        dreReconciled: Math.abs(netIncome - tbDreResult) < 1,
        bridge,
        assetSigned, passivSigned, plBaseSigned,
        dpv,
        isCertified: Math.abs(totalAtivo - totalPassivPL) < 1000 && yearAccounts.length > 0
      };
    };

    const current = calculateYear('current');
    const prior = calculateYear('prior');

    // 4. DFC Logic (Indirect)
    const calculateDFC = () => {
      const vars: Record<string, number> = {};
      const cur = current.lineValues;
      const prev = prior.lineValues;
      const available = prior.assetSum > 0;

      const getVar = (id: string, isAsset: boolean) => {
        if (!available) return 0;
        const delta = Math.abs(cur[id] || 0) - Math.abs(prev[id] || 0);
        return isAsset ? -delta : delta;
      };

      vars['LUCRO'] = current.netIncome;
      vars['DEPR'] = current.dpv;
      vars['AJUSTES_TOTAL'] = vars['DEPR'];
      vars['CAIXA_GERADO_AJUSTES'] = vars['LUCRO'] + vars['AJUSTES_TOTAL'];

      vars['AR'] = getVar('1.1.04', true);
      vars['INV'] = getVar('1.1.05', true);
      vars['TAX_REC'] = getVar('1.1.06', true);
      vars['OTHER_ASSET'] = getVar('1.1.07', true);
      vars['SUPPLIER'] = getVar('2.1.01', false);
      vars['TAX_PAY'] = getVar('2.1.03', false);
      vars['PAYROLL'] = getVar('2.1.04', false);
      
      vars['VAR_WC'] = vars['AR'] + vars['INV'] + vars['TAX_REC'] + vars['OTHER_ASSET'] + vars['SUPPLIER'] + vars['TAX_PAY'] + vars['PAYROLL'];
      vars['CAIXA_OPER'] = vars['CAIXA_GERADO_AJUSTES'] + vars['VAR_WC'];
      
      return { vars, available };
    };

    return {
      current,
      prior,
      dfc: calculateDFC()
    };
  }, [accounts, mapping, allLines]);

  // --- AUTOMAPPING LOGIC ---
  const runAutoMapping = useCallback((accs: Account[]) => {
    const newMapping: Record<string, string> = {};
    accs.forEach(acc => {
      // 1. Prefix Rules (Strongest)
      const rule = MAPPING_RULES.lineDictionary.find(r => acc.code.startsWith(r.codePrefix));
      if (rule) {
        newMapping[acc.code] = rule.lineId;
        return;
      }

      // 2. Keyword/Structure fallback
      const prefix = acc.code.split('.')[0];
      const name = acc.name.toLowerCase();

      if (prefix === '1') {
        if (name.includes('banco') || name.includes('caixa')) newMapping[acc.code] = '1.1.01';
        else if (name.includes('cliente') || name.includes('contas a receber')) newMapping[acc.code] = '1.1.04';
        else if (name.includes('estoque')) newMapping[acc.code] = '1.1.05';
        else if (name.includes('tributo') || name.includes('imposto a recuperar')) newMapping[acc.code] = '1.1.06';
        else if (name.includes('imobilizado') || name.includes('maquina') || name.includes('veiculo')) newMapping[acc.code] = '1.2.03';
        else newMapping[acc.code] = '1.1.07';
      } else if (prefix === '2' || prefix === '2.1' || prefix === '2.2') {
        if (name.includes('fornecedor')) newMapping[acc.code] = '2.1.01';
        else if (name.includes('emprestimo') || name.includes('financiamento')) {
           if (name.includes('lp') || name.includes('longo prazo')) newMapping[acc.code] = '2.2.01';
           else newMapping[acc.code] = '2.1.02';
        }
        else if (name.includes('trabalhista') || name.includes('folha') || name.includes('salario')) newMapping[acc.code] = '2.1.04';
        else if (name.includes('tributo') || name.includes('imposto a pagar')) newMapping[acc.code] = '2.1.03';
        else newMapping[acc.code] = '2.1.03';
      } else if (prefix === '3' || prefix === '2.3') {
        if (name.includes('capital')) newMapping[acc.code] = '2.3.01';
        else if (name.includes('reserva')) newMapping[acc.code] = '2.3.02';
        else if (name.includes('lucro') || name.includes('prejuizo') || name.includes('resultado')) {
           if (name.includes('do exercício') || name.includes('no período') || name.includes('líquido') || name.includes('corrente')) {
              // Critical: ignore "Result of the period" account if it matches the DRE calculation exactly
              // to prevent double counting in PL
           } else {
              newMapping[acc.code] = '2.3.03';
           }
        }
        else newMapping[acc.code] = '2.3.02';
      } else if (prefix === '4') {
        if (name.includes('financeira')) newMapping[acc.code] = '3.05.01';
        else if (name.includes('outra')) newMapping[acc.code] = '3.04.05';
        else if (name.includes('bruta') || name.includes('venda')) newMapping[acc.code] = '3.01';
        else newMapping[acc.code] = '3.01';
      } else if (prefix === '5') {
        if (name.includes('custo') || name.includes('cmv')) newMapping[acc.code] = '3.02';
        else if (name.includes('venda')) newMapping[acc.code] = '3.04.01';
        else if (name.includes('administrativa') || name.includes('geral') || name.includes('admin')) newMapping[acc.code] = '3.04.02';
        else if (name.includes('logística') || name.includes('frete')) newMapping[acc.code] = '3.04.03';
        else if (name.includes('depreciação') || name.includes('amortização')) newMapping[acc.code] = '3.04.04';
        else if (name.includes('financeira')) newMapping[acc.code] = '3.05.02';
        else if (name.includes('imposto de renda') || name.includes('csll') || name.includes('irpj') || name.includes('sobre o lucro')) newMapping[acc.code] = '3.06.01';
        else newMapping[acc.code] = '3.04.05';
      }
    });

    setMapping(prev => ({ ...prev, ...newMapping }));
  }, []);


  const reconciliation = useMemo(() => ({
    current: statementsState.current,
    prior: statementsState.prior
  }), [statementsState]);

  const financialRatios = useMemo(() => {
    if (!reconciliation.current.isCertified || accounts.length === 0) return null;
    const getVal = (id: string) => statementsState.current.lineValues[id] || 0;
    const ac = getVal('1.1.TOTAL');
    const pc = Math.max(1, Math.abs(getVal('2.1.TOTAL')));
    const ativoTotal = Math.max(1, getVal('1.TOTAL'));
    const pl = Math.max(1, Math.abs(getVal('2.3.TOTAL')));
    const receita = Math.max(1, getVal('3.01.SUBTOTAL'));
    const ll = getVal('3.06.03');

    return { 
      liqCorrente: ac / pc,
      liqSeca: (ac - Math.abs(getVal('1.1.05'))) / pc,
      endividamento: ((Math.abs(pc) + Math.abs(getVal('2.2.TOTAL'))) / ativoTotal) * 100,
      margemBruta: (getVal('3.02.SUBTOTAL') / (receita || 1)) * 100,
      margemLiq: (ll / (receita || 1)) * 100,
      ebitda: (getVal('3.04.SUBTOTAL') + Math.abs(getVal('3.04.04')))
    };
  }, [accounts, statementsState, reconciliation]);

  useEffect(() => {
    if (accounts.length > 0 && reconciliation.current.isCertified && !isNotesInitialized) {
      const getVal = (id: string) => statementsState.current.lineValues[id] || 0;
      const getPrior = (id: string) => statementsState.prior.lineValues[id] || 0;

      const formatLine = (id: string) => {
        const val = Math.abs(getVal(id));
        const pVal = Math.abs(getPrior(id));
        if (pVal === 0) return `R$ ${formatCurrency(val)}`;
        return `R$ ${formatCurrency(val)} (2024) e R$ ${formatCurrency(pVal)} (2023)`;
      };

      const initialNotes: Record<string, string> = {
        '1': `1. CONTEXTO OPERACIONAL\nA Companhia é uma sociedade limitada com sede no Brasil. Sua atividade principal é a produção e comercialização. A emissão destas demonstrações financeiras foi autorizada pela administração em 31 de março de 2025.`,
        '2': `2. BASE DE PREPARAÇÃO\nAs demonstrações financeiras foram elaboradas de acordo com as práticas contábeis adotadas no Brasil (CPC PME / IFRS for SMEs).`,
        'NOTE_CASH': `3. CAIXA E EQUIVALENTES DE CAIXA\nOs saldos de caixa e equivalentes de caixa totalizam ${formatLine('1.1.01')} e incluem dinheiro em caixa, depósitos bancários e investimentos de curto prazo com liquidez imediata.`,
        'NOTE_AR': `4. CONTAS A RECEBER\nO saldo de contas a receber de clientes monta a ${formatLine('1.1.04')}. A administração avalia periodicamente o risco de crédito.`,
        'NOTE_INVENTORIES': `5. ESTOQUES\nOs estoques, no montante de ${formatLine('1.1.05')}, são mensurados pelo menor valor entre o custo de aquisição e o valor líquido realizável.`,
        'NOTE_PPE': `6. IMOBILIZADO\nO imobilizado líquido totaliza ${formatLine('1.2.03')}, sendo mensurado ao custo histórico, deduzido de depreciação acumulada.`,
        'NOTE_EQUITY': `7. PATRIMÔNIO LÍQUIDO\nO Capital Social subscrito e integralizado é de R$ ${formatCurrency(Math.abs(getVal('2.3.01')))}. As Reservas totalizam R$ ${formatCurrency(Math.abs(getVal('2.3.02')))}.`
      };
      setNotesContent(initialNotes);
      setIsNotesInitialized(true);
    }
  }, [reconciliation.current.isCertified, isNotesInitialized, statementsState]);

  const parseNumeric = (val: any): number => {
    if (typeof val === 'number') return val;
    if (val === null || val === undefined) return 0;
    
    // Convert to string and clean
    let str = String(val).trim();
    if (!str || str === '-' || str === '.') return 0;

    // Remove currency symbols and spaces
    str = str.replace(/[R$€£\s]/g, '');

    // Detect format
    const hasComma = str.includes(',');
    const hasDot = str.includes('.');

    if (hasComma && hasDot) {
      if (str.indexOf('.') < str.indexOf(',')) {
        // format: 1.234,56
        return parseFloat(str.replace(/\./g, '').replace(',', '.'));
      } else {
        // format: 1,234.56
        return parseFloat(str.replace(/,/g, ''));
      }
    } else if (hasComma) {
      // format: 1234,56
      return parseFloat(str.replace(',', '.'));
    }
    
    return parseFloat(str) || 0;
  };

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF();
    const cur = statementsState.current;
    
    // 1. Cover
    doc.setFontSize(22);
    doc.text("DEMONSTRAÇÕES FINANCEIRAS", 105, 50, { align: 'center' });
    doc.setFontSize(14);
    doc.text("EXERCÍCIO FINDO EM 31 DE DEZEMBRO DE 2024", 105, 65, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`MicroCaaS - Nexus Finance`, 105, 80, { align: 'center' });
    doc.text(`Valores expressos em Reais (R$)`, 105, 85, { align: 'center' });

    // 2. BP Ativo
    doc.addPage();
    doc.setFontSize(16);
    doc.text("BALANÇO PATRIMONIAL - ATIVO", 15, 20);
    const bpAtivoData: any[] = STRUCTURE.BP_ATIVO.map(l => [
      l.label, 
      formatCurrency(Math.abs(cur.lineValues[l.id] || 0)), 
      formatCurrency(Math.abs(statementsState.prior.lineValues[l.id] || 0))
    ]);
    (doc as any).autoTable({
      startY: 30,
      head: [['Descrição', '2024', '2023']],
      body: bpAtivoData,
      theme: 'grid',
      headStyles: { fillColor: [0, 57, 166] },
      styles: { fontSize: 8 }
    });

    // 3. BP Passivo
    doc.addPage();
    doc.setFontSize(16);
    doc.text("BALANÇO PATRIMONIAL - PASSIVO E PL", 15, 20);
    const bpPassivoData: any[] = STRUCTURE.BP_PASSIVO.map(l => [
      l.label, 
      formatCurrency(Math.abs(cur.lineValues[l.id] || 0)), 
      formatCurrency(Math.abs(statementsState.prior.lineValues[l.id] || 0))
    ]);
    (doc as any).autoTable({
      startY: 30,
      head: [['Descrição', '2024', '2023']],
      body: bpPassivoData,
      theme: 'grid',
      headStyles: { fillColor: [0, 57, 166] },
      styles: { fontSize: 8 }
    });

    // 4. DRE
    doc.addPage();
    doc.setFontSize(16);
    doc.text("DEMONSTRAÇÃO DO RESULTADO (DRE)", 15, 20);
    const dreData = STRUCTURE.DRE.map(l => [
      l.label, 
      formatCurrency(cur.lineValues[l.id] || 0), 
      formatCurrency(statementsState.prior.lineValues[l.id] || 0)
    ]);
    (doc as any).autoTable({
      startY: 30,
      head: [['Descrição', '2024', '2023']],
      body: dreData,
      theme: 'grid',
      headStyles: { fillColor: [0, 57, 166] },
      styles: { fontSize: 8 }
    });

    // 5. DRA
    doc.addPage();
    doc.setFontSize(16);
    doc.text("DEMONSTRAÇÃO DO RESULTADO ABRANGENTE (DRA)", 15, 20);
    (doc as any).autoTable({
      startY: 30,
      head: [['Descrição', '2024', '2023']],
      body: [
        ['LUCRO LÍQUIDO DO EXERCÍCIO', formatCurrency(cur.netIncome), formatCurrency(statementsState.prior.netIncome)],
        ['Outros Resultados Abrangentes', '0,00', '0,00'],
        ['RESULTADO ABRANGENTE TOTAL', formatCurrency(cur.netIncome), formatCurrency(statementsState.prior.netIncome)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 57, 166] }
    });

    // 6. DMPL
    doc.addPage();
    doc.setFontSize(16);
    doc.text("DEMONSTRAÇÃO DAS MUTAÇÕES DO PL (DMPL)", 15, 20);
    const dmplData = [
      ['Saldo Anterior', formatCurrency(Math.abs(statementsState.prior.lineValues['2.3.01'] || 0)), formatCurrency(Math.abs(statementsState.prior.lineValues['2.3.02'] || 0)), formatCurrency(Math.abs(statementsState.prior.lineValues['2.3.03'] || 0)), formatCurrency(Math.abs(statementsState.prior.lineValues['2.3.TOTAL'] || 0))],
      ['Lucro Líquido', '-', '-', formatCurrency(cur.netIncome), formatCurrency(cur.netIncome)],
      ['Saldo Atual', formatCurrency(Math.abs(cur.lineValues['2.3.01'] || 0)), formatCurrency(Math.abs(cur.lineValues['2.3.02'] || 0)), formatCurrency(Math.abs(cur.lineValues['2.3.03'] || 0)), formatCurrency(Math.abs(cur.lineValues['2.3.TOTAL'] || 0))]
    ];
    (doc as any).autoTable({
      startY: 30,
      head: [['Eventos', 'Capital Social', 'Reservas', 'Lucros Acum.', 'Total PL']],
      body: dmplData,
      theme: 'grid',
      headStyles: { fillColor: [0, 57, 166] },
      styles: { fontSize: 8 }
    });

    // 7. DFC
    doc.addPage();
    doc.setFontSize(16);
    doc.text("DEMONSTRAÇÃO DO FLUXO DE CAIXA (DFC)", 15, 20);
    const dfcVars = statementsState.dfc.vars;
    const dfcData = [
      ['LUCRO LÍQUIDO DO EXERCÍCIO', formatCurrency(dfcVars.LUCRO)],
      ['(+) Depreciação e Amortização', formatCurrency(dfcVars.DEPR)],
      ['(=) Lucro líquido ajustado', formatCurrency(dfcVars.CAIXA_GERADO_AJUSTES)],
      ['Variações no Capital de Giro', formatCurrency(dfcVars.VAR_WC)],
      ['CAIXA LÍQUIDO DAS ATIV. OPERACIONAIS', formatCurrency(dfcVars.CAIXA_OPER)]
    ];
    (doc as any).autoTable({
      startY: 30,
      head: [['Descrição', 'Valor']],
      body: dfcData,
      theme: 'grid',
      headStyles: { fillColor: [0, 57, 166] }
    });

    // 8. Notes
    doc.addPage();
    doc.setFontSize(16);
    doc.text("NOTAS EXPLICATIVAS", 15, 20);
    let y = 35;
    Object.values(notesContent).forEach((note: string) => {
      const splitText = doc.splitTextToSize(note, 180);
      doc.setFontSize(10);
      if (y + (splitText.length * 5) > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitText, 15, y);
      y += (splitText.length * 5) + 10;
    });

    doc.save("Demonstracao_Financeira_MicroCaaS.pdf");
  }, [statementsState, notesContent, formatCurrency]);

  const handleExportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const cur = statementsState.current;
    
    // BP Tab
    const bpSheetData: (string | number)[][] = [["Descrição", "2024", "2023"]];
    STRUCTURE.BP_ATIVO.forEach(l => bpSheetData.push([l.label, Math.abs(cur.lineValues[l.id] || 0), Math.abs(statementsState.prior.lineValues[l.id] || 0)]));
    STRUCTURE.BP_PASSIVO.forEach(l => bpSheetData.push([l.label, Math.abs(cur.lineValues[l.id] || 0), Math.abs(statementsState.prior.lineValues[l.id] || 0)]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bpSheetData), "Balanço Patrimonial");

    // DRE Tab
    const dreSheetData: (string | number)[][] = [["Descrição", "2024", "2023"]];
    STRUCTURE.DRE.forEach(l => dreSheetData.push([l.label, cur.lineValues[l.id] || 0, statementsState.prior.lineValues[l.id] || 0]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dreSheetData), "DRE");

    // DRA Tab
    const draSheetData: (string | number)[][] = [
      ["Descrição", "2024", "2023"],
      ["LUCRO LÍQUIDO DO EXERCÍCIO", cur.netIncome, statementsState.prior.netIncome],
      ["Outros Resultados Abrangentes", 0, 0],
      ["RESULTADO ABRANGENTE TOTAL", cur.netIncome, statementsState.prior.netIncome]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(draSheetData), "DRA");

    // DMPL Tab
    const dmplSheetData: (string | number)[][] = [
      ["Eventos", "Capital Social", "Reservas", "Lucros Acum.", "Total PL"],
      ["Saldo Anterior", Math.abs(statementsState.prior.lineValues['2.3.01'] || 0), Math.abs(statementsState.prior.lineValues['2.3.02'] || 0), Math.abs(statementsState.prior.lineValues['2.3.03'] || 0), Math.abs(statementsState.prior.lineValues['2.3.TOTAL'] || 0)],
      ["Lucro Líquido", 0, 0, cur.netIncome, cur.netIncome],
      ["Saldo Atual", Math.abs(cur.lineValues['2.3.01'] || 0), Math.abs(cur.lineValues['2.3.02'] || 0), Math.abs(cur.lineValues['2.3.03'] || 0), Math.abs(cur.lineValues['2.3.TOTAL'] || 0)]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dmplSheetData), "DMPL");

    // DFC Tab
    const dfcVars = statementsState.dfc.vars;
    const dfcSheetData: (string | number)[][] = [
      ["Descrição", "Valor 2024"],
      ["LUCRO LÍQUIDO DO EXERCÍCIO", dfcVars.LUCRO],
      ["(+) Depreciação e Amortização", dfcVars.DEPR],
      ["(=) Lucro líquido ajustado", dfcVars.CAIXA_GERADO_AJUSTES],
      ["Variações no Capital de Giro", dfcVars.VAR_WC],
      ["CAIXA LÍQUIDO DAS ATIV. OPERACIONAIS", dfcVars.CAIXA_OPER]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dfcSheetData), "DFC");

    // TB Tab
    const tbSheetData: (string | number)[][] = [["Código", "Descrição", "Saldo Final", "Ano"]];
    accounts.forEach(a => tbSheetData.push([a.code, a.name, a.end, a.year]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tbSheetData), "Balancete Importado");

    XLSX.writeFile(wb, "Auditoria_Financeira_Nexus.xlsx");
  }, [statementsState, accounts]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    
    const reader = new FileReader();

    const processAccounts = (data: any[]) => {
      const validRows = data.filter(row => {
        const values = Object.values(row).map(v => String(v).toLowerCase());
        return values.some(v => v.includes('.') || /^\d+/.test(v));
      });

      const currentYearAccounts = validRows.map(row => {
        const code = String(row.codigo || row.Codigo || row.code || row.Account || row.Conta || '').trim();
        const name = String(row.descricao || row.Descricao || row.name || row.Description || row.Descricao || '').trim();
        
        return {
          code,
          name,
          begin: parseNumeric(row.saldo_anterior || row.SaldoAnterior || row.Anterior || 0),
          debit: parseNumeric(row.debito || row.Debito || 0),
          credit: parseNumeric(row.credito || row.Credito || 0),
          end: parseNumeric(row.saldo_atual || row.SaldoAtual || row.Atual || 0),
          year: 'current' as const,
          multiplier: 1
        };
      }).filter(a => a.code.length > 0 && a.name.length > 0);

      const priorYearAccounts = validRows.map(row => {
        const code = String(row.codigo || row.Codigo || row.code || row.Account || row.Conta || '').trim();
        const name = String(row.descricao || row.Descricao || row.name || row.Description || row.Descricao || '').trim();
        
        return {
          code,
          name,
          begin: 0,
          debit: 0,
          credit: 0,
          end: parseNumeric(row.saldo_anterior || row.SaldoAnterior || row.Anterior || 0),
          year: 'prior' as const,
          multiplier: 1
        };
      }).filter(a => a.code.length > 0 && a.name.length > 0 && a.end !== 0);

      const allAccounts = [...currentYearAccounts, ...priorYearAccounts];

      if (allAccounts.length === 0) {
        alert("Nenhuma conta válida encontrada. Certifique-se de que o arquivo contém colunas de 'codigo' e 'descricao' (ou similares).");
        setIsProcessing(false);
        return;
      }

      setAccounts(allAccounts);
      runAutoMapping(allAccounts);
      setActiveTab('mapping');
      setIsProcessing(false);
    };

    if (file.name.endsWith('.csv')) {
      // Read as text first to handle potential preambles by finding the header line
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/);
        
        // Find header row: the one with most accounting keywords
        let headerIndex = 0;
        let maxKeywords = 0;
        const keywords = ['codigo', 'descricao', 'saldo', 'debito', 'credito', 'account', 'description', 'balance'];
        
        lines.slice(0, 20).forEach((line, idx) => {
          const matched = keywords.filter(k => line.toLowerCase().includes(k)).length;
          if (matched > maxKeywords) {
            maxKeywords = matched;
            headerIndex = idx;
          }
        });

        const csvContent = lines.slice(headerIndex).join('\n');
        Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: 'greedy',
          complete: (results) => processAccounts(results.data),
          error: () => setIsProcessing(false)
        });
      };
      reader.readAsText(file);
    } else {
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];
        processAccounts(data);
      };
      reader.readAsBinaryString(file);
    }
  }, [runAutoMapping]);

  const updateMapping = (accCode: string, targetId: string) => {
    setMapping(prev => {
      const newMap = { ...prev };
      if (!targetId) delete newMap[accCode];
      else newMap[accCode] = targetId;
      return newMap;
    });
  };

  const getSourceAccounts = (lineId: string) => {
    return accounts.filter(acc => mapping[acc.code] === lineId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link to="/solucoes" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Box className="w-5 h-5 text-indigo-600" />
                <h1 className="text-xl font-black tracking-tight">{t.title}</h1>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setLang(l => l === 'pt' ? 'en' : 'pt')} className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{t.lang}</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        <nav className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {(Object.keys(t.tabs) as Array<keyof typeof t.tabs>).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest", activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-900 text-slate-500")}>
              {t.tabs[tab]}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed p-16 text-center border-slate-200 dark:border-slate-800">
               <input type="file" className="hidden" id="tb-upload" onChange={handleFileUpload} />
               <label htmlFor="tb-upload" className="cursor-pointer">
                  <FileSpreadsheet className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-black mb-2">{t.upload.title}</h2>
                  <p className="text-slate-500 mb-8">{t.upload.drop}</p>
               </label>
               <div className="flex flex-col items-center gap-4">
                 {isProcessing && <div className="flex items-center gap-2 text-indigo-600 animate-pulse font-bold text-xs"><Sparkles className="w-4 h-4" /> Processando arquivo...</div>}
               </div>
            </div>
          )}

          {activeTab === 'mapping' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
               <h2 className="text-xl font-black mb-6 flex items-center gap-2"><MapIcon className="w-5 h-5 text-indigo-600" /> Mapeamento de Contas</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {accounts.filter(a => a.year === 'current').map((acc, i) => (
                    <div key={i} className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700">
                       <span className="text-[10px] font-mono text-slate-400">{acc.code} - {acc.name}</span>
                       <select value={mapping[acc.code] || ''} onChange={(e) => updateMapping(acc.code, e.target.value)} className="bg-white dark:bg-slate-900 p-2 rounded-lg border text-sm">
                          <option value="">Não Mapeado</option>
                          {allLines.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                       </select>
                    </div>
                  ))}
               </div>
               <div className="flex justify-end mt-8">
                  <button onClick={() => setActiveTab('statements')} className="bg-indigo-600 text-white font-black px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors">Gerar Demonstrações</button>
               </div>
            </div>
          )}

          {activeTab === 'statements' && (
            <motion.div key="statements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               {/* Reconciliation Bar */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">TOTAL ATIVO</span>
                     <p className="text-xl font-bold">R$ {formatCurrency(reconciliation.current.assetSum)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">TOTAL PASSIVO + PL</span>
                     <p className="text-xl font-bold">R$ {formatCurrency(reconciliation.current.passivSum)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">DIFERENÇA (GAP)</span>
                     <p className={cn("text-xl font-bold", Math.abs(reconciliation.current.bpGap) < 1000 ? "text-emerald-600" : "text-rose-600")}>
                        R$ {formatCurrency(reconciliation.current.bpGap)}
                     </p>
                  </div>
                  <div 
                    onClick={() => {
                        const cur = reconciliation.current;
                        alert(`DIAGNÓSTICO DE CONCILIAÇÃO (SOMA ALGÉBRICA):\n\n` +
                              `1. SOMA ATIVO (D): R$ ${formatCurrency(cur.assetSigned)}\n` +
                              `2. SOMA PASSIVO (C): R$ ${formatCurrency(cur.passivSigned)}\n` +
                              `3. SOMA PL BASE (C): R$ ${formatCurrency(cur.plBaseSigned)}\n` +
                              `4. AJUSTE APLICADO (BRIDGE): R$ ${formatCurrency(cur.bridge)}\n` +
                              `----------------------------------\n` +
                              `TOTAL PASSIVO + PL FINAL: R$ ${formatCurrency(cur.passivSum)}\n\n` +
                              `RESULTADO: ${cur.isCertified ? 'EQUILIBRADO' : 'DIVERGENTE'}\n` +
                              `GAP FINAL: R$ ${formatCurrency(cur.bpGap)}\n\n` +
                              `Nota: O ajuste foi aplicado na conta 'Lucros/Prejuízos Acumulados' para fechar o balanço.`);
                    }}
                    className={cn("p-6 rounded-3xl flex items-center gap-3 cursor-pointer group transition-all transform hover:scale-[1.02]", reconciliation.current.isCertified ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200/50" : "bg-rose-600 text-white shadow-lg shadow-rose-200/50")}>
                     {reconciliation.current.isCertified ? <ShieldCheck className="w-8 h-8" /> : <AlertCircle className="w-8 h-8 group-hover:animate-bounce" />}
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block opacity-70">CERTIFICAÇÃO CONTÁBIL</span>
                        <p className="text-sm font-bold">{reconciliation.current.isCertified ? 'Padrão Ouro' : 'Verificar Divergência'}</p>
                     </div>
                  </div>
               </div>

               {/* A3: Reconciliação Técnica DRE x Balancete */}
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl", reconciliation.current.dreReconciled ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                      {reconciliation.current.dreReconciled ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight">Reconciliação DRE x Balancete</h4>
                      <p className="text-xs text-slate-500">Lucro na DRE ({formatCurrency(reconciliation.current.netIncome)}) vs Resultado no Balancete ({formatCurrency(reconciliation.current.tbDreResult)})</p>
                    </div>
                  </div>
                  {!reconciliation.current.dreReconciled && (
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase bg-rose-50 px-4 py-2 rounded-xl">
                       <AlertCircle className="w-4 h-4" /> Inconsistência DRE x Balancete detectada
                    </div>
                  )}
               </div>

               <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl w-full md:w-fit border dark:border-slate-800">
                     {(['BP', 'DRE', 'DRA', 'DMPL', 'DFC', 'RATIOS'] as const).map((st) => (
                       <button key={st} onClick={() => setActiveStatementTab(st)} className={cn("flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all", activeStatementTab === st ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-400")}>
                         {st === 'RATIOS' ? 'ÍNDICES' : st}
                       </button>
                     ))}
                  </div>
                  <button onClick={() => setShowOnlyCurrentYear(!showOnlyCurrentYear)} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-500 border dark:border-slate-700">{showOnlyCurrentYear ? 'Exibindo Ano Atual' : 'Exibir Apenas Ano Atual'}</button>
               </div>

               {activeStatementTab === 'RATIOS' && (
                  <div className="mt-8">
                    {!financialRatios ? (
                      <div className="bg-amber-50 border border-amber-200 p-12 rounded-[2.5rem] text-center">
                         <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                         <h3 className="text-xl font-bold text-amber-800">Cálculo Pendente</h3>
                         <p className="text-amber-600 max-w-md mx-auto mt-2">Os índices financeiros requerem reconciliação completa do BP e DRE.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. Liquidez Corrente */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all">
                          <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Liquidez Corrente</span>
                             <p className="text-4xl font-black text-indigo-600 group-hover:scale-105 transition-transform origin-left">{financialRatios.liqCorrente.toFixed(2)}</p>
                          </div>
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-slate-500">Base: BP 2024</span>
                                <span className="font-mono text-slate-300 uppercase">AC / PC</span>
                             </div>
                             <p className="text-[10px] text-slate-400 mt-2 font-medium">Solvência: Capacidade de pagar obrigações de curto prazo.</p>
                          </div>
                        </div>

                        {/* 2. Liquidez Seca */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all">
                          <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Liquidez Seca</span>
                             <p className="text-4xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{financialRatios.liqSeca.toFixed(2)}</p>
                          </div>
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-slate-500">Base: BP 2024</span>
                                <span className="font-mono text-slate-300 uppercase">(AC-Est) / PC</span>
                             </div>
                             <p className="text-[10px] text-slate-400 mt-2 font-medium">Solvência imediata desconsiderando os estoques.</p>
                          </div>
                        </div>

                        {/* 3. Margem Bruta */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all">
                          <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Margem Bruta</span>
                             <p className="text-4xl font-black text-emerald-600 group-hover:scale-105 transition-transform origin-left">{financialRatios.margemBruta.toFixed(1)}%</p>
                          </div>
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-slate-500">Base: DRE 2024</span>
                                <span className="font-mono text-slate-300 uppercase">LB / Receita</span>
                             </div>
                             <p className="text-[10px] text-slate-400 mt-2 font-medium">Eficiência na gestão de custos diretos.</p>
                          </div>
                        </div>

                        {/* 4. Margem Líquida */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all">
                          <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 md:mb-2 text-slate-400">Margem Líquida</span>
                             <p className="text-4xl font-black text-emerald-600 group-hover:scale-105 transition-transform origin-left">{financialRatios.margemLiq.toFixed(1)}%</p>
                          </div>
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-slate-500">Base: DRE 2024</span>
                                <span className="font-mono text-slate-300 uppercase">LL / Receita</span>
                             </div>
                             <p className="text-[10px] text-slate-400 mt-2 font-medium text-slate-400">Rentabilidade real para cada real vendido.</p>
                          </div>
                        </div>

                        {/* 5. EBITDA */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
                          <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 md:mb-2">EBITDA Anual</span>
                             <p className="text-2xl md:text-3xl font-black text-blue-600 group-hover:scale-105 transition-transform origin-left">R$ {formatCurrency(financialRatios.ebitda)}</p>
                          </div>
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-slate-500">Base: DRE 2024</span>
                                <span className="font-mono text-slate-300 uppercase">LOp + Depr</span>
                             </div>
                             <p className="text-[10px] text-slate-400 mt-2 font-medium leading-tight">Geração de caixa operacional bruto.</p>
                          </div>
                        </div>

                        {/* 6. Endividamento */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-rose-200 transition-all">
                          <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Endividamento Geral</span>
                             <p className="text-4xl font-black text-rose-600 group-hover:scale-105 transition-transform origin-left">{financialRatios.endividamento.toFixed(1)}%</p>
                          </div>
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-slate-500">Base: BP 2024</span>
                                <span className="font-mono text-slate-300 uppercase">PT / AT</span>
                             </div>
                             <p className="text-[10px] text-slate-400 mt-2 font-medium">Participação de capital de terceiros.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
               )}

               {activeStatementTab === 'BP' && (
                  <div className="mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                          <div className="p-8 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                            <h3 className="text-xl font-black uppercase tracking-tight">{t.statements.ativo}</h3>
                          </div>
                          <div className="p-8">
                             <table className="w-full text-xs md:text-sm">
                               <thead>
                                 <tr className="text-[10px] font-black text-slate-400 border-b uppercase">
                                   <th className="text-left w-12 py-3">Nota</th>
                                   <th className="text-left py-3">Item</th>
                                   <th className="text-right py-3">2024</th>
                                   {!showOnlyCurrentYear && <th className="text-right py-3">2023</th>}
                                 </tr>
                               </thead>
                               <tbody>
                                 {STRUCTURE.BP_ATIVO.map((line, i) => (
                                   <tr key={i} className={cn("border-b dark:border-slate-800/50 hover:bg-slate-50 transition-colors", line.isHeader && "bg-slate-50/50 italic", line.isTotal && "bg-slate-50 font-bold")}>
                                      <td className="py-3 text-[10px] text-slate-300">N01</td>
                                      <td className={cn("py-3", line.indent && "pl-8")}>{line.label}</td>
                                      <td className="py-3 text-right font-mono">{line.isHeader ? "" : formatCurrency(Math.abs(calculateLineValue(line.id, 'current')))}</td>
                                      {!showOnlyCurrentYear && <td className="py-3 text-right font-mono text-slate-400">{line.isHeader ? "" : formatCurrency(Math.abs(calculateLineValue(line.id, 'prior')))}</td>}
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                          </div>
                          <div className={cn("p-8 flex justify-between items-center font-black transition-all", !showOnlyCurrentYear ? "bg-slate-900 text-white" : "bg-indigo-600 text-white")}>
                             <span>{t.statements.totalAtivo}</span>
                             <div className="flex gap-8">
                                <span>R$ {formatCurrency(reconciliation.current.assetSum)}</span>
                                {!showOnlyCurrentYear && <span className="opacity-60 text-sm">R$ {formatCurrency(reconciliation.prior.assetSum)}</span>}
                             </div>
                          </div>
                       </div>

                       <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                          <div className="p-8 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                            <h3 className="text-xl font-black uppercase tracking-tight">{t.statements.passivo}</h3>
                          </div>
                          <div className="p-8">
                             <table className="w-full text-xs md:text-sm">
                               <thead>
                                 <tr className="text-[10px] font-black text-slate-400 border-b uppercase">
                                   <th className="text-left w-12 py-3">Nota</th>
                                   <th className="text-left py-3">Item</th>
                                   <th className="text-right py-3">2024</th>
                                   {!showOnlyCurrentYear && <th className="text-right py-3">2023</th>}
                                 </tr>
                               </thead>
                               <tbody>
                                 {STRUCTURE.BP_PASSIVO.map((line, i) => (
                                   <tr key={i} className={cn("border-b dark:border-slate-800/50 hover:bg-slate-50 transition-colors", line.isHeader && "bg-slate-50/50 italic", line.isTotal && "bg-slate-50 font-bold")}>
                                      <td className="py-3 text-[10px] text-slate-300">N02</td>
                                      <td className={cn("py-3", line.indent && "pl-8")}>{line.label}</td>
                                      <td className="py-3 text-right font-mono">{line.isHeader ? "" : formatCurrency(Math.abs(calculateLineValue(line.id, 'current')))}</td>
                                      {!showOnlyCurrentYear && <td className="py-3 text-right font-mono text-slate-400">{line.isHeader ? "" : formatCurrency(Math.abs(calculateLineValue(line.id, 'prior')))}</td>}
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                          </div>
                          <div className="bg-slate-900 text-white p-8 flex justify-between items-center font-black">
                             <span>{t.statements.totalPassivo}</span>
                             <div className="flex gap-8">
                                <span>R$ {formatCurrency(reconciliation.current.passivSum)}</span>
                                {!showOnlyCurrentYear && <span className="opacity-60 text-sm">R$ {formatCurrency(reconciliation.prior.passivSum)}</span>}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
               )}

               {activeStatementTab === 'DRE' && (
                 <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-12 max-w-4xl mx-auto shadow-sm">
                    <h3 className="text-2xl font-black mb-8 border-b pb-4 tracking-tight">{t.statements.dre}</h3>
                    <table className="w-full text-sm">
                       <thead><tr className="border-b text-[10px] font-black uppercase text-slate-400"><th className="text-left py-3">Descrição Operacional</th><th className="text-right py-3">2024</th>{!showOnlyCurrentYear && <th className="text-right py-3">2023</th>}</tr></thead>
                       <tbody>
                          {STRUCTURE.DRE.map(line => (
                            <tr key={line.id} className={cn("border-b dark:border-slate-800/50", line.isTotal && "font-black bg-slate-50/30")}>
                               <td className={cn("py-4 uppercase text-[11px]", line.indent && "pl-8 lowercase font-medium text-slate-500")}>{line.label}</td>
                               <td className={cn("py-4 text-right font-mono", line.highlight && "text-emerald-600 text-lg")}>{formatCurrency(calculateLineValue(line.id, 'current'))}</td>
                               {!showOnlyCurrentYear && <td className="py-4 text-right font-mono text-slate-400">{formatCurrency(calculateLineValue(line.id, 'prior'))}</td>}
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               )}

               {activeStatementTab === 'DRA' && (
                 <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-12 max-w-4xl mx-auto shadow-sm">
                   <h3 className="text-2xl font-black mb-8 border-b pb-4 tracking-tight">{t.statements.dra}</h3>
                   <table className="w-full text-sm">
                     <tbody>
                       <tr className="border-b"><td className="py-4 font-bold">LUCRO LÍQUIDO DO EXERCÍCIO</td><td className="py-4 text-right font-mono text-lg">{formatCurrency(calculateLineValue('3.06.03', 'current'))}</td></tr>
                       <tr className="border-b"><td className="py-4 pl-4 italic">Outros Resultados Abrangentes</td><td className="py-4 text-right font-mono italic">0,00</td></tr>
                       <tr className="bg-slate-50 font-black"><td className="py-4">RESULTADO ABRANGENTE TOTAL</td><td className="py-4 text-right font-mono text-xl">{formatCurrency(calculateLineValue('3.06.03', 'current'))}</td></tr>
                     </tbody>
                   </table>
                 </div>
               )}

               {activeStatementTab === 'DMPL' && (
                 <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-12 shadow-sm overflow-x-auto">
                   <h3 className="text-2xl font-black mb-8 border-b pb-4 tracking-tight">{t.statements.dmpl}</h3>
                   <table className="w-full text-xs min-w-[800px]">
                     <thead>
                       <tr className="border-b text-[10px] font-black uppercase text-slate-400">
                         <th className="text-left py-3">Eventos</th>
                         <th className="text-right py-3">Capital Social</th>
                         <th className="text-right py-3">Reservas</th>
                         <th className="text-right py-3">Lucros Acum.</th>
                         <th className="text-right py-3 font-black text-slate-900">Total PL</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr className="border-b">
                         <td className="py-4">Saldos em 31/12/2023</td>
                         <td className="text-right font-mono">{formatCurrency(Math.abs(calculateLineValue('2.3.01', 'prior')))}</td>
                         <td className="text-right font-mono">{formatCurrency(Math.abs(calculateLineValue('2.3.02', 'prior')))}</td>
                         <td className="text-right font-mono">{formatCurrency(Math.abs(calculateLineValue('2.3.03', 'prior')))}</td>
                         <td className="text-right font-mono font-bold bg-slate-50">{formatCurrency(Math.abs(calculateLineValue('2.3.TOTAL', 'prior')))}</td>
                       </tr>
                       <tr className="border-b">
                         <td className="py-4 pl-4 italic text-slate-500">Lucro Líquido do Exercício</td>
                         <td className="text-right">-</td>
                         <td className="text-right">-</td>
                         <td className="text-right font-mono text-emerald-600">{formatCurrency(calculateLineValue('3.06.03', 'current'))}</td>
                         <td className="text-right font-mono font-bold bg-slate-50">{formatCurrency(calculateLineValue('3.06.03', 'current'))}</td>
                       </tr>
                       <tr className="bg-slate-900 text-white font-black">
                         <td className="py-4">SALDOS EM 31/12/2024</td>
                         <td className="text-right font-mono">{formatCurrency(Math.abs(calculateLineValue('2.3.01', 'current')))}</td>
                         <td className="text-right font-mono">{formatCurrency(Math.abs(calculateLineValue('2.3.02', 'current')))}</td>
                         <td className="text-right font-mono">{formatCurrency(Math.abs(calculateLineValue('2.3.03', 'current')))}</td>
                         <td className="text-right font-mono text-indigo-400 text-lg">{formatCurrency(Math.abs(calculateLineValue('2.3.TOTAL', 'current')))}</td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
               )}

               {activeStatementTab === 'DFC' && (
                 <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-12 max-w-4xl mx-auto shadow-sm">
                   <h3 className="text-2xl font-black mb-8 border-b pb-4 tracking-tight">{t.statements.dfc} (Método Indireto)</h3>
                   <table className="w-full text-sm">
                     <tbody>
                       <tr className="bg-slate-50 font-bold"><td className="py-3 px-4" colSpan={2}>Fluxo de Caixa das Atividades Operacionais</td></tr>
                       <tr className="border-b"><td className="py-3 pl-8">Lucro Líquido do Exercício</td><td className="text-right font-mono pr-4">{formatCurrency(statementsState.dfc.vars.LUCRO)}</td></tr>
                       <tr className="border-b"><td className="py-3 pl-8">Ajustes para Reconciliar o Lucro:</td><td className="text-right font-mono pr-4"></td></tr>
                       <tr className="border-b"><td className="py-3 pl-12 font-medium text-slate-500">(+) Depreciação e Amortização</td><td className="text-right font-mono pr-4 text-emerald-600">+{formatCurrency(statementsState.dfc.vars.DEPR)}</td></tr>
                       <tr className="border-b font-bold bg-slate-50/50"><td className="py-3 pl-8">(=) Lucro líquido ajustado</td><td className="text-right font-mono pr-4">{formatCurrency(statementsState.dfc.vars.CAIXA_GERADO_AJUSTES)}</td></tr>
                       
                       {!statementsState.dfc.available ? (
                         <tr className="border-b bg-amber-50/50">
                           <td className="py-6 px-8 text-center text-[10px] uppercase font-black text-amber-600 tracking-widest" colSpan={2}>
                             Variações de capital de giro indisponíveis sem comparativo (ano anterior)
                           </td>
                         </tr>
                       ) : (
                         <>
                           <tr className="bg-slate-50 font-bold"><td className="py-3 px-4" colSpan={2}>Variações nos ativos e passivos operacionais:</td></tr>
                           {[
                             { label: '(Aum.) Red. em Contas a Receber', val: statementsState.dfc.vars.AR },
                             { label: '(Aum.) Red. em Estoques', val: statementsState.dfc.vars.INV },
                             { label: '(Aum.) Red. em Tributos a Recuperar', val: statementsState.dfc.vars.TAX_REC },
                             { label: '(Aum.) Red. em Outros Ativos', val: statementsState.dfc.vars.OTHER_ASSET },
                             { label: 'Aum. (Red.) em Fornecedores', val: statementsState.dfc.vars.SUPPLIER },
                             { label: 'Aum. (Red.) em Obrigações Tributárias', val: statementsState.dfc.vars.TAX_PAY },
                             { label: 'Aum. (Red.) em Obrigações Trabalhistas', val: statementsState.dfc.vars.PAYROLL }
                           ].map((v, idx) => (
                             <tr key={idx} className="border-b text-slate-600">
                               <td className="py-3 pl-8">{v.label}</td>
                               <td className={cn("text-right font-mono pr-4", v.val > 0 ? "text-emerald-600" : v.val < 0 ? "text-rose-600" : "")}>
                                 {v.val > 0 ? '+' : ''}{formatCurrency(v.val)}
                               </td>
                             </tr>
                           ))}
                         </>
                       )}
                       
                       <tr className="bg-slate-900 text-white font-black">
                         <td className="py-4 px-8 text-lg text-slate-100">CAIXA LÍQUIDO DAS ATIV. OPERACIONAIS</td>
                         <td className="text-right font-mono pr-4 text-xl">{formatCurrency(statementsState.dfc.vars.CAIXA_OPER)}</td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
               )}

            </motion.div>
          )}

          {activeTab === 'notes' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 p-16 shadow-sm">
               <h2 className="text-3xl font-black mb-12 underline">{t.notes.title}</h2>
               <div className="space-y-12 prose dark:prose-invert prose-slate max-w-none font-serif text-lg leading-relaxed">
                  {Object.entries(notesContent).map(([key, content]) => (
                    <section key={key} className="whitespace-pre-line p-8 bg-slate-50/50 dark:bg-slate-900 border dark:border-slate-800 rounded-3xl">
                       <textarea value={content} onChange={(e) => setNotesContent(p => ({ ...p, [key]: e.target.value }))} className="w-full bg-transparent border-none focus:ring-0 min-h-[100px] font-serif" />
                    </section>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'export' && (
             <div className="max-w-xl mx-auto text-center py-20 space-y-8">
                <Sparkles className="w-16 h-16 text-indigo-600 mx-auto" />
                <h2 className="text-3xl font-black">Exportar Demonstração</h2>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={handleExportPDF} className="bg-indigo-600 text-white font-black p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"><Download className="w-5 h-5" /> PDF Social</button>
                   <button onClick={handleExportExcel} className="bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-900 dark:text-white font-black p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"><FileSpreadsheet className="w-5 h-5" /> Auditoria Excel</button>
                </div>
             </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
