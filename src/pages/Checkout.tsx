import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Package, 
  User, 
  Mail, 
  ShoppingBag,
  Zap,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { dbService } from '../services/dbService';
import { storageService } from '../services/storageService';
import { cn } from '../lib/utils';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [email, setEmail] = useState('');

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setEmail(u.email || '');
      } else {
        const mock = localStorage.getItem('mock_user');
        if (mock) {
          const userMob = JSON.parse(mock);
          setEmail(userMob.email || '');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCheckoutStripe = async () => {
    if (!email) return alert('Por favor, informe um e-mail.');
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          userId: auth.currentUser?.uid || 'guest_' + Date.now(),
          userEmail: email
        })
      });

      const { url, error } = await response.json();
      if (url) {
        // Registrar solicitação antes de redirecionar para persistência no admin
        await storageService.addCheckoutRequest({
          userEmail: email,
          items: items.map(i => i.slug),
          totalLabel: `R$ ${total.toFixed(2)}`,
          totalValue: total
        });
        window.location.href = url;
      } else {
        throw new Error(error || 'Erro ao iniciar Stripe');
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro no checkout: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutMP = async () => {
    if (!email) return alert('Por favor, informe um e-mail.');
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          userId: auth.currentUser?.uid || 'guest_' + Date.now(),
          userEmail: email
        })
      });

      const { init_point, error } = await response.json();
      if (init_point) {
        await storageService.addCheckoutRequest({
          userEmail: email,
          items: items.map(i => i.slug),
          totalLabel: `R$ ${total.toFixed(2)}`,
          totalValue: total
        });
        window.location.href = init_point;
      } else {
        throw new Error(error || 'Erro ao iniciar Mercado Pago');
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro no checkout: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
          <Link to="/microcaas" className="btn-primary py-3 px-8">Voltar ao Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[40px] p-16 text-center shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Pedido Solicitado!</h1>
            <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto">
              Como este é um ambiente de demonstração, sua solicitação foi enviada para o painel administrativo. 
              Em breve você receberá o link de pagamento real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link to="/dashboard" className="btn-primary py-4 px-12">Meu Painel</Link>
               <Link to="/" className="py-4 px-12 font-bold text-slate-500 hover:text-slate-700">Início</Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Form Steps */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-4 mb-4">
                 <Link to="/carrinho" className="p-2 hover:bg-white rounded-xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                 </Link>
                 <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Finalizar Compra</h1>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2">
                 <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= 1 ? "bg-blue-600" : "bg-slate-200")} />
                 <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= 2 ? "bg-blue-600" : "bg-slate-200")} />
              </div>

              {/* Step 1: Identification */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" /> Identificação
                  </h2>
                  <div className="space-y-6">
                    {!auth.currentUser && !localStorage.getItem('mock_user') && (
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-6">
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-4">
                          Você não está logado. Para uma experiência melhor e vincular suas licenças, recomendamos entrar ou criar uma conta.
                        </p>
                        <div className="flex gap-4">
                          <Link to="/login?redirect=checkout" className="text-xs font-black uppercase bg-blue-600 text-white px-4 py-2 rounded-lg">Entrar</Link>
                          <Link to="/signup?redirect=checkout" className="text-xs font-black uppercase bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-200">Criar Conta</Link>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">E-mail para Licenciamento</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com.br"
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">As licenças serão vinculadas a este e-mail e disponibilizadas no seu painel.</p>
                    </div>

                    <button 
                      onClick={() => setStep(2)}
                      disabled={!email.includes('@')}
                      className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                    >
                      Continuar para Pagamento <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Mock */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600" /> Pagamento
                    </h2>
                    <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 hover:text-blue-600">Voltar</button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                      <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Gateways Prontos
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Selecione seu método de pagamento para ser redirecionado aos gateways oficiais.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={handleCheckoutStripe}
                        disabled={isProcessing}
                        className="p-6 border-2 border-slate-200 hover:border-blue-600 rounded-3xl bg-white hover:bg-blue-50 flex flex-col items-center gap-3 text-center transition-all group disabled:opacity-50"
                      >
                        <CreditCard className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 italic">Internacional</span>
                          <span className="text-sm font-black text-slate-900 group-hover:text-blue-900">Cartão via Stripe</span>
                        </div>
                      </button>
                      <button 
                        onClick={handleCheckoutMP}
                        disabled={isProcessing}
                        className="p-6 border-2 border-slate-200 hover:border-blue-600 rounded-3xl bg-white hover:bg-blue-50 flex flex-col items-center gap-3 text-center transition-all group disabled:opacity-50"
                      >
                        <Zap className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 italic">Nacional</span>
                          <span className="text-sm font-black text-slate-900 group-hover:text-blue-900">PIX / Cartão via MP</span>
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Lock className="w-3 h-3" /> Transação Criptografada SSL
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column: Summary */}
            <div className="space-y-6">
               <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white">
                  <h3 className="font-bold flex items-center gap-2 mb-6">
                    <ShoppingBag className="w-4 h-4 text-blue-600" /> Resumo do Pedido
                  </h3>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                             <Package className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{item.pricingModel}</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{item.priceLabel}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Subtotal</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2">
                       <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total</span>
                       <span className="text-3xl font-black text-blue-600">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
               </div>

               <div className="p-6 bg-slate-900 rounded-[32px] text-white">
                  <div className="flex items-center gap-3 mb-4">
                     <ShieldCheck className="w-6 h-6 text-blue-400" />
                     <h4 className="font-bold">Segurança CaaS</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Todas as soluções MicrosCaaS passam por um processo de homologação técnica antes de serem listadas.
                  </p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
