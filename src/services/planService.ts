import { db } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  onSnapshot 
} from 'firebase/firestore';

export interface UserPlan {
  tier: 'free' | 'pro' | 'advanced' | 'enterprise' | 'black';
  activeModules: string[];
  limits: {
    clients: number;
    docsPerMonth: number;
  };
}

export const planService = {
  async getUserPlan(userId: string): Promise<UserPlan> {
    try {
      const docSnap = await getDoc(doc(db, 'userPlans', userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          tier: data.tier || 'free',
          activeModules: data.activeModules || ['extrato', 'receiptor'],
          limits: data.limits || { clients: 2, docsPerMonth: 10 }
        } as UserPlan;
      }
      
      // Fallback: Check if user document has plan info
      const userSnap = await getDoc(doc(db, 'users', userId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.plano) {
          const tier = userData.plano as UserPlan['tier'];
          const activeModulesMap: Record<string, string[]> = {
            free: ['extrato', 'receiptor', 'consulta-nfe'],
            pro: ['extrato', 'receiptor', 'fechamento', 'consulta-nfe', 'monitor-nfe'],
            advanced: ['extrato', 'receiptor', 'fechamento', 'finance-insight', 'consulta-nfe', 'monitor-nfe'],
            enterprise: ['extrato', 'receiptor', 'fechamento', 'finance-insight', 'cobra-ai', 'billing-hub', 'consulta-nfe', 'monitor-nfe']
          };
          const limitsMap: Record<string, { clients: number, docsPerMonth: number }> = {
            free: { clients: 2, docsPerMonth: 10 },
            pro: { clients: 10, docsPerMonth: 500 },
            advanced: { clients: 50, docsPerMonth: 2000 },
            enterprise: { clients: 999, docsPerMonth: 9999 }
          };
          
          return {
            tier,
            activeModules: activeModulesMap[tier] || activeModulesMap.free,
            limits: limitsMap[tier] || limitsMap.free
          };
        }
      }
    } catch (err) {
      console.error("Error fetching plan:", err);
    }

    // Default Free Tier
    return {
      tier: 'free',
      activeModules: ['extrato', 'receiptor', 'consulta-nfe'],
      limits: { clients: 2, docsPerMonth: 10 }
    };
  },

  checkAccess: (plan: UserPlan, moduleId: string) => {
    return plan.activeModules.includes(moduleId) || plan.tier === 'black';
  }
};
