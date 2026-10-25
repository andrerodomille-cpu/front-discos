import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Lock } from 'lucide-react'
import api from '../api/client'

const INDEFINIDO = 'Indefinido'

export default function SubgenerosEditor({ genero, onAlterado, onErro }) {
  const [novoNome, setNovoNome] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [editandoNome, setEditandoNome] = useState('')
  const [salvando, setSalvando] = useState(false)

  const executar = async (acao) => {
    setSalvando(true)
    try {
      await acao()
      onAlterado()
      return true
    } catch (err) {
      onErro(err.response?.data?.error || err.message)
      return false
    } finally {
      setSalvando(false)
    }
  }

  const criar = async (e) => {
    e.preventDefault()
    if (!novoNome.trim()) return
    const ok = await executar(() => api.post('/subgeneros', { id_genero: genero.id_genero, nome: novoNome.trim() }))
    if (ok) setNovoNome('')
  }

  const salvarEdicao = async (id) => {
    if (!editandoNome.trim()) return
    const ok = await executar(() => api.put(`/subgeneros/${id}`, { nome: editandoNome.trim() }))
    if (ok) setEditandoId(null)
  }

  const remover = (sub) => {
    if (!confirm(`Remover o subgênero "${sub.nome}"? Os discos dele passarão para "${INDEFINIDO}".`)) return
    executar(() => api.delete(`/subgeneros/${sub.id_subgenero}`))
  }

  const subgeneros = genero.subgeneros || []

  return (
    <div className="border-t border-border bg-surface-2/50 py-2 pl-8 pr-3">
      <ul className="mb-2">
        {subgeneros.map((sub) => {
          const fixo = sub.nome === INDEFINIDO
          const emEdicao = editandoId === sub.id_subgenero
          return (
            <li key={sub.id_subgenero} className="flex items-center gap-2 py-1">
              {emEdicao ? (
                <>
                  <input
                    value={editandoNome}
                    onChange={(e) => setEditandoNome(e.target.value)}
                    autoFocus
                    className="u-field flex-1 py-1 text-sm"
                  />
                  <button
                    onClick={() => salvarEdicao(sub.id_subgenero)}
                    disabled={salvando}
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
                  <span className={`flex-1 text-sm ${fixo ? 'text-muted' : ''}`}>{sub.nome}</span>
                  {fixo ? (
                    <span className="p-1.5 text-faint" title="Subgênero padrão: não pode ser alterado">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditandoId(sub.id_subgenero)
                          setEditandoNome(sub.nome)
                        }}
                        className="rounded-[3px] p-1.5 text-muted hover:bg-surface-2 hover:text-accent"
                        aria-label="Editar subgênero"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => remover(sub)}
                        disabled={salvando}
                        className="rounded-[3px] p-1.5 text-muted hover:bg-surface-2 hover:text-red-500"
                        aria-label="Remover subgênero"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ul>
      <form onSubmit={criar} className="flex gap-2 pb-1">
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder={`Novo subgênero de ${genero.nome}…`}
          className="u-field flex-1 py-1.5 text-sm"
        />
        <button type="submit" disabled={salvando} className="u-btn u-btn-ghost shrink-0 px-3 py-1.5 text-sm">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </form>
    </div>
  )
}
