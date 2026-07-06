import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
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
          <Route path="/mais" element={<Mais />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
