export type PricingModel = 'free' | 'subscription' | 'one_time' | 'quote' | 'usage';
export type ProductStatus = 'active' | 'inactive' | 'beta' | 'coming_soon';

export interface Product {
  id: string; // Ex: "pc-ai"
  name: string; // Headline: DOR RESOLVIDA (Ex: "Elimine a digitação manual de vez")
  subtitle?: string; // Nome do produto (Ex: "Pré-Contábil AI")
  impactPhrase?: string; // Ancoragem de valor (Ex: "Economize até 12h/mês")
  slug: string; // URL canônica
  legacyNames?: string[];
  legacySlugs?: string[];
  category: "Fiscal" | "Contábil" | "Financeiro" | "Automação" | "Gestão" | "Compliance" | "Simulação";
  badges: string[]; // ["Destaque", "Novo", "Beta"]
  modelBadge?: "ASSINATURA" | "PAGAMENTO ÚNICO" | "GRATUITO" | "DEMO" | "PRO";
  usageImpact?: string; // "Configuração em 2 min" / "Resultado em 30s"
  integrationInfo?: string; // "Sem instalação" / "Importação via XML"
  dors?: string[]; // Tags de dor (Ex: ["NF-e/XML", "Conciliação", "Fechamento"])
  shortDescription: string;
  longDescription: string;
  howToUse: string[]; // Lista passo a passo
  inputs: string[]; // Lista (campos/arquivos)
  outputs: string[]; // Lista (entregáveis)
  pricingModel: PricingModel;
  pricing: {
    priceLabel: string; // Ex: "R$ 59/mês", "Grátis", "R$ 497,00"
    priceValue?: number;
    currency: string; // "BRL"
    trialDays?: number;
    includes: string[];
    ctaText: string; // "Testar agora", "Saiba mais", "Comprar"
    ctaAction: 'open_app' | 'checkout' | 'contact' | 'coming_soon';
  };
  status: ProductStatus;
  isFeatured?: boolean;
  liveUrl?: string;
  relatedProducts: string[]; // Slugs
  faq?: { q: string; a: string }[];
}

export interface Bundle extends Partial<Product> {
  id: string;
  name: string;
  slug: string;
  type: 'bundle';
  bundleItems: string[]; // Slugs dos produtos individuais
  status: 'active' | 'inactive';
}

export type MicroCaaS = Product;
export type Solucao = Product;

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price?: number;
  priceLabel: string;
  type: 'individual' | 'bundle';
  pricingModel: PricingModel;
  checkoutUrl?: string;
}

export interface Submission {
  id: string;
  name: string;
  userEmail: string;
  description: string;
  area: string;
  pricingModel: PricingModel;
  price?: number;
  status: 'pending' | 'approved' | 'rejected' | 'analyzing';
  createdAt: string;
  manifestJson?: string;
}

export interface CheckoutRequest {
  id: string;
  userEmail?: string;
  items: string[]; // slugs
  totalLabel: string;
  totalValue?: number; // Added for summation
  suggestedBundleSlug?: string;
  status: 'pending' | 'link_sent' | 'paid' | 'rejected';
  createdAt: string;
  paymentLink?: string;
}

export interface Entitlement {
  id: string;
  userEmail: string;
  productSlug: string;
  grantedAt: string;
  expiresAt?: string;
  status: 'active' | 'revoked';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  summary: string;
  relatedProductId?: string; // Link opcional para solução (slug do produto)
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

