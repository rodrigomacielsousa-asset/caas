import React, { useState } from 'react';
import { 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  Users,
  Briefcase,
  Chrome
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const createInitialProfile = async (uid: string, userEmail: string, userName: string) => {
     // Create initial user profile in Firestore
      await setDoc(doc(db, 'users', uid), {
        name: userName,
        email: userEmail,
        plano: 'free',
        status: 'ativo',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      // Default user plan
      await setDoc(doc(db, 'userPlans', uid), {
        tier: 'free',
        activeModules: ['extrato', 'receiptor'],
        limits: { clients: 2, docsPerMonth: 10 }
      });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await createInitialProfile(user.uid, email, name);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await createInitialProfile(user.uid, user.email || '', user.displayName || 'Usuário Google');
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro no cadastro com Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-white dark:bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 p-8 opacity-5 rotate-12"><Users className="w-48 h-48 text-indigo-600" /></div>
        
        <div className="space-y-8 relative z-10">
          <div className="flex flex-col items-center text-center gap-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Novo Acesso</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Crie sua conta em 30 segundos</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor email"
                  required
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Defina sua senha"
                  required
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-slate-900 transition-all flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Criar Minha Conta <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white dark:bg-slate-900 px-4">Ou cadastre-se com</div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Chrome className="w-5 h-5 text-indigo-600" /> Cadastrar com Google</>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Já tem uma conta? <Link to="/login" className="text-indigo-600 hover:underline">Voltar ao Portal</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
