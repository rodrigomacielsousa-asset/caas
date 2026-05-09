import type { Product, Bundle } from '../types';
import microcaasData from '../data/microcaas.json';
import solucoesData from '../data/solucoes.json';
import bundlesData from '../data/bundles.json';

// In a real app, this would fetch from an API or Firestore
// For this demo, we use the local JSON files and allow override via LocalStorage for admin edits

export const productService = {
  async getProducts(): Promise<Product[]> {
    const local = localStorage.getItem('products_override');
    if (local) return JSON.parse(local);
    
    // Combine official solutions and community microcaas
    return [...(solucoesData as Product[]), ...(microcaasData as Product[])];
  },

  async getBundles(): Promise<Bundle[]> {
    const local = localStorage.getItem('bundles_override');
    if (local) return JSON.parse(local);
    return bundlesData as Bundle[];
  },

  async saveProduct(product: Product): Promise<void> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === product.id || p.slug === product.slug);
    
    let updated;
    if (index >= 0) {
      updated = [...products];
      updated[index] = { ...product, id: product.id || Math.random().toString() };
    } else {
      updated = [...products, { ...product, id: Math.random().toString() }];
    }
    
    localStorage.setItem('products_override', JSON.stringify(updated));
  },

  async deleteProduct(id: string): Promise<void> {
    const products = await this.getProducts();
    const updated = products.filter(p => p.id !== id);
    localStorage.setItem('products_override', JSON.stringify(updated));
  }
};
