import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import DiscoForm from './pages/DiscoForm'
import DiscoDetalhe from './pages/DiscoDetalhe'
import Cadastro from './pages/Cadastro'
import Configuracoes from './pages/Configuracoes'
import Wishlist from './pages/Wishlist'
import WishlistForm from './pages/WishlistForm'
import Audicoes from './pages/Audicoes'
import AudicaoForm from './pages/AudicaoForm'
import Mais from './pages/Mais'
import Dashboards from './pages/Dashboards'
import DashboardAudicoes from './pages/DashboardAudicoes'
import DashboardFinanceiro from './pages/DashboardFinanceiro'
import DashboardWishlist from './pages/DashboardWishlist'
import DashboardArtistas from './pages/DashboardArtistas'
import DashboardMusicos from './pages/DashboardMusicos'

function RotaProtegida() {
  const { autenticado } = useAuth()
  const location = useLocation()
  if (!autenticado) return <Navigate to="/login" state={{ from: location }} replace />
  return <Layout />
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RotaProtegida />}>
          <Route path="/" element={<Home />} />
          <Route path="/discos/novo" element={<DiscoForm />} />
          <Route path="/discos/:id/editar" element={<DiscoForm />} />
          <Route path="/discos/:id" element={<DiscoDetalhe />} />
          <Route path="/cadastros/:tipo" element={<Cadastro />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/wishlist/novo" element={<WishlistForm />} />
          <Route path="/wishlist/:id/editar" element={<WishlistForm />} />
          <Route path="/audicoes" element={<Audicoes />} />
          <Route path="/audicoes/nova" element={<AudicaoForm />} />
          <Route path="/audicoes/:id/editar" element={<AudicaoForm />} />
          <Route path="/dashboards" element={<Dashboards />} />
          <Route path="/dashboards/audicoes" element={<DashboardAudicoes />} />
          <Route path="/dashboards/financeiro" element={<DashboardFinanceiro />} />
          <Route path="/dashboards/wishlist" element={<DashboardWishlist />} />
          <Route path="/dashboards/artistas" element={<DashboardArtistas />} />
          <Route path="/dashboards/musicos" element={<DashboardMusicos />} />
          <Route path="/mais" element={<Mais />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
