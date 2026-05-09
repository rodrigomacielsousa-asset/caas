import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Github, 
  Chrome, 
  LayoutGrid, 
  Fingerprint, 
  ShieldCheck,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, loginWithEmail, signInWithGoogle } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro no login com Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevQuickLogin = () => {
    // Mock login for developer view
    localStorage.setItem('mock_user', JSON.stringify({ email: 'admin@microcaas.com.br', isAdmin: true, displayName: 'Admin' }));
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-[56px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Left Side: Illustration & Value Prop */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative">
          <div className="absolute top-0 right-0 p-12 opacity-10"><LayoutGrid className="w-48 h-48" /></div>
          
          <div className="relative z-10 flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">M</div>
             <h2 className="text-xl font-bold tracking-tight">MicroCaaS 2025</h2>
          </div>

          <div className="relative z-10 space-y-6">
             <h1 className="text-5xl font-black tracking-tighter leading-none">Acesso à <br /><span className="text-indigo-400">Plataforma.</span></h1>
             <p className="text-indigo-200/60 font-medium text-lg leading-relaxed max-w-sm">Entre no ecossistema e gerencie todas as suas microsoluções contábeis em um só lugar.</p>
          </div>

          <div className="relative z-10 p-8 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 flex items-center gap-6">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <div>
                <h4 className="text-sm font-bold">Ambiente Auditado</h4>
                <p className="text-xs text-white/40">Seus dados e licenças estão 100% protegidos por criptografia militar.</p>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center space-y-12">
          <div className="space-y-4">
             <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest">
                <ArrowLeft className="w-3 h-3" /> Voltar ao Site
             </Link>
             <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Login</h2>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-3">
               <Fingerprint className="w-4 h-4" /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleEmailLogin}>
             <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Empresa / E-mail</label>
                <div className="relative">
                   <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-14 py-4 font-medium focus:ring-2 focus:ring-indigo-600 transition-all" 
                    placeholder="seu@email.com.br" 
                   />
                </div>
             </div>

             <div className="space-y-1">
                <div className="flex justify-between items-center px-4">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Senha</label>
                   <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:underline">Esqueci a senha</button>
                </div>
                <div className="relative">
                   <Lock className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-14 py-4 font-medium focus:ring-2 focus:ring-indigo-600 transition-all" 
                    placeholder="••••••••" 
                   />
                </div>
             </div>

             <button 
              disabled={isLoading}
              className="w-full btn-primary py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 group disabled:opacity-50"
             >
                {isLoading ? 'Autenticando...' : 'Entrar na Workspace'}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
             </button>
          </form>

          <div className="space-y-8">
             <div className="flex items-center gap-4 text-slate-300">
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                <span className="text-[10px] font-bold uppercase tracking-widest italic shrink-0">Ou acesso via Cloud</span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-3 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-white transition-all group"
                >
                   <Chrome className="w-5 h-5 group-hover:text-amber-500 transition-colors" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Google Workspace</span>
                </button>
                <button 
                  onClick={handleDevQuickLogin}
                  className="flex items-center justify-center gap-3 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-white transition-all group"
                >
                   <Zap className="w-5 h-5 group-hover:text-indigo-600 transition-colors" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Quick Dev</span>
                </button>
             </div>

             <p className="text-center text-sm font-medium text-slate-500">
                Novo por aqui? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Crie sua conta parceira</Link>
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
