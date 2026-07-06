import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Loader2, Trash2, ArrowLeft } from 'lucide-react'
import api from '../api/client'

const inputClass =
  'bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent'
const labelClass = 'flex flex-col gap-1 text-sm'
const spanClass = 'text-muted'

function Field({ label, children, className = '' }) {
  return (
    <label className={`${labelClass} ${className}`}>
      <span className={spanClass}>{label}</span>
      {children}
    </label>
  )
}

function paraDatetimeLocal(data) {
  const d = data ? new Date(data) : new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

const ESTADO_INICIAL = {
  id_disco: '',
  data_audicao: paraDatetimeLocal(),
  nota: '',
  local: '',
  observacoes: '',
}

export default function AudicaoForm() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(ESTADO_INICIAL)
  const [discos, setDiscos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const requisicoes = [api.get('/discos')]
    if (editando) requisicoes.push(api.get(`/audicoes/${id}`))

    Promise.all(requisicoes)
      .then(([discosRes, audicaoRes]) => {
        setDiscos(discosRes.data)
        if (audicaoRes) {
          const a = audicaoRes.data
          setForm({
            id_disco: a.id_disco ?? '',
            data_audicao: paraDatetimeLocal(a.data_audicao),
            nota: a.nota ?? '',
            local: a.local ?? '',
            observacoes: a.observacoes ?? '',
          })
        }
      })
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setCarregando(false))
  }, [id, editando])

  const set = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!form.id_disco) {
      setErro('Selecione um disco.')
      return
    }
    setSalvando(true)
    setErro(null)
    const payload = {
      id_disco: Number(form.id_disco),
      data_audicao: new Date(form.data_audicao).toISOString(),
      nota: form.nota === '' ? null : Number(form.nota),
      local: form.local || null,
      observacoes: form.observacoes || null,
    }

    try {
      if (editando) {
        await api.put(`/audicoes/${id}`, payload)
      } else {
        await api.post('/audicoes', payload)
      }
      navigate('/audicoes')
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async () => {
    if (!confirm('Excluir este registro de audição? Essa ação não pode ser desfeita.')) return
    try {
      await api.delete(`/audicoes/${id}`)
      navigate('/audicoes')
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
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <Link to="/audicoes" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        {editando && (
          <button
            type="button"
            onClick={excluir}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" /> Excluir registro
          </button>
        )}
      </div>

      <h1 className="text-xl font-semibold mb-6">{editando ? 'Editar audição' : 'Registrar audição'}</h1>

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

      <form onSubmit={salvar} className="flex flex-col gap-4">
        <Field label="Disco *">
          <select value={form.id_disco} onChange={set('id_disco')} required className={inputClass}>
            <option value="">Selecione...</option>
            {discos.map((d) => (
              <option key={d.id_disco} value={d.id_disco}>
                {d.titulo} {d.artista_nome ? `— ${d.artista_nome}` : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data e hora">
          <input type="datetime-local" value={form.data_audicao} onChange={set('data_audicao')} className={inputClass} />
        </Field>
        <Field label="Nota (0-5)">
          <input type="number" min="0" max="5" step="0.5" value={form.nota} onChange={set('nota')} className={inputClass} />
        </Field>
        <Field label="Local">
          <input value={form.local} onChange={set('local')} placeholder="Sala de estar, casa de um amigo..." className={inputClass} />
        </Field>
        <Field label="Observações">
          <textarea value={form.observacoes} onChange={set('observacoes')} rows={3} className={inputClass} />
        </Field>

        <div className="flex gap-3 pt-2 pb-8">
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-contrast font-medium px-5 py-2.5 rounded-lg"
          >
            {salvando && <Loader2 className="w-4 h-4 animate-spin" />}
            {editando ? 'Salvar alterações' : 'Registrar'}
          </button>
          <Link to="/audicoes" className="flex items-center px-5 py-2.5 rounded-lg border border-border-strong text-sm hover:border-faint">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
