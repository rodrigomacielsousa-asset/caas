import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Real Pages
import Home from './pages/Home';
import Solutions from './pages/Solutions';
import MicroCaaSPage from './pages/MicroCaaS';
import ProductDetail from './pages/ProductDetail';
import ReformaHub from './pages/Reforma';
// import Publish from './pages/Publish'; // Removed as per request
import Docs from './pages/Docs';
import Governance from './pages/Governance';
import MicroCaaSFactory from './pages/Factory';
import Ecossistema from './pages/Ecossistema';
import Ideas from './pages/Ideas';
import ICloudContabil from './pages/iCloudContabil';
import PreContabilidade from './pages/PreContabilidade';
import PreContabilAI from './pages/PreContabilAI';
import PortalCliente from './pages/PortalCliente';
import GestaoEscritorio from './pages/GestaoEscritorio';
import PropostasContratos from './pages/PropostasContratos';
import APInteligente from './pages/APInteligente';
import ForecastRelatorios from './pages/ForecastRelatorios';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';
import AdminPage from './pages/Admin';
import CartPage from './pages/Cart';
import BundleDetail from './pages/BundleDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardPage from './pages/Dashboard';
import ExtratoBr from './pages/ExtratoBr';
import ReceiptorBr from './pages/ReceiptorBr';
import FechamentoContabilPro from './pages/FechamentoContabilPro';
import HonorariosPro from './pages/HonorariosPro';
import PropostasContratosPro from './pages/PropostasContratosPro';
import FinanceInsight from './pages/FinanceInsight';
import CobraAI from './pages/CobraAI';
import DataHub from './pages/DataHub';
import OfficeContabil from './pages/OfficeContabil';
import Indicadores from './pages/Indicadores';
import CalculadorasTrabalhistas from './pages/CalculadorasTrabalhistas';
import SimuladorRegime from './pages/SimuladorRegime';
import SimuladorFatorR from './pages/SimuladorFatorR';
import SimuladorHonorarios from './pages/SimuladorHonorarios';
import ChecklistAbertura from './pages/ChecklistAbertura';
import SimuladorTransicaoReforma from './pages/SimuladorTransicaoReforma';
import SmokeTest from './pages/SmokeTest';
import ValidaEmpresa from './pages/ValidaEmpresa';
import Checkout from './pages/Checkout';
import GrowthDashboard from './pages/GrowthDashboard';
import NexusDF from './pages/NexusDF';
import ConsultaCNAE from './pages/ConsultaCNAE';
import Register from './pages/Register';
import ConsultaNFe from './pages/ConsultaNFe';
import MonitorNFe from './pages/MonitorNFe';
import LandingPage from './pages/LandingPage';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center space-y-4">
      <h1 className="text-9xl font-black text-slate-200">404</h1>
      <p className="text-xl font-bold text-slate-500 italic">Página não encontrada no ecossistema.</p>
      <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold">Voltar ao Início</button>
    </div>
  </div>
);

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes - No login required */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/solucoes" element={<Solutions />} />
            <Route path="/produtos" element={<Solutions />} />
            <Route path="/solucoes/:slug" element={<ProductDetail />} />
            <Route path="/solucao/:slug" element={<ProductDetail />} />
            <Route path="/micro/:slug" element={<ProductDetail />} />
            <Route path="/microcaas" element={<MicroCaaSPage />} />
            <Route path="/nexus-df" element={<NexusDF />} />
            <Route path="/simulador" element={<SimuladorRegime />} />
            <Route path="/fator-r" element={<SimuladorFatorR />} />
            <Route path="/honorarios" element={<SimuladorHonorarios />} />
            <Route path="/consulta-cnae" element={<ConsultaCNAE />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Register />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/reforma-hub" element={<ReformaHub />} />
            <Route path="/ecossistema" element={<Ecossistema />} />
            <Route path="/ideias" element={<Ideas />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/consulta-nfe" element={<ConsultaNFe />} />
            <Route path="/solucoes/consulta-nfe" element={<ConsultaNFe />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/vendas" element={<LandingPage />} />
            <Route path="/check-cnpj" element={<ValidaEmpresa />} />
            
            {/* Freemium & Demo Routes - Open, but internal check */}
            <Route path="/receiptor" element={<ReceiptorBr />} />
            <Route path="/extrato" element={<ExtratoBr />} />
            <Route path="/pre-contabil" element={<PreContabilAI />} />
            <Route path="/solucoes/receiptorbr" element={<ReceiptorBr />} />
            <Route path="/solucoes/extratobr" element={<ExtratoBr />} />
            <Route path="/solucoes/pre-contabil-ai" element={<PreContabilAI />} />
            
            {/* Private Routes - Login required */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/growth-dashboard" element={<GrowthDashboard />} />
              
              {/* Private Solutions */}
              <Route path="/office" element={<OfficeContabil />} />
              <Route path="/fechamento" element={<FechamentoContabilPro />} />
              <Route path="/portal" element={<PortalCliente />} />
              <Route path="/cliente" element={<PortalCliente />} />
              <Route path="/monitore" element={<MonitorNFe />} />
              <Route path="/monitor-nfe" element={<MonitorNFe />} />
              
              {/* Nested URLs for backward compatibility */}
              <Route path="/solucoes/office-contabil" element={<OfficeContabil />} />
              <Route path="/solucoes/fechamento-contabil-pro" element={<FechamentoContabilPro />} />
              <Route path="/solucoes/portal-cliente" element={<PortalCliente />} />
              <Route path="/solucoes/valida-empresa" element={<ValidaEmpresa />} />
              <Route path="/solucoes/honorarios-pro" element={<HonorariosPro />} />
              <Route path="/solucoes/propostas-contratos" element={<PropostasContratosPro />} />
              <Route path="/solucoes/data-hub" element={<DataHub />} />
            </Route>

            {/* Paywalled Solutions - Login + Plan required */}
            <Route element={<ProtectedRoute requiredModule="finance-insight" />}>
               <Route path="/finance-insight" element={<FinanceInsight />} />
               <Route path="/solucoes/finance-insight" element={<FinanceInsight />} />
            </Route>

            {/* Cobra AI is for Enterprise in current mappings, let's stick to module check */}
            <Route element={<ProtectedRoute requiredModule="cobra-ai" />}>
               <Route path="/cobra-ai" element={<CobraAI />} />
               <Route path="/solucoes/cobra-ai" element={<CobraAI />} />
            </Route>

            {/* Admin only */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* Other tools */}
            <Route path="/diag" element={<SmokeTest />} />
            <Route path="/reforma-simulador" element={<SimuladorTransicaoReforma />} />
            <Route path="/bundle/:slug" element={<BundleDetail />} />
            {/* <Route path="/publicar" element={<Publish />} /> Removed as per request */}
            <Route path="/governanca" element={<Governance />} />
            <Route path="/microcaas-factory" element={<MicroCaaSFactory />} />
            <Route path="/icloud-contabil" element={<ICloudContabil />} />
            <Route path="/pre-contabilidade" element={<PreContabilidade />} />
            <Route path="/gestao-escritorio" element={<GestaoEscritorio />} />
            <Route path="/propostas-contratos" element={<PropostasContratos />} />
            <Route path="/ap-inteligente" element={<APInteligente />} />
            <Route path="/forecast-relatorios" element={<ForecastRelatorios />} />
            
            <Route path="/ferramentas/consulta-cnae" element={<ConsultaCNAE />} />
            <Route path="/ferramentas/valida-empresa" element={<ValidaEmpresa />} />
            <Route path="/ferramentas/honorarios-pro" element={<HonorariosPro />} />
            <Route path="/ferramentas/propostas-contratos" element={<PropostasContratosPro />} />
            <Route path="/ferramentas/office-contabil" element={<OfficeContabil />} />
            <Route path="/ferramentas/pre-contabil-ai" element={<PreContabilAI />} />
            <Route path="/ferramentas/indicadores" element={<Indicadores />} />
            <Route path="/ferramentas/calculadoras" element={<CalculadorasTrabalhistas />} />
            <Route path="/ferramentas/simulador-regime" element={<SimuladorRegime />} />
            <Route path="/ferramentas/simulador-fator-r" element={<SimuladorFatorR />} />
            <Route path="/ferramentas/simulador-honorarios" element={<SimuladorHonorarios />} />
            <Route path="/ferramentas/checklist-abertura" element={<ChecklistAbertura />} />
            <Route path="/ferramentas/transicao-reforma" element={<SimuladorTransicaoReforma />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}
