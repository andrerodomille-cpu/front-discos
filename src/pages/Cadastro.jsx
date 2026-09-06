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
      <h1 className="mb-5 text-2xl">{cfg.label}</h1>

      <form onSubmit={criar} className="mb-6 flex gap-2">
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder={`Novo ${cfg.singular.toLowerCase()}…`}
          className="u-field flex-1"
        />
        <button type="submit" disabled={salvando} className="u-btn u-btn-primary shrink-0 px-3 py-2">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </form>

      {erro && <p className="mb-4 text-sm text-red-500">{erro}</p>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-faint">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando…
        </div>
      ) : itens.length === 0 ? (
        <p className="text-sm text-faint">Nenhum item cadastrado.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {itens.map((item) => {
            const id = item[cfg.idField]
            const emEdicao = editandoId === id
            return (
              <li key={id} className="u-spine flex items-center gap-2 py-2 pl-4 pr-3">
                {emEdicao ? (
                  <>
                    <input
                      value={editandoNome}
                      onChange={(e) => setEditandoNome(e.target.value)}
                      autoFocus
                      className="u-field flex-1 py-1"
                    />
                    <button
                      onClick={() => salvarEdicao(id)}
                      className="rounded-[3px] p-1.5 text-accent hover:bg-surface-2"
                      aria-label="Salvar"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="rounded-[3px] p-1.5 text-muted hover:bg-surface-2"
                      aria-label="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{item.nome}</span>
                    <button
                      onClick={() => iniciarEdicao(item)}
                      className="rounded-[3px] p-1.5 text-muted hover:bg-surface-2 hover:text-accent"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remover(id)}
                      className="rounded-[3px] p-1.5 text-muted hover:bg-surface-2 hover:text-red-500"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
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
