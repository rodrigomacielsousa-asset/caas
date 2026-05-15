import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export enum FunnelStage {
  VISITOR = 'visitante',
  LEAD = 'lead',
  ACTIVE = 'ativo',
  PAYING = 'pagante'
}

export const growthService = {
  async trackEvent(userId: string, productId: string, action: string, metadata: any = {}) {
    try {
      // Don't track if anonymous unless it's a visit
      const tid = userId === 'anonymous' ? 'anon_' + Math.random().toString(36).substring(7) : userId;

      await addDoc(collection(db, 'trackingEvents'), {
        userId: tid,
        productId,
        action,
        metadata,
        timestamp: serverTimestamp()
      });

      if (userId === 'anonymous') return;

      // Update counters in userMetrics
      const metricsRef = doc(db, 'userMetrics', userId);
      const metricsSnap = await getDoc(metricsRef);

      if (!metricsSnap.exists()) {
        await setDoc(metricsRef, {
          userId,
          funnelStage: FunnelStage.LEAD,
          totalActions: 1,
          productUsage: { [productId]: 1 },
          lastActive: serverTimestamp()
        });
      } else {
        const data = metricsSnap.data();
        const productUsage = data.productUsage || {};
        productUsage[productId] = (productUsage[productId] || 0) + 1;
        
        const newActions = (data.totalActions || 0) + 1;
        let newStage = data.funnelStage || FunnelStage.LEAD;

        // Auto-evolve lead to active after 5 actions
        if (newActions >= 5 && newStage === FunnelStage.LEAD) {
          newStage = FunnelStage.ACTIVE;
        }

        await updateDoc(metricsRef, {
          totalActions: newActions,
          funnelStage: newStage,
          productUsage,
          lastActive: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Growth Tracking Error:", error);
    }
  },

  async getSmartSuggestions(userId: string) {
    if (!userId || userId === 'anonymous') return [];
    
    try {
      const metricsRef = doc(db, 'userMetrics', userId);
      const metricsSnap = await getDoc(metricsRef);
      if (!metricsSnap.exists()) return [];

      const data = metricsSnap.data();
      const usage = data.productUsage || {};
      const suggestions = [];

      // Logic: If using Extrato but not Fechamento
      if (usage['extrato'] > 5 && !usage['fechamento']) {
        suggestions.push({
          id: 'upsell-fechamento',
          title: 'Acelere seu Fechamento',
          message: 'Você já processou muitos extratos. Que tal automatizar o fechamento contábil também?',
          cta: 'Ver Fechamento Pro',
          link: '/solucoes/fechamento-contabil-pro'
        });
      }

      // Logic: Busy user without Monitor NFe
      if (data.totalActions > 20 && !usage['monitor-nfe']) {
        suggestions.push({
          id: 'upsell-monitor',
          title: 'Pare de Digitar Chaves',
          message: 'Detectamos alto volume de atividade. Ative o Monitor NF-e e receba tudo automaticamente.',
          cta: 'Ativar Monitor',
          link: '/monitore'
        });
      }

      return suggestions;
    } catch (err) {
      return [];
    }
  },

  async updateFunnelStage(userId: string, stage: FunnelStage) {
    await updateDoc(doc(db, 'userMetrics', userId), { funnelStage: stage });
  },

  async markOnboardingStep(userId: string, stepId: string) {
    const metricsRef = doc(db, 'userMetrics', userId);
    await setDoc(metricsRef, { 
      onboardingStatus: stepId,
      lastActive: serverTimestamp()
    }, { merge: true });
  }
};
