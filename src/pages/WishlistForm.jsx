import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Loader2, Trash2, ArrowLeft, Plus } from 'lucide-react'
import api from '../api/client'

const ESTADO_INICIAL = {
  titulo: '',
  id_artista: '',
  id_formato: '',
  id_genero: '',
  ano_lancamento: '',
  numero_catalogo: '',
  prioridade: 3,
  adquirido: false,
  observacoes: '',
}

const PRECO_INICIAL = { id_loja: '', valor: '' }

const inputClass =
  'bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent'
const labelClass = 'flex flex-col gap-1 text-sm'
const spanClass = 'text-muted'

function numOuNulo(v) {
  if (v === '' || v === null || v === undefined) return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`${labelClass} ${className}`}>
      <span className={spanClass}>{label}</span>
      {children}
    </label>
  )
}

function Secao({ titulo, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">{titulo}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{children}</div>
    </section>
  )
}

export default function WishlistForm() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(ESTADO_INICIAL)
  const [precos, setPrecos] = useState([])
  const [novoPreco, setNovoPreco] = useState(PRECO_INICIAL)
  const [listas, setListas] = useState({ artistas: [], generos: [], formatos: [], lojas: [] })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  const carregarItem = () => {
    const requisicoes = [api.get('/artistas'), api.get('/generos'), api.get('/formatos'), api.get('/lojas')]
    if (editando) requisicoes.push(api.get(`/wishlist/${id}`))

    return Promise.all(requisicoes).then((resultados) => {
      const [artistas, generos, formatos, lojas, itemRes] = resultados
      setListas({ artistas: artistas.data, generos: generos.data, formatos: formatos.data, lojas: lojas.data })
      if (itemRes) {
        const d = itemRes.data
        setForm({
          titulo: d.titulo ?? '',
          id_artista: d.id_artista ?? '',
          id_formato: d.id_formato ?? '',
          id_genero: d.id_genero ?? '',
          ano_lancamento: d.ano_lancamento ?? '',
          numero_catalogo: d.numero_catalogo ?? '',
          prioridade: d.prioridade ?? 3,
          adquirido: Boolean(d.adquirido),
          observacoes: d.observacoes ?? '',
        })
        setPrecos(d.historico_precos || [])
      }
    })
  }

  useEffect(() => {
    carregarItem()
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setCarregando(false))
  }, [id, editando]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) {
      setErro('O título é obrigatório.')
      return
    }
    setSalvando(true)
    setErro(null)
    const payload = {
      titulo: form.titulo.trim(),
      id_artista: numOuNulo(form.id_artista),
      id_formato: numOuNulo(form.id_formato),
      id_genero: numOuNulo(form.id_genero),
      ano_lancamento: numOuNulo(form.ano_lancamento),
      numero_catalogo: form.numero_catalogo || null,
      prioridade: numOuNulo(form.prioridade) || 3,
      adquirido: form.adquirido,
      observacoes: form.observacoes || null,
    }

    try {
      if (editando) {
        await api.put(`/wishlist/${id}`, payload)
        navigate('/wishlist')
      } else {
        payload.precos_iniciais = precos
          .filter((p) => p.id_loja && p.valor !== '')
          .map((p) => ({
            id_loja: numOuNulo(p.id_loja),
            valor: numOuNulo(p.valor),
          }))
        await api.post('/wishlist', payload)
        navigate('/wishlist')
      }
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async () => {
    if (!confirm('Excluir este item da wishlist? Essa ação não pode ser desfeita.')) return
    try {
      await api.delete(`/wishlist/${id}`)
      navigate('/wishlist')
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    }
  }

  const adicionarPrecoLocal = () => {
    if (!novoPreco.id_loja || novoPreco.valor === '') return
    setPrecos((prev) => [...prev, novoPreco])
    setNovoPreco(PRECO_INICIAL)
  }

  const removerPrecoLocal = (index) => {
    setPrecos((prev) => prev.filter((_, i) => i !== index))
  }

  const adicionarPrecoRemoto = async () => {
    if (!novoPreco.id_loja || novoPreco.valor === '') return
    try {
      await api.post('/wishlist/precos', {
        id_wishlist: id,
        id_loja: numOuNulo(novoPreco.id_loja),
        valor: numOuNulo(novoPreco.valor),
      })
      setNovoPreco(PRECO_INICIAL)
      await carregarItem()
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    }
  }

  const removerPrecoRemoto = async (id_preco) => {
    try {
      await api.delete(`/wishlist/precos/${id_preco}`)
      await carregarItem()
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20 text-faint gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link to="/wishlist" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        {editando && (
          <button
            type="button"
            onClick={excluir}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" /> Excluir item
          </button>
        )}
      </div>

      <h1 className="text-xl font-semibold mb-6">{editando ? 'Editar item da wishlist' : 'Novo item na wishlist'}</h1>

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

      <form onSubmit={salvar} className="flex flex-col gap-8">
        <Secao titulo="Identificação">
          <Field label="Título *" className="md:col-span-2">
            <input value={form.titulo} onChange={set('titulo')} required className={inputClass} />
          </Field>
          <Field label="Artista">
            <select value={form.id_artista} onChange={set('id_artista')} className={inputClass}>
              <option value="">Selecione...</option>
              {listas.artistas.map((a) => (
                <option key={a.id_artista} value={a.id_artista}>{a.nome}</option>
              ))}
            </select>
          </Field>
          <Field label="Gênero">
            <select value={form.id_genero} onChange={set('id_genero')} className={inputClass}>
              <option value="">Selecione...</option>
              {listas.generos.map((g) => (
                <option key={g.id_genero} value={g.id_genero}>{g.nome}</option>
              ))}
            </select>
          </Field>
          <Field label="Formato">
            <select value={form.id_formato} onChange={set('id_formato')} className={inputClass}>
              <option value="">Selecione...</option>
              {listas.formatos.map((f) => (
                <option key={f.id_formato} value={f.id_formato}>{f.nome}</option>
              ))}
            </select>
          </Field>
          <Field label="Ano de lançamento">
            <input type="number" value={form.ano_lancamento} onChange={set('ano_lancamento')} className={inputClass} />
          </Field>
          <Field label="Número de catálogo">
            <input value={form.numero_catalogo} onChange={set('numero_catalogo')} className={inputClass} />
          </Field>
          <Field label="Prioridade (1 = mais alta)">
            <select value={form.prioridade} onChange={set('prioridade')} className={inputClass}>
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm text-muted pt-6">
            <input type="checkbox" checked={form.adquirido} onChange={set('adquirido')} />
            Já adquirido
          </label>
          <Field label="Observações" className="md:col-span-3">
            <textarea value={form.observacoes} onChange={set('observacoes')} rows={3} className={inputClass} />
          </Field>
        </Secao>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">Preços pesquisados</h2>

          {precos.length === 0 && <p className="text-sm text-faint">Nenhum preço pesquisado ainda.</p>}
          {precos.map((p, index) => (
            <div
              key={p.id_wishlist_preco ?? `local-${index}`}
              className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_auto] gap-2 items-center bg-surface/60 border border-border rounded-lg p-2"
            >
              <span className="text-sm truncate">{p.loja_nome || listas.lojas.find((l) => String(l.id_loja) === String(p.id_loja))?.nome || '—'}</span>
              <span className="text-sm">R$ {Number(p.valor).toFixed(2)}</span>
              <button
                type="button"
                onClick={() => (editando ? removerPrecoRemoto(p.id_wishlist_preco) : removerPrecoLocal(index))}
                className="p-2 text-muted hover:text-red-500 hover:bg-surface-2 rounded justify-self-end"
                aria-label="Remover preço"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr_auto] gap-2 items-start">
            <select
              value={novoPreco.id_loja}
              onChange={(e) => setNovoPreco((prev) => ({ ...prev, id_loja: e.target.value }))}
              className={inputClass}
            >
              <option value="">Loja...</option>
              {listas.lojas.map((l) => (
                <option key={l.id_loja} value={l.id_loja}>{l.nome}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              value={novoPreco.valor}
              onChange={(e) => setNovoPreco((prev) => ({ ...prev, valor: e.target.value }))}
              placeholder="Valor"
              className={inputClass}
            />
            <button
              type="button"
              onClick={editando ? adicionarPrecoRemoto : adicionarPrecoLocal}
              className="p-2 text-accent hover:bg-surface-2 rounded justify-self-end"
              aria-label="Adicionar preço"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </section>

        <div className="flex gap-3 pt-2 pb-8">
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-contrast font-medium px-5 py-2.5 rounded-lg"
          >
            {salvando && <Loader2 className="w-4 h-4 animate-spin" />}
            {editando ? 'Salvar alterações' : 'Adicionar à wishlist'}
          </button>
          <Link to="/wishlist" className="flex items-center px-5 py-2.5 rounded-lg border border-border-strong text-sm hover:border-faint">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
