import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Instagram, Twitter, ShieldCheck, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">M</div>
              <span className="font-black text-2xl tracking-tighter text-slate-800 dark:text-white uppercase">Micro<span className="text-indigo-600">CaaS</span></span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-serif italic max-w-sm">
              Empoderando contadores com inteligência modular para a era da contabilidade consultiva e tecnológica.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-indigo-100 dark:border-slate-800 pb-2">Soluções Elite</h4>
            <ul className="space-y-4">
              <li><Link to="/solucoes" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-bold uppercase tracking-tight flex items-center gap-2 group"><Zap className="w-3 h-3 text-indigo-400 group-hover:fill-current" /> Marketplace</Link></li>
              <li><Link to="/microcaas" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-bold uppercase tracking-tight flex items-center gap-2 group"><Zap className="w-3 h-3 text-indigo-400 group-hover:fill-current" /> MicroCaaS Hub</Link></li>
              <li><Link to="/reforma-hub" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-bold uppercase tracking-tight flex items-center gap-2 group"><Zap className="w-3 h-3 text-indigo-400 group-hover:fill-current" /> Reforma Hub</Link></li>
              <li><Link to="/app/nexus-df" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-bold uppercase tracking-tight flex items-center gap-2 group"><Zap className="w-3 h-3 text-indigo-400 group-hover:fill-current" /> Nexus DF</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-indigo-100 dark:border-slate-800 pb-2">Ecossistema</h4>
            <ul className="space-y-4">
              <li><Link to="/sobre" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-bold uppercase tracking-tight">Sobre a MicroCaaS</Link></li>
              <li><Link to="/governanca" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-bold uppercase tracking-tight">Governança & Termos</Link></li>
              <li><Link to="/publicar" className="text-indigo-600 hover:text-indigo-700 text-sm font-black uppercase tracking-tight">Seja um Autor</Link></li>
              <li><Link to="/admin" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-bold uppercase tracking-tight">Área Administrativa</Link></li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Headquarters</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed uppercase">Brasília, DF - BRASIL</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">contato@microcaas.com.br</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-indigo-600 shrink-0" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">+55 (65) 99205-8727</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] gap-6">
          <p>© {new Date().getFullYear()} MicroCaaS Enterprise • Desenvolvido pela Asset Group BR</p>
          <div className="flex items-center space-x-8">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> COMPOSIÇÃO: 100% MODULAR
            </span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div> NEXUS_READY
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
