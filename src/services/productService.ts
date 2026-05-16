import { collection, doc, getDocs, setDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { Product, Bundle } from '../types';
import { products as canonicalProducts } from '../data/products';
import bundlesData from '../data/bundles.json';

const PRODUCTS_COLLECTION = 'products';
const BUNDLES_COLLECTION = 'bundles';

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      let products = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      
      // If DB is empty or contains invalid data, fallback to canonical
      const validProducts = products.filter(p => p.name && p.slug);
      
      if (validProducts.length === 0) {
        console.log('Product collection empty or invalid, falling back to static data');
        return canonicalProducts;
      }
      
      return validProducts;
    } catch (error) {
      console.warn("Product collection issue, falling back to static data", error);
      // Log for platform but don't crash the fallback
      try { handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION); } catch(e) {}
      return canonicalProducts;
    }
  },

  async getBundles(): Promise<Bundle[]> {
    try {
      const querySnapshot = await getDocs(collection(db, BUNDLES_COLLECTION));
      let bundles = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Bundle));
      
      if (bundles.length === 0) {
        return bundlesData as Bundle[];
      }
      
      return bundles;
    } catch (error) {
       handleFirestoreError(error, OperationType.LIST, BUNDLES_COLLECTION);
       return bundlesData as Bundle[];
    }
  },

  async saveProduct(product: Product): Promise<void> {
    try {
      const id = product.id || product.slug;
      await setDoc(doc(db, PRODUCTS_COLLECTION, id), product, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, PRODUCTS_COLLECTION);
    }
  },

  async saveBundle(bundle: Bundle): Promise<void> {
    try {
      const id = bundle.id || bundle.slug;
      await setDoc(doc(db, BUNDLES_COLLECTION, id), bundle, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, BUNDLES_COLLECTION);
    }
  },

  async deleteBundle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, BUNDLES_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, BUNDLES_COLLECTION);
    }
  }
};
