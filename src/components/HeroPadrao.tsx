import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface HeroPadraoProps {
  badge?: string;
  title: string | React.ReactNode;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  visualContent?: React.ReactNode;
  theme?: 'dark' | 'light';
  className?: string;
}

export const HeroPadrao: React.FC<HeroPadraoProps> = ({
  badge,
  title,
  description,
  ctaText,
  ctaLink,
  onCtaClick,
  visualContent,
  theme = 'dark',
  className
}) => {
  const isDark = theme === 'dark';

  return (
    <section className={cn(
      "relative pt-20 pb-12 overflow-hidden min-h-[480px] flex items-center",
      isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900",
      className
    )}>
      {/* Background accents for dark theme */}
      {isDark && (
        <>
          <div className="absolute top-0 right-0 w-[600px] h-full bg-blue-600/5 blur-[120px] -z-0" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 blur-[100px] -z-0" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={cn(
          "grid grid-cols-1 gap-10 items-center",
          visualContent ? "lg:grid-cols-2" : "text-center flex flex-col items-center"
        )}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("space-y-6", !visualContent && "max-w-3xl")}
          >
            {badge && (
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                isDark ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" : "bg-blue-50 border border-blue-100 text-blue-600"
              )}>
                {badge}
              </div>
            )}
            
            <h1 className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1]",
              isDark ? "text-white" : "text-slate-900"
            )}>
              {title}
            </h1>

            {description && (
              <p className={cn(
                "text-lg font-medium leading-relaxed max-w-2xl",
                isDark ? "text-slate-400" : "text-slate-500",
                !visualContent && "mx-auto"
              )}>
                {description}
              </p>
            )}

            {(ctaText && (ctaLink || onCtaClick)) && (
              <div className={cn("pt-2", !visualContent && "flex justify-center")}>
                {ctaLink ? (
                  <Link 
                    to={ctaLink}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 hover:-translate-y-0.5"
                  >
                    {ctaText}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <button 
                    onClick={onCtaClick}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 hover:-translate-y-0.5"
                  >
                    {ctaText}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {visualContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {visualContent}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
