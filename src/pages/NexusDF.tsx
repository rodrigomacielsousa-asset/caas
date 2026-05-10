import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ArrowLeft, 
  Sparkles, 
  Map as MapIcon, 
  Download, 
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Box,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { cn } from '../lib/utils';
import { formatCurrency, parseNumberBR } from '../lib/format';

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

const COA_MAP: Record<string, string> = {
  // ATIVO CIRCULANTE
  '1.1.1.01': '1.1.01',
  '1.1.1.02': '1.1.01',
  '1.1.1.03': '1.1.01',
  '1.1.1.04': '1.1.01',
  '1.1.2.01': '1.1.02',
  '1.1.2.02': '1.1.02',
  '1.1.3': '1.1.03',
  '1.1.4.01': '1.1.04',
  '1.1.4.02': '1.1.04',
  '1.1.4.03': '1.1.05',
  '1.1.6.01': '1.1.06',
  '1.1.6.02': '1.1.06',
  '1.1.6.04': '1.1.07',
  '1.1.7.01': '1.1.08',
  '1.1.7.02': '1.1.08',
  '1.1.7.03': '1.1.08',
  '1.1.8.01': '1.1.09',
  '1.1.8.02': '1.1.10',

  // ATIVO NÃO CIRCULANTE
  '1.2.4': '1.2.01',
  '1.2.6': '1.2.02',
  '1.2.7': '1.2.03',
  '1.2.8': '1.2.04',
  '1.2.9.01': '1.2.05',
  '1.2.9.02': '1.2.06',
  '1.2.10.01': '1.2.07',
  '1.2.10.02': '1.2.08',

  // PASSIVO CIRCULANTE
  '2.1.1': '2.1.01',
  '2.1.2': '2.1.02',
  '2.1.3': '2.1.03',
  '2.1.4': '2.1.04',
  '2.1.5': '2.1.05',
  '2.1.6': '2.1.06',
  '2.1.7': '2.1.07',
  '2.1.8': '2.1.08',
  '2.1.9': '2.1.09',

  // PASSIVO NÃO CIRCULANTE
  '2.2.1': '2.2.01',
  '2.2.2': '2.2.02',
  '2.2.3': '2.2.03',
  '2.2.5': '2.2.04',

  // PATRIMÔNIO LÍQUIDO
  '3.1': '2.3.01',
  '3.3': '2.3.02',
  '3.4': '2.3.03',
  '3.6': '2.3.04',
  '3.7': '2.3.05',
  '3.8': '2.3.06',

  // DRE
  '4.1.01': '3.01',
  '4.1.02': '3.01',
  '4.3': '3.02',
  '4.4': '3.03',
  '5.1.01': '3.04',
  '5.1.02': '3.05',
  '5.2': '3.06',
  '5.3': '3.07',
  '5.5': '3.08',
  '5.6': '3.09',
  '5.7': '3.10',
  '5.8': '3.11',
  '5.9': '3.12',
  '5.10': '3.13'
};

