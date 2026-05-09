export type PricingModel = 'free' | 'one_time' | 'subscription';
export type ProductStatus = 'beta' | 'active' | 'em_breve';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  area: string;
  status: ProductStatus;
  statusBadge: string;
  pricingModel: PricingModel;
  price?: number;
  priceLabel: string; // Ex: "R$ 49,90", "R$ 19/mês", "Grátis"
  checkoutUrl?: string; // Link externo para pagamento (Stripe/MP)
  paymentProvider?: 'mercadopago';
  paymentStatus?: 'mock' | 'real';
  liveUrl?: string;     // Link para acessar o sistema (especialmente para free)
  tags: string[];
  lastUpdated: string;
  features: string[];
  version?: string;
  isFree?: boolean; // Adicionado para gerenciar o estado gratuito vs pago
}

export interface Bundle extends Product {
  type: 'bundle';
  bundleItems: string[]; // Slugs dos produtos individuais
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  manifestJson?: string;
}

export interface CheckoutRequest {
  id: string;
  userEmail?: string;
  items: string[]; // slugs
  totalLabel: string;
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
