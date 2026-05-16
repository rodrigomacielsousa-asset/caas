import React, { useState } from 'react';
import { Share2, Link as LinkIcon, MessageCircle, Linkedin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function ShareButtons() {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = window.location.href;
  const shareText = `Veja como é fácil usar essa ferramenta contábil. Teste aqui: ${currentUrl}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar link', err);
    }
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Botão Copiar Link Independente (Pequeno) */}
      <button 
        onClick={copyLink}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500">Copiado</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-3 h-3" />
            <span>Copiar Link</span>
          </>
        )}
      </button>

      {/* Botão Compartilhar com Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setShowOptions(!showOptions)}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-[10px] font-black uppercase tracking-widest border outline-none",
            showOptions 
              ? "bg-blue-600 text-white border-blue-600" 
              : "bg-white dark:bg-slate-900 text-blue-600 border-blue-600/30 hover:border-blue-600"
          )}
        >
          <Share2 className="w-3 h-3" />
          <span>Compartilhar</span>
        </button>

        <AnimatePresence>
          {showOptions && (
            <>
               <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowOptions(false)} 
               />
               <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden"
              >
                <button 
                  onClick={shareWhatsApp}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  WhatsApp
                </button>
                <button 
                  onClick={shareLinkedIn}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  LinkedIn
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
