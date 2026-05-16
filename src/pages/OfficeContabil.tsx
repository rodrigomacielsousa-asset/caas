import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Search, 
  Filter, 
  Calendar,
  Plus,
  ArrowRight,
  ChevronRight,
  Zap,
  Building2,
  Trash2,
  Edit,
  ArrowLeft,
  Crown,
  Bell,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Settings,
  MoreVertical,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

// Types
interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  deadline: string;
}

interface Client {
  id: string;
  companyName: string;
  cnpj: string;
  responsible: string;
  status: 'active' | 'pending' | 'risk';
  tasks: Task[];
  margin?: number; // From Honorários integration
  isIrregular?: boolean; // From CheckCNPJ integration
}

// Initial Data
const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    companyName: 'Prime Tech Solutions',
    cnpj: '12.345.678/0001-90',
    responsible: 'Diego Silveira',
    status: 'active',
    margin: 45,
    tasks: [
      { id: 't1', title: 'Folha de Pagamento - Maio', status: 'completed', deadline: '2024-05-05' },
      { id: 't2', title: 'Apuração Fiscal (DAS)', status: 'in_progress', deadline: '2024-05-20' },
    ]
  },
  {
    id: '2',
    companyName: 'Padaria Alfa Ltda',
    cnpj: '98.765.432/0001-11',
    responsible: 'Ana Beatriz',
    status: 'risk',
    margin: 12,
    isIrregular: true,
    tasks: [
      { id: 't3', title: 'Entrega de DEFIS', status: 'pending', deadline: '2024-05-15' },
    ]
  },
  {
    id: '3',
    companyName: 'Consultoria Beta',
    cnpj: '33.222.111/0001-22',
    responsible: 'Cássio Andrade',
    status: 'pending',
    tasks: []
  }
];

