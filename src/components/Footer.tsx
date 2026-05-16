import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Instagram, Twitter, ShieldCheck, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">M</div>
              <span className="font-black text-2xl tracking-tighter text-slate-800">Micro<span className="text-blue-600 font-black">CaaS</span></span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Empoderando contadores com inteligência modular para a era da contabilidade consultiva e tecnológica.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all"><Linkedin className="w-4 h-4" /></a>
              <a href="https://www.instagram.com/microcaas" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all"><Instagram className="w-4 h-4" /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-blue-100 pb-2">Soluções</h4>
            <ul className="space-y-4">
              <li><Link to="/solucoes" className="text-slate-600 hover:text-blue-600 text-sm font-bold uppercase tracking-tight flex items-center gap-2 group"><Zap className="w-3 h-3 text-blue-400 group-hover:fill-current" /> Marketplace</Link></li>
              <li><Link to="/reforma-hub" className="text-slate-600 hover:text-blue-600 text-sm font-bold uppercase tracking-tight flex items-center gap-2 group"><Zap className="w-3 h-3 text-blue-400 group-hover:fill-current" /> Reforma Hub</Link></li>
              <li><Link to="/ecossistema" className="text-slate-600 hover:text-blue-600 text-sm font-bold uppercase tracking-tight flex items-center gap-2 group"><Zap className="w-3 h-3 text-blue-400 group-hover:fill-current" /> Ecossistema CaaS</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-blue-100 pb-2">Institucional</h4>
            <ul className="space-y-4">
              <li><Link to="/sobre" className="text-slate-600 hover:text-blue-600 text-sm font-bold uppercase tracking-tight">Sobre a MicroCaaS</Link></li>
              <li><Link to="/governanca" className="text-slate-600 hover:text-blue-600 text-sm font-bold uppercase tracking-tight">Termos & Privacidade</Link></li>
              <li><Link to="/contato" className="text-slate-600 hover:text-blue-600 text-sm font-bold uppercase tracking-tight">Suporte Técnico</Link></li>
              <li><Link to="/admin" className="text-slate-400 hover:text-blue-600 text-[10px] font-black uppercase tracking-widest">Área Administrativa</Link></li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Headquarters</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs font-bold text-slate-700 leading-relaxed uppercase">Brasília, DF - BRASIL</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs font-bold text-slate-700 break-all">contato@microcaas.com.br</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs font-bold text-slate-700 uppercase">+55 11 99455-5471</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] gap-6">
          <p>© {new Date().getFullYear()} MicroCaaS Enterprise • <a href="https://www.assetbr.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Asset Group (www.assetbr.com.br)</a></p>
        </div>
      </div>
    </footer>
  );
}
