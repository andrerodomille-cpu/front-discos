import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Loader2, Trash2, ArrowLeft, Disc3 } from 'lucide-react'
import api from '../api/client'
import { GRAUS_CONSERVACAO } from '../api/entidades'
import FichaTecnica from '../components/FichaTecnica'

const ESTADO_INICIAL = {
  titulo: '',
  id_formato: '',
  id_artista: '',
  id_genero: '',
  id_gravadora: '',
  ano_lancamento: '',
  quantidade_discos: 1,
  rpm: '',
  diametro_polegadas: '',
  cor_vinil: '',
  pais_origem: '',
  primeira_prensagem: false,
  importado: false,
  mono: false,
  estado_vinil: '',
  estado_capa: '',
  url_capa: '',
  resenha: '',
  avaliacao: '',
  numero_catalogo: '',
  valor_pago: '',
  valor_estimado: '',
  id_loja: '',
  data_compra: '',
  codigo_barras: '',
  numero_serie: '',
  observacoes: '',
}

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

export default function DiscoForm() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(ESTADO_INICIAL)
  const [fichaTecnica, setFichaTecnica] = useState([])
  const [listas, setListas] = useState({
    artistas: [], generos: [], gravadoras: [], formatos: [], lojas: [], musicos: [], instrumentos: [],
  })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const requisicoes = [
      api.get('/artistas'),
      api.get('/generos'),
      api.get('/gravadoras'),
      api.get('/formatos'),
      api.get('/lojas'),
      api.get('/musicos'),
      api.get('/instrumentos'),
    ]
    if (editando) requisicoes.push(api.get(`/discos/${id}`))

    Promise.all(requisicoes)
      .then((resultados) => {
        const [artistas, generos, gravadoras, formatos, lojas, musicos, instrumentos, discoRes] = resultados
        setListas({
          artistas: artistas.data, generos: generos.data, gravadoras: gravadoras.data,
          formatos: formatos.data, lojas: lojas.data, musicos: musicos.data, instrumentos: instrumentos.data,
        })
        if (discoRes) {
          const d = discoRes.data
          setForm({
            titulo: d.titulo ?? '',
            id_formato: d.id_formato ?? '',
            id_artista: d.id_artista ?? '',
            id_genero: d.id_genero ?? '',
            id_gravadora: d.id_gravadora ?? '',
            ano_lancamento: d.ano_lancamento ?? '',
            quantidade_discos: d.quantidade_discos ?? 1,
            rpm: d.rpm ?? '',
            diametro_polegadas: d.diametro_polegadas ?? '',
            cor_vinil: d.cor_vinil ?? '',
            pais_origem: d.pais_origem ?? '',
            primeira_prensagem: Boolean(d.primeira_prensagem),
            importado: Boolean(d.importado),
            mono: Boolean(d.mono),
            estado_vinil: d.estado_vinil ?? '',
            estado_capa: d.estado_capa ?? '',
            url_capa: d.url_capa ?? '',
            resenha: d.resenha ?? '',
            avaliacao: d.avaliacao ?? '',
            numero_catalogo: d.numero_catalogo ?? '',
            valor_pago: d.valor_pago ?? '',
            valor_estimado: d.valor_estimado ?? '',
            id_loja: d.id_loja ?? '',
            data_compra: d.data_compra ? String(d.data_compra).slice(0, 10) : '',
            codigo_barras: d.codigo_barras ?? '',
            numero_serie: d.numero_serie ?? '',
            observacoes: d.observacoes ?? '',
          })
          setFichaTecnica(
            (d.musicos_ficha_tecnica || []).map((m) => ({
              id_musico: m.id_musico ?? '',
              id_instrumento: m.id_instrumento ?? '',
              faixas: m.faixas ?? '',
              observacoes: m.observacoes ?? '',
            })),
          )
        }
      })
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setCarregando(false))
  }, [id, editando])

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
      id_formato: numOuNulo(form.id_formato),
      id_artista: numOuNulo(form.id_artista),
      id_genero: numOuNulo(form.id_genero),
      id_gravadora: numOuNulo(form.id_gravadora),
      ano_lancamento: numOuNulo(form.ano_lancamento),
      quantidade_discos: numOuNulo(form.quantidade_discos) || 1,
      rpm: numOuNulo(form.rpm),
      diametro_polegadas: numOuNulo(form.diametro_polegadas),
      cor_vinil: form.cor_vinil || null,
      pais_origem: form.pais_origem || null,
      primeira_prensagem: form.primeira_prensagem,
      importado: form.importado,
      mono: form.mono,
      estado_vinil: form.estado_vinil || null,
      estado_capa: form.estado_capa || null,
      url_capa: form.url_capa || null,
      resenha: form.resenha || null,
      avaliacao: numOuNulo(form.avaliacao),
      numero_catalogo: form.numero_catalogo || null,
      valor_pago: numOuNulo(form.valor_pago),
      valor_estimado: numOuNulo(form.valor_estimado),
      id_loja: numOuNulo(form.id_loja),
      data_compra: form.data_compra || null,
      codigo_barras: form.codigo_barras || null,
      numero_serie: form.numero_serie || null,
      observacoes: form.observacoes || null,
      musicos_ficha_tecnica: fichaTecnica
        .filter((l) => l.id_musico)
        .map((l) => ({
          id_musico: numOuNulo(l.id_musico),
          id_instrumento: numOuNulo(l.id_instrumento),
          faixas: l.faixas || null,
          observacoes: l.observacoes || null,
        })),
    }

    try {
      if (editando) {
        await api.put(`/discos/${id}`, payload)
      } else {
        await api.post('/discos', payload)
      }
      navigate('/')
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async () => {
    if (!confirm('Excluir este disco da coleção? Essa ação não pode ser desfeita.')) return
    try {
      await api.delete(`/discos/${id}`)
      navigate('/')
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
        <Link to="/" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        {editando && (
          <button
            type="button"
            onClick={excluir}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" /> Excluir disco
          </button>
        )}
      </div>

      <h1 className="text-xl font-semibold mb-6">{editando ? 'Editar disco' : 'Novo disco'}</h1>

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

      <form onSubmit={salvar} className="flex flex-col gap-8">
        <div className="flex justify-center sm:justify-start">
          <div className="w-64 h-64 rounded-xl bg-surface-2 border border-border flex items-center justify-center overflow-hidden shrink-0">
            {form.url_capa ? (
              <img
                key={form.url_capa}
                src={form.url_capa}
                alt="Capa do disco"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <Disc3 className="w-16 h-16 text-faint" />
            )}
          </div>
        </div>

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
          <Field label="Gravadora">
            <select value={form.id_gravadora} onChange={set('id_gravadora')} className={inputClass}>
              <option value="">Selecione...</option>
              {listas.gravadoras.map((g) => (
                <option key={g.id_gravadora} value={g.id_gravadora}>{g.nome}</option>
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
          <Field label="URL da capa" className="md:col-span-2">
            <input value={form.url_capa} onChange={set('url_capa')} placeholder="https://..." className={inputClass} />
          </Field>
        </Secao>

        <Secao titulo="Detalhes técnicos">
          <Field label="Quantidade de discos">
            <input type="number" min="1" value={form.quantidade_discos} onChange={set('quantidade_discos')} className={inputClass} />
          </Field>
          <Field label="RPM">
            <input type="number" value={form.rpm} onChange={set('rpm')} placeholder="33, 45, 78..." className={inputClass} />
          </Field>
          <Field label="Diâmetro (polegadas)">
            <input type="number" value={form.diametro_polegadas} onChange={set('diametro_polegadas')} placeholder="12, 10, 7..." className={inputClass} />
          </Field>
          <Field label="Cor do vinil">
            <input value={form.cor_vinil} onChange={set('cor_vinil')} className={inputClass} />
          </Field>
          <Field label="País de origem">
            <input value={form.pais_origem} onChange={set('pais_origem')} className={inputClass} />
          </Field>
          <Field label="Número de catálogo">
            <input value={form.numero_catalogo} onChange={set('numero_catalogo')} className={inputClass} />
          </Field>
          <Field label="Código de barras">
            <input value={form.codigo_barras} onChange={set('codigo_barras')} className={inputClass} />
          </Field>
          <Field label="Número de série">
            <input value={form.numero_serie} onChange={set('numero_serie')} className={inputClass} />
          </Field>
          <div className="flex items-center gap-4 md:col-span-3 flex-wrap pt-1">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={form.primeira_prensagem} onChange={set('primeira_prensagem')} />
              Primeira prensagem
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={form.importado} onChange={set('importado')} />
              Importado
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={form.mono} onChange={set('mono')} />
              Mono
            </label>
          </div>
        </Secao>

        <Secao titulo="Estado e avaliação">
          <Field label="Estado do vinil">
            <select value={form.estado_vinil} onChange={set('estado_vinil')} className={inputClass}>
              <option value="">Selecione...</option>
              {GRAUS_CONSERVACAO.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Estado da capa">
            <select value={form.estado_capa} onChange={set('estado_capa')} className={inputClass}>
              <option value="">Selecione...</option>
              {GRAUS_CONSERVACAO.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Avaliação pessoal (0-5)">
            <input type="number" min="0" max="5" step="0.5" value={form.avaliacao} onChange={set('avaliacao')} className={inputClass} />
          </Field>
          <Field label="Resenha" className="md:col-span-3">
            <textarea value={form.resenha} onChange={set('resenha')} rows={3} className={inputClass} />
          </Field>
        </Secao>

        <Secao titulo="Aquisição">
          <Field label="Loja / local de compra">
            <select value={form.id_loja} onChange={set('id_loja')} className={inputClass}>
              <option value="">Selecione...</option>
              {listas.lojas.map((l) => (
                <option key={l.id_loja} value={l.id_loja}>{l.nome}</option>
              ))}
            </select>
          </Field>
          <Field label="Data da compra">
            <input type="date" value={form.data_compra} onChange={set('data_compra')} className={inputClass} />
          </Field>
          <Field label="Valor pago (R$)">
            <input type="number" step="0.01" value={form.valor_pago} onChange={set('valor_pago')} className={inputClass} />
          </Field>
          <Field label="Valor estimado (R$)">
            <input type="number" step="0.01" value={form.valor_estimado} onChange={set('valor_estimado')} className={inputClass} />
          </Field>
          <Field label="Observações" className="md:col-span-3">
            <textarea value={form.observacoes} onChange={set('observacoes')} rows={3} className={inputClass} />
          </Field>
        </Secao>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">Ficha técnica (músicos)</h2>
          <FichaTecnica
            linhas={fichaTecnica}
            musicos={listas.musicos}
            instrumentos={listas.instrumentos}
            onChange={setFichaTecnica}
          />
        </section>

        <div className="flex gap-3 pt-2 pb-8">
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-contrast font-medium px-5 py-2.5 rounded-lg"
          >
            {salvando && <Loader2 className="w-4 h-4 animate-spin" />}
            {editando ? 'Salvar alterações' : 'Cadastrar disco'}
          </button>
          <Link to="/" className="flex items-center px-5 py-2.5 rounded-lg border border-border-strong text-sm hover:border-faint">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
