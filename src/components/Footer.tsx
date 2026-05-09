import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-lg">M</div>
              <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-white">Micro<span className="text-indigo-600">CaaS</span></span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Ecossistema de microsoluções modulares focadas em dores reais. Desenvolvido pelo <a href="https://www.assetbr.com.br" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">Asset Group</a>.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Manifesto</h4>
            <ul className="space-y-4">
              <li><Link to="/docs" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-medium">Documentação</Link></li>
              <li><Link to="/governanca" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-medium">Governança</Link></li>
              <li><Link to="/microcaas-factory" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-medium">MicroCaaS Factory</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Marketplace</h4>
            <ul className="space-y-4">
              <li><Link to="/solucoes" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-medium">Oficiais</Link></li>
              <li><Link to="/microcaas" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-medium">Comunidade</Link></li>
              <li><Link to="/publicar" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-medium">Seja um Autor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Empresa</h4>
            <ul className="space-y-4">
              <li><Link to="/sobre" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-medium">Sobre</Link></li>
              <li><Link to="/admin" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-medium">Admin</Link></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 text-sm font-medium">Privacidade</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest gap-4">
          <p>© {new Date().getFullYear()} MicroCaaS • BRASIL</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              TERM.A1: CONNECTED
            </span>
            <span className="leading-none opacity-50">|</span>
            <span className="leading-none">FIREBASE_READY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
