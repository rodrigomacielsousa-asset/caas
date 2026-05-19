export interface NBSData {
  codigo: string;
  descricao: string;
  cst?: string;
  cclassTrib?: string;
  nomeClass?: string;
  redIBS?: number;
  redCBS?: number;
  descricaoCST?: string;
}

export interface NCMData {
  codigo: string;
  descricao: string;
  unidadeMedida: string;
  aliquotaIPI: string;
}

export interface CSTData {
  cst: string;
  descricaoCST: string;
  cclassTrib: string;
  nomeClass: string;
  redIBS: number;
  redCBS: number;
}

export const NBS_DATA: NBSData[] = [
{ codigo: "1.1502.10.00", descricao: "Serviços de projeto, desenvolvimento e instalação de aplicativos e programas não personalizados (não customizados) ", cst: "000", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ codigo: "1.1502.20.00", descricao: "Serviços de projeto e desenvolvimento, adaptação e instalação de aplicativos e programas personalizados (customizados) ", cst: "000", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ codigo: "1.1502.40.00", descricao: "Serviços de projeto e desenvolvimento de estruturas e conteúdo de bancos de dados ", cst: "000", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ codigo: "1.1502.50.00", descricao: "Serviços de integração de sistemas em tecnologia da informação (TI) ", cst: "000", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ codigo: "1.1502.90.00", descricao: "Serviços de projeto e desenvolvimento de aplicativos e programas em tecnologia da informação (TI) não classificados em subposições anteriores", cst: "000", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ codigo: "1.1502.90.00", descricao: "Serviços de projeto e desenvolvimento de aplicativos e programas em tecnologia da informação (TI) não classificados em subposições anteriores", cst: "200", cclassTrib: "200043", nomeClass: "Fornecimento à administração pública dos serviços e dos bens relativos à soberania (Anexo XI)", redIBS: 60, redCBS: 60 },
{ codigo: "1.1502.90.00", descricao: "Serviços de projeto e desenvolvimento de aplicativos e programas em tecnologia da informação (TI) não classificados em subposições anteriores", cst: "200", cclassTrib: "200044", nomeClass: "Operações e prestações de serviços de segurança da informação e segurança cibernética desenvolvidos por sociedade que tenha sócio brasileiro (Anexo XI)", redIBS: 60, redCBS: 60 },
{ codigo: "1.1503.00.00", descricao: "Serviços de projeto e desenvolvimento de redes em tecnologia da informação (TI) ", cst: "000", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ codigo: "1.1504.00.00", descricao: "Serviços de projeto e desenvolvimento de topografias de circuitos integrados ", cst: "000", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ codigo: "1.1505.00.00", descricao: "Serviços de projeto de circuitos integrados ", cst: "000", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ codigo: "1.1506.10.00", descricao: "Serviços de hospedagem de sítios eletrônicos na rede mundial de computadores ", cst: "000", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ codigo: "1.1506.21.00", descricao: "Serviços de hospedagem de aplicativos e programas software como serviço (SaaS)", cst: "000", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ codigo: "1.2301.22.00", descricao: "Serviços médicos especializados ", cst: "200", cclassTrib: "200029", nomeClass: "Fornecimento dos serviços de saúde humana (Anexo III)", redIBS: 60, redCBS: 60 },
{ codigo: "1.1302.21.00", descricao: "Serviços de contabilidade", cst: "200", cclassTrib: "200052", nomeClass: "Prestação de serviços de profissões intelectuais", redIBS: 30, redCBS: 30 },
{ codigo: "1.1001.21.00", descricao: "Serviços de intermediação na compra e venda de imóveis residenciais", cst: "200", cclassTrib: "200046", nomeClass: "Operações com bens imóveis", redIBS: 50, redCBS: 50 }
];

export const NCM_DATA: NCMData[] = [
{ codigo: "01012100", descricao: "-- Reprodutores de raça pura ", unidadeMedida: "UN", aliquotaIPI: "0"},
{ codigo: "02011000", descricao: "- Carcaças e meias-carcaças ", unidadeMedida: "KG", aliquotaIPI: "0"},
{ codigo: "04061010", descricao: "Mozarela ", unidadeMedida: "KG", aliquotaIPI: "0"},
{ codigo: "10061091", descricao: "Parboilizado ", unidadeMedida: "KG", aliquotaIPI: "0"},
{ codigo: "17011400", descricao: "-- Outros açúcares de cana ", unidadeMedida: "TON", aliquotaIPI: "0"},
{ codigo: "19059090", descricao: "Outros (Pão do tipo comum)", unidadeMedida: "KG", aliquotaIPI: "0"},
{ codigo: "22030000", descricao: "Cervejas de malte ", unidadeMedida: "LT", aliquotaIPI: "3.9"},
{ codigo: "30049019", descricao: "Outros medicamentos", unidadeMedida: "KG", aliquotaIPI: "0"},
{ codigo: "39233010", descricao: "Recipientes para gás liquefeito de petróleo (GLP) ", unidadeMedida: "KG", aliquotaIPI: "9.75"},
{ codigo: "40111000", descricao: "- Do tipo utilizado em automóveis de passageiros ", unidadeMedida: "UN", aliquotaIPI: "9.75"},
{ codigo: "73089090", descricao: "Telhas de aço", unidadeMedida: "KG", aliquotaIPI: "0"},
{ codigo: "84713011", descricao: "De peso inferior a 350 g, com tela de área não superior a 140 cm2 ", unidadeMedida: "UN", aliquotaIPI: "15"},
{ codigo: "85171300", descricao: "-- Telefones inteligentes (smartphones) ", unidadeMedida: "UN", aliquotaIPI: "15"},
{ codigo: "87032100", descricao: "-- De cilindrada não superior a 1000 cm3 ", unidadeMedida: "UN", aliquotaIPI: "5.27"}
];

export const CST_DATA: CSTData[] = [
{ cst: "000", descricaoCST: "Tributação integral", cclassTrib: "000001", nomeClass: "Situações tributadas integralmente pelo IBS e CBS.", redIBS: 0, redCBS: 0 },
{ cst: "000", descricaoCST: "Tributação integral", cclassTrib: "000002", nomeClass: "Exploração de via", redIBS: 0, redCBS: 0 },
{ cst: "010", descricaoCST: "Tributação com alíquotas uniformes - operações setor financeiro", cclassTrib: "010002", nomeClass: "Operações do serviço financeiro", redIBS: 0, redCBS: 0 },
{ cst: "011", descricaoCST: "Tributas com alíquotas uniformes reduzidas", cclassTrib: "011002", nomeClass: "Planos de assistência à saúde", redIBS: 60, redCBS: 60 },
{ cst: "200", descricaoCST: "Alíquota zero", cclassTrib: "200003", nomeClass: "Vendas de produtos destinados à alimentação humana (Anexo I)", redIBS: 100, redCBS: 100 },
{ cst: "200", descricaoCST: "Alíquota reduzida em 60%", cclassTrib: "200029", nomeClass: "Fornecimento dos serviços de saúde humana (Anexo III)", redIBS: 60, redCBS: 60 },
{ cst: "200", descricaoCST: "Alíquota reduzida em 50%", cclassTrib: "200046", nomeClass: "Operações com bens imóveis", redIBS: 50, redCBS: 50 },
{ cst: "200", descricaoCST: "Alíquota reduzida em 30%", cclassTrib: "200052", nomeClass: "Prestação de serviços de profissões intelectuais", redIBS: 30, redCBS: 30 }
];
