import React, { useState } from 'react';
import { 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Chrome
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSuccessfulLogin = (userId: string) => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      const params = new URLSearchParams(searchParams);
      params.delete('redirect');
      const queryString = params.toString();
      navigate(`/${redirect}${queryString ? `?${queryString}` : ''}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Mock login for the user's requested test account
    if (email === 'teste@microcaas.com.br' && password === '178801') {
       localStorage.setItem('mock_user', JSON.stringify({
         uid: 'teste-microcaas-uid',
         email: 'teste@microcaas.com.br',
         displayName: 'Usuário Teste',
         plano: 'free'
       }));
       handleSuccessfulLogin('teste-microcaas-uid');
       setIsLoading(false);
       return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      handleSuccessfulLogin(userCredential.user.uid);
    } catch (err: any) {
      console.error(err);
      let msg = 'Erro ao realizar login. Verifique seu e-mail e senha.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Muitas tentativas sem sucesso. Tente novamente mais tarde.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore, if not create profile (it's essentially a signup too)
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || 'Usuário Google',
          email: user.email,
          plano: 'free',
          status: 'ativo',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });

        await setDoc(doc(db, 'userPlans', user.uid), {
          tier: 'free',
          activeModules: ['extrato', 'receiptor'],
          limits: { clients: 2, docsPerMonth: 10 }
        });
      }

      handleSuccessfulLogin(user.uid);
    } catch (err: any) {
      setError(err.message || 'Erro no login com Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return setError("Por favor, preencha o campo de email.");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email de redefinição de senha enviado!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 md:p-10 rounded-[32px] border border-slate-200 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12"><Zap className="w-48 h-48" /></div>
        
        <div className="space-y-8 relative z-10">
          <div className="flex flex-col items-center text-center gap-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Entrar no Portal</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acesse suas ferramentas e relatórios</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  required
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 border-none rounded-3xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="w-full pl-16 pr-16 py-6 bg-slate-50 border-none rounded-3xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center px-4">
               <button 
                 type="button"
                 onClick={handleResetPassword}
                 className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
               >
                  Esqueci minha senha
               </button>
            </div>

            <button 
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Entrar Agora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white px-4">Ou continue com</div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-5 bg-white border border-slate-200 text-slate-900 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Chrome className="w-5 h-5 text-blue-600" /> Acessar com Google</>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Ainda não tem acesso? <Link to="/signup" className="text-blue-600 hover:underline">Criar conta gratuita</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
