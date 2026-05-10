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
import Publish from './pages/Publish';
import Docs from './pages/Docs';
import Governance from './pages/Governance';
import MicroCaaSFactory from './pages/Factory';
import ICloudContabil from './pages/iCloudContabil';
import PreContabilidade from './pages/PreContabilidade';
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
import ExtratoBR from './pages/ExtratoBR';
import ReceiptorBr from './pages/ReceiptorBr';
import NexusDF from './pages/NexusDF';
import Login from './pages/Login';
import Register from './pages/Register';
import CheckoutPage from './pages/Checkout';
import DashboardPage from './pages/Dashboard';
import ConsultaCNAE from './pages/ConsultaCNAE';
import Indicadores from './pages/Indicadores';
import CalculadorasTrabalhistas from './pages/CalculadorasTrabalhistas';
import SimuladorRegime from './pages/SimuladorRegime';
import SimuladorFatorR from './pages/SimuladorFatorR';
import SimuladorHonorarios from './pages/SimuladorHonorarios';
import ChecklistAbertura from './pages/ChecklistAbertura';
import SimuladorTransicaoReforma from './pages/SimuladorTransicaoReforma';
import SmokeTest from './pages/SmokeTest';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="text-center space-y-4">
      <h1 className="text-9xl font-black text-slate-200 dark:text-slate-800">404</h1>
      <p className="text-xl font-bold text-slate-500 italic">Página não encontrada no ecossistema.</p>
      <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold">Voltar ao Início</button>
    </div>
  </div>
);

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/solucoes" element={<Solutions />} />
            <Route path="/solucao/:slug" element={<ProductDetail />} />
            <Route path="/microcaas" element={<MicroCaaSPage />} />
            <Route path="/diag" element={<SmokeTest />} />
            <Route path="/micro/:slug" element={<ProductDetail />} />
            <Route path="/extrato-br" element={<ExtratoBR />} />
            <Route path="/receiptor-br" element={<ReceiptorBr />} />
            <Route path="/app/nexus-df" element={<NexusDF />} />
            <Route path="/bundle/:slug" element={<BundleDetail />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/minhas-compras" element={<Navigate to="/dashboard" replace />} />
            <Route path="/reforma" element={<Navigate to="/reforma-hub" replace />} />
            <Route path="/reforma-hub" element={<ReformaHub />} />
            <Route path="/publicar" element={<Publish />} />
            <Route path="/docs" element={<Navigate to="/publicar" replace />} />
            <Route path="/governanca" element={<Governance />} />
            <Route path="/microcaas-factory" element={<MicroCaaSFactory />} />
            <Route path="/icloud-contabil" element={<ICloudContabil />} />
            <Route path="/pre-contabilidade" element={<PreContabilidade />} />
            <Route path="/portal-cliente" element={<PortalCliente />} />
            <Route path="/gestao-escritorio" element={<GestaoEscritorio />} />
            <Route path="/propostas-contratos" element={<PropostasContratos />} />
            <Route path="/ap-inteligente" element={<APInteligente />} />
            <Route path="/forecast-relatorios" element={<ForecastRelatorios />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ferramentas/consulta-cnae" element={<ConsultaCNAE />} />
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
