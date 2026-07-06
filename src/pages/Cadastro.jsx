import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import api from '../api/client'
import { ENTIDADES } from '../api/entidades'

export default function Cadastro() {
  const { tipo } = useParams()
  const cfg = ENTIDADES[tipo]

  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [novoNome, setNovoNome] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [editandoNome, setEditandoNome] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!cfg) return
    setErro(null)
    setLoading(true)
    api
      .get(cfg.endpoint)
      .then((res) => setItens(res.data))
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setLoading(false))
  }, [tipo]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!cfg) return <Navigate to="/" replace />

  const recarregar = () => {
    api
      .get(cfg.endpoint)
      .then((res) => setItens(res.data))
      .catch((err) => setErro(err.response?.data?.error || err.message))
  }

  const criar = async (e) => {
    e.preventDefault()
    if (!novoNome.trim()) return
    setSalvando(true)
    try {
      await api.post(cfg.endpoint, { nome: novoNome.trim() })
      setNovoNome('')
      recarregar()
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    } finally {
      setSalvando(false)
    }
  }

  const iniciarEdicao = (item) => {
    setEditandoId(item[cfg.idField])
    setEditandoNome(item.nome)
  }

  const salvarEdicao = async (id) => {
    if (!editandoNome.trim()) return
    try {
      await api.put(`${cfg.endpoint}/${id}`, { nome: editandoNome.trim() })
      setEditandoId(null)
      recarregar()
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    }
  }

  const remover = async (id) => {
    if (!confirm(`Remover este ${cfg.singular.toLowerCase()}? Discos vinculados podem ser afetados.`)) return
    try {
      await api.delete(`${cfg.endpoint}/${id}`)
      recarregar()
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">{cfg.label}</h1>

      <form onSubmit={criar} className="flex gap-2 mb-6">
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder={`Novo ${cfg.singular.toLowerCase()}...`}
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-1 bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-contrast font-medium px-3 py-2 rounded-lg text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </form>

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-faint py-10 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
        </div>
      ) : itens.length === 0 ? (
        <p className="text-faint text-sm">Nenhum item cadastrado.</p>
      ) : (
        <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {itens.map((item) => {
            const id = item[cfg.idField]
            const emEdicao = editandoId === id
            return (
              <li key={id} className="flex items-center gap-2 px-3 py-2 bg-surface">
                {emEdicao ? (
                  <>
                    <input
                      value={editandoNome}
                      onChange={(e) => setEditandoNome(e.target.value)}
                      autoFocus
                      className="flex-1 bg-surface-2 border border-border-strong rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => salvarEdicao(id)}
                      className="p-1.5 text-accent hover:bg-surface-2 rounded"
                      aria-label="Salvar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="p-1.5 text-muted hover:bg-surface-2 rounded"
                      aria-label="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{item.nome}</span>
                    <button
                      onClick={() => iniciarEdicao(item)}
                      className="p-1.5 text-muted hover:text-accent hover:bg-surface-2 rounded"
                      aria-label="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remover(id)}
                      className="p-1.5 text-muted hover:text-red-500 hover:bg-surface-2 rounded"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