const DESC_TO_CODE: Record<string, string> = {
  "caixa geral":"1.1.1.01",
  "bancos conta movimento":"1.1.1.02",
  "numerarios em transito":"1.1.1.03",
  "aplicacoes financeiras de curto prazo":"1.1.1.04",
  "titulos publicos":"1.1.2.01",
  "fundos di cdi":"1.1.2.02",
  "instrumentos financeiros derivativos ativo":"1.1.3",
  "clientes mercado interno":"1.1.4.01",
  "clientes exportacao":"1.1.4.02",
  "provisao perdas esperadas pec pdd":"1.1.4.03",
  "estoques commodities":"1.1.6.01",
  "estoques insumos":"1.1.6.02",
  "provisao para perdas em estoques":"1.1.6.04",
  "icms a recuperar":"1.1.7.03",
  "pis a recuperar":"1.1.7.01",
  "cofins a recuperar":"1.1.7.02",
  "adiantamento a fornecedores":"1.1.8.01",
  "despesas antecipadas":"1.1.8.02",
  "ir cs diferidos ativo":"1.2.4",
  "propriedades para investimento":"1.2.6",
  "ativo biologico":"1.2.7",
  "ativos de direito de uso arrendamentos":"1.2.8",
  "imobilizado bruto":"1.2.9.01",
  "depreciacao acumulada":"1.2.9.02",
  "intangivel bruto":"1.2.10.01",
  "amortizacao acumulada":"1.2.10.02",
  "fornecedores":"2.1.1",
  "emprestimos e financiamentos cp":"2.1.2",
  "instrumentos financeiros derivativos passivo":"2.1.3",
  "passivo de arrendamento cp":"2.1.4",
  "obrigacoes tributarias":"2.1.5",
  "obrigacoes trabalhistas":"2.1.6",
  "dividendos a pagar":"2.1.7",
  "jcp a pagar":"2.1.8",
  "provisoes e estimativas cp":"2.1.9",
  "emprestimos e financiamentos lp":"2.2.1",
  "passivo de arrendamento lp":"2.2.2",
  "provisoes para contingencias":"2.2.3",
  "ir cs diferidos passivo":"2.2.5",
  "capital social subscrito":"3.1",
  "reserva de capital":"3.3",
  "reserva legal":"3.4",
  "ajustes da avaliacao patrimonial ora oci":"3.6",
  "reservas de lucro":"3.7",
  "lucros prejuizos acumulados":"3.8",
  "receita mercado interno":"4.1.01",
  "receita exportacao":"4.1.02",
  "receitas financeiras":"4.3",
  "ganho com derivativos resultado":"4.4",
  "custo producao agricola":"5.1.01",
  "cmv mercadorias":"5.1.02",
  "despesas comerciais":"5.2",
  "despesas gerais e administrativas":"5.3",
  "despesas logisticas":"5.5",
  "despesas financeiras":"5.6",
  "perdas com derivativos resultado":"5.7",
  "ir e csll corrente":"5.8",
  "ir e csll diferido":"5.9",
  "depreciacao e amortizacao":"5.10"
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
interface Account {
  code: string;
  canonicalCode: string;
  name: string;
  begin: number;
  debit: number;
  credit: number;
  end: number;
  year: number;
  mappedTo?: string;
  multiplier: number;
}

// --- STATEMENT STRUCTURE DEFINITIONS ---
const STRUCTURE = {
  BP_ATIVO: [
    { id: '1.1', label: 'Ativo Circulante', isHeader: true },
    { id: '1.1.01', label: 'Caixa e equivalentes de caixa', indent: 1 },
    { id: '1.1.02', label: 'Títulos e valores mobiliários', indent: 1 },
    { id: '1.1.03', label: 'Derivativos (Ativo)', indent: 1 },
    { id: '1.1.04', label: 'Contas a receber de clientes', indent: 1 },
    { id: '1.1.05', label: '(-) PECLD/PDD', indent: 1 },
    { id: '1.1.06', label: 'Estoques', indent: 1 },
    { id: '1.1.07', label: '(-) Provisão para perdas em estoques', indent: 1 },
    { id: '1.1.08', label: 'Tributos a recuperar', indent: 1 },
    { id: '1.1.09', label: 'Adiantamentos a fornecedores', indent: 1 },
    { id: '1.1.10', label: 'Despesas antecipadas', indent: 1 },
    { id: '1.1.TOTAL', label: 'Total Ativo Circulante', isTotal: true },
    { id: '1.2', label: 'Ativo Não Circulante', isHeader: true },
    { id: '1.2.01', label: 'IR/CS diferidos (Ativo)', indent: 1 },
    { id: '1.2.02', label: 'Propriedades para investimento', indent: 1 },
    { id: '1.2.03', label: 'Ativo biológico', indent: 1 },
    { id: '1.2.04', label: 'Direito de uso (Arrendamentos)', indent: 1 },
    { id: '1.2.05', label: 'Imobilizado (bruto)', indent: 1 },
    { id: '1.2.06', label: '(-) Depreciação acumulada', indent: 1 },
    { id: '1.2.07', label: 'Intangível (bruto)', indent: 1 },
    { id: '1.2.08', label: '(-) Amortização acumulada', indent: 1 },
    { id: '1.2.99', label: 'Outros (Ativo) - Não mapeados', indent: 1 },
    { id: '1.2.TOTAL', label: 'Total Ativo Não Circulante', isTotal: true },
    { id: '1.TOTAL', label: 'TOTAL DO ATIVO', isTotal: true, highlight: true },
  ],
  BP_PASSIVO: [
    { id: '2.1', label: 'Passivo Circulante', isHeader: true },
    { id: '2.1.01', label: 'Fornecedores', indent: 1 },
    { id: '2.1.02', label: 'Empréstimos e financiamentos (CP)', indent: 1 },
    { id: '2.1.03', label: 'Derivativos (Passivo)', indent: 1 },
    { id: '2.1.04', label: 'Arrendamentos (CP)', indent: 1 },
    { id: '2.1.05', label: 'Obrigações tributárias', indent: 1 },
    { id: '2.1.06', label: 'Obrigações trabalhistas', indent: 1 },
    { id: '2.1.07', label: 'Dividendos a pagar', indent: 1 },
    { id: '2.1.08', label: 'JCP a pagar', indent: 1 },
    { id: '2.1.09', label: 'Provisões e estimativas (CP)', indent: 1 },
    { id: '2.1.TOTAL', label: 'Total Passivo Circulante', isTotal: true },
    { id: '2.2', label: 'Passivo Não Circulante', isHeader: true },
    { id: '2.2.01', label: 'Empréstimos e financiamentos (LP)', indent: 1 },
    { id: '2.2.02', label: 'Arrendamentos (LP)', indent: 1 },
    { id: '2.2.03', label: 'Provisões para contingências', indent: 1 },
    { id: '2.2.04', label: 'IR/CS diferidos (Passivo)', indent: 1 },
    { id: '2.2.TOTAL', label: 'Total Passivo Não Circulante', isTotal: true },
    { id: '2.PASSIVO_TOTAL', label: 'TOTAL DO PASSIVO', isTotal: true },
    { id: '2.3', label: 'Patrimônio Líquido', isHeader: true },
    { id: '2.3.01', label: 'Capital social', indent: 1 },
    { id: '2.3.02', label: 'Reserva de capital', indent: 1 },
    { id: '2.3.03', label: 'Reserva legal', indent: 1 },
    { id: '2.3.04', label: 'Ajustes de avaliação patrimonial (OCI)', indent: 1 },
    { id: '2.3.05', label: 'Reservas de lucro', indent: 1 },
    { id: '2.3.06', label: 'Lucros/Prejuízos acumulados', indent: 1 },
    { id: '2.3.07', label: 'Lucro/Prejuízo do Exercício', indent: 1, highlight: true },
    { id: '2.3.99', label: 'Outros (Passivo/PL) - Não mapeados', indent: 1 },
    { id: '2.3.TOTAL', label: 'TOTAL DO PL', isTotal: true },
    { id: '2.TOTAL', label: 'TOTAL PASSIVO + PL', isTotal: true, highlight: true },
  ],
  DRE: [
    { id: '3.01', label: 'Receita bruta', isHeader: false },
    { id: '3.02', label: 'Receitas financeiras', indent: 1 },
    { id: '3.03', label: 'Ganhos com derivativos', indent: 1 },
    { id: '3.04', label: '(-) Custos - produção agrícola', indent: 1 },
    { id: '3.05', label: '(-) Custos - CMV', indent: 1 },
    { id: '3.01.SUBTOTAL', label: '(=) MARGEM BRUTA', isTotal: true },
    { id: '3.06', label: '(-) Despesas comerciais', indent: 1 },
    { id: '3.07', label: '(-) Despesas gerais e administrativas', indent: 1 },
    { id: '3.08', label: '(-) Despesas logísticas', indent: 1 },
    { id: '3.09', label: '(-) Despesas financeiras', indent: 1 },
    { id: '3.10', label: '(-) Perdas com derivativos', indent: 1 },
    { id: '3.13', label: '(-) Depreciação e amortização', indent: 1 },
    { id: '3.04.SUBTOTAL', label: '(=) EBITDA ESTIMADO', isTotal: true },
    { id: '3.11', label: '(-) IR/CSLL corrente', indent: 1 },
    { id: '3.12', label: '(-) IR/CSLL diferido', indent: 1 },
    { id: '3.06.03', label: '(=) LUCRO LÍQUIDO DO EXERCÍCIO', isTotal: true, highlight: true },
  ],
  DRA: [
    { id: '4.01', label: 'Lucro Líquido do Exercício', isHeader: true },
    { id: '4.02', label: 'Outros Componentes do Resultado Abrangente', isHeader: true },
    { id: '4.03', label: 'Variação Cambial de Investimentos no Exterior', indent: 1 },
    { id: '4.04', label: 'Ajustes de Avaliação Patrimonial', indent: 1 },
    { id: '4.TOTAL', label: 'TOTAL DO RESULTADO ABRANGENTE', isTotal: true, highlight: true },
  ],
  DMPL: [
    { id: '5.01', label: 'Saldo Inicial', isHeader: true },
    { id: '5.02', label: 'Aumento de Capital', indent: 1 },
    { id: '5.03', label: 'Lucro Líquido do Exercício', indent: 1 },
    { id: '5.04', label: 'Destinações (Reservas/Dividendos)', indent: 1 },
    { id: '5.05', label: 'Ajustes de Avaliação Patrimonial', indent: 1 },
    { id: '5.TOTAL', label: 'Saldo Final', isTotal: true, highlight: true },
  ]
};

export default function NexusDF() {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [activeTab, setActiveTab] = useState<'upload' | 'mapping' | 'statements' | 'notes' | 'export'>('upload');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [detectedYears, setDetectedYears] = useState<number[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [mappingErrors, setMappingErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStatementTab, setActiveStatementTab] = useState<'BP' | 'DRE' | 'DRA' | 'DMPL' | 'DFC' | 'RATIOS' | 'NOTES'>('BP');
  const [showOnlyCurrentYear, setShowOnlyCurrentYear] = useState(true);

  const [auditData, setAuditData] = useState<{
    brutoAtivo: number;
    brutoPassivo: number;
    brutoPL: number;
    brutoDRE: number;
    totalLines: number;
    linesWithBalance: number;
  }>({ brutoAtivo: 0, brutoPassivo: 0, brutoPL: 0, brutoDRE: 0, totalLines: 0, linesWithBalance: 0 });

  const [missingAccountsByYear, setMissingAccountsByYear] = useState<Record<number, Account[]>>({});
  const [notesContent, setNotesContent] = useState<Record<string, string>>({});
  const [isNotesInitialized, setIsNotesInitialized] = useState(false);

  const t = TRANSLATIONS[lang];

  // --- LOGIC: MASTER STATEMENTS STATE ---
  const allLines = useMemo(() => {
    return [...STRUCTURE.BP_ATIVO, ...STRUCTURE.BP_PASSIVO, ...STRUCTURE.DRE];
  }, []);

const statementsState = useMemo(() => {
    const calculateYear = (pYear: number | null) => {
      if (!pYear) return null;
      const yearAccounts = accounts.filter(a => a.year === pYear);
      const lineValues: Record<string, number> = {};
      
      // Calculate DRE items first to get Net Income
      const revenueIds = ['3.01', '3.02', '3.03'];
      const expenseIds = ['3.04', '3.05', '3.06', '3.07', '3.08', '3.09', '3.10', '3.11', '3.12', '3.13'];
      
      const unmappedAccounts: Account[] = [];

      // Initial clear
      allLines.forEach(l => { if (!l.isHeader && !l.isTotal) lineValues[l.id] = 0; });

      yearAccounts.forEach(a => {
        const targetId = mapping[a.canonicalCode];
        if (targetId) {
          lineValues[targetId] = (lineValues[targetId] || 0) + a.end;
        } else {
          unmappedAccounts.push(a);
        }
      });

      // Calculated DRE Result
      const revenueSum = revenueIds.reduce((s, id) => s + Math.abs(lineValues[id] || 0), 0);
      const expenseSum = expenseIds.reduce((s, id) => s + Math.abs(lineValues[id] || 0), 0);
      const netIncome = revenueSum - expenseSum;

      // Map DRE items for display (inverting signs as appropriate)
      const dreDisplayValues: Record<string, number> = {};
      revenueIds.forEach(id => dreDisplayValues[id] = Math.abs(lineValues[id] || 0));
      expenseIds.forEach(id => dreDisplayValues[id] = -Math.abs(lineValues[id] || 0));

      dreDisplayValues['3.01.SUBTOTAL'] = dreDisplayValues['3.01'] + (dreDisplayValues['3.04'] || 0) + (dreDisplayValues['3.05'] || 0);
      dreDisplayValues['3.04.SUBTOTAL'] = dreDisplayValues['3.01.SUBTOTAL'] + 
                                          (dreDisplayValues['3.02'] || 0) +
                                          (dreDisplayValues['3.03'] || 0) +
                                          (dreDisplayValues['3.06'] || 0) +
                                          (dreDisplayValues['3.07'] || 0) +
                                          (dreDisplayValues['3.08'] || 0) +
                                          (dreDisplayValues['3.09'] || 0) +
                                          (dreDisplayValues['3.10'] || 0) +
                                          (dreDisplayValues['3.13'] || 0);
      dreDisplayValues['3.06.03'] = netIncome;

      Object.assign(lineValues, dreDisplayValues);

      // BP Closure: Inserir Lucro do Exercício no PL
      lineValues['2.3.07'] = netIncome;

      // Result from Balance Sheet accounts (4 and 5) - USING CANONICAL CODE
      const resultAccounts = yearAccounts.filter(a => a.canonicalCode.startsWith('4') || a.canonicalCode.startsWith('5'));
      const tbDreResult = -resultAccounts.reduce((s, a) => s + a.end, 0);

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
      const totalPassivPL = Math.abs(lineValues['2.TOTAL']);
      const dpv = Math.abs(lineValues['3.13'] || 0);

      const bpGap = Math.abs(totalAtivo - totalPassivPL);

      return {
        lineValues,
        assetSum: totalAtivo,
        passivSum: totalPassivPL,
        bpGap,
        netIncome,
        tbDreResult,
        dreReconciled: Math.abs(netIncome - tbDreResult) < 1,
        unmappedAccounts,
        bridge: 0,
        assetSigned: Math.abs(lineValues['1.TOTAL']), 
        passivSigned: Math.abs(lineValues['2.PASSIVO_TOTAL']), 
        plBaseSigned: Math.abs(lineValues['2.3.TOTAL']),
        dpv,
        isCertified: bpGap < 1 && yearAccounts.length > 0 && unmappedAccounts.length === 0
      };
    };

    const current = calculateYear(detectedYears[0]) || { lineValues: {}, assetSum: 0, passivSum: 0, bpGap: 0, netIncome: 0, tbDreResult: 0, dreReconciled: true, isCertified: false, dpv: 0 };
    const prior = calculateYear(detectedYears[1]) || { lineValues: {}, assetSum: 0, passivSum: 0, bpGap: 0, netIncome: 0, tbDreResult: 0, dreReconciled: true, isCertified: false, dpv: 0 };

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

  // --- UTILS ---
const normalizeDesc = (str: string): string => {
  if (!str) return '';
  return str
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeCode = (raw: any, desc: string): string => {
  const codeStr = String(raw || '').trim();
  const codeRegex = /^\d+(\.\d+){1,4}$/;
  const normD = normalizeDesc(desc);
  
  // Rule A: Valid format
  if (codeRegex.test(codeStr)) {
    // Rule C: Truncated fix for Depreciation
    if (codeStr === '5.1' && normD.includes('depreciacao e amortizacao')) {
      return '5.10';
    }
    return codeStr;
  }

  // Rule B: Recover from description dictionary (deterministic)
  const recovered = DESC_TO_CODE[normD];
  if (recovered) return recovered;

  return codeStr;
};

const fixEncoding = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/Ã§/g, 'ç')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã¢/g, 'â')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã£/g, 'ã')
    .replace(/Ã*/g, ' '); 
};

const runAutoMapping = useCallback((accs: Account[]) => {
  const newMapping: Record<string, string> = {};
  const missingInMap: string[] = [];

  accs.forEach(acc => {
    // 1. Strict Deterministic Map using CANONICAL CODE
    const targetId = COA_MAP[acc.canonicalCode];
    if (targetId) {
      newMapping[acc.canonicalCode] = targetId;
    } else if (acc.end !== 0) {
      // If it has balance but not in map, we track it
      missingInMap.push(acc.canonicalCode);
    }
  });

  if (missingInMap.length > 0) {
     setMappingErrors(Array.from(new Set(missingInMap)));
  } else {
     setMappingErrors([]);
  }

  setMapping(prev => ({ ...prev, ...newMapping }));
}, []);

  const financialRatios = useMemo(() => {
    if (accounts.length === 0) return null;
    const activeStatement = statementsState.current;
    if (!activeStatement.assetSum) return null;
    
    const getVal = (id: string) => activeStatement.lineValues[id] || 0;

    const ac = getVal('1.1.TOTAL');
    const pc = Math.max(1, Math.abs(getVal('2.1.TOTAL')));
    const ativoTotal = Math.max(1, activeStatement.assetSum);
    const receita = Math.max(1, getVal('3.01.SUBTOTAL'));
    const ll = getVal('3.06.03');

    return { 
      liqCorrente: ac / pc,
      liqSeca: (ac - Math.abs(getVal('1.1.05'))) / pc,
      endividamento: ((Math.abs(pc) + Math.abs(getVal('2.2.TOTAL'))) / ativoTotal) * 100,
      margemBruta: (getVal('3.02.SUBTOTAL') / receita) * 100,
      margemLiq: (ll / receita) * 100,
      ebitda: (getVal('3.04.SUBTOTAL') + Math.abs(getVal('3.04.04')))
    };
  }, [accounts, statementsState]);

  useEffect(() => {
    if (accounts.length > 0 && statementsState.current.isCertified && !isNotesInitialized) {
      const getVal = (id: string) => statementsState.current.lineValues[id] || 0;
      const getPrior = (id: string) => statementsState.prior.lineValues[id] || 0;

      const formatLine = (id: string) => {
        const val = Math.abs(getVal(id));
        const pVal = Math.abs(getPrior(id));
        const y1 = detectedYears[0];
        const y2 = detectedYears[1];
        if (!y2 || pVal === 0) return `R$ ${formatCurrency(val)}`;
        return `R$ ${formatCurrency(val)} (${y1}) e R$ ${formatCurrency(pVal)} (${y2})`;
      };

      const y1 = detectedYears[0];
      const initialNotes: Record<string, string> = {
        '1': `1. CONTEXTO OPERACIONAL\nA Companhia é uma sociedade limitada com sede no Brasil. Sua atividade principal é a produção e comercialização. A emissão destas demonstrações financeiras foi autorizada pela administração em 31 de março de ${y1 + 1}.`,
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
  }, [statementsState, isNotesInitialized, accounts.length]);

  const handleExportPDF = useCallback((type: 'FULL' | 'BP' | 'DRE' | 'DRA' | 'DMPL' | 'DFC' | 'RATIOS' | 'NOTES') => {
    const doc = new jsPDF() as any;
    const cur = statementsState.current;
    const pri = statementsState.prior;
    const y1 = detectedYears[0];
    const y2 = detectedYears[1];
    
    const addHeader = (title: string) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Exercícios findos em 31 de dezembro de ${y1}${y2 ? ` e ${y2}` : ''}`, 105, 28, { align: 'center' });
      doc.text("(Em Reais - R$)", 105, 34, { align: 'center' });
    };

    if (type === 'FULL' || type === 'BP') {
      addHeader("BALANÇO PATRIMONIAL");
      const bpData: any[] = [];
      STRUCTURE.BP_ATIVO.forEach(l => {
        const row = [l.indent ? "    " + l.label : l.label, l.isHeader ? "" : formatCurrency(Math.abs(cur.lineValues[l.id] || 0))];
        if (y2) row.push(l.isHeader ? "" : formatCurrency(Math.abs(pri.lineValues[l.id] || 0)));
        bpData.push(row);
      });
      STRUCTURE.BP_PASSIVO.forEach(l => {
        const row = [l.indent ? "    " + l.label : l.label, l.isHeader ? "" : formatCurrency(Math.abs(cur.lineValues[l.id] || 0))];
        if (y2) row.push(l.isHeader ? "" : formatCurrency(Math.abs(pri.lineValues[l.id] || 0)));
        bpData.push(row);
      });
      const bpHead = ['Descrição', String(y1)];
      if (y2) bpHead.push(String(y2));
      doc.autoTable({ 
        startY: 40, 
        head: [bpHead], 
        body: bpData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 }
      });
      if (type !== 'FULL') { doc.save(`NexusDF_BP_${y1}.pdf`); return; }
    }

    if (type === 'FULL' || type === 'DRE') {
      if (type === 'FULL' || doc.lastAutoTable) doc.addPage();
      addHeader("DEMONSTRAÇÃO DO RESULTADO");
      const dreData = STRUCTURE.DRE.map(l => {
        const row = [l.indent ? "    " + l.label : l.label, formatCurrency(cur.lineValues[l.id] || 0)];
        if (y2) row.push(formatCurrency(pri.lineValues[l.id] || 0));
        return row;
      });
      const dreHead = ['Descrição', String(y1)];
      if (y2) dreHead.push(String(y2));
      doc.autoTable({ 
        startY: 40, 
        head: [dreHead], 
        body: dreData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 }
      });
      if (type !== 'FULL') { doc.save(`NexusDF_DRE_${y1}.pdf`); return; }
    }

    if (type === 'FULL' || type === 'DRA') {
      if (type === 'FULL' || doc.lastAutoTable) doc.addPage();
      addHeader("RESULTADO ABRANGENTE");
      const draData: any[] = [
        ['Lucro Líquido do Exercício', formatCurrency(cur.netIncome), y2 ? formatCurrency(pri.netIncome) : ""],
        ['Outros Componentes Abrangentes', "", ""],
        ['    Variação Cambial e Ajustes OCI', formatCurrency(cur.lineValues['4.03'] || 0), y2 ? formatCurrency(pri.lineValues['4.03'] || 0) : ""],
        ['RESULTADO ABRANGENTE TOTAL', formatCurrency(cur.netIncome + (cur.lineValues['4.03'] || 0)), y2 ? formatCurrency(pri.netIncome + (pri.lineValues['4.03'] || 0)) : ""]
      ];
      doc.autoTable({ 
        startY: 40, 
        head: [['Descrição', String(y1), y2 ? String(y2) : ""]], 
        body: draData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
      });
      if (type !== 'FULL') { doc.save(`NexusDF_DRA_${y1}.pdf`); return; }
    }

    if (type === 'FULL' || type === 'RATIOS') {
      if (type === 'FULL' || doc.lastAutoTable) doc.addPage();
      addHeader("ÍNDICES FINANCEIROS");
      const r = financialRatios;
      if (r) {
        const ratioData = [
          ['Liquidez Corrente', r.liqCorrente.toFixed(2)],
          ['Liquidez Seca', r.liqSeca.toFixed(2)],
          ['Endividamento Geral', r.endividamento.toFixed(2) + '%'],
          ['Margem Bruta', r.margemBruta.toFixed(2) + '%'],
          ['Margem Líquida', r.margemLiq.toFixed(2) + '%'],
          ['EBITDA', formatCurrency(r.ebitda)]
        ];
        doc.autoTable({ 
          startY: 40, 
          head: [['Índice', 'Valor']], 
          body: ratioData,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] }
        });
      }
      if (type !== 'FULL') { doc.save(`NexusDF_Indices_${y1}.pdf`); return; }
    }

    if (type === 'FULL' || type === 'NOTES') {
      if (type === 'FULL') doc.addPage();
      addHeader("NOTAS EXPLICATIVAS");
      let yPos = 45;
      doc.setFontSize(9);
      Object.entries(notesContent).forEach(([_, content]) => {
        const splitText = doc.splitTextToSize(content, 180);
        if (yPos + splitText.length * 5 > 280) { doc.addPage(); yPos = 20; }
        doc.text(splitText, 15, yPos);
        yPos += (splitText.length * 6) + 10;
      });
      if (type !== 'FULL') { doc.save(`NexusDF_Notas_${y1}.pdf`); return; }
    }

    if (type === 'FULL') doc.save(`NexusDF_Completo_${y1}.pdf`);
  }, [statementsState, detectedYears, notesContent]);

  const handleExportXLSX = useCallback((type: string) => {
    const wb = XLSX.utils.book_new();
    const cur = statementsState.current;
    const pri = statementsState.prior;
    const y1 = detectedYears[0];
    const y2 = detectedYears[1];

    const formatData = (val: number) => val === 0 ? "-" : formatCurrency(val);

    if (type === 'BP' || type === 'FULL') {
      const rows: any[] = [['BALANÇO PATRIMONIAL'], [`Exercícios findos em 31 de dezembro de ${y1} ${y2 ? `e ${y2}` : ''}`], []];
      const head = ['Descrição', String(y1)];
      if (y2) head.push(String(y2));
      rows.push(head);

      STRUCTURE.BP_ATIVO.forEach(l => {
        const r = [l.label, l.isHeader ? "" : (cur.lineValues[l.id] || 0)];
        if (y2) r.push(l.isHeader ? "" : (pri.lineValues[l.id] || 0));
        rows.push(r);
      });
      STRUCTURE.BP_PASSIVO.forEach(l => {
        const r = [l.label, l.isHeader ? "" : (cur.lineValues[l.id] || 0)];
        if (y2) r.push(l.isHeader ? "" : (pri.lineValues[l.id] || 0));
        rows.push(r);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'BP');
    }

    if (type === 'DRE' || type === 'FULL') {
      const rows: any[] = [['DEMONSTRAÇÃO DO RESULTADO'], [`Exercícios findos em 31 de dezembro de ${y1} ${y2 ? `e ${y2}` : ''}`], []];
      const head = ['Descrição', String(y1)];
      if (y2) head.push(String(y2));
      rows.push(head);

      STRUCTURE.DRE.forEach(l => {
        const r = [l.label, (cur.lineValues[l.id] || 0)];
        if (y2) r.push((pri.lineValues[l.id] || 0));
        rows.push(r);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'DRE');
    }

    XLSX.writeFile(wb, `NexusDF_${type}_${y1}.xlsx`);
  }, [statementsState, detectedYears, financialRatios, notesContent]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as any[][];

        // Find header row and detect PERIODO year
        let headerIndex = -1;
        let fileYearFromPeriod: number | null = null;
        const keywords = ['codigo', 'code', 'conta', 'account', 'descricao', 'description', 'saldo', 'name', 'nome'];
        
        for (let i = 0; i < Math.min(rawData.length, 30); i++) {
          const row = rawData[i];
          if (!row) continue;
          
          const rowStr = row.join(' ').toUpperCase();
          // Priority to PERIODO and exclude strings like "GERADO EM"
          if ((rowStr.includes('PERIODO') || rowStr.includes('PERÍODO')) && !rowStr.includes('GERADO')) {
            const matches = rowStr.match(/\d{2}\/\d{2}\/(\d{4})/) || rowStr.match(/\d{4}/);
            if (matches) {
              fileYearFromPeriod = parseInt(matches[0].length === 4 ? matches[0] : matches[0].split('/')[2]);
            }
          }

          if (headerIndex === -1 && row.some(cell => {
            const c = normalizeDesc(String(cell || ''));
            return keywords.some(k => c.includes(k));
          })) {
            headerIndex = i;
          }
        }

        if (headerIndex === -1) headerIndex = 0;

        const headers = rawData[headerIndex].map(h => normalizeDesc(String(h || '')));
        const dataRows = rawData.slice(headerIndex + 1);
        
        // Detect years - Strict 2025 focus as per instruction
        const yearsFound = new Set<number>();
        if (fileYearFromPeriod) {
          yearsFound.add(fileYearFromPeriod);
        }

        // Only look for years in headers if they don't conflict with period
        headers.forEach(h => {
          const matches = h.match(/\d{4}/g);
          if (matches) {
            matches.forEach(m => {
              const y = parseInt(m);
              // Avoid picking up year 2026 if it looks like a generation date (usually > current/period year)
              if (fileYearFromPeriod && y > fileYearFromPeriod) return;
              yearsFound.add(y);
            });
          }
        });

        if (yearsFound.size === 0) {
          dataRows.forEach(row => {
            row.forEach(cell => {
              if (typeof cell === 'number' && cell > 2000 && cell < 2100) {
                 if (fileYearFromPeriod && cell > fileYearFromPeriod) return;
                 yearsFound.add(cell);
              }
            });
          });
        }
        
        let fileYears = Array.from(yearsFound).sort((a,b) => b-a);
        if (fileYears.length === 0) {
          fileYears = [new Date().getFullYear()]; 
        }
        setDetectedYears(fileYears);

        const newAccounts: Account[] = [];
        let brutoAtivo = 0;
        let brutoPassivo = 0;
        let brutoPL = 0;
        let brutoDRE = 0;
        let linesWithBalance = 0;
        
        dataRows.forEach((row, rowIdx) => {
          const acc: any = { code: '', name: '', canonicalCode: '' };
          let currentEnd = 0;
          let priorEnd = 0;
          let hasPriorValue = false;

          headers.forEach((h, idx) => {
            const val = row[idx];
            if (h.includes('codigo') || h.includes('code') || h === 'conta' || h.includes('acct')) {
              acc.code = String(val || '').trim();
            }
            else if (h.includes('descricao') || h.includes('description') || h === 'nome' || h === 'name') {
              acc.name = fixEncoding(String(val || '').trim());
            }
            else if (h.includes('atual') || h.includes('saldo') || (fileYears[0] && h.includes(String(fileYears[0]))) || h === 'saldo_atual') {
              if (h.includes('anterior') || (fileYears[1] && h.includes(String(fileYears[1]))) || h === 'saldo_anterior') {
                priorEnd += parseNumberBR(val);
                hasPriorValue = true;
              } else {
                currentEnd += parseNumberBR(val);
              }
            }
            else if (h.includes('anterior') || h.includes('begin') || (fileYears[1] && h.includes(String(fileYears[1]))) || h === 'saldo_anterior') {
              priorEnd += parseNumberBR(val);
              hasPriorValue = true;
            }
          });

          // PASSO 1 — NORMALIZAÇÃO DO CÓDIGO
          acc.canonicalCode = normalizeCode(acc.code, acc.name);

          if (acc.canonicalCode && acc.name) {
            const firstDigit = acc.canonicalCode[0];

            // BP: 1, 2, 3 | DRE: 4, 5
            if (firstDigit === '1') brutoAtivo += currentEnd;
            else if (firstDigit === '2') brutoPassivo += currentEnd;
            else if (firstDigit === '3') brutoPL += currentEnd;
            else if (firstDigit === '4' || firstDigit === '5') brutoDRE += currentEnd;

            if (currentEnd !== 0 || priorEnd !== 0) linesWithBalance++;

            if (fileYears[0]) {
              newAccounts.push({ 
                ...acc, 
                end: currentEnd, 
                year: fileYears[0], 
                multiplier: 1,
                begin: 0,
                debit: 0,
                credit: 0
              });
            }
            if (hasPriorValue && fileYears[1]) {
              newAccounts.push({ 
                ...acc, 
                end: priorEnd, 
                year: fileYears[1], 
                multiplier: 1,
                begin: 0,
                debit: 0,
                credit: 0
              });
            }
          }
        });

        if (newAccounts.length === 0) {
           throw new Error("Nenhuma conta com código e descrição foi encontrada no arquivo.");
        }

        setAuditData({
          brutoAtivo,
          brutoPassivo,
          brutoPL,
          brutoDRE,
          totalLines: dataRows.length,
          linesWithBalance
        });
        setAccounts(newAccounts);
        runAutoMapping(newAccounts);
        setActiveTab('mapping');
      } catch (err: any) {
        console.error("Erro no processamento:", err);
        alert(err.message || "Erro ao processar arquivo. Verifique o formato.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [runAutoMapping]);

  const pendingIssues = useMemo(() => {
    const issues: { id: string; title: string; message: string; targetTab: any; severity: string; elementId?: string }[] = [];
    if (accounts.length === 0) return [];
    
    // 1. Unmapped accounts (check both years if present) using canonicalCode
    const unmapped = accounts.filter(a => !mapping[a.canonicalCode]);
    if (unmapped.length > 0) {
      const uniqueCodes = Array.from(new Set(unmapped.map(a => a.canonicalCode)));
      issues.push({
        id: 'unmapped',
        title: 'Contas não mapeadas',
        message: `${uniqueCodes.length} contas do balancete aguardam classificação para compor as demonstrações.`,
        targetTab: 'mapping',
        severity: 'high',
        elementId: `acc-${uniqueCodes[0]}`
      });
    }

    // 2. GAP check
    if (statementsState.current.bpGap > 1) {
      issues.push({
        id: 'gap',
        title: 'Diferença Ativo x Passivo',
        message: `Balanço Patrimonial desequilibrado em R$ ${formatCurrency(statementsState.current.bpGap)} no ano atual.`,
        targetTab: 'statements',
        severity: 'high',
        elementId: 'bp-grid'
      });
    }

    // 3. DRE Reconciliation
    if (!statementsState.current.dreReconciled) {
      issues.push({
        id: 'dre',
        title: 'Reconciliação divergente',
        message: 'O lucro líquido na DRE diverge do resultado direto do balancete. Verifique o mapeamento das contas de resultado.',
        targetTab: 'statements',
        severity: 'high',
        elementId: 'reconciliation-block'
      });
    }

    return issues;
  }, [accounts, mapping, statementsState]);

  const scrollToIssues = (issue: any) => {
    setActiveTab(issue.targetTab);
    setTimeout(() => {
      const el = document.getElementById(issue.elementId || '');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-rose-500', 'ring-offset-4', 'transition-all', 'duration-1000');
        setTimeout(() => el.classList.remove('ring-4', 'ring-rose-500', 'ring-offset-4'), 3000);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/microcaas" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Box className="w-5 h-5 text-indigo-600" />
                <h1 className="text-xl font-black">{t.title}</h1>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'pt' ? 'en' : 'pt')} className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{t.lang}</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        <nav className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {(Object.keys(t.tabs) as Array<keyof typeof t.tabs>).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-900 text-slate-500")}>
              {t.tabs[tab]}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <div className="space-y-8">
              {accounts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* --- AUDITORIA DO BALANCETE --- */}
                  <div id="audit-panel" className="bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/30 p-8 rounded-[2.5rem] shadow-sm">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-indigo-600 uppercase tracking-tighter">
                       <ShieldCheck className="w-6 h-6" /> AUDITORIA DO BALANCETE (RAW vs BP)
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Totais Brutos (Balancete)</span>
                          <p className="text-[11px]">Ativo (1): <span className="font-bold">R$ {formatCurrency(Math.abs(auditData.brutoAtivo))}</span></p>
                          <p className="text-[11px]">Passivo (2): <span className="font-bold">R$ {formatCurrency(auditData.brutoPassivo)}</span></p>
                          <p className="text-[11px]">PL (3): <span className="font-bold">R$ {formatCurrency(auditData.brutoPL)}</span></p>
                          <p className="text-[11px]">DRE (4+5): <span className="font-bold">R$ {formatCurrency(auditData.brutoDRE)}</span></p>
                          <p className={cn("text-xs font-black mt-2", Math.abs(auditData.brutoAtivo + auditData.brutoPassivo + auditData.brutoPL + auditData.brutoDRE) < 1 ? "text-emerald-500" : "text-rose-500")}>
                             Gap Total: R$ {formatCurrency(auditData.brutoAtivo + auditData.brutoPassivo + auditData.brutoPL + auditData.brutoDRE)}
                          </p>
                       </div>
                       
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Integridade BP</span>
                          <p className="text-sm">PL Bruto + DRE: <span className="font-bold">R$ {formatCurrency(auditData.brutoPL + auditData.brutoDRE)}</span></p>
                          <p className="text-sm">Passivo + PL Total: <span className="font-bold">R$ {formatCurrency(auditData.brutoPassivo + auditData.brutoPL + auditData.brutoDRE)}</span></p>
                          <p className={cn("text-xs font-black", Math.abs(auditData.brutoAtivo + (auditData.brutoPassivo + auditData.brutoPL + auditData.brutoDRE)) < 1 ? "text-emerald-500" : "text-rose-500")}>
                             Status: {Math.abs(auditData.brutoAtivo + (auditData.brutoPassivo + auditData.brutoPL + auditData.brutoDRE)) < 1 ? "Equilibrado" : "Divergente"}
                          </p>
                       </div>

                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Reconciliação DRE x Balancete</span>
                          <p className="text-sm">Resultado (DRE): <span className="font-bold text-indigo-600">R$ {formatCurrency(statementsState.current.netIncome)}</span></p>
                          <p className="text-sm">Resultado (TB): <span className="font-bold text-slate-600">R$ {formatCurrency(statementsState.current.tbDreResult)}</span></p>
                          <p className={cn("text-xs font-black", statementsState.current.dreReconciled ? "text-emerald-500" : "text-rose-500")}>
                             {statementsState.current.dreReconciled ? "Sincronizado" : "Divergência Detectada"}
                          </p>
                       </div>

                       <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Resumo Arquivo</span>
                          <p className="text-xs">Anos: {detectedYears.join(', ')}</p>
                          <p className="text-xs">Contas totais: {auditData.totalLines}</p>
                          <p className="text-xs font-bold">Com Saldo: {auditData.linesWithBalance}</p>
                       </div>
                    </div>

                    {statementsState.current.unmappedAccounts.length > 0 && (
                      <div className="mt-8 border-t dark:border-slate-800 pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="space-y-1">
                               <h3 className="text-sm font-black text-rose-500 uppercase flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" /> CONTAS BP FORA DO BALANÇO (1, 2, 3)
                               </h3>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">
                                  Soma Gap BP: R$ {formatCurrency(statementsState.current.unmappedAccounts.filter(a => ['1', '2', '3'].includes(a.canonicalCode[0])).reduce((s, a) => s + a.end, 0))}
                               </p>
                            </div>
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-3 py-1 rounded-full uppercase">
                               {statementsState.current.unmappedAccounts.filter(a => ['1', '2', '3'].includes(a.canonicalCode[0])).length} pendências
                            </span>
                          </div>
                          
                          <div className="overflow-x-auto mb-8">
                             <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                   <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-400">
                                      <th className="p-3">Código</th>
                                      <th className="p-3">Descrição</th>
                                      <th className="p-3 text-right">Saldo</th>
                                      <th className="p-3 text-center">Tipo</th>
                                      <th className="p-3">Motivo</th>
                                      <th className="p-3 text-right">Ação</th>
                                   </tr>
                                </thead>
                                <tbody>
                                   {statementsState.current.unmappedAccounts
                                     .filter(acc => ['1', '2', '3'].includes(acc.canonicalCode[0]))
                                     .sort((a, b) => Math.abs(b.end) - Math.abs(a.end))
                                     .slice(0, 10)
                                     .map((acc, i) => {
                                      const first = acc.canonicalCode[0];
                                      const side = first === '1' ? 'Ativo' : (first === '2' ? 'Passivo' : (first === '3' ? 'PL' : 'Indefinido'));
                                      return (
                                      <tr key={i} className="border-b dark:border-slate-800 hover:bg-slate-50/50 transition-colors">
                                         <td className="p-3 font-mono">{acc.canonicalCode}</td>
                                         <td className="p-3 font-bold">{acc.name}</td>
                                         <td className="p-3 text-right text-rose-600 font-bold">R$ {formatCurrency(acc.end)}</td>
                                         <td className="p-3 text-center">
                                            <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase", 
                                               side === 'Ativo' ? "bg-emerald-100 text-emerald-600" : 
                                               side === 'Passivo' ? "bg-indigo-100 text-indigo-600" :
                                               side === 'PL' ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-600"
                                            )}>
                                               {side}
                                            </span>
                                         </td>
                                         <td className="p-3 italic text-slate-400 text-[10px]">não_mapeado_no_bp</td>
                                         <td className="p-3 text-right">
                                            <button onClick={() => { setActiveTab('mapping'); setTimeout(() => document.getElementById(`acc-${acc.canonicalCode}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Mapear</button>
                                         </td>
                                      </tr>
                                   )})}
                                </tbody>
                             </table>
                          </div>

                          {/* --- DRE UNMAPPED --- */}
                          {statementsState.current.unmappedAccounts.some(a => ['4', '5'].includes(a.canonicalCode[0])) && (
                            <div className="mt-4 pt-6 border-t dark:border-slate-800">
                               <div className="flex items-center justify-between mb-4">
                                  <div className="space-y-1">
                                     <h3 className="text-sm font-black text-amber-500 uppercase flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> CONTAS DE RESULTADO FORA DA DRE (4, 5)
                                     </h3>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase">
                                        Impacto no Lucro: R$ {formatCurrency(statementsState.current.unmappedAccounts.filter(a => ['4', '5'].includes(a.canonicalCode[0])).reduce((s, a) => s + a.end, 0))}
                                     </p>
                                  </div>
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-3 py-1 rounded-full uppercase">
                                     {statementsState.current.unmappedAccounts.filter(a => ['4', '5'].includes(a.canonicalCode[0])).length} pendências
                                  </span>
                               </div>
                               <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs border-collapse">
                                     <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-400">
                                           <th className="p-3">Código</th>
                                           <th className="p-3">Descrição</th>
                                           <th className="p-3 text-right">Saldo</th>
                                           <th className="p-3 text-right">Ação</th>
                                        </tr>
                                     </thead>
                                     <tbody>
                                        {statementsState.current.unmappedAccounts
                                          .filter(acc => ['4', '5'].includes(acc.canonicalCode[0]))
                                          .sort((a, b) => Math.abs(b.end) - Math.abs(a.end))
                                          .slice(0, 10)
                                          .map((acc, i) => (
                                          <tr key={i} className="border-b dark:border-slate-800 hover:bg-slate-50/50 transition-colors">
                                             <td className="p-3 font-mono">{acc.canonicalCode}</td>
                                             <td className="p-3 font-bold">{acc.name}</td>
                                             <td className="p-3 text-right text-amber-600 font-bold">R$ {formatCurrency(acc.end)}</td>
                                             <td className="p-3 text-right">
                                                <button onClick={() => { setActiveTab('mapping'); setTimeout(() => document.getElementById(`acc-${acc.canonicalCode}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Mapear</button>
                                             </td>
                                          </tr>
                                        ))}
                                     </tbody>
                                  </table>
                               </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 p-6 rounded-3xl">
                       <span className="text-[10px] font-black text-slate-400 uppercase">ATIVO ({detectedYears[0]})</span>
                       <p className="text-xl font-bold">R$ {formatCurrency(statementsState.current.assetSum)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 p-6 rounded-3xl">
                       <span className="text-[10px] font-black text-slate-400 uppercase">PASSIVO + PL ({detectedYears[0]})</span>
                       <p className="text-xl font-bold">R$ {formatCurrency(statementsState.current.passivSum)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 p-6 rounded-3xl">
                       <span className="text-[10px] font-black text-slate-400 uppercase">DIFERENÇA (GAP)</span>
                       <p className={cn("text-xl font-bold", statementsState.current.bpGap < 1 ? "text-emerald-500" : "text-rose-500")}>R$ {formatCurrency(statementsState.current.bpGap)}</p>
                    </div>
                    <div className={cn("p-6 rounded-3xl flex items-center gap-3 text-white", (statementsState.current.isCertified) ? "bg-emerald-600" : "bg-rose-600")}>
                       {statementsState.current.isCertified ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                       <div className="flex-1">
                         <p className="text-[10px] font-black uppercase opacity-80">CERTIFICAÇÃO</p>
                         <p className="text-sm font-bold">{statementsState.current.isCertified ? "Padrão Ouro - Auditado" : "Revisão Necessária"}</p>
                       </div>
                       {!statementsState.current.isCertified && (
                          <button onClick={() => {
                             const el = document.getElementById('audit-panel');
                             if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }} className="bg-white text-rose-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-rose-50">
                             Ver Pendências
                          </button>
                       )}
                    </div>
                  </div>

                  {pendingIssues.length > 0 && (
                    <div className="flex flex-wrap gap-4 items-center bg-rose-50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                       <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase">
                          <AlertCircle className="w-4 h-4" /> Pendências Detectadas:
                       </div>
                       {pendingIssues.map(issue => (
                         <button key={issue.id} onClick={() => scrollToIssues(issue)} className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full text-[10px] font-bold border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                           {issue.title}
                         </button>
                       ))}
                    </div>
                  )}
                </motion.div>
              )}
              
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed p-16 text-center border-slate-200 dark:border-slate-800">
                <input type="file" className="hidden" id="tb-upload" onChange={handleFileUpload} />
                <label htmlFor="tb-upload" className="cursor-pointer">
                    <FileSpreadsheet className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-black mb-2">{t.upload.title} </h2>
                    <p className="text-slate-500 mb-8">{t.upload.drop}</p>
                </label>
                {isProcessing && <div className="text-indigo-600 animate-pulse font-bold text-xs uppercase tracking-tighter">Sincronizando Base de Dados...</div>}
                
                {accounts.length > 0 && (
                  <div className="mt-8 flex justify-center gap-4">
                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                      {accounts.filter(a => a.year === detectedYears[0]).length} Contas {detectedYears[0]} Carregadas
                    </div>
                    {detectedYears[1] && accounts.some(a => a.year === detectedYears[1]) && (
                      <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full text-[10px] font-black uppercase">
                        {accounts.filter(a => a.year === detectedYears[1]).length} Contas {detectedYears[1]} Carregadas
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'mapping' && (
            <div id="mapping-root" className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
               <h2 className="text-xl font-black mb-6 flex items-center justify-between">
                 Mapeamento
                 <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
                    {accounts.filter(a => mapping[a.canonicalCode]).length} / {accounts.length} mapeados
                 </span>
               </h2>
               
               {mappingErrors.length > 0 && (
                  <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/30 rounded-3xl">
                     <h3 className="text-rose-600 dark:text-rose-400 font-black text-sm uppercase flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5" /> ERRO DE AUTO-MAPEAMENTO: CÓDIGOS NÃO ENCONTRADOS
                     </h3>
                     <p className="text-xs text-rose-500 mb-4 font-bold">Os seguintes códigos do balancete não possuem correspondência no COA_MAP e precisam de atenção:</p>
                     <div className="flex flex-wrap gap-2">
                        {mappingErrors.map(code => (
                           <span key={code} className="bg-white dark:bg-slate-900 text-[10px] font-mono font-bold px-2 py-1 rounded-lg border border-rose-200">{code}</span>
                        ))}
                     </div>
                  </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from(new Set(accounts.map(a => a.canonicalCode))).sort().map((code) => {
                    const acc = accounts.find(a => a.canonicalCode === code)!;
                    return (
                    <div key={code} id={`acc-${code}`} className={cn("flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border transition-all", !mapping[code] ? "border-rose-200 bg-rose-50/30" : "dark:border-slate-700")}>
                       <div className="flex justify-between items-start">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">Canonical: {code}</span>
                            <span className="text-[9px] font-mono text-slate-300 italic">Original: {acc.code}</span>
                         </div>
                         {!mapping[code] && <AlertCircle className="w-3 h-3 text-rose-500" />}
                       </div>
                       <span className="text-xs font-bold truncate">{acc.name}</span>
                       <select value={mapping[code] || ''} onChange={(e) => {
                          const val = e.target.value;
                          setMapping(p => {
                            const nm = { ...p };
                            nm[code as string] = val;
                            return nm;
                          });
                       }} className="bg-white dark:bg-slate-900 p-2 rounded-lg border text-sm mt-1">
                           <option value="">Não Mapeado</option>
                           {allLines.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                        </select>
                     </div>
                  )})}
               </div>
               <div className="flex justify-end mt-8 gap-4">
                  {mappingErrors.length > 0 && (
                     <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase">
                        Corrija os erros de mapeamento para prosseguir
                     </div>
                  )}
                  <button 
                     disabled={mappingErrors.length > 0}
                     onClick={() => setActiveTab('statements')} 
                     className={cn("font-black px-8 py-3 rounded-xl transition-all", mappingErrors.length > 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-indigo-600 text-white shadow-lg")}
                  >
                     Próximo
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'statements' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               {/* --- RECONCILIAÇÃO BLOCK --- */}
               <div id="reconciliation-block" className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl overflow-hidden shadow-sm p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-indigo-900 dark:text-indigo-100 font-black uppercase text-sm flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5" /> RECONCILIAÇÃO DRE x BALANCETE
                    </h2>
                    <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase", statementsState.current.dreReconciled ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                      {statementsState.current.dreReconciled ? "Sincronizado" : "Divergente"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-white/20">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Lucro Líquido (DRE)</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {formatCurrency(statementsState.current.netIncome)}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-white/20">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Lucro/Prejuízo Exercício (PL)</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {formatCurrency(statementsState.current.lineValues['2.3.07'])}</p>
                    </div>
                    <div className={cn("p-6 rounded-2xl border bg-white/50 dark:bg-slate-900/50", Math.abs(statementsState.current.netIncome - statementsState.current.lineValues['2.3.07']) < 1 ? "border-emerald-200" : "border-rose-200")}>
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Divergência</span>
                      <p className={cn("text-2xl font-black", Math.abs(statementsState.current.netIncome - statementsState.current.lineValues['2.3.07']) < 1 ? "text-emerald-500" : "text-rose-500")}>
                        R$ {formatCurrency(Math.abs(statementsState.current.netIncome - statementsState.current.lineValues['2.3.07']))}
                      </p>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 p-6 rounded-3xl">
                     <span className="text-[10px] font-black text-slate-400 uppercase">ATIVO ({detectedYears[0]})</span>
                     <p className="text-xl font-bold">R$ {formatCurrency(statementsState.current.assetSum)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 p-6 rounded-3xl">
                     <span className="text-[10px] font-black text-slate-400 uppercase">PASSIVO + PL ({detectedYears[0]})</span>
                     <p className="text-xl font-bold">R$ {formatCurrency(statementsState.current.passivSum)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 p-6 rounded-3xl">
                     <span className="text-[10px] font-black text-slate-400 uppercase">GAP BALANÇO</span>
                     <p className={cn("text-xl font-bold", statementsState.current.bpGap < 1 ? "text-emerald-500" : "text-rose-500")}>
                        R$ {formatCurrency(statementsState.current.bpGap)}
                     </p>
                  </div>
                  <div className={cn("p-6 rounded-3xl flex items-center gap-3 text-white", (statementsState.current.isCertified) ? "bg-emerald-600" : "bg-rose-600")}>
                     <ShieldCheck className="w-8 h-8" />
                     <div className="flex-1">
                        <span className="text-[10px] font-black uppercase block opacity-70">CERTIFICAÇÃO</span>
                        <p className="text-sm font-bold">{(statementsState.current.isCertified) ? 'Padrão Ouro' : 'Revisão Necessária'}</p>
                     </div>
                     {!statementsState.current.isCertified && (
                        <button onClick={() => setActiveTab('upload')} className="bg-white text-rose-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-rose-50">
                           Ver Pendências
                        </button>
                     )}
                  </div>
               </div>

               <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl w-fit border dark:border-slate-800">
                 {(['BP', 'DRE', 'DRA', 'DMPL', 'DFC', 'RATIOS', 'NOTES'] as const).map((st) => (
                   <button key={st} onClick={() => setActiveStatementTab(st)} className={cn("px-6 py-2 rounded-xl text-[10px] font-black transition-all", activeStatementTab === st ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-400")}>
                     {st}
                   </button>
                 ))}
                 <button onClick={() => setShowOnlyCurrentYear(!showOnlyCurrentYear)} className={cn("ml-4 px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2", showOnlyCurrentYear ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700")}>
                   {showOnlyCurrentYear ? "Exibindo: Ano Atual" : "Exibindo: Comparativo"}
                 </button>
               </div>

               {activeStatementTab === 'BP' && (
                  <div id="bp-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-8 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800"><h3 className="font-black uppercase">{t.statements.ativo}</h3></div>
                        <div className="p-8"><table className="w-full text-sm">
                           <thead>
                             <tr className="text-[10px] font-black text-slate-400 uppercase border-b dark:border-slate-800">
                               <th className="text-left pb-4">Descrição</th>
                               <th className="text-right pb-4">{detectedYears[0]}</th>
                               {!showOnlyCurrentYear && detectedYears[1] && <th className="text-right pb-4">{detectedYears[1]}</th>}
                             </tr>
                           </thead>
                           <tbody>
                            {STRUCTURE.BP_ATIVO.map((l, i) => (
                              <tr key={i} className={cn("border-b dark:border-slate-800/50", l.isTotal && "font-black bg-slate-100/50 dark:bg-slate-800/30")}>
                                <td className={cn("py-3", l.indent && "pl-8")}>{l.label}</td>
                                <td className="py-3 text-right font-mono">{l.isHeader ? "" : formatCurrency(Math.abs(statementsState.current.lineValues[l.id] || 0))}</td>
                                {!showOnlyCurrentYear && detectedYears[1] && (
                                  <td className="py-3 text-right font-mono text-slate-400">{l.isHeader ? "" : formatCurrency(Math.abs(statementsState.prior.lineValues[l.id] || 0))}</td>
                                )}
                              </tr>
                            ))}
                        </tbody></table></div>
                     </div>
                     <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-8 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800"><h3 className="font-black uppercase">{t.statements.passivo}</h3></div>
                        <div className="p-8"><table className="w-full text-sm">
                           <thead>
                             <tr className="text-[10px] font-black text-slate-400 uppercase border-b dark:border-slate-800">
                               <th className="text-left pb-4">Descrição</th>
                               <th className="text-right pb-4">{detectedYears[0]}</th>
                               {!showOnlyCurrentYear && detectedYears[1] && <th className="text-right pb-4">{detectedYears[1]}</th>}
                             </tr>
                           </thead>
                           <tbody>
                            {STRUCTURE.BP_PASSIVO.map((l, i) => (
                              <tr key={i} className={cn("border-b dark:border-slate-800/50", l.isTotal && "font-black bg-slate-100/50 dark:bg-slate-800/30")}>
                                <td className={cn("py-3", l.indent && "pl-8")}>{l.label}</td>
                                <td className="py-3 text-right font-mono">{l.isHeader ? "" : formatCurrency(Math.abs(statementsState.current.lineValues[l.id] || 0))}</td>
                                {!showOnlyCurrentYear && detectedYears[1] && (
                                  <td className="py-3 text-right font-mono text-slate-400">{l.isHeader ? "" : formatCurrency(Math.abs(statementsState.prior.lineValues[l.id] || 0))}</td>
                                )}
                              </tr>
                            ))}
                        </tbody></table></div>
                     </div>
                  </div>
               )}

               {activeStatementTab === 'DRE' && (
                  <div id="dre-grid" className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 flex justify-between items-center">
                       <h3 className="font-black uppercase">Demonstração do Resultado</h3>
                    </div>
                    <div className="p-8">
                      <table className="w-full text-sm">
                         <thead>
                           <tr className="text-[10px] font-black text-slate-400 uppercase">
                             <th className="text-left pb-4">Descrição</th>
                             <th className="text-right pb-4">{detectedYears[0]}</th>
                             {!showOnlyCurrentYear && detectedYears[1] && <th className="text-right pb-4">{detectedYears[1]}</th>}
                           </tr>
                         </thead>
                         <tbody>
                           {STRUCTURE.DRE.map((l, i) => (
                             <tr key={i} className={cn("border-b dark:border-slate-800/50", l.isTotal && "font-black bg-slate-50 dark:bg-slate-800/50")}>
                               <td className={cn("py-3", (l.indent || 0) > 0 && "pl-8")}>{l.label}</td>
                               <td className="py-3 text-right font-mono">{formatCurrency(statementsState.current.lineValues[l.id] || 0)}</td>
                               {!showOnlyCurrentYear && detectedYears[1] && (
                                 <td className="py-3 text-right font-mono text-slate-400">{formatCurrency(statementsState.prior.lineValues[l.id] || 0)}</td>
                               )}
                             </tr>
                           ))}
                         </tbody>
                       </table>
                    </div>
                  </div>
               )}

               {activeStatementTab === 'DRA' && (
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800"><h3 className="font-black uppercase">Resultado Abrangente</h3></div>
                    <div className="p-8">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[10px] font-black text-slate-400 uppercase">
                            <th className="text-left pb-4">Descrição</th>
                            <th className="text-right pb-4">{detectedYears[0]}</th>
                            {detectedYears[1] && <th className="text-right pb-4">{detectedYears[1]}</th>}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b dark:border-slate-800/50">
                            <td className="py-3">Lucro Líquido do Exercício</td>
                            <td className="py-3 text-right font-mono">{formatCurrency(statementsState.current.netIncome || 0)}</td>
                            {detectedYears[1] && (
                               <td className="py-3 text-right font-mono text-slate-400">{formatCurrency(statementsState.prior.netIncome || 0)}</td>
                            )}
                          </tr>
                          <tr className="border-b dark:border-slate-800/50 font-bold bg-slate-50/50">
                            <td className="py-3" colSpan={detectedYears[1] ? 3 : 2}>Outros Componentes Abrangentes</td>
                          </tr>
                          <tr className="border-b dark:border-slate-800/50">
                            <td className="py-3 pl-8">Variação Cambial e Ajustes OCI</td>
                            <td className="py-3 text-right font-mono">{formatCurrency(statementsState.current.lineValues['4.03'] || 0)}</td>
                            {detectedYears[1] && (
                              <td className="py-3 text-right font-mono text-slate-400">{formatCurrency(statementsState.prior.lineValues['4.03'] || 0)}</td>
                            )}
                          </tr>
                          <tr className="font-black bg-slate-50 dark:bg-slate-800 border-t">
                            <td className="py-4 uppercase tracking-wider">Resultado Abrangente Total</td>
                            <td className="py-4 text-right font-mono">{formatCurrency(statementsState.current.netIncome + (statementsState.current.lineValues['4.03'] || 0))}</td>
                            {detectedYears[1] && (
                               <td className="py-4 text-right font-mono text-slate-400">{formatCurrency(statementsState.prior.netIncome + (statementsState.prior.lineValues['4.03'] || 0))}</td>
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
               )}

               {activeStatementTab === 'DMPL' && (
                  <div id="dmpl-grid" className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800"><h3 className="font-black uppercase">Mutações do Patrimônio Líquido</h3></div>
                    <div className="p-8">
                       <table className="w-full text-xs">
                          <thead>
                             <tr className="text-[10px] font-black text-slate-400 uppercase">
                                <th className="text-left pb-4">Descrição</th>
                                <th className="text-right pb-4">Capital Social</th>
                                <th className="text-right pb-4">Reservas</th>
                                <th className="text-right pb-4">Lucros Acum.</th>
                                <th className="text-right pb-4">Total PL</th>
                             </tr>
                          </thead>
                          <tbody>
                             <tr className="border-b dark:border-slate-800/50 font-bold">
                                <td className="py-3">Saldos em 31/12/{detectedYears[1] || 'Anterior'}</td>
                                <td className="py-3 text-right font-mono">{formatCurrency(statementsState.prior.lineValues['2.3.01'] || 0)}</td>
                                <td className="py-3 text-right font-mono">{formatCurrency(statementsState.prior.lineValues['2.3.02'] || 0)}</td>
                                <td className="py-3 text-right font-mono">{formatCurrency(statementsState.prior.lineValues['2.3.03'] || 0)}</td>
                                <td className="py-3 text-right font-mono">{formatCurrency(statementsState.prior.lineValues['2.3.TOTAL'] || 0)}</td>
                             </tr>
                             <tr className="border-b dark:border-slate-800/50">
                                <td className="py-3">Lucro Líquido do Exercício</td>
                                <td className="py-3 text-right">-</td>
                                <td className="py-3 text-right">-</td>
                                <td className="py-3 text-right font-mono">{formatCurrency(statementsState.current.netIncome || 0)}</td>
                                <td className="py-3 text-right font-mono">{formatCurrency(statementsState.current.netIncome || 0)}</td>
                             </tr>
                             <tr className="border-b dark:border-slate-800/50 font-black bg-slate-50 dark:bg-slate-800">
                                <td className="py-4">Saldos em 31/12/{detectedYears[0] || 'Atual'}</td>
                                <td className="py-4 text-right font-mono">{formatCurrency(statementsState.current.lineValues['2.3.01'] || 0)}</td>
                                <td className="py-4 text-right font-mono">{formatCurrency(statementsState.current.lineValues['2.3.02'] || 0)}</td>
                                <td className="py-4 text-right font-mono">{formatCurrency(statementsState.current.lineValues['2.3.03'] || 0)}</td>
                                <td className="py-4 text-right font-mono">{formatCurrency(statementsState.current.lineValues['2.3.TOTAL'] || 0)}</td>
                             </tr>
                          </tbody>
                       </table>
                    </div>
                  </div>
               )}

               {activeStatementTab === 'DFC' && (
                  <div id="dfc-grid" className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800"><h3 className="font-black uppercase">Fluxo de Caixa (Indireto)</h3></div>
                    <div className="p-8">
                      {!statementsState.dfc.available ? (
                        <div className="p-12 text-center text-slate-400 font-bold">Importe o Ano Anterior para gerar a DFC comparativa.</div>
                      ) : (
                        <table className="w-full text-sm">
                          <tbody>
                            <tr className="font-black bg-slate-50 dark:bg-slate-800/50"><td className="py-3">1. FLUXO DAS OPERAÇÕES</td><td className="py-3 text-right"></td></tr>
                            <tr><td className="py-3 pl-8">Lucro Líquido</td><td className="py-3 text-right font-mono">{formatCurrency(statementsState.dfc.vars['LUCRO'])}</td></tr>
                            <tr><td className="py-3 pl-8">(+) Depreciações e Amortizações</td><td className="py-3 text-right font-mono">{formatCurrency(statementsState.dfc.vars['DEPR'])}</td></tr>
                            <tr className="font-bold border-t"><td className="py-3 pl-8">Caixa Gerado das Operações (Antes do Capital de Giro)</td><td className="py-3 text-right font-mono">{formatCurrency(statementsState.dfc.vars['CAIXA_GERADO_AJUSTES'])}</td></tr>
                            <tr className="text-slate-400 italic"><td className="py-3">Variação no Capital de Giro</td><td className="py-3 text-right"></td></tr>
                            <tr><td className="py-3 pl-8">(Inc) Dec em Contas a Receber</td><td className="py-3 text-right font-mono">{formatCurrency(statementsState.dfc.vars['AR'])}</td></tr>
                            <tr><td className="py-3 pl-8">(Inc) Dec em Estoques</td><td className="py-3 text-right font-mono">{formatCurrency(statementsState.dfc.vars['INV'])}</td></tr>
                            <tr><td className="py-3 pl-8">Inc (Dec) em Fornecedores</td><td className="py-3 text-right font-mono">{formatCurrency(statementsState.dfc.vars['SUPPLIER'])}</td></tr>
                            <tr className="font-black border-t bg-slate-50 dark:bg-slate-800/50"><td className="py-3">(=) GERADO PELAS ATIVIDADES OPERACIONAIS</td><td className="py-3 text-right font-mono">{formatCurrency(statementsState.dfc.vars['CAIXA_OPER'])}</td></tr>
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
               )}

               {activeStatementTab === 'RATIOS' && financialRatios && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 p-8 rounded-[2rem] shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Liquidez Corrente</span>
                      <p className="text-3xl font-black mt-2">{financialRatios.liqCorrente.toFixed(2)}</p>
                      <div className="h-1 bg-slate-100 rounded-full mt-4"><div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, financialRatios.liqCorrente * 30)}%` }}></div></div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 p-8 rounded-[2rem] shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Margem Líquida</span>
                      <p className="text-3xl font-black mt-2">{financialRatios.margemLiq.toFixed(1)}%</p>
                      <div className="h-1 bg-slate-100 rounded-full mt-4"><div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.max(0, financialRatios.margemLiq)}%` }}></div></div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 p-8 rounded-[2rem] shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase">EBITDA Estimado</span>
                      <p className="text-3xl font-black mt-2">R$ {formatCurrency(financialRatios.ebitda)}</p>
                    </div>
                  </div>
               )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 p-16 shadow-sm">
               <h2 className="text-3xl font-black mb-12 underline">{t.notes.title}</h2>
               <div className="space-y-12 max-w-none font-serif text-lg leading-relaxed">
                  {Object.entries(notesContent).map(([key, content]) => (
                    <section key={key} className="whitespace-pre-line p-8 bg-slate-50/50 dark:bg-slate-900 border dark:border-slate-800 rounded-3xl">
                       <textarea value={content} onChange={(e) => setNotesContent(p => ({ ...p, [key]: e.target.value }))} className="w-full bg-transparent border-none focus:ring-0 min-h-[100px]" />
                    </section>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'export' && (
             <div className="space-y-8">
                {/* --- DIAGNÓSTICO NEXUS (DEV PANEL) --- */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-slate-900 border-l-4 border-indigo-500 p-8 rounded-3xl text-white font-mono text-xs">
                    <h3 className="text-indigo-400 font-black mb-4 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> DIAGNÓSTICO NEXUS DF
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       <div>
                         <p className="text-slate-500 mb-1">Detected Years:</p>
                         <p>{JSON.stringify(detectedYears)}</p>
                       </div>
                       <div>
                         <p className="text-slate-500 mb-1">Current / Prior:</p>
                         <p>{detectedYears[0] || 'N/A'} / {detectedYears[1] || 'N/A'}</p>
                       </div>
                       <div>
                         <p className="text-slate-500 mb-1">Total Ativo (Source: TOTAL DO ATIVO):</p>
                         <p>R$ {formatCurrency(statementsState.current.assetSum)}</p>
                       </div>
                       <div>
                         <p className="text-slate-500 mb-1">Total Passivo+PL (Source: TOTAL PASSIVO + PL):</p>
                         <p>R$ {formatCurrency(statementsState.current.passivSum)}</p>
                       </div>
                       <div>
                         <p className="text-slate-500 mb-1">GAP (Ativo - Passivo+PL):</p>
                         <p>R$ {formatCurrency(statementsState.current.bpGap)}</p>
                       </div>
                       <div>
                         <p className="text-slate-500 mb-1">Lucro DRE:</p>
                         <p>R$ {formatCurrency(statementsState.current.netIncome)}</p>
                       </div>
                       <div>
                         <p className="text-slate-500 mb-1">Resultado Balancete:</p>
                         <p>R$ {formatCurrency(statementsState.current.tbDreResult)}</p>
                       </div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 p-12 text-center shadow-sm">
                  <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-black mb-2">Central de Exportação</h2>
                  <p className="text-slate-500 mb-8 max-w-lg mx-auto">Selecione as demonstrações que deseja exportar. Todos os documentos seguem os padrões contábeis vigentes.</p>
                  
                  <button 
                    onClick={() => handleExportPDF('FULL')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-12 py-4 rounded-2xl flex items-center justify-center gap-2 mx-auto transition-all shadow-lg"
                  >
                    <Download className="w-5 h-5" /> Exportar Relatório Completo (PDF)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: 'BP', label: 'Balanço Patrimonial' },
                    { id: 'DRE', label: 'Demonstração do Resultado' },
                    { id: 'DRA', label: 'Resultado Abrangente' },
                    { id: 'DMPL', label: 'Mutações do PL' },
                    { id: 'DFC', label: 'Fluxo de Caixa' },
                    { id: 'RATIOS', label: 'Índices Financeiros' },
                    { id: 'NOTES', label: 'Notas Explicativas' },
                  ].map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 p-6 rounded-[2rem] shadow-sm group">
                      <h3 className="font-black text-sm uppercase tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">{item.label}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleExportPDF(item.id as any)}
                          className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                        >
                          PDF
                        </button>
                        <button 
                          onClick={() => handleExportXLSX(item.id)}
                          className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all"
                        >
                          Excel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
