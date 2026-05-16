import { Mail, Phone, MapPin, Globe, Linkedin, Youtube, Instagram, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contato() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 py-24 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Vamos conversar sobre o <br /> 
              <span className="text-blue-600">futuro da contabilidade.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              Dúvidas sobre o ecossistema, propostas de parcerias ou suporte técnico? Nossa equipe está pronta para ajudar.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Cards */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8"
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">E-mail</h3>
              <p className="text-slate-500 mb-6 font-medium">Envie sua dúvida e responderemos em até 24h úteis.</p>
              <a href="mailto:contato@microcaas.com.br" className="text-blue-600 font-black text-lg hover:underline block">contato@microcaas.com.br</a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8"
          >
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">WhatsApp</h3>
              <p className="text-slate-500 mb-6 font-medium">Atendimento dinâmico para suporte e vendas.</p>
              <a href="https://wa.me/5565992058727" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-black text-lg hover:underline block">+55 (65) 99205-8727</a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8"
          >
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center">
              <MapPin className="w-8 h-8 text-slate-800 dark:text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Localização</h3>
              <p className="text-slate-500 mb-6 font-medium">Nossa sede oficial no centro administrativo.</p>
              <address className="not-italic text-slate-900 dark:text-white font-black text-lg leading-tight">
                Brasília, DF <br /> Brasil
              </address>
            </div>
          </motion.div>
        </div>

        {/* Social & Forms Area */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">Acompanhe a revolução <br /> nas redes sociais</h2>
              <div className="flex gap-6">
                <a href="#" className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Linkedin className="w-6 h-6" /></a>
                <a href="#" className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Instagram className="w-6 h-6" /></a>
                <a href="#" className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Youtube className="w-6 h-6" /></a>
              </div>
            </div>

            <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[32px] border border-blue-100 dark:border-blue-900/30">
               <h4 className="font-bold flex items-center gap-2 mb-2"><Globe className="w-5 h-5 text-blue-600" /> Portal MicroCaaS 2025</h4>
               <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Ao submeter seu contato, você autoriza o recebimento de novidades sobre lançamentos e updates do sistema.</p>
            </div>
          </div>

          <form className="bg-white dark:bg-slate-900 p-12 rounded-[48px] shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nome</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-600 transition-all font-medium" placeholder="Ex: João Silva" />
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">E-mail</label>
                  <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-600 transition-all font-medium" placeholder="Ex: joao@empresa.com" />
               </div>
            </div>
            <div className="space-y-1">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Assunto</label>
               <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-600 transition-all font-medium appearance-none">
                  <option>Parceria Comercial</option>
                  <option>Suporte Técnico</option>
                  <option>MicroCaaS Factory (Expertise)</option>
                  <option>Outros</option>
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Mensagem</label>
               <textarea rows={4} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-600 transition-all font-medium" placeholder="Como podemos ajudar?"></textarea>
            </div>
            <button className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all group">
              Enviar Mensagem
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