export default function OfficeContabil() {
  const location = useLocation();
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [activeView, setActiveView] = useState<'dashboard' | 'clients' | 'tasks' | 'deadlines'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [newClientData, setNewClientData] = useState<{
    companyName: string;
    cnpj: string;
    responsible: string;
    margin?: number;
  }>({ companyName: '', cnpj: '', responsible: '' });

  // Integration from CheckCNPJ or Valida Empresa or Honorários
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const dataRaw = searchParams.get('data');
    const marginParam = searchParams.get('margin');
    
    if (dataRaw || marginParam) {
      try {
        let integratedData: any = {};
        if (dataRaw) integratedData = JSON.parse(decodeURIComponent(dataRaw));
        
        setNewClientData({
          companyName: integratedData.razaoSocial || integratedData.companyName || '',
          cnpj: integratedData.cnpj || '',
          responsible: integratedData.responsible || '',
          margin: marginParam ? parseFloat(marginParam) : undefined
        });
        setIsNewClientModalOpen(true);
      } catch (e) {
        console.error("Error parsing integration data", e);
      }
    }
  }, [location]);

  const stats = useMemo(() => {
    const total = clients.length;
    const risk = clients.filter(c => c.status === 'risk' || (c.margin && c.margin < 20)).length;
    const pendingTasks = clients.reduce((acc, c) => acc + c.tasks.filter(t => t.status !== 'completed').length, 0);
    return { total, risk, pendingTasks };
  }, [clients]);

  const filteredClients = clients.filter(c => 
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cnpj.includes(searchQuery)
  );

  const handleAddClient = () => {
    // O usuário solicitou remover limites compulsórios de plano free
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      ...newClientData,
      status: 'pending',
      tasks: []
    };
    setClients([...clients, newClient]);
    setIsNewClientModalOpen(false);
    setNewClientData({ companyName: '', cnpj: '', responsible: '' });
  };

  const toggleTaskStatus = (clientId: string, taskId: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          tasks: c.tasks.map(t => {
            if (t.id === taskId) {
              const nextStatus: Task['status'] = t.status === 'pending' ? 'in_progress' : t.status === 'in_progress' ? 'completed' : 'pending';
              return { ...t, status: nextStatus };
            }
            return t;
          })
        };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar Navigation */}
      <div className="w-24 md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col pt-32 pb-10 fixed h-full z-20">
        <div className="px-6 mb-12 hidden md:block">
           <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Office Contábil</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Gestão de Escritório</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
           {[
             { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
             { id: 'clients', label: 'Clientes', icon: Users },
             { id: 'tasks', label: 'Tarefas', icon: ClipboardList },
             { id: 'deadlines', label: 'Prazos', icon: CalendarDays },
           ].map(item => (
             <button
               key={item.id}
               onClick={() => setActiveView(item.id as any)}
               className={cn(
                 "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group",
                 activeView === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
               )}
             >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span className="font-bold text-sm hidden md:block">{item.label}</span>
             </button>
           ))}
        </nav>

        <div className="px-4 mt-auto space-y-4">
           {/* O usuário solicitou remover o bloco de upgrade */}
           <Link to="/solucoes" className="flex items-center gap-4 px-4 py-4 text-slate-400 hover:text-blue-600 transition-all">
              <ArrowLeft className="w-6 h-6" />
              <span className="font-bold text-sm hidden md:block">Voltar</span>
           </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-24 md:ml-72 pt-32 pb-20 px-4 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <Link to="/solucoes" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest mb-4">
            <ArrowLeft className="w-4 h-4" /> Catálogo de Soluções
          </Link>

          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
                <div className="space-y-2">
                   <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                      Painel <span className="text-blue-600 italic">Geral.</span>
                   </h1>
                   <p className="text-lg text-slate-500 font-serif italic">Visão 360 do seu escritório contábil.</p>
                </div>
                <button 
                  onClick={() => setIsNewClientModalOpen(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                >
                   <UserPlus className="w-4 h-4" /> Novo Cliente
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'Carteira Ativa', val: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Clientes em Risco', val: stats.risk, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
                  { label: 'Tarefas Pendentes', val: stats.pendingTasks, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                ].map(k => (
                  <div key={k.label} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
                    <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center flex-shrink-0", k.bg)}>
                       <k.icon className={cn("w-8 h-8", k.color)} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
                       <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{k.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alertas Automáticos */}
              <div className="space-y-6">
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" /> Alertas Automáticos
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clients.some(c => c.margin && c.margin < 20) && (
                      <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-800/50 flex items-start gap-4">
                         <TrendingUp className="w-6 h-6 text-rose-500 mt-1" />
                         <div>
                            <h4 className="text-sm font-black text-rose-900 dark:text-rose-400 uppercase tracking-widest leading-none mb-2">Baixa Rentabilidade</h4>
                            <p className="text-xs text-rose-700 dark:text-rose-500 font-medium">Clientes identificados com margem abaixo de 20%. Verifique precificação no Honorários Pro.</p>
                         </div>
                      </div>
                    )}
                    {clients.some(c => c.isIrregular) && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-800/50 flex items-start gap-4">
                         <ShieldCheck className="w-6 h-6 text-amber-600 mt-1" />
                         <div>
                            <h4 className="text-sm font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest leading-none mb-2">Inconsistência Federal</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-500 font-medium">Empresas com pendências detectadas via CheckCNPJ. Risco de desenquadramento.</p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Tasks of the Day */}
              <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Tarefas Críticas - Hoje</h3>
                    <button onClick={() => setActiveView('tasks')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-1">Ver Tudo <ChevronRight className="w-3 h-3" /></button>
                 </div>
                 <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {clients.flatMap(c => c.tasks.filter(t => t.status !== 'completed').map(t => ({ ...t, company: c.companyName, clientId: c.id }))).slice(0, 5).map(task => (
                      <div key={task.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                         <div className="flex items-center gap-4">
                            <button 
                              onClick={() => toggleTaskStatus(task.clientId, task.id)}
                              className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-blue-600 transition-colors"
                            >
                               {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                            </button>
                            <div>
                               <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{task.title}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.company}</p>
                            </div>
                         </div>
                         <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-full">
                            Hoje
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}

          {/* Clients View */}
          {activeView === 'clients' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Carteira de <span className="text-blue-600">Clientes</span></h1>
                    <p className="text-sm font-medium text-slate-500">Gerencie todos os seus contratos ativos.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="relative group">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                       <input 
                         type="text" 
                         placeholder="Buscar por CNPJ ou Nome..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all w-full md:w-80"
                       />
                    </div>
                    <button className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm">
                       <Filter className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {filteredClients.map(client => (
                   <motion.div 
                     key={client.id}
                     layoutId={client.id}
                     className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden"
                   >
                      <div className="absolute top-0 right-0 p-8">
                         <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                      </div>

                      <div className="space-y-6">
                         <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-[28px] flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                            <Building2 className="w-8 h-8" />
                         </div>
                         
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{client.companyName}</h3>
                               {client.isIrregular && <AlertCircle className="w-4 h-4 text-amber-500" />}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client.cnpj}</p>
                         </div>

                         <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50 dark:border-slate-800">
                            <div>
                               <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Status</span>
                               <span className={cn(
                                 "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                                 client.status === 'active' ? "text-emerald-600 bg-emerald-50" :
                                 client.status === 'risk' ? "text-rose-600 bg-rose-50" : "text-amber-600 bg-amber-50"
                               )}>{client.status}</span>
                            </div>
                            <div>
                               <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Margem</span>
                               <span className={cn(
                                 "text-lg font-black",
                                 (client.margin || 0) < 20 ? "text-rose-500" : "text-emerald-500"
                               )}>{client.margin ? `${client.margin}%` : 'N/A'}</span>
                            </div>
                         </div>

                         <div className="flex items-center justify-between pt-2">
                            <div className="flex -space-x-2">
                               {[1, 2].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">?</div>
                               ))}
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                               Gerenciar <ArrowRight className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                   </motion.div>
                 ))}

                 {/* New Client Card UI */}
                 {!isPremium && clients.length >= 5 ? (
                   <div className="bg-slate-900 p-8 rounded-[48px] text-white flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group">
                      <Crown className="w-16 h-16 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="space-y-4">
                         <h3 className="text-xl font-bold italic leading-tight">Chegou ao Limite!</h3>
                         <p className="text-xs font-medium text-slate-400 leading-relaxed px-4">O plano FREE permite gerenciar até 5 clientes. Desbloqueie o PRO para crescer sem limites.</p>
                      </div>
                      <button 
                        onClick={() => setIsPremium(true)}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20"
                      >
                         Seja PRO por R$ 49/mês
                      </button>
                   </div>
                 ) : (
                   <button 
                     onClick={() => setIsNewClientModalOpen(true)}
                     className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-6 hover:border-blue-600 hover:bg-slate-50 transition-all text-slate-300 hover:text-blue-600 group"
                   >
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                         <Plus className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest italic">Adicionar Novo Cliente</span>
                   </button>
                 )}
              </div>
            </motion.div>
          )}

          {/* Tasks/Workflow View */}
          {activeView === 'tasks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Workflow <span className="text-blue-600 italic">Contábil.</span></h1>
                    <p className="text-sm font-medium text-slate-500">Controle de obrigações e tarefas diárias.</p>
                 </div>
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {['pending', 'in_progress', 'completed'].map(tab => (
                      <button key={tab} className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">{tab.replace('_', ' ')}</button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {['pending', 'in_progress', 'completed'].map((status) => (
                  <div key={status} className="space-y-6">
                     <div className="flex items-center justify-between px-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                           <div className={cn(
                             "w-2 h-2 rounded-full",
                             status === 'pending' ? "bg-rose-400" : status === 'in_progress' ? "bg-amber-400" : "bg-emerald-400"
                           )} />
                           {status === 'pending' ? 'Pendente' : status === 'in_progress' ? 'Em Andamento' : 'Concluído'}
                        </h4>
                        <span className="text-[10px] font-black text-slate-400">{clients.flatMap(c => c.tasks.filter(t => t.status === status)).length}</span>
                     </div>
                     <div className="space-y-4">
                        {clients.flatMap(c => c.tasks.filter(t => t.status === status).map(t => ({ ...t, company: c.companyName, clientId: c.id }))).map(task => (
                           <div key={task.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-move group">
                              <div className="flex items-start justify-between mb-4">
                                 <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{task.title}</h5>
                                 <button className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit className="w-4 h-4" /></button>
                              </div>
                              <div className="flex items-center justify-between">
                                 <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tight">{task.company}</div>
                                 <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase italic">
                                    <Clock className="w-3 h-3 text-rose-400" /> {task.deadline}
                                 </div>
                              </div>
                           </div>
                        ))}
                        <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-300 hover:border-blue-600 hover:text-blue-600 transition-all text-[10px] font-black uppercase tracking-widest">
                           Adicionar Tarefa
                        </button>
                     </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Deadlines/Calendar View (Placeholder) */}
          {activeView === 'deadlines' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <div className="text-center py-32 space-y-8">
                  <Calendar className="w-24 h-24 text-blue-600 mx-auto opacity-20" />
                  <div className="space-y-2">
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Agenda Fiscal</h2>
                     <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Visualize todos os vencimentos de impostos e obrigações do mês.</p>
                  </div>
                  <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-100 dark:shadow-none">Carregar Calendário 2024</button>
               </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* New Client Modal */}
      <AnimatePresence>
        {isNewClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsNewClientModalOpen(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[48px] shadow-3xl overflow-hidden"
             >
                <div className="p-12 space-y-8">
                   <div className="text-center space-y-2">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Novo Clientes</h3>
                      <p className="text-sm font-medium text-slate-500">Cadastre os dados básicos para iniciar a gestão.</p>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                         <input 
                           type="text" 
                           value={newClientData.companyName}
                           onChange={(e) => setNewClientData({...newClientData, companyName: e.target.value})}
                           className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-600 transition-all"
                           placeholder="Ex: Minha Empresa Ltda"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                         <input 
                           type="text" 
                           value={newClientData.cnpj}
                           onChange={(e) => setNewClientData({...newClientData, cnpj: e.target.value})}
                           className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-600 transition-all font-mono"
                           placeholder="00.000.000/0000-00"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsável</label>
                         <input 
                           type="text" 
                           value={newClientData.responsible}
                           onChange={(e) => setNewClientData({...newClientData, responsible: e.target.value})}
                           className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-600 transition-all"
                           placeholder="Nome do Proprietário"
                         />
                      </div>
                   </div>

                   <div className="flex gap-4 p-2 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                      <button 
                        onClick={() => setIsNewClientModalOpen(false)}
                        className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
                      >
                         Cancelar
                      </button>
                      <button 
                         onClick={handleAddClient}
                         disabled={!newClientData.companyName || !newClientData.cnpj}
                         className="flex-[3] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:bg-slate-900 transition-all"
                      >
                         Confirmar Cadastro
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
