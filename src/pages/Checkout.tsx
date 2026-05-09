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

  const handleFinish = async () => {
    setIsProcessing(true);
    
    try {
      // Registrar o pedido no "storageService" (ou Firestore)
      const orderData = {
        userEmail: email || auth.currentUser?.email || 'anon@example.com',
        items: items.map(i => i.slug),
        totalLabel: `R$ ${total.toFixed(2)}`,
        status: 'pending' as const,
      };

      await storageService.addCheckoutRequest(orderData);
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
      clearCart();
    } catch (err) {
      console.error(err);
      alert('Erro ao processar pedido. Tente novamente.');
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
                 <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= 1 ? "bg-indigo-600" : "bg-slate-200")} />
                 <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= 2 ? "bg-indigo-600" : "bg-slate-200")} />
              </div>

              {/* Step 1: Identification */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <User className="w-5 h-5 text-indigo-600" /> Identificação
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">E-mail para Licenciamento</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com.br"
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
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
                      <CreditCard className="w-5 h-5 text-indigo-600" /> Pagamento
                    </h2>
                    <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 hover:text-indigo-600">Voltar</button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                       <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                         <ShieldCheck className="w-4 h-4 text-emerald-500" /> Gateways Prontos
                       </h3>
                       <p className="text-xs text-slate-500 leading-relaxed font-medium">
                         Nesta demo, o pagamento é simulado. Em produção real, você será redirecionado para o Stripe ou Mercado Pago via Checkout Transparente.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-4 border-2 border-indigo-600 rounded-2xl bg-indigo-50/50 flex flex-col items-center gap-2 text-center">
                          <Zap className="w-6 h-6 text-indigo-600" />
                          <span className="text-sm font-black text-indigo-900">Checkout Express</span>
                          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Recomendado</span>
                       </div>
                       <div className="p-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-2 text-center opacity-50">
                          <CreditCard className="w-6 h-6 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">Boleto / PIX</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Offline</span>
                       </div>
                    </div>

                    <button 
                      onClick={handleFinish}
                      disabled={isProcessing}
                      className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-2 font-black text-xl shadow-xl shadow-indigo-200"
                    >
                      {isProcessing ? (
                        <>Processando...</>
                      ) : (
                        <>Confirmar Pedido <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                       <Lock className="w-3 h-3" /> Transação Criptografada SSL
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column: Summary */}
            <div className="space-y-6">
               <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-6">
                    <ShoppingBag className="w-4 h-4 text-indigo-600" /> Resumo do Pedido
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
                            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{item.pricingModel}</span>
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
                       <span className="text-3xl font-black text-indigo-600">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
               </div>

               <div className="p-6 bg-slate-900 rounded-[32px] text-white">
                  <div className="flex items-center gap-3 mb-4">
                     <ShieldCheck className="w-6 h-6 text-indigo-400" />
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
