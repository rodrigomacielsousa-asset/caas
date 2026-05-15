import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Rocket, Box, Database, Calculator, Info, ShoppingCart, User, Search, Zap, Globe, Lightbulb, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { auth, logout } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const navItems = [
  { name: 'Início', path: '/', icon: Box },
  { name: 'Soluções', path: '/solucoes', icon: Rocket },
  { name: 'Reforma', path: '/reforma-hub', icon: Calculator },
  { name: 'Ecossistema', path: '/ecossistema', icon: Globe },
  { name: 'Ideias', path: '/ideias', icon: Lightbulb },
  { name: 'Blog', path: '/blog', icon: BookOpen },
  { name: 'Contato', path: '/contato', icon: Info },
];

export function Navbar() {
  const { count } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        const mock = localStorage.getItem('mock_user');
        setUser(mock ? JSON.parse(mock) : null);
      } else {
        setUser(u);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('mock_user');
    await logout();
    window.location.href = '/';
  };

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled ? "bg-white/90 backdrop-blur-md border-slate-200 py-3" : "bg-white border-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-105 shadow-sm">
              M
            </div>
            <div className="flex flex-col">
                      <span className="font-black text-xl tracking-tighter leading-none text-slate-800">Micro<span className="text-blue-600">CaaS</span></span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Ecossistema Contábil</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            <div className="flex space-x-6 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-xs font-black uppercase tracking-widest transition-all py-2",
                    location.pathname === item.path 
                      ? "text-blue-600" 
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="w-[1px] h-4 bg-slate-200 mx-2" />
              {user && (
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors py-2"
                  >
                    Minha Conta
                  </button>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-slate-50 mb-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Painel</div>
                        <div className="text-xs font-bold text-slate-800 truncate">{user.email}</div>
                      </div>
                      <Link to="/dashboard" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        Dashboard
                      </Link>
                      <Link to="/minhas-compras" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        Minhas Compras
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50"
                      >
                        Sair
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
              <div className="flex items-center space-x-4 border-l border-slate-200 pl-8">
              <Link 
                to="/carrinho" 
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {count}
                  </span>
                )}
              </Link>
              {!user && (
                <Link 
                  to="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Entrar
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-3 px-3 py-4 text-base font-medium text-slate-700 border-b"
                >
                  <item.icon className="w-5 h-5 text-blue-600" />
                  <span>{item.name}</span>
                </Link>
              ))}
              {user ? (
                <div className="border-b pb-2">
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Minha Conta
                  </div>
                  <Link to="/dashboard" className="block px-3 py-3 text-base font-medium text-slate-700">
                    Dashboard
                  </Link>
                  <Link to="/minhas-compras" className="block px-3 py-3 text-base font-medium text-slate-700">
                    Minhas Compras
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-3 text-base font-medium text-rose-500">
                    Sair
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-3 px-3 py-4 text-base font-medium text-slate-700 border-b"
                >
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Login</span>
                </Link>
              )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
