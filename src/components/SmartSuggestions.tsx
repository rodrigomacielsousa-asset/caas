import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { growthService } from '../services/growthService';

export function SmartSuggestions({ userId }: { userId: string }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await growthService.getSmartSuggestions(userId);
      setSuggestions(data);
    };
    fetch();
  }, [userId]);

  if (suggestions.length === 0 || !visible) return null;

  const current = suggestions[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full bg-gradient-to-r from-blue-600 to-violet-700 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Sparkles className="w-40 h-40" /></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-2 px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase tracking-widest w-fit">
               <Sparkles className="w-3 h-3" /> Growth Engine Insight
             </div>
             <h4 className="text-2xl font-black italic tracking-tighter uppercase">{current.title}</h4>
             <p className="text-sm font-medium italic opacity-80 max-w-lg">{current.message}</p>
           </div>

           <div className="flex items-center gap-4">
              <Link 
                to={current.link}
                className="px-8 py-4 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 group"
              >
                {current.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => setVisible(false)}
                className="p-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
