import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Loader2, Trash2, ArrowLeft } from 'lucide-react'
import api from '../api/client'
import ComboBox from '../components/ComboBox'

const inputClass = 'u-field'
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

  const opcoesDiscos = useMemo(
    () =>
      [...discos]
        .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }))
        .map((d) => ({
          value: d.id_disco,
          label: d.artista_nome ? `${d.titulo} — ${d.artista_nome}` : d.titulo,
        })),
    [discos],
  )

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

      <h1 className="mb-6 text-2xl">{editando ? 'Editar audição' : 'Registrar audição'}</h1>

      {erro && <p className="mb-4 text-sm text-red-500">{erro}</p>}

      <form onSubmit={salvar} className="flex flex-col gap-4">
        <Field label="Disco *">
          <ComboBox
            options={opcoesDiscos}
            value={form.id_disco}
            onChange={(value) => setForm((prev) => ({ ...prev, id_disco: value }))}
            placeholder="Busque pelo título..."
          />
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

        <div className="flex gap-3 pb-8 pt-2">
          <button type="submit" disabled={salvando} className="u-btn u-btn-primary px-5 py-2.5">
            {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
            {editando ? 'Salvar alterações' : 'Registrar'}
          </button>
          <Link to="/audicoes" className="u-btn u-btn-ghost px-5 py-2.5">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
