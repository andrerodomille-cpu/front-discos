import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Disc3, Headphones, Shuffle, ArrowLeft, Check, Star } from 'lucide-react'
import api from '../api/client'
import SectionHeading from '../components/SectionHeading'

const TODOS = '__todos__'
// Sorteia entre os N discos mais "esquecidos" para variar as sugestões
const TAMANHO_POOL = 5

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function tempoDecorrido(data) {
  const dias = Math.floor((Date.now() - new Date(data).getTime()) / (24 * 60 * 60 * 1000))
  if (dias <= 0) return 'hoje'
  if (dias === 1) return 'ontem'
  if (dias < 30) return `há ${dias} dias`
  const meses = Math.floor(dias / 30.44)
  if (meses < 12) return `há ${meses} ${meses === 1 ? 'mês' : 'meses'}`
  const anos = Math.floor(meses / 12)
  const resto = meses % 12
  const txtAnos = `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  return resto ? `há ${txtAnos} e ${resto} ${resto === 1 ? 'mês' : 'meses'}` : `há ${txtAnos}`
}

export default function Sugestao() {
  const [discos, setDiscos] = useState([])
  const [audicoes, setAudicoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [genero, setGenero] = useState('')
  const [etapa, setEtapa] = useState('escolha') // escolha | sugestao | recusada | registro | concluido
  const [sugerido, setSugerido] = useState(null)
  const [jaSugeridos, setJaSugeridos] = useState([])

  const [nota, setNota] = useState('')
  const [local, setLocal] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/discos'), api.get('/audicoes')])
      .then(([discosRes, audicoesRes]) => {
        setDiscos(discosRes.data)
        setAudicoes(audicoesRes.data)
      })
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setCarregando(false))
  }, [])

  const generos = useMemo(() => {
    const contagem = new Map()
    discos.forEach((d) => {
      if (d.genero_nome) contagem.set(d.genero_nome, (contagem.get(d.genero_nome) || 0) + 1)
    })
    return [...contagem.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
  }, [discos])

  const historico = useMemo(() => {
    const mapa = new Map()
    audicoes.forEach((a) => {
      const t = new Date(a.data_audicao).getTime()
      const atual = mapa.get(a.id_disco)
      if (!atual) mapa.set(a.id_disco, { ultima: a.data_audicao, total: 1 })
      else {
        atual.total += 1
        if (t > new Date(atual.ultima).getTime()) atual.ultima = a.data_audicao
      }
    })
    return mapa
  }, [audicoes])

  const locaisAnteriores = useMemo(
    () => [...new Set(audicoes.map((a) => a.local).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [audicoes],
  )

  // Nunca ouvidos primeiro, depois do mais antigo para o mais recente
  const candidatos = useMemo(() => {
    const ultimaVez = (d) => {
      const h = historico.get(d.id_disco)
      return h ? new Date(h.ultima).getTime() : -Infinity
    }
    return discos
      .filter((d) => genero === TODOS || d.genero_nome === genero)
      .sort((a, b) => ultimaVez(a) - ultimaVez(b))
  }, [discos, genero, historico])

  const sortear = (excluidos) => {
    let restantes = candidatos.filter((d) => !excluidos.includes(d.id_disco))
    let novosExcluidos = excluidos
    if (restantes.length === 0) {
      // Todos já foram sugeridos: recomeça, evitando repetir o último
      novosExcluidos = sugerido ? [sugerido.id_disco] : []
      restantes = candidatos.filter((d) => !novosExcluidos.includes(d.id_disco))
      if (restantes.length === 0) restantes = candidatos
    }
    const nuncaOuvidos = restantes.filter((d) => !historico.has(d.id_disco))
    const pool = nuncaOuvidos.length > 0 ? nuncaOuvidos : restantes.slice(0, TAMANHO_POOL)
    const escolhido = pool[Math.floor(Math.random() * pool.length)]
    setSugerido(escolhido)
    setJaSugeridos([...novosExcluidos, escolhido.id_disco])
    setEtapa('sugestao')
  }

  const iniciar = () => {
    if (!genero || candidatos.length === 0) return
    setErro(null)
    sortear([])
  }

  const aceitar = () => {
    setNota('')
    setLocal('')
    setErro(null)
    setEtapa('registro')
  }

  const trocarGenero = () => {
    setSugerido(null)
    setJaSugeridos([])
    setEtapa('escolha')
  }

  const registrar = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setErro(null)
    const payload = {
      id_disco: sugerido.id_disco,
      data_audicao: new Date().toISOString(),
      nota: nota === '' ? null : Number(nota),
      local: local.trim() || null,
      observacoes: null,
    }
    try {
      const res = await api.post('/audicoes', payload)
      const nova = res.data?.audicao || payload
      setAudicoes((prev) => [nova, ...prev])
      setEtapa('concluido')
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-faint">
        <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
      </div>
    )
  }

  const infoSugerido = sugerido ? historico.get(sugerido.id_disco) : null

  return (
    <div className="max-w-xl">
      <h1 className="mb-1.5 text-2xl">O que ouvir?</h1>
      <p className="mb-7 text-sm text-muted">
        Escolha um gênero e eu sugiro um disco que você nunca ouviu ou não escuta há tempo.
      </p>

      {erro && <p className="mb-4 text-sm text-red-500">{erro}</p>}

      {etapa === 'escolha' && (
        <div className="flex flex-col gap-4">
          {discos.length === 0 ? (
            <p className="py-10 text-center text-faint">Nenhum disco cadastrado ainda.</p>
          ) : (
            <>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted">Gênero</span>
                <select value={genero} onChange={(e) => setGenero(e.target.value)} className="u-field">
                  <option value="">Selecione um gênero…</option>
                  <option value={TODOS}>Qualquer gênero ({discos.length})</option>
                  {generos.map(([nome, qtd]) => (
                    <option key={nome} value={nome}>
                      {nome} ({qtd})
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <button
                  type="button"
                  onClick={iniciar}
                  disabled={!genero}
                  className="u-btn u-btn-primary px-5 py-2.5"
                >
                  <Shuffle className="h-4 w-4" /> Sugerir disco
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {sugerido && etapa !== 'escolha' && (
        <>
          <div className="mb-6 flex gap-4">
            <Link
              to={`/discos/${sugerido.id_disco}`}
              className="u-sleeve flex aspect-square w-32 shrink-0 items-center justify-center overflow-hidden sm:w-40"
            >
              {sugerido.url_capa ? (
                <img
                  src={sugerido.url_capa}
                  alt={sugerido.titulo}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <Disc3 className="h-9 w-9 text-border-strong" />
              )}
            </Link>
            <div className="flex min-w-0 flex-col justify-center gap-1">
              <p className="u-condensed truncate text-[13px] uppercase text-muted">
                {sugerido.artista_nome || 'Artista desconhecido'}
              </p>
              <h2 className="font-display text-xl font-bold leading-tight tracking-[-0.02em]">{sugerido.titulo}</h2>
              <p className="text-xs text-faint">
                {[sugerido.ano_lancamento, sugerido.genero_nome, sugerido.formato_nome].filter(Boolean).join(' · ')}
              </p>
              <div className="mt-2 border-l-2 border-accent pl-3 text-sm">
                {infoSugerido ? (
                  <>
                    <p>
                      Última audição: <span className="font-semibold">{formatarData(infoSugerido.ultima)}</span>
                    </p>
                    <p className="text-xs text-muted">
                      {tempoDecorrido(infoSugerido.ultima)} · {infoSugerido.total}{' '}
                      {infoSugerido.total === 1 ? 'audição' : 'audições'} no total
                    </p>
                  </>
                ) : (
                  <p className="font-semibold">Nunca ouvido</p>
                )}
              </div>
            </div>
          </div>

          {etapa === 'sugestao' && (
            <div>
              <SectionHeading className="mb-3">Quer ouvir este disco agora?</SectionHeading>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={aceitar} className="u-btn u-btn-primary px-5 py-2.5">
                  <Headphones className="h-4 w-4" /> Sim, ouvir agora
                </button>
                <button type="button" onClick={() => setEtapa('recusada')} className="u-btn u-btn-ghost px-5 py-2.5">
                  Não
                </button>
              </div>
            </div>
          )}

          {etapa === 'recusada' && (
            <div>
              <SectionHeading className="mb-3">Quer outra sugestão?</SectionHeading>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => sortear(jaSugeridos)}
                  className="u-btn u-btn-primary px-5 py-2.5"
                >
                  <Shuffle className="h-4 w-4" /> Sim, sugerir outra
                </button>
                <button type="button" onClick={trocarGenero} className="u-btn u-btn-ghost px-5 py-2.5">
                  Não, trocar gênero
                </button>
              </div>
              {candidatos.length === 1 && (
                <p className="mt-3 text-xs text-faint">Este é o único disco desse gênero.</p>
              )}
            </div>
          )}

          {etapa === 'registro' && (
            <form onSubmit={registrar} className="flex flex-col gap-4">
              <SectionHeading>Registrar audição</SectionHeading>
              <p className="text-xs text-muted">
                Data e hora: {new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted">Nota (0-5)</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  className="u-field"
                  autoFocus
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted">Local</span>
                <input
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  list="locais-anteriores"
                  placeholder="Sala de estar, casa de um amigo..."
                  className="u-field"
                />
                <datalist id="locais-anteriores">
                  {locaisAnteriores.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </label>
              <div className="flex flex-wrap gap-3 pb-8 pt-2">
                <button type="submit" disabled={salvando} className="u-btn u-btn-primary px-5 py-2.5">
                  {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                  Registrar audição
                </button>
                <button type="button" onClick={() => setEtapa('sugestao')} className="u-btn u-btn-ghost px-5 py-2.5">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
              </div>
            </form>
          )}

          {etapa === 'concluido' && (
            <div>
              <p className="mb-4 flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-accent" /> Audição registrada. Boa audição!
                {nota !== '' && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" /> {nota}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={trocarGenero} className="u-btn u-btn-primary px-5 py-2.5">
                  <Shuffle className="h-4 w-4" /> Nova sugestão
                </button>
                <Link to="/audicoes" className="u-btn u-btn-ghost px-5 py-2.5">
                  Ver audições
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
